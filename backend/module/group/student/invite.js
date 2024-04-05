const express = require("express");
const router = express.Router();
const { Task, Group, GroupUser } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.post("/", async (req, res) => {
	try {
		if (res.locals["change_group"] === false || res.locals["interview_group"]) {
			return res.status(400).json({ message: "Changing group is not allowed for this task." });
		}

		const { task, username, course_id } = res.locals;

		const taskInstance = await Task.findOne({ where: { task, course_id } });
		if (!taskInstance) {
			return res.status(400).json({ message: "The task is not found in the database." });
		}

		const usersInGroup = await GroupUser.findAll({
			where: { task_id: taskInstance.id, status: 'confirmed' }
		});

		const hasAccess = usersInGroup.some(user => user.username === username);
		if (!hasAccess) {
			return res.status(400).json({ message: "You don't have access to invite." });
		}

		const group = await Group.findByPk(usersInGroup[0].group_id);
		const maxMember = taskInstance.max_member;
		if (usersInGroup.length >= maxMember) {
			return res.status(400).json({ message: "No more user can be invited as the maximum has been reached." });
		}

		const { username: invitedUsername } = req.body;
		if (!invitedUsername || helpers.name_validate(invitedUsername)) {
			return res.status(400).json({ message: "The username is missing or has an invalid format." });
		}

		const [inviteResult, created] = await GroupUser.findOrCreate({
			where: { task_id: taskInstance.id, username: invitedUsername.toLowerCase() },
			defaults: { group_id: group.group_id, status: 'pending' }
		});

		if (!created) {
			return res.status(409).json({ message: "The user has joined a group or been invited by another group." });
		}

		return res.status(200).json({ message: "User has been invited." });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Internal server error." });
	}
});

module.exports = router;
