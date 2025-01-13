const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");

const { Sequelize } = require('sequelize');
const { Interview } = require("../../../models");

router.get("/", async (req, res) => {
    if (res.locals["task"] === "") {
        res.status(400).json({ message: "The task is missing or invalid." });
        return;
    }
    if (res.locals["hide_interview"] === true) {
        res.status(400).json({ message: "The interviews are not ready yet." });
        return;
    }

    let sql_times = "SELECT to_char(time AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI:SS') AS start_time, " +
        "to_char(time AT TIME ZONE 'America/Toronto' + CONCAT(length,' minutes')::INTERVAL, 'YYYY-MM-DD HH24:MI:SS') AS end_time, " +
        "COUNT(*) AS all_count, COUNT(group_id) AS booked_count, location FROM course_" +
        res.locals["course_id"] + ".interview WHERE task = ($1) AND time > now() AND cancelled = false GROUP BY time, length, location ORDER BY time";
    client.query(sql_times, [res.locals["task"]], (err, pgRes) => {
        if (err) {
            res.status(404).json({ message: "Unknown error." });
            console.log(err)
        } else {
            let interviews = {};
            for (let interview of pgRes.rows) {
                if (!(interview["location"] in interviews)) {
                    interviews[interview["location"]] = {};
                }
                let time = interview["start_time"] + " - " + interview["end_time"];
                interviews[interview["location"]][time] = interview["all_count"] - interview["booked_count"];
            }
            let interviews_count = Object.keys(interviews).length;
            if (interviews_count != 0) {
                res.json({ task: res.locals["task"], count: interviews_count, availability: interviews });
            } else {
                res.json({ task: res.locals["task"], message: "No interview is available." });
            }
        }
    });
})

module.exports = router;