// routes/group/disinvite.js
const express = require("express");
const router = express.Router();
const { GroupUser, Group } = require('../../../models');
const helpers = require("../../../utilities/helpers");

router.delete("/", async (req, res) => {
	try {
		if (!res.locals.change_group || (res.locals.interview_group !== "" && res.locals.interview_group !== null)) {
			return res.status(400).json({ message: "Changing group is not allowed for this task." });
		}

		if (!res.locals.task) {
			return res.status(400).json({ message: "The task is missing or invalid." });
		}

		if (!req.body.username || helpers.name_validate(req.body.username)) {
			return res.status(400).json({ message: "The username is missing or has an invalid format." });
		}

		const { username } = res.locals;
		const { task } = res.locals.task;

		// Check if the user has access to cancel the invitation
		const groupUser = await GroupUser.findOne({
			where: { username: username },
			attributes: ['task_id', 'username', 'group_id', 'status']
		});

		if (!groupUser || groupUser.status !== 'confirmed') {
			return res.status(403).json({ message: "You don't have access to cancel the invitation." });
		}

		// Delete the invitation
		const deletedRows = await GroupUser.destroy({
			where: {
				task_id: groupUser.task_id,
				username: req.body.username.toLowerCase(),
				status: 'pending'
			}
		});

		if (deletedRows > 0) {
			return res.status(200).json({ message: "You have cancelled the invitation." });
		} else {
			return res.status(400).json({ message: "Invitation doesn't exist." });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Unknown error." });
	}
});

module.exports = router;
