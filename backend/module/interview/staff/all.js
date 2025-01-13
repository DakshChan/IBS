const moment = require('moment');
require('moment-timezone');
const express = require("express");
const router = express.Router();
const { Interview, Task } = require("../../../models");
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const sequelize = require('../../../helpers/database');

/**
 * Obtain all interviews for a course_id and task_id
 */

router.get("/", async (req, res) => {
    try {

        const task = res.locals["task"];

        if (task === "") {
            return res.status(400).json({ message: "The task is missing or invalid." });
        }

        // if (res.locals["task"] === "") {
        //     res.status(400).json({ message: "The task is missing or invalid." });
        //     return;
        // }

        // let filter = helpers.interview_data_filter(req.query, true, res.locals["username"]); -> Doesnt seem like there are filters for this based on FE code

        // const interviews = await Interview.findAll({
        //     attributes: [
        //         'id',
        //         'task_name',
        //         'time',
        //         'host',
        //         'group_id',
        //         'length',
        //         'location',
        //         'note',
        //         'cancelled'
        //     ],
        //     where: filter,
        //     order: [
        //         ['time', 'ASC']
        //     ]
        // });

        const interviews = await Interview.findAll({ where: { task_id: task }, order: [['time', 'ASC']] })

        // Format timestamps with time zones here
        interviews.forEach(interview => {
            interview.dataValues.length = parseInt(interview.length); // Workaround
            const formattedTime = moment(interview.time).tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss');
            interview.dataValues.time = formattedTime;
        });

        return res.status(200).json({ count: interviews.length, interviews: interviews });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Unknown error." });
    }

})

module.exports = router;