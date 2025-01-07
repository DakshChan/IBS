const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const { Submission } = require("../../../models");

router.get("/", async (req, res) => {
	try {
		const { course_id, username } = res.locals;
		const task = req.query['task']

		// Get the group ID for the student
		const group_id = await helpers.get_group_id(course_id, task, username);

		if (group_id === -1) {
			return res.status(400).json({ message: "You need to join a group before checking your submission." });
		}

		// Check if there is a submission before the due date
		const result = await helpers.get_submission_before_due_date(course_id, group_id);

		// Query the submission details from the database
		const submissionDetails = await Submission.findOne({
			where: { group_id },
			attributes: ['commit_id', 'token_used']
		});

		let responseData = { before_due_date: result };

		if (submissionDetails) {
			responseData.collected = submissionDetails;
		}

		return res.status(200).json(responseData);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Internal server error." });
	}
});

module.exports = router;

