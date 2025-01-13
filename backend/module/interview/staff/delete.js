const express = require("express");
const router = express.Router();
const { Interview } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.delete("/", async (req, res) => {
    try {
        const task_id = res.locals["task"]
        const interview_id = req.body.interview_id;

        if (!task_id){
            return res.status(400).json({ message: "The task is missing or invalid." });
        }

		if (!interview_id || helpers.number_validate(req.body["interview_id"])) {
			return res.status(400).json({ message: "The interview id is missing or has invalid format." });
		}

        // Find the interview to delete
        const interview = await Interview.findOne({
            where: {
                task_id: task_id,
                group_id: null, // Assuming group_id must be null
                host: res.locals["username"],
                id: interview_id
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