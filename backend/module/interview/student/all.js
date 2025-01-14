const express = require("express");
const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const { Interview } = require("../../../models");
const moment = require("moment-timezone");

router.get("/", async (req, res) => {
    try {
        if (!res.locals["task"]) {
            res.status(400).json({ message: "The task is missing or invalid." });
            return;
        }
        if (res.locals["hide_interview"]) {
            res.status(400).json({ message: "The interviews are not ready yet." });
            return;
        }

        const todayUTC = moment.tz("America/Toronto").startOf("day").utc().toDate();

        // Fetch available interviews, combining date and time
        const availableInterviews = await Interview.findAll({
            attributes: [
                'date', 
                'time',
                'length',
                'location',
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'all_count'],
                [Sequelize.fn('COUNT', Sequelize.col('group_id')), 'booked_count']
            ],
            where: {
                task_id: res.locals["task"],
                cancelled: false,
                group_id: null,
                date: { [Op.gt]: todayUTC },
            },
            group: ['date', 'time', 'length', 'location'],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        // Process the results into a nested object
        let interviews = {};
        availableInterviews.forEach(interview => {
            const data = interview.get();

            // Combine date and time into a single datetime
            const combinedDateTime = moment.utc(`${data.date}T${data.time}`).tz('America/Toronto');

            // Format start and end times
            const startTime = combinedDateTime.format('YYYY-MM-DD HH:mm:ss');
            const endTime = combinedDateTime.add(data.length, 'minutes').format('YYYY-MM-DD HH:mm:ss');

            // Create time slot string
            const timeSlot = `${startTime} - ${endTime}`;

            // Ensure the location exists in the interviews object
            if (!interviews[data.location]) {
                interviews[data.location] = {};
            }

            // Calculate available slots
            const availableSlots = data.all_count - data.booked_count;

            // Assign to nested object
            interviews[data.location][timeSlot] = availableSlots;
        });

        const interviews_count = Object.keys(interviews).length;
        if (interviews_count > 0) {
            res.json({ task: res.locals["task"], count: interviews_count, availability: interviews });
        } else {
            res.json({ task: res.locals["task"], message: "No interview is available." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unknown error." });
    }
});

module.exports = router;
