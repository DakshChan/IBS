const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const TaskGroup = require("../../../models/taskgroup");


router.put("/", async (req, res) => {
    if (!req.body.task_group_id || helpers.number_validate(req.body["task_group_id"])) {
        return res.status(400).json({ message: "The task group id is missing or has invalid format." });
    }

    if (!req.body.max_token || helpers.number_validate(req.body["max_token"])) {
        return res.status(400).json({ message: "The max token is missing or has invalid format." });
    }

    const { task_group_id, max_token } = req.body;

    const task_group = await TaskGroup.findOne({ where: { task_group_id } });

    if (!task_group) return res.status(400).json({ message: "The task group id is invalid." });

    task_group.set({ max_token });
    await task_group.save();

    return res.status(200).json({ message: "The task group is changed.", task_group });
});

module.exports = router;