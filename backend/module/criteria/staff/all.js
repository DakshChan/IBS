const express = require("express");
const router = express.Router();
const { Criteria, Task } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.get("/", async (req, res) => {
    try {

        if (res.locals["task"] === "") {
            res.status(400).json({ message: "The task is missing or invalid." });
            return;
        }

        // Fetch criteria based on task ID
        const taskCriteria = await Criteria.findAll({
            where: {task_name: res.locals["task"]},
            order: [['id', 'ASC']] // Assuming criteria_id is the primary key
        });

        res.status(200).json({count: taskCriteria.length, criteria: taskCriteria});
    } catch (error) {
        console.error(error);
        res.status(404).json({message: "Unknown error."});
    }
})

module.exports = router;