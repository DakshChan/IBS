const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Mark } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.post("/", async(req, res) => {
    const { task } = req.body;

    if (!task) {
        res.status(400).json({ message: "The task is missing or invalid." });
        return;
    }

    const { criteria } = req.body;

    if (!criteria || helpers.string_validate(criteria)) {
        res.status(400).json({ message: "The criteria is missing or has invalid format." });
        return;
    }

    const { mark } = req.body;

    if (!mark || helpers.number_validate(mark)) {
        res.status(400).json({ message: "The mark is missing or has invalid format." });
        return;
    }

    const { username } = req.body;

    if (username && !helpers.name_validate(username)) {
        await submit_mark([username.toLowerCase()], req, res);
    } else if ("group_id" in req.body && !helpers.name_validate(req.body["group_id"])) {
        const groupUsers = await helpers.get_group_users(res.locals["course_id"], req.body["group_id"]);
            if (groupUsers.length === 0) {
                res.status(400).json({ message: "The group id is not found in the database." });
                return;
            }

            await submit_mark(user, req, res);
    } else {
        res.status(400).json({ message: "Either group id or username needs to be provided." });
    }
})

async function submit_mark(user_list, req, res) {
    try {
        const criteriaId = await helpers.get_criteria_id(res.locals.course_id, res.locals.task, req.body.criteria);

        if (criteriaId === -1) {
            return res.status(400).json({ message: "The criteria is not found in the database." });
        }

        const marksData = user_list.map(user => ({
            criteria_id: criteriaId,
            username: user.toLowerCase(),
            mark: req.body.mark,
            task_name: res.locals.task
        }));

        // Check if overwrite is true or "true"
        const overwrite = req.body.overwrite === true || req.body.overwrite === "true";

        const options = {
            // Specify the columns for the unique constraint or primary key
            onConflict: ['criteria_id', 'username', 'task_name'],
            // Conditionally set the action to take on conflict
            onConflictDoNothing: !overwrite // If overwrite is true, set it to false (overwrite existing marks)
        };

        // Check if updateOnDuplicate is an empty array, if so, remove it from options
        if (!options.updateOnDuplicate || !options.updateOnDuplicate.length) {
            delete options.updateOnDuplicate;
        }
        const result = await Mark.bulkCreate(marksData, options);

        const changedCount = result.length;
        const unchangedCount = marksData.length - changedCount;
        const message = `${changedCount} marks are changed. ${unchangedCount} marks are unchanged.`;

        return res.status(200).json({ message, changedCount, unchangedCount });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError' && error.fields.includes('username')) {
            const username = error.fieldsValue.username;
            let regex = err.detail.match(/Key \(username\)=\((.*)\) is not present in table "user"\./);
            res.status(400).json({ message: "The username " + regex[1] + " is not found in the database." });
        } else {
            console.error(error);
            res.status(404).json({ message: "Unknown error." });
        }
    }
}


    // let sql_add = "INSERT INTO course_" + res.locals["course_id"] + ".mark (criteria_id, username, mark, task) VALUES %L";
    // if (req.body["overwrite"] === true || req.body["overwrite"] === "true") {
    //     sql_add += " ON CONFLICT (criteria_id, username) DO UPDATE SET mark = EXCLUDED.mark";
    // } else {
    //     sql_add += " ON CONFLICT (criteria_id, username) DO NOTHING";
    // }

    // helpers.get_criteria_id(res.locals["course_id"], res.locals["task"], req.body["criteria"]).then(criteria_id => {
    //     if (criteria_id === -1){
    //         res.status(400).json({ message: "The criteria is not found in the database." });
    //         return;
    //     }

    //     let marks_data = [];
    //     for (let user of user_list) {
    //         marks_data.push([criteria_id, user.toLowerCase(), req.body["mark"], res.locals["task"]]);
    //     }

    //     client.query(format(sql_add, marks_data), [], (err, pgRes) => {
    //         if (err) {
    //             if (err.code === "23503" && err.constraint === "username") {
    //                 let regex = err.detail.match(/Key \(username\)=\((.*)\) is not present in table "user"\./);
    //                 res.status(400).json({ message: "The username " + regex[1] + " is not found in the database." });
    //             } else {
    //                 console.log(err);
    //                 res.status(404).json({ message: "Unknown error." });
    //             }
    //         } else {
    //             let message = pgRes.rowCount + " marks are changed. " + (marks_data.length - pgRes.rowCount) + " marks are unchanged.";
    //             res.status(200).json({ message: message, changed_count: pgRes.rowCount, unchanged_count: marks_data.length - pgRes.rowCount });
    //         }
    //     });
    // });
// }

module.exports = router;