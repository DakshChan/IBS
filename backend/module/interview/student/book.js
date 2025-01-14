// const express = require("express");
// const router = express.Router();
// const moment = require("moment");
// require("moment-timezone");
// const client = require("../../../setup/db");
// const helpers = require("../../../utilities/helpers");
// const rate_limit = require("../../../setup/rate_limit");

// const { Op, Sequelize } = require('sequelize');
// const { Interview } = require("../../../models");

// router.post("/", rate_limit.email_limiter, async (req, res) => {
//     if (res.locals["task"] === "") {
//         res.status(400).json({ message: "The task is missing or invalid." });
//         return;
//     }
//     if (res.locals["hide_interview"] === true) {
//         res.status(400).json({ message: "The interviews are not ready yet." });
//         return;
//     }
//     if (!("time" in req.body) || helpers.time_validate(req.body["time"])) {
//         res.status(400).json({ message: "The time is missing or has invalid format. (YYYY-MM-DD HH:mm:ss)" });
//         return;
//     }
//     if (moment.tz(req.body["time"], "America/Toronto").subtract(30, "minutes") < moment().tz("America/Toronto")) {
//         res.status(400).json({ message: req.body["time"] + " was in the past or is within 30 minutes from now. Please choose a new time." });
//         return;
//     }
//     let time = req.body["time"] + " America/Toronto";

//     let location = "Zoom";
//     if ("location" in req.body) {
//         if (helpers.string_validate(req.body["location"])) {
//             res.status(400).json({ message: "The location has invalid format." });
//             return;
//         } else {
//             location = req.body["location"];
//         }
//     }

//     if (res.locals["interview_group"] !== "" && res.locals["interview_group"] !== null) {
//         var task = res.locals["interview_group"];
//     } else {
//         var task = res.locals["task"];
//     }

//     helpers.get_group_id(res.locals["course_id"], task, res.locals["username"]).then(group_id => {
//         if (group_id === -1) {
//             res.status(400).json({ message: "You need to join a group before booking your interview." });
//             return;
//         }

//         // check if group has an existing interview

//         const existingInterview = await Interview.findOne({
//             attributes: [
//                 [Sequelize.fn('to_char', Sequelize.literal("time AT TIME ZONE 'America/Toronto'"), 'YYYY-MM-DD HH24:MI:SS'), 'time']
//             ],
//             where: {
//                 group_id: group_id,
//                 task_id: res.locals["task"],
//                 cancelled: false
//             }
//         });
        

//         if (existingInterview.length > 0){
//             res.status(409).json({ message: "You already have an existing interview for " + res.locals["task"] + "." });
//         }  

//         const [updatedCount] = await Interview.update(
//             { group_id: group_id },
//             {
//                 where: {
//                     task_id: res.locals["task"],
//                     time: time,
//                     group_id: null,
//                     location: location,
//                     cancelled: false
//                 },
//                 limit: 1
//             }
//         );


        


//         let sql_check = "SELECT to_char(time AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI:SS') AS time FROM course_" + res.locals["course_id"] + ".interview WHERE group_id = ($1) AND task = ($2) AND cancelled = false";
//         client.query(sql_check, [group_id, res.locals["task"]], (err, pgRes) => {
//             if (err) {
//                 res.status(404).json({ message: "Unknown error." });
//                 return;
//             }

