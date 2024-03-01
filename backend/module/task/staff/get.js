const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Task } = require("../../../models");

router.get("/", async (req, res) => {

    try {
        if (!req.query.task){
            return res.status(400).json({message: "The task is missing or invalid."});
        }
        const taskDetails = await Task.findOne({
            where: {
                task: req.query.task
            },
            attributes: ['task', 'long_name', 'due_date', 'hidden', 'weight', 'min_member', 'max_member', 'max_token', 'change_group', 'hide_interview', 'hide_file', 'interview_group', 'task_group_id', 'starter_code_url']
        });

        if (!taskDetails) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Add the due_date_utc field
        // taskDetails.due_date_utc = taskDetails.due_date.toISOString();
        taskDetails.dataValues.due_date_utc = taskDetails.due_date.toISOString();

        return res.status(200).json({ message: "Task details are returned.", task: taskDetails });

    } catch (error) {
        console.error("Error retrieving task details: ", error);
        return res.status(500).json({message: "Unknown error occurred."});
    }

})

module.exports = router;
