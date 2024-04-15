const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const { Group, GroupUser } = require("../../../models");


router.delete("/", async (req, res) => {
    if (!req.body.group_id || helpers.number_validate(req.body["group_id"])) {
        return res.status(400).json({ message: "The group id is missing or invalid." });
    }

    if (!req.body.username || helpers.name_validate(req.body["username"])) {
        return res.status(400).json({ message: "The username is missing or has invalid format." });
    }

    // Checking if group id is valid
    const group = await Group.findOne({
        where: {
            group_id: req.body.group_id
        }
    })

    if (!group) return res.status(400).json({ message: 'Group does not exist in the database' });

    // Checking if the student is in the group
    const group_user = await GroupUser.findOne({
        where: {
            username: req.body.username,
            group_id: group.group_id
        }
    });

    if (!group_user) return res.status(400).json({ message: "The student was not in the group." });

    // Removing the student from the group
    await group_user.destroy();

    await helpers.gitlab_remove_user(res.locals["course_id"], req.body["group_id"], req.body["username"].toLowerCase());
    res.status(200).json({ message: "The student is removed from the group." });

    // Removing the entire group if there are no more members in it.
    const group_members = await GroupUser.findAll({
        where: {
            group_id: group.group_id
        }
    })

    if (group_members.length === 0) {
        await group.destroy();
    }
})

module.exports = router;