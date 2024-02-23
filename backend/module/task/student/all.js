const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const {Task} = require("../../../models");

router.get("/", async (req, res) => {
    const course_id = res.locals["course_id"];

    try {
        const tasks = await Task.findAll({
            where: {course_id: course_id}
        });

        if (!tasks) {
            return res.status(400).json({message: "The task is invalid."});
        }

        const count = tasks.length;

        res.status(200).json({
            message: "Task details are returned.",
            tasks: tasks,
            count: count
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Unknown error."});
    }
})

module.exports = router;
