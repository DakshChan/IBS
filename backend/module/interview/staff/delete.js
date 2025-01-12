const express = require("express");
const router = express.Router();
const { Interview } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.delete("/", async (req, res) => {
    try {
		if (res.locals["task"] === "") {
			res.status(400).json({ message: "The task is missing or invalid." });
			return;
		}
		if (!("interview_id" in req.body) || helpers.number_validate(req.body["interview_id"])) {
			res.status(400).json({ message: "The interview id is missing or has invalid format." });
			return;
		}

        // Find the interview to delete
        const interview = await Interview.findOne({
            where: {
                task_name: res.locals["task"],
                host: res.locals["username"],
                group_id: null, // Assuming group_id must be null
                id: req.body["interview_id"]
            }
        });

        if (!interview) {
            res.status(400).json({ message: "The interview cannot be found." });
            return;
        }

        // Delete the interview
        await interview.destroy();

        res.status(200).json({ message: "The interview is deleted" });
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: "Unknown error." });
    }
});

module.exports = router;