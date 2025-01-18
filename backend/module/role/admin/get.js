// const express = require("express");
// const router = express.Router();
// const client = require("../../../setup/db");
// const helpers = require("../../../utilities/helpers");

// router.get("/", (req, res) => {
//     let sql_role = "";
//     let sql_role_data = "";
//     if ("username" in req.query && !helpers.name_validate(req.query["username"])) {
//         sql_role =
//             "SELECT course_role.username, email, role, course_role.course_id, course_code, course_session FROM course_role LEFT JOIN user_info ON course_role.username = user_info.username LEFT JOIN courses ON course_role.course_id = courses.course_id WHERE course_role.username = ($1)";
//         sql_role_data = [req.query["username"]];
//     } else if ("course_id" in req.query && !helpers.number_validate(req.query["course_id"])) {
//         sql_role =
//             "SELECT course_role.username, email, role, course_role.course_id, course_code, course_session FROM course_role LEFT JOIN user_info ON course_role.username = user_info.username LEFT JOIN courses ON course_role.course_id = courses.course_id WHERE course_role.course_id = ($1)";
//         sql_role_data = [req.query["course_id"]];
//     }
//     client.query(sql_role, sql_role_data, (err, pg_res) => {
//         if (err) {
//             console.log(err);
//             res.status(404).json({ message: "Unknown error." });
//         } else {
//             res.status(200).json({ count: pg_res.rows.length, role: pg_res.rows });
//         }
//     });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const { CourseRole, User, Course } = require("../../../models"); // Adjust path to models
const helpers = require("../../../utilities/helpers");

router.get("/", async (req, res) => {
    try {
        let whereClause = {};
        let includeOptions = [
            {
                model: User,
                as: 'User',
                attributes: ['email'], // Columns from User table
            },
            {
                model: Course,
                as: 'Course',
                attributes: ['course_code', 'course_session'], // Columns from Course table
            },
        ];

        // Apply filters based on query params
        if ("username" in req.query) {
            if (!helpers.name_validate(req.query["username"])) {
                whereClause.username = req.query["username"];
            } else {
                return res.status(400).json({ message: "Invalid username." });
            }
        } else if ("course_id" in req.query) {
            if (!helpers.number_validate(req.query["course_id"])) {
                whereClause.course_id = req.query["course_id"];
            } else {
                return res.status(400).json({ message: "Invalid course_id." });
            }
        } else {
            return res.status(400).json({ message: "No valid query parameters provided." });
        }

        // Execute the query with Sequelize
        const roles = await CourseRole.findAll({
            where: whereClause,
            include: includeOptions,
            attributes: ['username', 'role', 'course_id'], // Columns from CourseRole
        });

        res.status(200).json({ count: roles.length, role: roles });
    } catch (error) {
        console.error("Error fetching course roles:", error);
        res.status(404).json({ message: "Unknown error." });
    }
});

module.exports = router;

