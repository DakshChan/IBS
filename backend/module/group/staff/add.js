const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const { Group, GroupUser, User } = require("../../../models");
const { GROUP_STATUS } = require("../../../helpers/constants");

router.post("/", async (req, res) => {
	if (!("group_id" in req.body) || helpers.number_validate(req.body["group_id"])) {
		res.status(400).json({ message: "The group id is missing or invalid." });
		return;
	}
	if (!("username" in req.body) || helpers.name_validate(req.body["username"])) {
		res.status(400).json({ message: "The username is missing or has invalid format." });
		return;
	}

	// Checking if the user exists
	const user = await User.findOne({ where: { username: req.body.username } });
	if (!user) return res.status(400).json({ message: "The username is not found in the database." });


	// Checking if a group with a given id exists
	const group = await Group.findOne({ where: { group_id: req.body.group_id } });
	if (!group) return res.status(400).json({ message: "The group id is not found in the database." });


	// Checking if the given user is already in a group for the same task
	const groupsUserIsIn = await GroupUser.findAll({ where: { username: req.body.username, task_id: group.task_id }})
	if (groupsUserIsIn.length !== 0)
		return res.status(409)
			.json({ message: "The user has joined a group or been invited by another group. Please remove them from the existing group first." });;

	// Adding the user to the group
	await GroupUser.create({
		task_id: group.task_id,
		username: req.body.username.toLowerCase(),
		group_id: group.group_id,
		status: GROUP_STATUS.confirmed
	});

	helpers.gitlab_add_user_without_gitlab_group_id(res.locals["course_id"], req.body["group_id"], req.body["username"].toLowerCase()).then(result => {
		console.log(result)
		if (result["success"] === true) {
			let message = "User has been added to the group.";
			return res.status(200).json({ message: message, group_id: req.body["group_id"], gitlab_url: result["gitlab_url"] });
		} else if (result["code"] === "project_not_exist") {
			return res.status(404).json({ message: "A Gitlab project wasn't created for this group. Please contact system admin." });
		} else if (result["code"] === "failed_add_user") {
			return res.status(404).json({ message: "Unable to add the user to the Gitlab project. Please contact system admin." });
		} else if (result["code"] === "gitlab_invalid_username") {
			return res.status(404).json({ message: "User cannot be found on Gitlab. Please contact system admin to be added to Gitlab." });
		} else {
			return res.status(404).json({ message: "Unknown error. Please contact system admin.", result });
		}
	});
})

module.exports = router;