//             if (pgRes.rowCount === 1) {
//                 res.status(409).json({ message: "You already have an existing interview for " + res.locals["task"] + " at " + pgRes.rows[0]["time"] + "." });
//             } else {
//                 let sql_book = "UPDATE course_" + res.locals["course_id"] + ".interview SET group_id = ($1) WHERE interview_id = (SELECT interview_id FROM course_" + res.locals["course_id"] + ".interview WHERE task = ($2) AND time = ($3) AND group_id IS NULL AND location = ($4) AND cancelled = false LIMIT 1 FOR UPDATE)";
//                 client.query(sql_book, [group_id, res.locals["task"], time, location], (err, pgRes) => {
//                     if (err) {
//                         res.status(404).json({ message: "Unknown error." });
//                     } else if (pgRes.rowCount === 0) {
//                         res.status(400).json({ message: "No available interview exists for " + res.locals["task"] + " at " + req.body["time"] + " at location " + location + ". Please choose a different time." });
//                     } else {
//                         let message = "You have booked your interview for " + res.locals["task"] + " at " + req.body["time"] + " successfully. The location is " + location + ".";
//                         res.status(200).json({ message: message });
//                         helpers.send_email_by_group(res.locals["course_id"], group_id, "IBS Interview Confirmation", message);
//                     }
//                 });
//             }
//         });
//     });
// })

// module.exports = router;

const express = require("express");
const router = express.Router();
const moment = require("moment");
require("moment-timezone");
const { Op, Sequelize } = require('sequelize');
const { Interview } = require("../../../models");
const helpers = require("../../../utilities/helpers");
const rate_limit = require("../../../setup/rate_limit");

router.post("/", rate_limit.email_limiter, async (req, res) => {
    try {
        if (res.locals["task"] === "") {
            res.status(401).json({ message: "The task is missing or invalid." });
            return;
        }
        if (res.locals["hide_interview"] === true) {
            res.status(402).json({ message: "The interviews are not ready yet." });
            return;
        }
        if (!("time" in req.body) || helpers.time_validate(req.body["time"])) {
            res.status(403).json({ message: "The time is missing or has invalid format. (YYYY-MM-DD HH:mm:ss)" });
            return;
        }
        if (moment.tz(req.body["time"], "America/Toronto").subtract(30, "minutes") < moment().tz("America/Toronto")) {
            res.status(405).json({ message: req.body["time"] + " was in the past or is within 30 minutes from now. Please choose a new time." });
            return;
        }

        let time = req.body["time"];
        let location = req.body["location"] || "Zoom";

        if (helpers.string_validate(location)) {
            res.status(460).json({ message: "The location has invalid format." });
            return;
        }

        const task = res.locals["interview_group"] || res.locals["task"];
        const group_id = await helpers.get_group_id(res.locals["course_id"], task, res.locals["username"]);
        
        if (group_id === -1) {
            res.status(400).json({ message: "You need to join a group before booking your interview." });
            return;
        }
        
        // Parse and ensure the time is in UTC
        const utcMoment = moment.utc(time, 'YYYY-MM-DD HH:mm:ss');
        
        // Extract the date and time components
        const interviewTime = utcMoment.format('HH:mm:ss');  // Time in UTC
        const interviewDate = utcMoment.startOf('day').toISOString();

        // Check for existing interview
        const existingInterview = await Interview.findOne({
            attributes: [
                'time',
                'date'
            ],
            where: {
                group_id: group_id,
                task_id: res.locals["task"],
                cancelled: false
            }
        });

        if (existingInterview) {
            res.status(409).json({ message: `You already have an existing interview for ${res.locals["task"]} at ${existingInterview.get('date')} ${existingInterview.get('time')}.` });
            return;
        }

        // Book the interview
        const [updatedCount] = await Interview.update(
            { group_id: group_id },
            {
                where: {
                    task_id: res.locals["task"],
                    time: {[Op.eq]: interviewTime},
                    date: { [Op.eq]: interviewDate },
                    group_id: null,
                    location: location,
                    cancelled: false
                },
                limit: 1
            }
        );
        
        if (updatedCount === 0) {
            res.status(400).json({ message: `No available interview exists for ${res.locals["task"]} at ${req.body["time"]} at location ${location}. Please choose a different time.` });
        } else {
            const message = `You have booked your interview for ${res.locals["task"]} at ${req.body["time"]} successfully. The location is ${location}.`;
            res.status(200).json({ message: message });
            helpers.send_email_by_group(res.locals["course_id"], group_id, "IBS Interview Confirmation", message);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unknown error." });
    }
});

module.exports = router;
