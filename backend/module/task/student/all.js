const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const {Task} = require("../../../models");

router.get("/", async (req, res) => {
    // let sql_task = "SELECT task, long_name, to_char(due_date AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI:SS') AS due_date, due_date AS due_date_utc, hidden, weight, min_member, max_member, max_token, change_group, hide_interview, hide_file, interview_group, task_group_id, starter_code_url FROM course_" + res.locals["course_id"] + ".task WHERE hidden = 'false' ORDER BY due_date, task";
    // client.query(sql_task, [], (err, pg_res) => {
    //     if (err) {
    //         res.status(404).json({ message: "Unknown error." });
    //     } else {
    //         res.status(200).json({ count: pg_res.rowCount, task: pg_res.rows });
    //     }
    // });

    const course_id = res.locals["course_id"];

    try {
        const tasks = await Task.findAll({
            where: {course_id: course_id}
        });

        if (!tasks) {
            return res.status(400).json({message: "The task is invalid."});
        }

        const count = tasks.length;

        res.status(200).json({
            message: "Task details are returned.",
            tasks: tasks,
            count: count
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Unknown error."});
    }
})

module.exports = router;
