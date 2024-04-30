const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const { Submission } = require("../../../models");

router.get("/", async (req, res) => {
	try {
		let group_id, username;

		if ("group_id" in req.query && !helpers.number_validate(req.body["group_id"])) {
			group_id = req.body["group_id"];
		} else if ("username" in req.query && !helpers.name_validate(req.body["username"])) {
			username = req.body["username"];
			if (!username){
				return res.status(400).json({ message: "Missing username from the request body." });
			}
			group_id = await helpers.get_group_id(res.locals["course_id"], req.body["task"], username);
			if (group_id === -1) {
				return res.status(400).json({ message: "The user needs to join a group before checking the submission." });
			}
		} else {
			return res.status(400).json({ message: "Both group id and username are missing or have invalid format." });
		}

		const submissionDetails = await Submission.findOne({
			where: { group_id },
			attributes: ['commit_id', 'token_used']
		});

		const before_due_date = await helpers.get_submission_before_due_date(res.locals["course_id"], group_id);
		const return_query = { before_due_date, collected: submissionDetails.dataValues }

		res.status(200).json(return_query);
	} catch (error) {
		console.error('Error retrieving submissions:', error);
		res.status(404).json({ message: "Unknown error." });
	}
})

module.exports = router;