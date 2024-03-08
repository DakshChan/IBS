const express = require("express");
const router = express.Router();
const { Criteria, Task } = require("../../../models"); // Adjust the path as per your project structure
const helpers = require("../../../utilities/helpers");

router.post("/", async (req, res) => {
    try {
        // Check if the task exists
        const task = await Task.findOne({
            where: {
                task: res.locals["task"],
            },
        });

        if (!task) {
            return res.status(400).json({ message: "The task is not found in the database." });
        }

        // Validate criteria and total
        if (!("criteria" in req.body) || helpers.string_validate(req.body["criteria"])) {
            return res.status(400).json({ message: "The criteria is missing or has an invalid format." });
        }

        if (!("total" in req.body) || helpers.number_validate(req.body["total"])) {
            return res.status(400).json({ message: "The total is missing or has an invalid format." });
        }

        // Validate description
        const description = req.body["description"] || null;

        if ("description" in req.body && req.body["description"] !== "") {
            if (helpers.string_validate(description)) {
                res.status(400).json({message: "The description has invalid format."});
                return;
            }
        }

        // Create a new criteria
        await Criteria.create({
            task_id: res.locals["task"],
            criteria: req.body["criteria"],
            total: req.body["total"],
            description: description,
        });

        return res.status(200).json({ message: "The criteria is added."});
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ message: "Criteria must have a unique name for each task." });
        } else {
            console.error(error);
            return res.status(404).json({ message: "Unknown error." });
        }
    }
});

module.exports = router;
