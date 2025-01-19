const express = require("express");
const router = express.Router();
const helpers = require("../../../utilities/helpers");

router.get("/", async (req, res) => {
    try {
        if (!("username" in req.query) || helpers.name_validate(req.query["username"])) {
            return res.status(400).json({ message: "The username is missing or has invalid format." });
        }

        const data = await helpers.get_max_user_tokens(res.locals["course_id"], req.query["username"]);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching max user tokens:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    }
});


module.exports = router;