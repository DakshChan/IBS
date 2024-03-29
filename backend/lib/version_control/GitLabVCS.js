const AbstractVCS = require("./AbstractVCS");
const db = require("../../setup/db");
const axios = require("axios");

class GitlabVCS extends AbstractVCS {
    static async add_user_to_new_group(course_id, group_id, username) {
        let pg_res = await db.query(
            'SELECT gitlab_group_id, gitlab_url FROM course_' +
            course_id +
            '.group WHERE group_id = ($1)',
            [group_id]
        );
        if (pg_res.rowCount !== 1) {
            return { success: false, code: 'group_not_exist' };
        }
        let data = pg_res.rows[0];
        if (
            data['gitlab_group_id'] === null ||
            data['gitlab_url'] === null ||
            data['gitlab_group_id'] === '' ||
            data['gitlab_url'] === ''
        ) {
            return { success: false, code: 'group_not_exist' };
        }
        return await this.add_user_with_group_id(
            data['gitlab_group_id'],
            data['gitlab_url'],
            username
        );
    }

    static async add_user_with_group_id(vcs_group_id, vcs_url, username) {

        let user_id = await this.get_vcs_user_id(username);
        if (user_id === -1) {
            return { success: false, code: 'gitlab_invalid_username' };
        }

        try {
            let data_add_user = {
                id: vcs_group_id,
                user_id: user_id,
                access_level: 30 // Developer
            };
            let config_add_user = {
                headers: {
                    Authorization: 'Bearer ' + process.env.GITLAB_TOKEN,
                    'Content-Type': 'application/json'
                }
            };

            await axios.post(
                process.env.GITLAB_URL + 'groups/' + vcs_group_id + '/members',
                data_add_user,
                config_add_user
            );
        } catch (err) {
            if (
                'response' in err &&
                'data' in err['response'] &&
                'message' in err['response']['data']
            ) {
                console.log(err['response']['data']['message']);
            } else {
                console.log(err);
            }
            return { success: false, code: 'failed_add_user' };
        }

        return { success: true, gitlab_url: vcs_url };
    }

    static async create_group_and_project_no_user(course_id, group_id, task) {
        // Get the gitlab group id
        let pg_res_gitlab_course_group_id = await db.query(
            'SELECT gitlab_group_id FROM course WHERE course_id = ($1)',
            [course_id]
        );
        if (pg_res_gitlab_course_group_id.rowCount !== 1) {
            return { success: false, code: 'invalid_gitlab_group' };
        }

        // Get the starter code url
        let pg_res_starter_code_url = await db.query(
            'SELECT starter_code_url FROM course_' + course_id + '.task WHERE task = ($1)',
            [task]
        );
        let starter_code_url = null;
        if (
            pg_res_starter_code_url.rowCount === 1 &&
            pg_res_starter_code_url.rows[0]['starter_code_url'] !== null &&
            pg_res_starter_code_url.rows[0]['starter_code_url'] !== ''
        ) {
            starter_code_url = pg_res_starter_code_url.rows[0]['starter_code_url'];
        }

        try {
            // Create a new subgroup in the course group
            let group_name = 'group_' + group_id;
            let config = {
                headers: {
                    Authorization: 'Bearer ' + process.env.GITLAB_TOKEN,
                    'Content-Type': 'application/json'
                }
            };

            let data_create_group = {
                path: group_name,
                name: group_name,
                parent_id: pg_res_gitlab_course_group_id.rows[0]['gitlab_group_id']
            };
            let res_create_group = await axios.post(
                process.env.GITLAB_URL + 'groups/',
                data_create_group,
                config
            );
            var gitlab_subgroup_id = res_create_group['data']['id'];

            // Create a new project in the subgroup
            if (starter_code_url !== null) {
                var data_create_project = {
                    path: task,
                    namespace_id: gitlab_subgroup_id,
                    import_url: starter_code_url
                };
            } else {
                var data_create_project = {
                    path: task,
                    namespace_id: gitlab_subgroup_id,
                    initialize_with_readme: true
                };
            }
            let res_create_project = await axios.post(
                process.env.GITLAB_URL + 'projects/',
                data_create_project,
                config
            );
            var gitlab_url = res_create_project['data']['web_url'];
            var gitlab_project_id = res_create_project['data']['id'];

            // Wait for Gitlab to initialize
            await new Promise((resolve) => setTimeout(resolve, 5000));

            let delete_config = {
                headers: {
                    Authorization: 'Bearer ' + process.env.GITLAB_TOKEN,
                    'Content-Type': 'application/json'
                },
                data: {}
            };

            // Delete the protected branch
            await axios.delete(
                process.env.GITLAB_URL + 'projects/' + gitlab_project_id + '/protected_branches/master',
                delete_config
            );
        } catch (err) {
            if (
                'response' in err &&
                'data' in err['response'] &&
                'message' in err['response']['data']
            ) {
                console.log(err['response']['data']['message']);
            } else {
                console.log(err);
            }
            return { success: false, code: 'failed_create_project' };
        }

        // Store the Gitlab info in the db
        let sql_add_gitlab_info =
            'UPDATE course_' +
            course_id +
            '.group SET gitlab_group_id = ($1), gitlab_project_id = ($2), gitlab_url = ($3) WHERE group_id = ($4)';
        await db.query(sql_add_gitlab_info, [
            gitlab_subgroup_id,
            gitlab_project_id,
            gitlab_url,
            group_id
        ]);

        return {
            success: true,
            gitlab_group_id: gitlab_subgroup_id,
            gitlab_project_id: gitlab_project_id,
            gitlab_url: gitlab_url
        };
    }

