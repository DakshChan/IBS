const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Criteria, Mark } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.delete("/", async (req, res) => {
    try {
        const {criteria_id} = req.body;

        // Check if the criteria id is missing or has invalid format
        if (!criteria_id || helpers.number_validate(criteria_id)) {
            return res.status(400).json({message: "The criteria id is missing or has invalid format."});
        }

        // Check if the criteria exists
        const criteria = await Criteria.findByPk(criteria_id);

        if (!criteria) {
            return res.status(400).json({message: "The criteria id is invalid."});
        }

        // Delete associated marks first
        await Mark.destroy({
            where: {
                criteria_id: criteria_id
            }
        });

        // Delete the criteria using Sequelize
        await Criteria.destroy({
            where: {
                id: criteria_id
            }
        });

        return res.status(200).json({message: "The criteria is deleted."});
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: "Unknown error.", error: error.message});
    }
})

module.exports = router;