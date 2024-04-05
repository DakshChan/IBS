const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const { Task, Group, GroupUser } = require("../../../models")

router.get("/", async (req, res) => {
    if (res.locals["task"] === "") {
        res.status(400).json({ message: "The task is missing or invalid." });
        return;
    }

    const task = await Task.findOne({ where: { task: res.locals.task, course_id: res.locals["course_id"] }});

    // Getting groups for this task
    const studentGroups = await Group.findAll({ where: { task_id: task.id }});

    const groups = [];

    for (const group of studentGroups) {
        const usernames = await GroupUser.findAll({ where: { group_id: group.group_id }, attributes: ['username']});
        const users = usernames.map((username) => username.username);
        groups.push({
            group_id: group.group_id,
            task_id: group.task_id,
            extension: group.extension,
            gitlab_group_id: group.gitlab_group_id,
            gitlab_project_id: group.gitlab_project_id,
            gitlab_url: group.gitlab_url,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            users,
        })
    }

    return res.status(200).json({ count: groups.length, groups });
})

module.exports = router;