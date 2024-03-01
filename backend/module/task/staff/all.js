const express = require("express");
const router = express.Router();
const { Task, Course } = require("../../../models");
const helpers = require("../../../utilities/helpers"); // Adjust path according to your project structure

router.get("/", async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { course_id: res.locals["course_id"] },
            attributes: ['task', 'long_name', 'due_date', 'hidden', 'weight', 'min_member', 'max_member', 'max_token', 'change_group', 'hide_interview', 'hide_file', 'interview_group', 'task_group_id', 'starter_code_url'],
            order: [['due_date', 'ASC'], ['task', 'ASC']]
        });

        if (tasks) {
            res.status(200).json({ count: tasks.length, task: tasks });
        } else {
            res.status(404).json({ message: "Tasks not found." });
        }
    } catch (error) {
        res.status(500).json({ message: "Unknown error occurred." });
    }
});

module.exports = router;
