const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Mark, Task } = require("../../../models");
const helpers = require("../../../utilities/helpers");
const sequelize = require('../../../helpers/database');

router.get("/", async (req, res) => {
    try {
        let courseId = res.locals.course_id;
        let total = req.query["total"] === true || req.query["total"] === "true";
        const task = req.query["task"];
        let marks;

        if (!task) {
            // Retrieve all marks in the course 
            const tasks = await Task.findAll({
                where: { course_id: courseId },
                attributes: ['task']
            });

            const taskNames = tasks.map(task => task.task);
            const marksData = await Mark.findAll({
                where: { task_name: taskNames },
                attributes: [
                    "username",
                    "task_name",
                    [sequelize.fn("SUM", sequelize.col("mark")), "sum"],
                ],
                group: ["username", "task_name"],
                order: ["username"]
            });

            marks = await helpers.format_marks_all_tasks_csv(marksData, courseId, res, task);

        } else {
            // Retrieve marks for a specific task
            marksData = await Mark.findAll({
                where: {task_name: task},
                order: [["username"]],
            });

            marks = await helpers.format_marks_one_task_csv(marksData, courseId, task, res, true);
        }

        //res.status(200).json({marks});
    } catch (error) {
        console.error(error);
        res.status(404).json({message: "Unknown error."});
    }
})

module.exports = router;