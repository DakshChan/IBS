const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Mark } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.put("/", async (req, res) => {
    const { task } = req.body;

    if (!task) {
        return res.status(400).json({ message: "The task is missing or invalid." });
    }

    try {
        // Find mark with task name
        const marks = await Mark.findAll(
            { where: { task_name: task } }
        )

        if (marks.length === 0) {
            return res.status(404).json({ message: "Unknown error." });
        }

        const [rowCount, _] = await Mark.update(
            { hidden: false },
            { where: { task_name: task } }
        );

        const message = rowCount <= 1 ? "1 mark is released." : `${rowCount} marks are released.`;
        res.status(200).json({ message, count: rowCount });
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: "Unknown error." });
    }
});

module.exports = router;