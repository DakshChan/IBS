const express = require("express");
const router = express.Router();
const { QueryTypes } = require('sequelize');
const { GroupUser, Task} = require('../../../models');
const { gitlab_add_user_without_gitlab_group_id } = require('../../../utilities/helpers');

router.put("/", async (req, res) => {
	try {
		const { change_group, course_id, task, username } = res.locals;

		if (!change_group) {
			return res.status(400).json({ message: "Changing group is not allowed for this task." });
		}

		if (!task) {
			return res.status(400).json({ message: "The task is missing or invalid." });
		}
		// Find the task ID based on the provided criteria
		const taskDetails = await Task.findOne({
			where: { course_id, task }
		});

		if (!taskDetails) {
			return res.status(400).json({ message: "Task not found." });
		}

		const taskId = taskDetails.id;

		const groupUser = await GroupUser.findOne({
			where: { username, task_id: taskId, status: 'pending' },
			attributes: ['task_id', 'username', 'group_id', 'status']
		});

		if (!groupUser) {
			return res.status(400).json({ message: "Invitation doesn't exist." });
		}

		await GroupUser.update({ status: 'confirmed' }, {
			where: { username, task_id: taskId, status: 'pending' },
		});

		const group_id = groupUser.group_id;

		const gitlabResult = await gitlab_add_user_without_gitlab_group_id(course_id, group_id, username);

		if (gitlabResult.success) {
			return res.status(200).json({ message: "User has been added to the group.", group_id, gitlab_url: gitlabResult.gitlab_url });
		} else {
			switch (gitlabResult.code) {
				case 'project_not_exist':
					return res.status(404).json({ message: "A Gitlab project wasn't created for this group. Please contact system admin." });
				case 'failed_add_user':
					return res.status(404).json({ message: "Unable to add the user to the Gitlab project. Please contact system admin." });
				case 'gitlab_invalid_username':
					return res.status(404).json({ message: "User cannot be found on Gitlab. Please contact system admin to be added to Gitlab." });
				default:
					return res.status(404).json({ message: "Unknown error. Please contact system admin." });
			}
		}
	} catch (error) {
		console.error(error);
		res.status(404).json({ message: "Unknown error." });
	}
});

module.exports = router;
