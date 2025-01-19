const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csvtojson");
const format = require("pg-format");
const path = require("path");
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");

const { CourseRole, User, Course } = require("../../../models"); // Adjust path to models
const sequelize = require('../../../helpers/database');

const upload = multer({
  dest: "./tmp/upload/",
});

router.post("/", upload.single("file"), async (req, res) => {
  if (req.file === undefined) {
    res
      .status(400)
      .json({ message: "The file is missing or has invalid format." });
    return;
  }
  if (path.extname(req.file.originalname) !== ".csv") {
    res.status(200).json({ message: "The file must be a csv file." });
    return;
  }
  if (
    !("course_id" in req.body) ||
    helpers.number_validate(req.body["course_id"])
  ) {
    res
      .status(400)
      .json({ message: "The course id is missing or has invalid format." });
    return;
  }
  if (
    !("update_user_info" in req.body) ||
    helpers.boolean_validate(req.body["update_user_info"])
  ) {
    res.status(400).json({
      message: "The update user info property is missing or invalid.",
    });
    return;
  }

  let roles = ["instructor", "ta", "student"];
  if (!("role" in req.body) || !roles.includes(req.body["role"])) {
    res.status(400).json({ message: "The role is missing or invalid." });
    return;
  }

  const csvPath = req.file.destination + req.file.filename;
  const updateUserInfo = req.body["update_user_info"] === true || req.body["update_user_info"] === "true";
  const courseId = req.body["course_id"];
  const role = req.body["role"];

  try {
    // Fetch default token count for the course
    const course = await Course.findOne({
      attributes: ["default_token_count"],
      where: { course_id: courseId },
    });

    if (!course) {
      return res.status(400).json({ message: "The course id is not found or invalid." });
    }

    const defaultTokenCount = course.default_token_count;

    const csvRows = await csv({ noheader: true, output: "csv" }).fromFile(csvPath);

    let invalidUsername = 0;
    let invalidEmail = 0;
    const registerData = [];
    const uploadDataAll = [];
    const uploadDataUsers = [];

    // Process rows
    for (let i = 1; i < csvRows.length; i++) {
      const row = csvRows[i];
      if (row.length >= 1 && !helpers.name_validate(row[0])) {
        
        uploadDataUsers.push({ username: row[0] });

        const roleData = { username: row[0], course_id: courseId, role };
        if (role === "student") {
          roleData.token_count = defaultTokenCount; // Add token count for students
        }
        uploadDataAll.push(roleData);

        if (row.length >= 2 && row[1] !== "") {
          if (helpers.email_validate(row[1])) {
            invalidEmail++;
          } else {
            registerData.push({ username: row[0], password: "initial", email: row[1] });
          }
        }
      } else {
        invalidUsername++;
      }
    }

    const validRows = csvRows.length - 1 - invalidUsername - invalidEmail;

    if (uploadDataUsers.length === 0) {
      return res.status(400).json({
        message: "The file must contain at least 1 valid username.",
      });
    }

    // Transaction
    await sequelize.transaction(async (transaction) => {
      // Register users to IBS
      if (registerData.length > 0) {
        await User.bulkCreate(registerData, {
          transaction,
          updateOnDuplicate: updateUserInfo ? ["email"] : undefined,
        });
      }

      // Add roles to course_role
      if (uploadDataAll.length > 0) {
        await CourseRole.bulkCreate(uploadDataAll, {
          transaction,
          ignoreDuplicates: true,
        });
      }
    });

    const message = `${validRows} users are added to the course as ${role}.`;
    res.status(200).json({
      message,
      added: validRows,
      registered: validRows,
      invalid_username: invalidUsername,
      invalid_email: invalidEmail,
    });
  } catch (err) {
    if (err.name === "SequelizeForeignKeyConstraintError" && err.index === "username") {
      return res.status(400).json({
        message: "A username is missing in the database and no valid email was provided.",
      });
    }
    console.error(err);
    res.status(500).json({ message: "An unexpected error occurred." });
  }

});

module.exports = router;
