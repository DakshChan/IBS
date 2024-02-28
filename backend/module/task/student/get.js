const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const {Task} = require("../../../models");
const sequelize = require('../../../helpers/database');

router.get("/", async (req, res) => {
    const task_id = req.query.task;
    const course_id = res.locals["course_id"];

    if (task_id === "") {
        return res.status(400).json({message: "The task is missing or invalid."});
    }

    try {
        const task = await Task.findOne({
            attributes: [
                'task',
                'long_name',
                [sequelize.fn('to_char', sequelize.fn('timezone', 'America/Toronto', sequelize.col('due_date')), 'YYYY-MM-DD HH24:MI:SS'), 'due_date'],
                ['due_date', 'due_date_utc'],
                'hidden',
                'weight',
                'min_member',
                'max_member',
                'max_token',
                'change_group',
                'hide_interview',
                'hide_file',
                'interview_group',
                'task_group_id',
                'starter_code_url'
            ],
            where: {id: task_id, course_id: course_id, hidden: 'false'}
        });

        if (!task) {
            return res.status(404).json({message: "Unknown error."});
        }

        res.status(200).json({
            message: "Task details are returned.",
            task: task
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({message: "Unknown error."});
    }
});

module.exports = router;
