const express = require("express");
const router = express.Router();
const { Criteria, Task } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.get("/", async (req, res) => {
    try {

        if (res.locals["task"] === "") {
            res.status(400).json({ message: "The task is missing or invalid." });
            return;
        }

        // Fetch criteria based on task ID
        const taskCriteria = await Criteria.findAll({
            where: {task_name: res.locals["task"]},
            order: [['id', 'ASC']] // Assuming criteria_id is the primary key
        });

        res.status(200).json({count: taskCriteria.length, criteria: taskCriteria});
    } catch (error) {
        console.error(error);
        res.status(404).json({message: "Unknown error."});
    }


    // if (res.locals["task"] === "") {
    //     res.status(400).json({ message: "The task is missing or invalid." });
    //     return;
    // }
    //
    // let sql_criteria = "SELECT * FROM course_" + res.locals["course_id"] + ".criteria WHERE task = ($1) ORDER BY criteria_id";
    // client.query(sql_criteria, [res.locals["task"]], (err, pg_res) => {
    //     if (err) {
    //         res.status(404).json({ message: "Unknown error." });
    //     } else {
    //         res.status(200).json({ count: pg_res.rowCount, criteria: pg_res.rows });
    //     }
    // });
})

module.exports = router;