const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Mark, Task } = require("../../../models");
const helpers = require("../../../utilities/helpers");
const sequelize = require('../../../helpers/database');

router.get("/", async(req, res) => {
    try {
        let courseId = res.locals.course_id;
        let total = req.query["total"] === true || req.query["total"] === "true";
        const task = req.query["task"];
        let marks;

        if (!("username" in req.query) || helpers.name_validate(req.query["username"])) {
            res.status(400).json({ message: "The username is missing or has invalid format." });
            return;
        }

        let username = req.query["username"];

        if (!task) {
            // Retrieve all marks of student in the course 
            const tasks = await Task.findAll({
                where: {
                    course_id: courseId                    
                },
                attributes: ['task']
            });

            const taskNames = tasks.map(task => task.task);
            const marksData = await Mark.findAll({
                where: { task_name: taskNames, username: username },
                attributes: [
                    "username",
                    "task_name",
                    [sequelize.fn("SUM", sequelize.col("mark")), "sum"],
                ],
                group: ["username", "task_name"]
            });
            marks = await helpers.format_marks_all_tasks(marksData, courseId, task);
        } else {
            // Retrieve marks for a specific task
            marksData = await Mark.findAll({
                where: {task_name: task, hidden: false, username: username},
                order: [["username"]],
            });

            marks = await helpers.format_marks_one_task(marksData, courseId, task, true);     
        }

        if (marks && 'error' in marks) {
            return res.status(404).json({ message: marks.error });
        }

        res.status(200).json({marks});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unknown error." });
    }
})

module.exports = router;