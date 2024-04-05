class AbstractVCS {

    static async add_user_to_new_group(course_id, group_id, username) {
        throw new Error("Method 'add_user_to_new_group()' must be implemented.");

    }

    static async add_user_with_group_id(vcs_group_id, vcs_url, username) {
        throw new Error("Method 'add_user_with_group_id()' must be implemented.");
    }

    static async create_group_and_project_no_user(course_id, group_id, task) {
        throw new Error("Method 'create_group_and_project_no_user()' must be implemented.");
    }

    static async create_group_and_project_with_user(course_id, group_id, username, task) {
        throw new Error("Method 'create_group_and_project_with_user()' must be implemented.");
    }

    static async remove_user_from_group(course_id, group_id, username) {
        throw new Error("Method 'remove_user_from_group()' must be implemented.");
    }

    static async get_user_id(username) {
        throw new Error("Method 'get_user_id()' must be implemented.");
    }

    static async get_commits(course_id, group_id) {
        throw new Error("Method 'get_commits()' must be implemented.");
    }
}

module.exports = AbstractVCS;