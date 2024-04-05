const express = require("express");
const router = express.Router();
const { GroupUser, Task} = require('../../../models'); // Adjust the path as per your project structure
const { gitlab_remove_user } = require('../../../utilities/helpers');

router.delete("/", async (req, res) => {
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

		// Delete the group user entry and return the group_id
		const groupUser = await GroupUser.findOne({
			where: { username, task_id: taskId, },
			attributes: ['group_id']
		});

		if (!groupUser) {
			return res.status(400).json({ message: "You were not in the group." });
		}

		await GroupUser.destroy({
			where: { username, task_id: taskId, }
		});

		const group_id = groupUser.group_id;

		gitlab_remove_user(course_id, group_id, username);

		return res.status(200).json({ message: "You have left the group." });
	} catch (error) {
		console.error(error);
		return res.status(404).json({ message: "Unknown error." });
	}
});

module.exports = router;
