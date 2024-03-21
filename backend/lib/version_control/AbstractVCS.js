class AbstractVCS {

    /**
     *
     * NEW gitlab_add_user_without_gitlab_group_id
     * @param course_id
     * @param group_id NOTE: Might not need
     * @param username
     * @returns
     */
    static async add_user_to_new_group(course_id, group_id, username) {
        throw new Error("Method 'add_user_to_new_group()' must be implemented.");

    }

    /**
     * NEW gitlab_add_user_with_gitlab_group_id
     * @param vcs_group_id
     * @param vcs_url
     * @param username
     * @returns
     */
    static async add_user_with_group_id(vcs_group_id, vcs_url, username) {
        throw new Error("Method 'add_user_with_group_id()' must be implemented.");
        // GITLAB_URL/groups/:id/members
        // gitlab API link: https://docs.gitlab.com/ee/api/members.html
    }

    /**
     * gitlab_create_group_and_project_no_user
     * @param course_id
     * @param group_id
     * @param task
     * @returns
     */
    static async create_group_and_project_no_user(course_id, group_id, task) {
        throw new Error("Method 'create_group_and_project_no_user()' must be implemented.");
    }

    /**
     * gitlab_create_group_and_project_with_user
     * @param course_id
     * @param group_id
     * @param username
     * @param task
     * @returns
     */
    static async create_group_and_project_with_user(course_id, group_id, username, task) {
        throw new Error("Method 'create_group_and_project_with_user()' must be implemented.");
    }

    /**
     * gitlab_remove_user
     * @param course_id
     * @param group_id
     * @param username
     * @returns
     */
    static async remove_user_from_group(course_id, group_id, username) {
        throw new Error("Method 'remove_user_from_group()' must be implemented.");
    }

    /**
     * gitlab_get_user_id
     * @param username
     * @returns
     */
    static async get_vcs_user_id(username) {
        throw new Error("Method 'get_vcs_user_id()' must be implemented.");
    }

    /**
     * gitlab_get_commits
     * @param course_id
     * @param group_id
     * @returns
     */
    static async get_commits(course_id, group_id) {
        throw new Error("Method 'get_commits()' must be implemented.");
        // projects/:gitlab_project_id/repository/commits
        // https://docs.gitlab.com/ee/api/commits.html

        // projects/:gitlab_project_id/events
        // https://docs.gitlab.com/ee/api/events.html
    }


}

module.exports = AbstractVCS;