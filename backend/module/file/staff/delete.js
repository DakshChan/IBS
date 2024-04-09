const express = require("express");
const router = express.Router();
const AdmZip = require("adm-zip");
const fs = require("fs");
const helpers = require("../../../utilities/helpers");

router.delete("/", (req, res) => {
    if (res.locals["task"] === "") {
        return res.status(400).json({ message: "The task is missing or invalid." });
    }

    let path = "./files/course_" + res.locals["course_id"] + "/" + res.locals["task"];

    if (!fs.existsSync(path)) {
        return res.status(200).json({ message: "This task has no file." });
    }

    fs.rmSync(path, { recursive: true, force: true });
    res.status(200).json({ message: "All files have been deleted." });
})

module.exports = router;