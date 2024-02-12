const express = require("express");
const router = express.Router();
const helpers = require("../../../utilities/helpers");

const TaskGroup = require("../../../models/taskgroup");


router.post("/", async (req, res) => {
    if (!req.body.max_token || helpers.number_validate(req.body["max_token"])) {
        return res.status(400).json({ message: "The max token is missing or has invalid format." });
    }

    if (!req.body.name || helpers.name_validate(req.body["name"])) {
        return res.status(400).json({ message: "The task group name is missing or has invalid format." });
    }

    const { max_token, name } = req.body;
    const { course_id } = res.locals;

    const task_group = await TaskGroup.create({ max_token, name, course_id })

    return res.status(200).json({ message: "The task group is added.", task_group });
});

module.exports = router;
