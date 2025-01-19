const express = require("express");
const router = express.Router();
// const { User, CourseRole } = require("../../../models"); // Adjust path as needed
const { User, CourseRole, Course } = require("../../../models");
const helpers = require("../../../utilities/helpers");
const adminMiddleware = require("../../auth/admin/middleware");

router.post("/", adminMiddleware, async (req, res) => {
    try {
        if (!("course_id" in req.body) || helpers.number_validate(req.body["course_id"])) {
            return res.status(400).json({ message: "The course id is missing or has invalid format." });
        }
        if (!("username" in req.body) || helpers.name_validate(req.body["username"])) {
            return res.status(400).json({ message: "The username is missing or has invalid format." });
        }
        if (!("update_user_info" in req.body) || helpers.boolean_validate(req.body["update_user_info"])) {
            return res.status(400).json({ message: "The update user info property is missing or invalid." });
        }

        let email = req.body["email"] || "ibs-test@utoronto.ca";

        let roles = ["instructor", "ta", "student"];
        if (!("role" in req.body) || !roles.includes(req.body["role"])) {
            return res.status(400).json({ message: "The role is missing or invalid." });
        }

        const userInfo = { username: req.body["username"].toLowerCase(), email, password: "initial" };

        if (req.body["update_user_info"] === true || req.body["update_user_info"] === "true") {
            await User.upsert(userInfo);
        } else {
            await User.findOrCreate({ where: { username: userInfo.username }, defaults: userInfo });
        }

        // obtain the token count for the course, if it exists

        const course_token_count = await Course.findOne({
            attributes: ["default_token_count"],
            where: {
                course_id: req.body["course_id"]
            }
        })

        if (!course_token_count) {
            return res.status(400).json({ message: "The course id is not found or invalid." });
        }

        let courseRole = { username: userInfo.username, course_id: req.body["course_id"], role: req.body["role"] };
        if (req.body["role"] === "student") { // only students have tokens :)
            courseRole.token_count = course_token_count.default_token_count;
        }
        await CourseRole.create(courseRole);

        res.status(200).json({ message: "The user is registered if needed and the role is added." });
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            res.status(400).json({ message: "The course id is not found in the database." });
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ message: "Only one role can be added for the same user and course." });
        } else {
            res.status(500).json({ message: "An unknown error occurred." });
        }
    }
});

module.exports = router;
