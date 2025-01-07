const express = require("express");
const router = express.Router();

const middleware = require("../module/auth/student/middleware");
const all_tasks = require("../module/task/student/all");
const get_task = require("../module/task/student/get");
const check_group = require("../module/group/student/check");
const create_group = require("../module/group/student/create");
const leave_group = require("../module/group/student/leave");
const invite_group = require("../module/group/student/invite");
const disinvite_group = require("../module/group/student/disinvite");
const accept_group = require("../module/group/student/accept");
const reject_group = require("../module/group/student/reject");
const mark = require("../module/mark/student/get");
const all_interviews = require("../module/interview/student/all");
const available_interviews = require("../module/interview/student/available");
const check_interview = require("../module/interview/student/check");
const book_interview = require("../module/interview/student/book");
const change_interview = require("../module/interview/student/change");
const cancel_interview = require("../module/interview/student/cancel");
const all_file = require("../module/file/student/all");
const retrieve_file = require("../module/file/student/retrieve");
const check_submission = require("../module/submission/student/check");

router.use("/", function (req, res, next) {
    next();
})

// Middleware
router.use("/course/", middleware);

// Task
router.use("/course/:course_id/task/all", all_tasks);
router.use("/course/:course_id/task/get", get_task);

// Group
router.use("/course/:course_id/group/check", check_group);
router.use("/course/:course_id/group/create", create_group);
router.use("/course/:course_id/group/leave", leave_group);
router.use("/course/:course_id/group/invite", invite_group);
router.use("/course/:course_id/group/disinvite", disinvite_group);
router.use("/course/:course_id/group/accept", accept_group);
router.use("/course/:course_id/group/reject", reject_group);

// Mark
router.use("/course/:course_id/mark", mark);

// Interview
router.use("/course/:course_id/interview/all", all_interviews);
router.use("/course/:course_id/interview/available", available_interviews);
router.use("/course/:course_id/interview/check", check_interview);
router.use("/course/:course_id/interview/book", book_interview);
router.use("/course/:course_id/interview/change", change_interview);
router.use("/course/:course_id/interview/cancel", cancel_interview);

// File
router.use("/course/:course_id/file/all", all_file);
router.use("/course/:course_id/file/retrieve", retrieve_file);

// Submission
router.use("/course/:course_id/submission/check", check_submission);

module.exports = router;