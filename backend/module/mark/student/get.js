const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Mark } = require("../../../models");
const helpers = require("../../../utilities/helpers");
const sequelize = require('../../../helpers/database');

router.get("/", async (req, res) => {
    let total;
    try {
        total = req.body["total"] === true || req.body["total"] === "true";
        const task = req.body["task"];

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
            
            marks = await helpers.format_marks_all_tasks(marksData, res.locals.course_id, task);

        } else {
            // Retrieve marks for a specific task for the student
            marksData = await Mark.findAll({
                where: {username: res.locals.username, hidden: false},
                order: [["criteria_id", "ASC"]],
            });

            marks = await helpers.format_marks_one_task(marksData, res.locals.course_id, task, true);
        }

        res.json({marks});
    } catch (error) {
        console.error(error);
        res.status(404).json({message: "Unknown error."});
    }
});

module.exports = router;