const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const { Group } = require("../../../models");


router.put("/", async (req, res) => {
	if (!("group_id" in req.body) || helpers.number_validate(req.body["group_id"])) {
		return res.status(400).json({ message: "The group id is missing or invalid." });
	}
	if (!("extension" in req.body) || helpers.number_validate(req.body["extension"])) {
		return res.status(400).json({ message: "The extension is missing or has invalid format." });
	}

	// Check if group with given id exists
	const group = await Group.findOne({
		where: { group_id: req.body.group_id }
	})

	if (!group) return res.status(400).json({ message: "The group id doesn't exist." });

	group.extension = req.body.extension;
	await group.save();

	res.status(200).json({ message: "The extension is changed." });

	let subject = "IBS Extension Confirmation";
	let body = "Your extension request for " + pg_res_update.rows[0]["task"] + " has been approved. The due date is extended by " + req.body["extension"] + " minutes. Please check IBS for details.";
	await helpers.send_email_by_group(res.locals["course_id"], req.body["group_id"], subject, body);
})

module.exports = router;