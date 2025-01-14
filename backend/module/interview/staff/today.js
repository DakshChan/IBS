const express = require("express");
const router = express.Router();
const moment = require("moment");
require("moment-timezone");
const { Op } = require("sequelize");
const { Interview } = require("../../../models");

router.get("/", async (req, res) => {
    try {
        if (!res.locals["task"]) {
            return res.status(400).json({ message: "The task is missing or invalid." });
        }

        // Define start and end of today in UTC
        const startOfTodayUTC = new Date(Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate()
        ));

        const endOfTodayUTC = new Date(Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate(),
            23, 59, 59, 999
        ));

        // Fetch interviews for today (UTC range)
        const interviewsToday = await Interview.findAll({
            where: {
                task_id: res.locals["task"],
                host: res.locals["username"],
                date: { [Op.between]: [startOfTodayUTC, endOfTodayUTC] }
            },
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        // Define start and end of today in Toronto time
        const midnightToronto = moment().tz("America/Toronto").startOf("day"); // Midnight in Toronto
        const endOfDayToronto = moment().tz("America/Toronto").endOf("day");   // 11:59:59 PM in Toronto

        // Filter interviews based on Toronto time
        const validInterviews = interviewsToday.filter(interview => {
            // Combine date and time into an ISO8601-compliant datetime string
            const interviewDateTimeUTC = moment.utc(`${interview.date.toISOString().split('T')[0]}T${interview.time}`);
            const interviewDateTimeToronto = interviewDateTimeUTC.tz("America/Toronto");

            // Check if the interview falls between midnight and 11:59:59 PM in Toronto
            return interviewDateTimeToronto.isBetween(midnightToronto, endOfDayToronto, null, '[]'); // inclusive range
        });

        // Map the interviews to the required format
        const formattedInterviews = validInterviews.map(interview => {
            const interviewDateTimeUTC = moment.utc(`${interview.date.toISOString().split('T')[0]}T${interview.time}`);
            const startTimeToronto = interviewDateTimeUTC.tz("America/Toronto").format("YYYY-MM-DD HH:mm:ss");
            const endTimeToronto = interviewDateTimeUTC.add(interview.length, 'minutes').tz("America/Toronto").format("YYYY-MM-DD HH:mm:ss");

            return {
                id: interview.id,
                task_id: interview.task_id,
                start_time: startTimeToronto,
                end_time: endTimeToronto,
                host: interview.host,
                group_id: interview.group_id,
                length: parseInt(interview.length),
                location: interview.location,
                note: interview.note,
                cancelled: interview.cancelled
            };
        });

        return res.status(200).json({ count: formattedInterviews.length, interviews: formattedInterviews });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unknown error." });
    }
});

module.exports = router;
