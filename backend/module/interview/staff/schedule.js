const express = require("express");
const router = express.Router();
const { User, Interview, Task } = require("../../../models");
const helpers = require("../../../utilities/helpers");
const moment = require("moment");
require("moment-timezone");
const { Op, Sequelize } = require("sequelize");

router.post("/", async (req, res) => {
    try {
        if (res.locals["task"] === "") {
            res.status(400).json({ message: "The task is missing or invalid." });
            return;
        }

        if (!("length" in req.body) || helpers.number_validate(req.body["length"])) {
            res.status(400).json({ message: "The length is missing or has invalid format." });
            return;
        }

        let location = "";
        if ("location" in req.body && helpers.string_validate(req.body["location"])) {
            res.status(400).json({ message: "The location has invalid format." });
            return;
        } else if ("location" in req.body && !helpers.string_validate(req.body["location"])) {
            location = req.body["location"];
        } else {
            location = "Zoom";
        }

        if (!("time" in req.body) || helpers.time_validate(req.body["time"])) {
            res.status(400).json({ message: "The time is missing or has invalid format. (YYYY-MM-DD HH:mm:ss)" });
            return;
        }

        // Converting timezones
        var start_time = moment.tz(req.body["time"], 'America/Toronto').utc().toDate();
        var end_time = moment.tz(req.body["time"], "America/Toronto").add(req.body["length"], 'minutes').utc().toDate();

        const convert_start_time = start_time;
        const convert_end_time = end_time;

        // Construct interview object
        const new_interview = {
            task_id: res.locals["task"],
            date: moment.utc(start_time).format('YYYY-MM-DD'),
            time: moment.utc(start_time).format('HH:mm:ss'),
            host: res.locals["username"],
            location: location,
            length: req.body["length"]
        };

        // Check if the task exists
        const task = await Task.findOne({ where: { id: res.locals["task"] } });
        if (!task) {
            return res.status(400).json({ message: "The task is not found in the database." });
        }

        // Check if the username exists
        const user = await User.findOne({ where: { username: res.locals["username"] } });
        if (!user) {
            return res.status(400).json({ message: "The username is not found in the database." });
        }

        const existingInterviews = await Interview.findAll({
            where: {
                host: new_interview.host
            }
        });

        // Loop through existing interviews
        for (const existingInterview of existingInterviews) {
            const existingDate = moment.utc(existingInterview.dataValues.date).format('YYYY-MM-DD'); // Ensure UTC date
            const existingTime = existingInterview.dataValues.time; // e.g., "13:30:00"
            const fullDateTime = `${existingDate}T${existingTime}Z`; // Combine and ensure UTC

            const existing_start = moment.utc(fullDateTime); // Ensure existing start is in UTC
            const existing_end = moment(existing_start).add(existingInterview.dataValues.length, 'minutes'); // End time in UTC

            if (
                moment.utc(convert_start_time).isBetween(existing_start, existing_end, null, '[)') ||
                moment.utc(convert_end_time).isBetween(existing_start, existing_end, null, '(]') ||
                (moment.utc(convert_start_time).isSameOrBefore(existing_start) && moment.utc(convert_end_time).isSameOrAfter(existing_end))
            ) {
                return res.status(409).json({ message: "You have another interview at the same time." });
            }
        }


        // Create the interview record
        await Interview.create(new_interview);

        // Obtain the task name
        const taskData = await Task.findOne({
            attributes: ['task'], // Specify the column(s) you want to retrieve
            where: {
                id: res.locals["task"]
            }
        });

        // Send success message
        let message = `You have scheduled an interview for ${taskData.task} at ${req.body["time"]} successfully.`;
        return res.status(200).json({ message: message });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Unknown error." });
    }
});

module.exports = router;