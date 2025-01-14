const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const moment = require("moment");
require("moment-timezone");

const { Interview } = require("../../../models");

router.get("/", async (req, res) => {
    try{
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
        res.status(400).json({ message: "You need to join a group before checking your interview." });
        return;
    }

    const bookedInterview = await Interview.findOne({
        where: {task_id: res.locals["task"], group_id: group_id, cancelled: false }
    })

    if (!bookedInterview){
        res.status(200).json({ message: "You don't have a booked interview for " + res.locals["task"] + " yet.", booked: false });
    }

    // Convert bookedInterview.date to a proper date without time
    const dateOnly = moment.utc(bookedInterview.date).format('YYYY-MM-DD'); // Extract date in 'YYYY-MM-DD'

    // Combine the date and time correctly
    const startTimeUTC = moment.utc(`${dateOnly} ${bookedInterview.time}`, 'YYYY-MM-DD HH:mm:ss');

    // Convert to Toronto time
    const startTimeToronto = startTimeUTC.tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss');

    // Calculate the end time and convert to Toronto time
    const endTimeUTC = startTimeUTC.clone().add(bookedInterview.length, 'minutes');
    const endTimeToronto = endTimeUTC.tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss');

    let message = "Your interview for " + res.locals["task"] + " is from " + startTimeToronto + " to " + endTimeToronto + ". The location is " + bookedInterview.location + ".";
    res.status(200).json({ message: message, booked: true, start_time: startTimeToronto , end_time: endTimeToronto, location: bookedInterview.location, note: bookedInterview.note });
} catch (error) {
    console.log(error);
    return;
}
})

module.exports = router;