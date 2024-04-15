const express = require("express");
const router = express.Router();
const AdmZip = require("adm-zip");
const fs = require("fs");
const helpers = require("../../../utilities/helpers");

router.get("/", (req, res) => {
    if (res.locals["task"] === "") {
        return res.status(400).json({ message: "The task is missing or invalid." });
    }

    let original_path = "./files/course_" + res.locals["course_id"] + "/" + res.locals["task"];
    let zip_root = "./tmp/download/";
    let zip_file_name = res.locals["task"] + ".zip";
    if (!fs.existsSync(original_path)) {
        return res.status(200).json({ message: "This task has no file." });
    }

    var zip = new AdmZip();
    zip.addLocalFolder(original_path);
    zip.writeZip(zip_root + zip_file_name);
    res.sendFile(zip_file_name, { root: zip_root, headers: { "Content-Disposition": "attachment; filename=" + zip_file_name } });
})

module.exports = router;