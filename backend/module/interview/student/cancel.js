const express = require("express");
const router = express.Router();
const moment = require("moment");
require("moment-timezone");
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const rate_limit = require("../../../setup/rate_limit");

router.delete("/", rate_limit.interviews_limiter, (req, res) => {
    if (!("task" in req.body) || helpers.string_validate(req.body["task"])) {
        res.status(400).json({ message: "The task is missing or has invalid format." });
        return;
    }

    helpers.get_group_id(res.locals["course_id"], req.body["task"], res.locals["username"]).then(group_id => {
        let sql_check = "SELECT interview_id, to_char(time AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI:SS') AS time, location FROM course_" + res.locals["course_id"] + ".interview WHERE group_id = ($1) AND task = ($2)";
        client.query(sql_check, [group_id, req.body["task"]], (err, pg_res_check) => {
            if (err) {
                res.status(404).json({ message: "Unknown error." });
            } else {
                if (pg_res_check.rowCount === 0) {
                    res.status(400).json({ message: "You don't have a booked interview for " + req.body["task"] + " yet." });
                } else if (moment.tz(pg_res_check.rows[0]["time"], "America/Toronto").subtract(2, "hours") < moment().tz("America/Toronto")) {
                    res.status(400).json({ message: "Your interview for " + req.body["task"] + " at " + pg_res_check.rows[0]["time"] + " was in the past or will take place in 2 hours. You can't cancel it at this time." });
                } else {
                    let sql_cancel = "UPDATE course_" + res.locals["course_id"] + ".interview SET group_id = NULL WHERE interview_id = ($1)";
                    client.query(sql_cancel, [pg_res_check.rows[0]["interview_id"]], (err, pr_res_cancel) => {
                        if (err) {
                            res.status(404).json({ message: "Unknown error." });
                        } else {
                            let message = "You have cancelled your interview for " + req.body["task"] + " at " + pg_res_check.rows[0]["time"] + " successfully.";
                            res.status(200).json({ message: message });
                            helpers.send_email(res.locals["group_emails"], "Your CSC309 Interview Confirmation", message + "\n\nCongratulations!");
                        }
                    });
                }
            }
        });
    });
})

module.exports = router;