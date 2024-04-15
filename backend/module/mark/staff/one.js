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

        res.status(200).json({marks});
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: "Unknown error." });
    }

    // if (!("username" in req.query) || helpers.name_validate(req.query["username"])) {
    //     res.status(400).json({ message: "The username is missing or has invalid format." });
    //     return;
    // }

    // if (req.query["total"] === true || req.query["total"] === "true") {
    //     var total = true;
    // } else {
    //     var total = false;
    // }

    // if (res.locals["task"] === "") {
    //     let sql_mark = "SELECT username, task, SUM(mark) AS sum FROM course_" + res.locals["course_id"] + ".mark WHERE username = ($1) GROUP BY username, task";
    //     client.query(sql_mark, [req.query["username"]], (err, pgRes) => {
    //         if (err) {
    //             res.status(404).json({ message: "Unknown error." });
    //         } else {
    //             helpers.format_marks_all_tasks(pgRes.rows, res.locals["course_id"], total).then(marks => {
    //                 res.json({ marks: marks });
    //             });
    //         }
    //     });
    // } else {
    //     let sql_mark = "SELECT * FROM course_" + res.locals["course_id"] + ".mark WHERE username = ($1) AND task = ($2)";
    //     client.query(sql_mark, [req.query["username"], res.locals["task"]], (err, pgRes) => {
    //         if (err) {
    //             res.status(404).json({ message: "Unknown error." });
    //         } else {
    //             helpers.format_marks_one_task(pgRes.rows, res.locals["course_id"], res.locals["task"], total).then(marks => {
    //                 res.json({ marks: marks });
    //             });
    //         }
    //     });
    // }
})

module.exports = router;