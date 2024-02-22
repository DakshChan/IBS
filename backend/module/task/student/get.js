const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const {Task} = require("../../../models");

router.get("/", async (req, res) => {
    const task_id = req.query.task;
    const course_id = res.locals["course_id"];

    if (task_id === "") {
        return res.status(400).json({message: "The task is missing or invalid."});
    }

    try {
        const task = await Task.findOne({
            where: {id: task_id, course_id: course_id}
        });

        if (!task) {
            return res.status(400).json({message: "The task is invalid."});
        }

        res.status(200).json({
            message: "Task details are returned.",
            task: task
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Unknown error."});
    }
});

module.exports = router;
