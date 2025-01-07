const express = require("express");
const router = express.Router();
const { GroupUser, Group, Task } = require("../../../models");

router.get("/", async (req, res) => {
	try {
		if (req.body["task"] === "") {
			res.status(400).json({ message: "The task is missing or invalid." });
			return;
		}
		const task_name = req.body["task"];
		const { username, course_id } = res.locals;

		const taskModel = await Task.findOne({
			where: { task:task_name, course_id }
		})
		// Find the GroupUser record for the given username and task
		const groupUser = await GroupUser.findOne({
			where: { username, task_id: taskModel.id },
			attributes: ['task_id', 'username', 'group_id', 'status']
		});


		if (!groupUser) {
			res.status(200).json({ message: "You are not in a group." });
			return;
		}

		const group_id = groupUser.dataValues.group_id;

		// Find members of the group
		const members = await GroupUser.findAll({
			where: { group_id },
			attributes: ['username', 'status']
		});

		const group = await Group.findOne({
			where: { group_id },
			attributes: ['gitlab_url']
		});


		let message, gitlab_url;

		if (groupUser.status === "pending") {
			message = "You have been invited to join a group.";
			res.status(200).json({ message, group_id, members });
		} else {
			gitlab_url = group.gitlab_url;
			message = "You have joined a group.";
			res.status(200).json({ message, group_id, members, gitlab_url });
		}


	} catch (error) {
		console.error("Error retrieving group details:", error);
		res.status(500).json({ message: "Unknown error occurred." });
	}
});

module.exports = router;
