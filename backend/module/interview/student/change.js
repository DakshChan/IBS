const express = require("express");
const router = express.Router();
const moment = require("moment");
require("moment-timezone");
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const rate_limit = require("../../../setup/rate_limit");

const { Op, Sequelize } = require('sequelize');
const { Interview } = require("../../../models");

router.put("/", rate_limit.email_limiter, async (req, res) => {
    if (res.locals["task"] === "") {
        res.status(400).json({ message: "The task is missing or invalid." });
        return;
    }
    if (res.locals["hide_interview"] === true) {
        res.status(400).json({ message: "The interviews are not ready yet." });
        return;
    }
    if (!("time" in req.body) || helpers.time_validate(req.body["time"])) {
        res.status(400).json({ message: "Your desired time is missing or not correct." });
        return;
    }
    if (moment.tz(req.body["time"], "America/Toronto").subtract(30, "minutes") < moment().tz("America/Toronto")) {
        res.status(400).json({ message: req.body["time"] + " was in the past or is within 30 minutes from now. Please choose a new time." });
        return;
    }
    let time = req.body["time"] + " America/Toronto";

    let location = "Zoom";
    if ("location" in req.body) {
        if (helpers.string_validate(req.body["location"])) {
            res.status(400).json({ message: "Your desired location has invalid format." });
            return;
        } else {
            location = req.body["location"];
        }
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

    // Extract the date part from booked_interview.date and combine it with time
    const dateOnly = moment.utc(booked_interview.date).format('YYYY-MM-DD'); // Extract date in 'YYYY-MM-DD' format
    const booked_time = moment.utc(`${dateOnly} ${booked_interview.time}`, 'YYYY-MM-DD HH:mm:ss'); // Combine date and time correctly

    // Get the current time and the time 2 hours from now
    const now = moment.utc();
    const twoHoursLater = moment.utc().add(2, 'hours');

    // Check if the booked time is in the past or within the next 2 hours
    if (booked_time.isBefore(now)) {
        return res.status(400).json({ message: "The booked interview is in the past." });
    } else if (booked_time.isBetween(now, twoHoursLater, null, '[)')) {
        res.status(400).json({ message: "Your interview for " + res.locals["task"] + " at " + booked_time + " was in the past or will take place in 2 hours. You can't cancel it at this time." });
    }

    const freeInterview = await Interview.findOne({
        where: { task_id: res.locals["task"], time: time, location: location, group_id: null, cancelled: false },
        lock: true
    })

    if (!freeInterview) {
        res.status(400).json({ message: "No available interview exists for " + res.locals["task"] + " at " + req.body["time"] + " at location " + location + ". Please choose a different time." });
    }

    // set the freeinterview to booked
    const update = await Interview.update({
        group_id: group_id
    }, {
        where: { id: freeInterview.id }
    })

    if (update === 0) {
        res.status(404).json({ message: "Unknown error." });
        return;
    }

    const formattedTime = booked_time.format('YYYY-MM-DD HH:mm:ss');

    let message = "You have changed your interview for " + res.locals["task"] + " from " + formattedTime + " to " + req.body["time"] + " successfully. The new location is " + location + ".";
    res.status(200).json({ message: message });

    // set the old interview as unbooked now

    const result = await Interview.update(
        { group_id: null },
        {
            where: { id: booked_interview.id }
        })
})

module.exports = router;