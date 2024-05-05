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
        var userTimezoneOffset = start_time.getTimezoneOffset() * 60000;
        const convert_start_time = new Date(start_time.getTime() - userTimezoneOffset);
        const convert_end_time = new Date(end_time.getTime() - userTimezoneOffset);
        
        // Construct interview object
        const new_interview = {
            task_name: res.locals["task"],
            time: convert_start_time, 
            host: res.locals["username"],
            location: location,
            length: req.body["length"]
        };

        // Check if the task exists
        const task = await Task.findOne({ where: { task: res.locals["task"] } });
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
            const existing_start = moment.tz(existingInterview.dataValues.time, "America/Toronto").utc().toDate();
            const existing_end = moment.tz(existingInterview.dataValues.time, "America/Toronto").add(existingInterview.dataValues.length, 'minutes').utc().toDate();

            // Compare start and end times
            if ((convert_start_time >= existing_start && convert_start_time  <= existing_end) || 
                (convert_end_time >= existing_start && convert_end_time <= existing_end) || 
                (convert_start_time <= existing_start && convert_end_time >= existing_end)) {
                return res.status(409).json({ message: "You have another interview at the same time." });
            }
        }

        // Create the interview record
        await Interview.create(new_interview);

        // Send success message
        let message = `You have scheduled an interview for ${res.locals["task"]} at ${req.body["time"]} successfully.`;
        return res.status(200).json({ message: message });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Unknown error." });
    }
});

module.exports = router;