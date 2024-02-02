const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");
const User = require('../../../models/user')

router.get("/", async (req, res) => {
    if ("username" in req.query && helpers.name_validate(req.query["username"])) {
        return res.status(400).json({ message: "The username has invalid format." })
    }

    let opts = {}
    if ("username" in req.query) {
        opts = { where: { username: req.query.username.toLowerCase() }}
    }

    const users = await User.findAll(opts);

    return res.status(200).json({ count: users.length, user: users });
})

module.exports = router;