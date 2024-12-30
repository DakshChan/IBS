const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const { Task, GroupUser, Group, User } = require("../../../models");
const { GROUP_STATUS } = require("../../../helpers/constants");


router.post("/", async (req, res) => {
	if (res.locals["task"] === "") {
		return res.status(400).json({ message: "The task is missing or invalid." });
	}

	if (!req.body.username || helpers.name_validate(req.body["username"])) {
		return res.status(400).json({ message: "The username is missing or has invalid format." });
	}

	// Checking if a user has the given username
	const user = await User.findOne({
		where: {
			username: req.body.username.toLowerCase()
		}
	})

	if (!user) return res.status(404).json({ message: 'The username is not found in the database.' });

	const task = await Task.findOne({
		where: {
			course_id: res.locals["course_id"],
			task: res.locals["task"]
		}
	})

	// Checking if the user is already in a group for this task
	const user_is_in_group = await GroupUser.findOne({
		where: {
			username: user.username.toLowerCase(),
			task_id: task.id
		}
	})

	if (user_is_in_group) return res.status(409).json({ message: "The student can join at most one group for each task." });

	// Creating the new group and adding the user to it
	const new_group = await Group.create({
		task_id: task.id
	});

	await GroupUser.create({
		task_id: task.id,
		username: user.username.toLowerCase(),
		group_id: new_group.group_id,
		status: GROUP_STATUS.confirmed
	});

	helpers.gitlab_create_group_and_project_with_user(res.locals["course_id"], new_group.group_id, req.body["username"].toLowerCase(), res.locals["task"]).then(result => {
		if (result["success"] === true) {
			let message = "Group and Gitlab repo have been created. Student has been added to the Gitlab project.";
			res.status(200).json({ message: message, group_id: new_group.group_id, url: result["gitlab_url"] });
		} else if (result["code"] === "failed_create_project") {
			res.status(404).json({ message: "Unable to create the Gitlab project. Please contact system admin." });
		} else if (result["code"] === "failed_add_user") {
			res.status(404).json({ message: "Unable to add the student to the Gitlab group. Please contact system admin." });
		} else if (result["code"] === "gitlab_invalid_username") {
			res.status(404).json({ message: "Student cannot be found on Gitlab. Please contact system admin to be added to Gitlab." });
		} else {
			res.status(404).json({ message: "Unknown error. Please contact system admin." });
		}
	});
})

module.exports = router;