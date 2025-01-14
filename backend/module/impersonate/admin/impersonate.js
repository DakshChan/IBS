const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");

const { User, CourseRole } = require('../../../models');

router.post("/", async (req, res) => {
  if (!("username" in req.body) || helpers.name_validate(req.body["username"])) {
    res.status(400).json({ message: "The username is missing or has invalid format." });
    return;
  }

  try {

    const user = await User.findOne({
      where: {
        username: req.body["username"].toLowerCase(),
      }
    })

    if (!user) {
      return res.status(404).json({ message: "Unknown user" });
    }

    const rolesWithDetails = await CourseRole.findAll({
      include: {
        model: Course,
        where: {
          hidden: false,
        },
      },
      where: {
        username: req.body["username"].toLowerCase(), 
      },
      order: [['course_id', 'ASC']], 
    });

    // Process roles into the required format
    let roles = {};
    let roles_with_details = [];

    for (let row of rolesWithDetails) {
      roles[row.course_id] = row.role;
      roles_with_details.push({
        course_id: row.course_id,
        course_code: row['course.course_code'],
        course_session: row['course.course_session'],
        role: row.role,
      });
    }

    // Generate JWT token
    const token = helpers.generateAccessToken(
      req.body["username"].toLowerCase(),
      user.email,
      user.admin,
      roles
    );

    res.json({ token, roles: roles_with_details });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An internal server error occurred." });
  }

})

module.exports = router;