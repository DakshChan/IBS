const AbstractVCS = require("./AbstractVCS");
const db = require("../../setup/db");
const axios = require("axios");
const { User, Group, GroupUser, Course, Task } = require("../../models");

class MockVCS extends AbstractVCS {
    static async add_user_to_new_group(course_id, group_id, username) {
        let group;
        try {
            group = await Group.findOne({ where: { group_id } });
        } catch (e) {  // Couldn't find a group with given group_id
            return { success: false, code: 'group_not_exist' };
        }

        if (
            group.gitlab_group_id === null ||
            group.gitlab_url === null ||
            group.gitlab_group_id === '' ||
            group.gitlab_url === ''
        ) {
            return { success: false, code: 'group_not_exist' };
        }

        return await MockVCS.add_user_with_group_id(
            group.gitlab_group_id,
            group.gitlab_url,
            username
        );
    }

    static async add_user_with_group_id(vcs_group_id, vcs_url, username) {
        // 1. calls get_vcs_user_id(username) to get user_id
        let user_id = await MockVCS.get_user_id(username);

        if (user_id === -1) {
            return { success: false, code: 'gitlab_invalid_username' };
        }

        return { success: true, gitlab_url: vcs_url };

    }

    static async create_group_and_project_no_user(course_id, group_id, task) {

        let course = await Course.findOne( { where: { course_id } });

        if (!course) {
            return { success: false, code: 'invalid_gitlab_group' };
        }

        // Get the starter code url
        let taskRow = await Task.findOne({ where: { task, course_id } })

        let starter_code_url = null;
        if (
            taskRow &&
            taskRow.starter_code_url !== null &&
            taskRow.starter_code_url !== ''
        ) {
            starter_code_url = taskRow.starter_code_url;
        }


        // Create a new subgroup in the course group
        let gitlab_url = "https://gitlab.example.com/diaspora/diaspora-client";
        let gitlab_project_id = group_id;
        let gitlab_subgroup_id = group_id;

        // Store the Gitlab info in the db
        let group = await Group.findOne({ where: { group_id } });
        group.set({
            gitlab_group_id: gitlab_subgroup_id,
            gitlab_project_id: gitlab_project_id,
            gitlab_url: gitlab_url
        });
        await group.save();

        return {
            success: true,
            gitlab_group_id: gitlab_subgroup_id,
            gitlab_project_id: gitlab_project_id,
            gitlab_url: gitlab_url
        };
    }

    static async create_group_and_project_with_user(course_id, group_id, username, task) {
        // 1. calls create_group_and_project_no_user

            // 1.1 if fail

            // 1.2 calls add_user_with_group_id()
        let add_project = await MockVCS.create_group_and_project_no_user(course_id, group_id, task);
        if (add_project['success'] === false) {
            return add_project;
        }

        // Add the user to the subgroup
        return await MockVCS.add_user_with_group_id(
            add_project['gitlab_group_id'],
            add_project['gitlab_url'],
            username
        );
    }

    static async remove_user_from_group(course_id, group_id, username) {
        let group = await Group.findOne({ where: { group_id } });

        if (!group) {
            return { success: false, code: 'group_not_exist' };
        }

        if (group.gitlab_group_id === null || group.gitlab_group_id === '') {
            return { success: false, code: 'group_not_exist' };
        }

        // Get user_id
        let user_id = await MockVCS.get_user_id(username);
        if (user_id === -1) {
            return { success: false, code: 'gitlab_invalid_username' };
        }
        // Removed axios.delete call and just return true
        return { success: true };
    }

    static async get_user_id(username) {
        if (username.includes("no_gitlab")) return -1;

        const user = await User.findOne({
            where: {
                username: username
            }
        });

        if (!user){
            return -1;
        }
        return user.user_id;
    }

    static async get_commits(course_id, group_id) {
        // Get gitlab_project_id
        let group = await Group.findOne({ where: { group_id } });

        if (!group) {
            return { success: false, code: 'group_not_exist' };
        }


        if (group.gitlab_project_id === null || group.gitlab_project_id === '') {
            return [];
        }

        let res_commit = [{
            "id": "ed899a2f4b50b4370feeea94676502b42383c746",
            "short_id": "ed899a2f4b5",
            "title": "Replace sanitize with escape once",
            "author_name": "Example User",
            "author_email": "user@example.com",
            "authored_date": "2021-09-20T11:50:22.001+00:00",
            "committer_name": "Administrator",
            "committer_email": "admin@example.com",
            "committed_date": "2021-09-20T11:50:22.001+00:00",
            "created_at": "2021-09-20T11:50:22.001+00:00",
            "message": "Replace sanitize with escape once",
            "parent_ids": [
                "6104942438c14ec7bd21c6cd5bd995272b3faff6"
            ],
            "web_url": "https://gitlab.example.com/janedoe/gitlab-foss/-/commit/ed899a2f4b50b4370feeea94676502b42383c746",
            "trailers": {},
            "extended_trailers": {}
        }];

        let res_push =   [{
                "id": 1,
                "title":null,
                "project_id":1,
                "action_name":"opened",
                "target_id":160,
                "target_iid":53,
                "target_type":"Issue",
                "author_id":25,
                "target_title":"Qui natus eos odio tempore et quaerat consequuntur ducimus cupiditate quis.",
                "created_at":"2017-02-09T10:43:19.667Z",
                "author":{
                    "name":"User 3",
                    "username":"user3",
                    "id":25,
                    "state":"active",
                    "avatar_url":"http://www.gravatar.com/avatar/97d6d9441ff85fdc730e02a6068d267b?s=80\u0026d=identicon",
                    "web_url":"https://gitlab.example.com/user3"
                },
                "author_username":"user3"
            }];

        return { commit: res_commit, push: res_push };
    }
}

module.exports = MockVCS;