const express = require("express");
const router = express.Router();
const helpers = require("../../../utilities/helpers");
const TaskGroup = require("../../../models/taskgroup");


router.delete("/", async (req, res) => {
    if (!req.body.task_group_id || helpers.number_validate(req.body["task_group_id"])) {
        return res.status(400).json({ message: "The task group id is missing or has invalid format." });
    }

    const { task_group_id } = req.body;

    const task_group_to_delete = await TaskGroup.findOne({ where: { task_group_id } });

    if (!task_group_to_delete) return res.status(400).json({ message: "The task group id is invalid." });

    await task_group_to_delete.destroy();

    return res.status(200).json({ message: "The task group is deleted." });
})

module.exports = router;