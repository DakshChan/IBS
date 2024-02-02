const express = require("express");
const router = express.Router();
const helpers = require("../../../utilities/helpers");
const User = require('../../../models/user');

router.put("/", async (req, res) => {
    if (!("username" in req.body) || helpers.name_validate(req.body["username"])) {
        return res.status(400).json({ message: "The username is missing or has invalid format." });
    }
    if (!("email" in req.body) || helpers.email_validate(req.body["email"])) {
        return res.status(400).json({ message: "The email is missing or has invalid format." });
    }

    const { username, email } = req.body;

    const user = await User.findOne({ where: { username }});

    if (!user) return res.status(400).json({ message: "The username is invalid." });

    user.set({ email });
    await user.save();

    const userObj = {
        email: user.email,
        username: user.username,
    };

    return res
        .status(200)
        .json({ message: "The user info is changed.", user: userObj });
})

module.exports = router;