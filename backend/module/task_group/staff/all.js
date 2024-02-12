const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");

router.get("/", (req, res) => {
    let sql_task_group = "SELECT * FROM task_groups WHERE course_id=" + res.locals["course_id"] + " ORDER BY task_group_id";
    client.query(sql_task_group, [], (err, pg_res) => {
        if (err) {
            res.status(404).json({ message: "Unknown error." });
        } else {
            res.status(200).json({ count: pg_res.rowCount, task_group: pg_res.rows });
        }
    });
})

module.exports = router;