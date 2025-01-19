const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");

const { CourseRole } = require("../../../models"); // Adjust path to models

router.put("/", async (req, res) => {
    if (!("username" in req.body) || helpers.name_validate(req.body["username"])) {
        res.status(400).json({ message: "The username is missing or has invalid format." });
        return;
    }

    let token_count = -1;
    if ("token_count" in req.body) {
        if (helpers.name_validate(req.body["token_count"])) {
            res.status(400).json({ message: "The token count is missing or has invalid format." });
            return;
        } else {
            token_count = req.body["token_count"];
        }
    } else{
        return res.status(400).json({ message: "The token count is missing or has invalid format." });
    }

    const [update_tokens] = await CourseRole.update(
        { token_count: token_count },
        { where: { course_id: res.locals["course_id"], username: req.body["username"].toLowerCase() } }
    )

    if (update_tokens === 1) {
        res.status(200).json({ message: "The token is changed." });
    } else if (update_tokens === 0) {
        res.status(400).json({ message: "The username is invalid." });
    } else {
        res.status(404).json({ message: "Unknown error." });
        console.log(err);
    }
})

module.exports = router;