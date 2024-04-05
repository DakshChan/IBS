// routes/group/rejectGroupInvite.js

const express = require("express");
const router = express.Router();
const { GroupUser, Task } = require("../../../models");

router.delete("/", async (req, res) => {
	try {
		const { username, task, course_id } = res.locals;


		// Check if changing group is allowed
		if (res.locals["change_group"] === false || (res.locals["interview_group"] !== "" && res.locals["interview_group"] !== null)) {
			res.status(400).json({ message: "Changing group is not allowed for this task." });
			return;
		}

		// Check if task is missing or invalid
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

		// Delete the pending invitation from the database
		const deletedRows = await GroupUser.destroy({
			where: { username, task_id: taskId, status: 'pending' }
		});

		if (deletedRows === 1) {
			return res.status(200).json({ message: "You have rejected the invitation." });
		} else {
			return res.status(400).json({ message: "Invitation doesn't exist." });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Unknown error." });
	}
});

module.exports = router;
