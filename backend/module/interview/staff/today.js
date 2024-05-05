const express = require("express");
const router = express.Router();
const moment = require("moment");
require("moment-timezone");
const { Op } = require("sequelize");
const { Interview } = require("../../../models");

router.get("/", async (req, res) => {
    try {
        if (res.locals["task"] === "") {
            res.status(400).json({ message: "The task is missing or invalid." });
            return;
        }

        // Get the current date in America/Toronto timezone
        const currentDate = moment().tz("America/Toronto").format("YYYY-MM-DD");

        const startDate = new Date(`${currentDate} 00:00:00`);
        const endDate = new Date(`${currentDate} 23:59:59`)

        // Find interviews within the next 24 hours for the specified task and host
        const interviews = await Interview.findAll({
            where: {
                task_name: res.locals["task"],
                host: res.locals["username"],
                time: {
                    [Op.between]: [
                        startDate,
                        endDate
                    ]
                }
            },
            order: [['time', 'ASC']]
        });

        // Map the interviews to the required format
        const formattedInterviews = interviews.map(interview => ({
            id: interview.interview_id,
            task_name: interview.task_name,
            start_time: moment(interview.time).tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss'),
            end_time: moment(interview.time).add(interview.length, 'minutes').tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss'),
            host: interview.host,
            group_id: interview.group_id,
            length: parseInt(interview.length),
            location: interview.location,
            note: interview.note,
            cancelled: interview.cancelled
        }));

        return res.status(200).json({ count: interviews.length, interviews: formattedInterviews });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Unknown error." });
    }
});

module.exports = router;