    static async create_group_and_project_with_user(course_id, group_id, username, task) {
        let add_project = await this.create_group_and_project_no_user(course_id, group_id, task);
        if (add_project['success'] === false) {
            return add_project;
        }

        // Add the user to the subgroup
        return await this.add_user_with_group_id(
            add_project['gitlab_group_id'],
            add_project['gitlab_url'],
            username
        );
    }

    static async remove_user_from_group(course_id, group_id, username) {
        // Get gitlab_group_id
        let pg_res = await db.query(
            'SELECT gitlab_group_id FROM course_' + course_id + '.group WHERE group_id = ($1)',
            [group_id]
        );
        if (pg_res.rowCount !== 1) {
            return { success: false, code: 'group_not_exist' };
        }
        let data = pg_res.rows[0];
        if (data['gitlab_group_id'] === null || data['gitlab_group_id'] === '') {
            return { success: false, code: 'group_not_exist' };
        }
        let gitlab_group_id = data['gitlab_group_id'];

        // Get user_id
        let user_id = await this.get_vcs_user_id(username);
        if (user_id === -1) {
            return { success: false, code: 'gitlab_invalid_username' };
        }

        // Remove the user
        try {
            let config = {
                headers: {
                    Authorization: 'Bearer ' + process.env.GITLAB_TOKEN,
                    'Content-Type': 'application/json'
                },
                data: {
                    id: gitlab_group_id,
                    user_id: user_id
                }
            };

            await axios.delete(
                process.env.GITLAB_URL + 'groups/' + gitlab_group_id + '/members/' + user_id,
                config
            );
        } catch (err) {
            if (
                'response' in err &&
                'data' in err['response'] &&
                'message' in err['response']['data']
            ) {
                console.log(err['response']['data']['message']);
            } else {
                console.log(err);
            }
            return { success: false, code: 'failed_remove_user' };
        }

        return { success: true };
    }

    static async get_user_id(username) {
        try {
            let config_get_user_id = {
                headers: {
                    Authorization: 'Bearer ' + process.env.GITLAB_TOKEN
                }
            };

            let res = await axios.get(
                process.env.GITLAB_URL + 'users?username=' + username,
                config_get_user_id
            );
            if (res['data'].length <= 0) {
                return -1;
            }
            return res['data'][0]['id'];
        } catch (err) {
            if (
                'response' in err &&
                'data' in err['response'] &&
                'message' in err['response']['data']
            ) {
                console.log(err['response']['data']['message']);
            } else {
                console.log(err);
            }
            return -1;
        }
    }

    static async get_commits(course_id, group_id) {
        // Get gitlab_project_id
        let pg_res = await db.query(
            'SELECT gitlab_project_id FROM course_' + course_id + '.group WHERE group_id = ($1)',
            [group_id]
        );
        if (pg_res.rowCount !== 1) {
            return [];
        }
        let data = pg_res.rows[0];
        if (data['gitlab_project_id'] === null || data['gitlab_project_id'] === '') {
            return [];
        }
        let gitlab_project_id = data['gitlab_project_id'];

        try {
            let config = {
                headers: {
                    Authorization: 'Bearer ' + process.env.GITLAB_TOKEN
                }
            };

            let res_commit = await axios.get(
                process.env.GITLAB_URL + 'projects/' + gitlab_project_id + '/repository/commits',
                config
            );
            let res_push = await axios.get(
                process.env.GITLAB_URL + 'projects/' + gitlab_project_id + '/events',
                config
            );
            return { commit: res_commit['data'], push: res_push['data'] };
        } catch (err) {
            if (
                'response' in err &&
                'data' in err['response'] &&
                'message' in err['response']['data']
            ) {
                console.log(err['response']['data']['message']);
            } else {
                console.log(err);
            }
            return { commit: [], push: [] };
        }
    }
}

module.exports = GitlabVCS;