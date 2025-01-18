const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");

const { User, CourseRole } = require("../../../models");

router.get("/", async (req, res) => {

    try {
        // Base query options
        const queryOptions = {
            where: {
                course_id: res.locals["course_id"],
            },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['email'], // Specify email column from the User model
                },
            ],
            attributes: ['username', 'role', 'course_id'], // Specify desired columns from CourseRole
        };

        // Add optional condition for username if present in req.query
        if ("username" in req.query && helpers.name_validate(req.query["username"])) {
            queryOptions.where.username = req.query["username"];
        }

        // Execute query
        const roles = await CourseRole.findAll(queryOptions);

        // Respond with results
        res.status(200).json({ count: roles.length, role: roles });
    } catch (error) {
        console.error('Error fetching course roles:', error);
        res.status(404).json({ message: "Unknown error." });
    }
})

module.exports = router;
