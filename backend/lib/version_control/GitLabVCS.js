const AbstractVCS = require("./AbstractVCS");
const db = require("../../setup/db");
const axios = require("axios");

const { Group, Course, Task } = require("../../models")

class GitlabVCS extends AbstractVCS {
    static async add_user_to_new_group(course_id, group_id, username) {
        const group_info = await Group.findOne({
            where: { group_id }
        });

        if (!group_info) return { success: false, code: 'group_not_exist' };

        if (
            group_info.gitlab_group_id === null ||
            group_info.gitlab_url === null ||
            group_info.gitlab_group_id === '' ||
            group_info.gitlab_url === ''
        ) {
            return { success: false, code: 'group_not_exist' };
        }
        return await GitlabVCS.add_user_with_group_id(
            group_info.gitlab_group_id,
            group_info.gitlab_url,
            username
        );
    }

    static async add_user_with_group_id(vcs_group_id, vcs_url, username) {

        let user_id = await GitlabVCS.get_user_id(username);
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
        const course = await Course.findOne({
            where: { course_id }
        });

        if (!course) return { success: false, code: 'invalid_gitlab_group' };

        const task_item = await Task.findOne({
            where: {
                course_id,
                task
            }
        });

        let starter_code_url = null;
        if (
            !task_item &&
            task_item.starter_code_url !== null &&
            task_item.starter_code_url !== ''
        ) {
            starter_code_url = task_item.starter_code_url;
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

            const data_create_group = {
                path: group_name,
                name: group_name,
                parent_id: course.gitlab_group_id
            };

            const res_create_group = await axios.post(
                process.env.GITLAB_URL + 'groups/',
                data_create_group,
                config
            );

            var gitlab_subgroup_id = res_create_group['data']['id'];

            const data_create_project = {
                path: task,
                namespace_id: gitlab_subgroup_id
            };

            // Create a new project in the subgroup
            if (starter_code_url !== null) {
                data_create_project.import_url = starter_code_url;
            } else {
                data_create_project.initialize_with_readme = true;
            }

            const res_create_project = await axios.post(
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

        await Group.update(
            {
                gitlab_group_id: gitlab_subgroup_id,
                gitlab_project_id,
                gitlab_url
            },
            {
                where: { group_id }
            }
        )

        return {
            success: true,
            gitlab_group_id: gitlab_subgroup_id,
            gitlab_project_id: gitlab_project_id,
            gitlab_url: gitlab_url
        };
    }

    static async create_group_and_project_with_user(course_id, group_id, username, task) {
        let add_project = await GitlabVCS.create_group_and_project_no_user(course_id, group_id, task);
        if (add_project['success'] === false) {
            return add_project;
        }

        // Add the user to the subgroup
        return await GitlabVCS.add_user_with_group_id(
            add_project['gitlab_group_id'],
            add_project['gitlab_url'],
            username
        );
    }

    static async remove_user_from_group(course_id, group_id, username) {
        const group = await Group.findOne({
            where: { group_id }
        });

        if (!group) return { success: false, code: 'group_not_exist' };

        if (group.gitlab_group_id === null || group.gitlab_group_id === '') {
            return { success: false, code: 'group_not_exist' };
        }

        const gitlab_group_id = group.gitlab_group_id;

        // Get user_id
        let user_id = await GitlabVCS.get_user_id(username);
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
        const group = await Group.findOne({
            where: { group_id }
        });

        if (!group || group.gitlab_project_id === null || group.gitlab_project_id === '') {
            return [];
        }

        const gitlab_project_id = group.gitlab_project_id;

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