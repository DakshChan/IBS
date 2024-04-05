const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const { Task, Group, GroupUser } = require("../../../models");

router.post("/", async (req, res) => {
	try {
		if (res.locals["change_group"] === false || (res.locals["interview_group"] !== "" && res.locals["interview_group"] !== null)) {
			return res.status(400).json({ message: "Changing group is not allowed for this task." });
		}

		if (res.locals["task"] === "") {
			return res.status(400).json({ message: "The task is missing or invalid." });
		}

		const task = res.locals["task"];
		const username = res.locals["username"];
		const course_id = res.locals["course_id"];

		const taskInstance = await Task.findOne({ where: { task, course_id } });

		if (!taskInstance) {
			return res.status(400).json({ message: "The task is not found in the database." });
		}

		// Create a new group using the found task ID
		const newGroup = await Group.create({ task_id: taskInstance.id });

		// Associate the current user with the created group
		await GroupUser.create({
			task_id: taskInstance.id,
			username,
			group_id: newGroup.group_id,
			status: 'confirmed'
		});

		// Call the helper function to create a GitLab group and project
		const result = await helpers.gitlab_create_group_and_project_with_user(course_id, newGroup.group_id, username, task);

		if (result.success === true) {
			const message = "Group and Gitlab repo have been created. User has been added to the Gitlab project.";
			return res.status(200).json({ message, group_id: newGroup.group_id, url: result.url });
		} else if (result.code === "failed_create_project") {
			return res.status(404).json({ message: "Unable to create the Gitlab project. Please contact system admin." });
		} else if (result.code === "failed_add_user") {
			return res.status(404).json({ message: "Unable to add the user to the Gitlab group. Please contact system admin." });
		} else if (result.code === "gitlab_invalid_username") {
			return res.status(404).json({ message: "User cannot be found on Gitlab. Please contact system admin to be added to Gitlab." });
		} else {
			return res.status(404).json({ message: "Unknown error. Please contact system admin." });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Internal server error." });
	}
});

module.exports = router;