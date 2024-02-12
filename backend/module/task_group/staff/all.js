const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");

const TaskGroup = require("../../../models/taskgroup");

router.get("/", async (req, res) => {
    const { course_id }  = res.locals;

    const task_groups = await TaskGroup.findAll({ where: { course_id } });

    return res.status(200).json({ count: task_groups.length, task_group: task_groups });
})

module.exports = router;