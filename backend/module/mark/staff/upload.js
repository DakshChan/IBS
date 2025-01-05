const express = require("express");
const router = express.Router();
const multer = require('multer');
const csv = require('csvtojson');
const path = require('path');
const { Mark, Task } = require("../../../models");
const helpers = require("../../../utilities/helpers");
const TaskGroup = require("../../../models/taskgroup");

const upload = multer({
    dest: './tmp/upload/'
});

router.post("/", upload.single("file"), async (req, res) => {
    if (req.file === undefined) {
        res.status(400).json({ message: "The file is missing or has invalid format." });
        return;
    }
    if (path.extname(req.file.originalname) !== ".csv") {
        res.status(400).json({ message: "The file must be a csv file." });
        return;
    }
    if (!("task" in req.body) || helpers.name_validate(req.body["task"])) {
        res.status(400).json({ message: "The task is missing or invalid." });
        return;
    }

    let task = await Task.findOne({
        where: {
            task: req.body["task"]
        }
    });

    if (!task) {
        res.status(400).json({ message: "The task is missing or invalid." });
        return;
    }

    const csv_path = req.file.destination + req.file.filename;
    csv({
        noheader: true,
        output: "csv"
    }).fromFile(csv_path).then((csv_row) => {
        let all_criteria = [];
        let marks_data = [];

        helpers.get_criteria(res.locals["course_id"], req.body["task"]).then(db_all_criteria => {
            if (!csv_row || csv_row.length === 0 || csv_row[0].length <= 1) {
                res.status(400).json({ message: "At least one criteria is required." });
                return;
            }

            // Validate all criteria
            for (let i = 1; i < csv_row[0].length; i++) {
                let found = false;
                for (let temp_criteria in db_all_criteria) {
                    if (db_all_criteria[temp_criteria]["criteria"] === csv_row[0][i]) {
                        all_criteria.push(temp_criteria);
                        found = true;
                    }
                }
                if (!found) {
                    res.status(400).json({ message: "Criteria " + csv_row[0][i] + " is not found in the database." });
                    return;
                }
            }

            helpers.get_all_group_users(res.locals["course_id"], req.body["task"]).then(async groups => {
                // Process the csv file
                for (let j = 2; j < csv_row.length; j++) {
                    let user = csv_row[j][0];
                    for (let k = 0; k < all_criteria.length; k++) {
                        let mark = parseFloat(csv_row[j][k + 1]);
                        if (isNaN(parseFloat(csv_row[j][k + 1]))) {
                            mark = 0;
                        }

                        if (user.startsWith("group_") && (user.replace("group_", "") in groups)) { // The user is a group so add the mark for all confirmed members
                            let group_id = user.replace("group_", "");
                            for (let temp_user of groups[group_id]) {
                                marks_data.push({
                                    criteria_id: all_criteria[k],
                                    username: temp_user.toLowerCase(),
                                    mark: mark,
                                    task_name: req.body["task"],
                                    old_mark: null, // Set to null initially
                                    hidden: true, // Set default value
                                    createdAt: new Date(), // Add timestamp
                                    updatedAt: new Date() // Add timestamp
                                });
                            }
                        } else { // The user is just a single user
                            marks_data.push({
                                criteria_id: all_criteria[k],
                                username: user.toLowerCase(),
                                mark: mark,
                                task_name: req.body["task"],
                                old_mark: null, // Set to null initially
                                hidden: true, // Set default value
                                createdAt: new Date(), // Add timestamp
                                updatedAt: new Date() // Add timestamp
                            });
                        }
                    }
                }
                
                if (marks_data.length === 0) {
                    res.status(400).json({ message: "The file must contain at least 1 valid mark." });
                    return;
                }

                try {
                    // Bulk insert the marks data into the database
                    const result = await Mark.bulkCreate(marks_data, {
                        updateOnDuplicate: ['mark'], // Update mark if conflict occurs
                        ignoreDuplicates: false, // Ignore duplicates (no update) if conflict occurs
                        returning: true
                    });
                
                    // Calculate counts of changed and unchanged marks
                    const changedCount = result.length;
                    const unchangedCount = marks_data.length - changedCount;
                
                    // Prepare response message
                    const message = `${changedCount} marks are changed. ${unchangedCount} marks are unchanged.`;
                
                    // Send response
                    res.status(200).json({ message, changedCount, unchangedCount });
                } catch (error) {
                    // Handle errors
                    if (error.name === 'SequelizeForeignKeyConstraintError') {
                        // Handle foreign key constraint violation error
                        const regex = error.message.match(/Key \(username\)=\((.*)\) is not present in table "user"\./);
                        const missingUsername = regex ? regex[1] : '';
                        res.status(400).json({ message: `The username ${missingUsername} is not found in the database.` });
                    } else if (error.name === 'SequelizeUniqueConstraintError') {
                        // Handle unique constraint violation error
                        res.status(409).json({ message: 'Rows must have unique username.' });
                    } else {
                        // Handle other errors
                        console.error(error);
                        res.status(404).json({ message: 'Unknown error.' });
                    }
                }
            });
        });
    });
});

module.exports = router;