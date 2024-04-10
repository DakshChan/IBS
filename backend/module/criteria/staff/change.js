const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Criteria } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.put("/", async (req, res) => {
    try {
        // Validation checks
        if (!("criteria_id" in req.body) || helpers.number_validate(req.body["criteria_id"])) {
            return res.status(400).json({ message: "The criteria id is missing or has invalid format." });
        }

        if (!("criteria" in req.body) || helpers.string_validate(req.body["criteria"])) {
            return res.status(400).json({ message: "The criteria is missing or has invalid format." });
        }

        if (!("total" in req.body) || helpers.number_validate(req.body["total"])) {
            return res.status(400).json({ message: "The total is missing or has invalid format." });
        }

        if ("description" in req.body && (req.body["description"] === "" || !helpers.string_validate(req.body["description"]))) {
            // Update criteria using Sequelize
            const [updatedCount] = await Criteria.update(
                {
                    criteria: req.body["criteria"],
                    total: req.body["total"],
                    description: req.body["description"],
                },
                {
                    where: {
                        id: req.body["criteria_id"],
                    },
                }
            );

            if (updatedCount === 0) {
                return res.status(400).json({ message: "The criteria id is invalid." });
            }

            return res.status(200).json({ message: "The criteria is changed." });
        } else {
            return res.status(400).json({ message: "The description is missing or has invalid format." });
        }
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Unknown error." });
    }
});

module.exports = router;
