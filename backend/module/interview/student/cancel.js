const express = require("express");
const router = express.Router();
const moment = require("moment");
require("moment-timezone");
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const rate_limit = require("../../../setup/rate_limit");

const { Op, Sequelize } = require('sequelize');
const { Interview } = require("../../../models");

router.delete("/", rate_limit.email_limiter, async (req, res) => {
    if (res.locals["task"] === "") {
        res.status(400).json({ message: "The task is missing or invalid." });
        return;
    }
    if (res.locals["hide_interview"] === true) {
        res.status(400).json({ message: "The interviews are not ready yet." });
        return;
    }

    if (res.locals["interview_group"] !== "" && res.locals["interview_group"] !== null) {
        var task = res.locals["interview_group"];
    } else {
        var task = res.locals["task"];
    }

    const group_id = await helpers.get_group_id(res.locals["course_id"], task, res.locals["username"]);
    if (group_id === -1) {
        res.status(400).json({ message: "You need to join a group before cancelling your interview." });
        return;
    }


    const booked_interview = await Interview.findOne({
        where: { group_id: group_id, task_id: res.locals["task"], cancelled: false }
    })

    if (!booked_interview) {
        res.status(400).json({ message: "You don't have a booked interview for " + res.locals["task"] + " yet." });
    }

    const booked_time = moment.utc(`${booked_interview.date} ${booked_interview.time}`, 'YYYY-MM-DD HH:mm:ss');

    // Get the current time and the time 2 hours from now
    const now = moment.utc();
    const twoHoursLater = moment.utc().add(2, 'hours');

    // Check if the booked time is in the past or within the next 2 hours
    if (booked_time.isBefore(now)) {
        return res.status(400).json({ message: "The booked interview is in the past." });
    } else if (booked_time.isBetween(now, twoHoursLater, null, '[)')) {
        res.status(400).json({ message: "Your interview for " + res.locals["task"] + " at " + booked_time + " was in the past or will take place in 2 hours. You can't cancel it at this time." });
    }

    const interview_to_cancel_id = booked_interview.id;

    const update = await Interview.update({
        group_id: null
    }, { where: { id: interview_to_cancel_id } })

    if (update === 0){
        res.status(404).json({ message: "Unknown error." });
    }

    let message = "You have cancelled your interview for " + res.locals["task"] + " at " + booked_time + " successfully.";
    res.status(200).json({ message: message });
    helpers.send_email_by_group(res.locals["course_id"], group_id, "IBS Interview Confirmation", message);
})

module.exports = router;