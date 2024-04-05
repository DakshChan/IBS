const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const { Task, GroupUser, Group, User } = require("../../../models");
const {GROUP_STATUS} = require("../../../helpers/constants");

router.get("/", async (req, res) => {
	if (req.query.group_id && !helpers.number_validate(req.query.group_id)) {
		const group = await Group.findOne({ where: { group_id: req.query.group_id } });
		if (!group) return res.status(400).json({ message: "The group id is not found in the database." });

		const membersInGroup = await GroupUser.findAll({
			attributes: ['username', 'status'],
			where: { group_id: req.query.group_id }
		});

		return res
			.status(200)
			.json({
				message: "Group info is returned.",
				group_id: group.group_id,
				members: membersInGroup,
				extension: group.extension,
				gitlab_url: group.gitlab_url
			});

	} else if (req.query.username && !helpers.name_validate(req.query.username)) {
		if (res.locals["task"] === "") {
			return res.status(400).json({ message: "The task is missing or invalid." });
		}

		// Checking if user exists
		const user = await User.findOne({ where: { username: req.query.username } });
		if (!user) return res.status(400).json({ message: "The username is not found in the database." });

		const task = await Task.findOne({ where: { task: res.locals.task, course_id: res.locals["course_id"] }});

		const usersGroupForTask = await GroupUser.findOne({
			where: { username: req.query.username, task_id: task.id }
		});

		if (!usersGroupForTask) return res.status(200).json({ message: "The student is not in a group." });

		const group = await Group.findOne({ where: { group_id: usersGroupForTask.group_id } });

		const membersInGroup = await GroupUser.findAll({
			attributes: ['username', 'status'],
			where: { group_id: usersGroupForTask.group_id }
		});

		const response = {
			group_id: usersGroupForTask.group_id,
			members: membersInGroup
		}

		if (usersGroupForTask.status === GROUP_STATUS.pending) {
			response.message = "The student has been invited to join a group.";
			return res.status(200).json(response);
		}

		response.message = "The student has joined a group.";
		response.extension = group.extension
		response.gitlab_url = group.gitlab_url

		return res.status(200).json(response);
	} else {
		res.status(200).json({ message: "Either group id or username needs to be provided." });
	}
})

module.exports = router;