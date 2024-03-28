const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Mark } = require("../../../models");
const helpers = require("../../../utilities/helpers");
const sequelize = require('../../../helpers/database');

router.get("/", async (req, res) => {
    let total;
    try {
        total = req.query["total"] === true || req.query["total"] === "true";
        const {task} = req.query;
        let marksData;
        let marks;
        if (!task) {
            // Retrieve all marks for the student
            marksData = await Mark.findAll({
                where: {username: res.locals.username, hidden: false},
                attributes: [
                    "username",
                    "task_name",
                    [sequelize.fn("SUM", sequelize.col("mark")), "sum"],
                ],
                group: ["username", "task_name"],
            });

            marks = await helpers.format_marks_all_tasks(marksData, res.locals.course_id, total);

        } else {
            // Retrieve marks for a specific task for the student
            marksData = await Mark.findAll({
                where: {username: res.locals.username, task, hidden: false},
                order: [["criteria_id", "ASC"]],
            });

            marks = await helpers.format_marks_one_task(marksData, res.locals.course_id, task, true);
        }

        // // Format marks data
        // const marks = total
        //     ? await helpers.format_marks_all_tasks(marksData, res.locals.course_id, true)
        //     : await helpers.format_marks_one_task(marksData, res.locals.course_id, task, true);

        res.json({marks});
    } catch (error) {
        console.error(error);
        res.status(404).json({message: "Unknown error."});
    }
    //
    // if (req.query["total"] === true || req.query["total"] === "true") {
    //     var total = true;
    // } else {
    //     var total = false;
    // }
    //
    // if (res.locals["task"] === "") {
    //     let sql_mark = "SELECT username, task, SUM(mark) AS sum FROM course_" + res.locals["course_id"] + ".mark WHERE username = ($1) AND hidden = false GROUP BY username, task";
    //     client.query(sql_mark, [res.locals["username"]], (err, pgRes) => {
    //         if (err) {
    //             res.status(404).json({ message: "Unknown error." });
    //         } else {
    //             helpers.format_marks_all_tasks(pgRes.rows, res.locals["course_id"], total).then(marks => {
    //                 res.json({ marks: marks });
    //             });
    //         }
    //     });
    // } else {
    //     let sql_mark = "SELECT * FROM course_" + res.locals["course_id"] + ".mark WHERE username = ($1) AND task = ($2) AND hidden = false ORDER BY criteria_id";
    //     client.query(sql_mark, [res.locals["username"], res.locals["task"]], (err, pgRes) => {
    //         if (err) {
    //             res.status(404).json({ message: "Unknown error." });
    //         } else {
    //             helpers.format_marks_one_task(pgRes.rows, res.locals["course_id"], res.locals["task"], total).then(marks => {
    //                 res.json({ marks: marks });
    //             });
    //         }
    //     });
});

module.exports = router;