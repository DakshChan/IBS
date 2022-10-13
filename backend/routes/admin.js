const express = require("express");
const router = express.Router();
const courseRouter = require("./admin/course");
const roleRouter = require("./admin/role");

const middleware_task = require("./ta/middleware_task");
const backupAllRouter = require("./ta/backup_all");
const backupTaskRouter = require("./ta/backup_task");

router.use("/", function (req, res, next) {
    next();
})

router.use("/course", courseRouter);
router.use("/role", roleRouter);

router.use("/", backupAllRouter);
router.use("/", backupTaskRouter);

module.exports = router;