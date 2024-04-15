const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require("fs");
const path = require('path');
const AdmZip = require("adm-zip");
const helpers = require("../../../utilities/helpers");

const upload = multer({
	dest: './tmp/upload/'
});

router.post("/", upload.single("file"), (req, res) => {
	if (req.file === undefined) {
		return res.status(400).json({ message: "The file is missing or has invalid format." });
	}

	if (path.extname(req.file.originalname) !== ".zip") {
		return res.status(200).json({ message: "The file must be a zip file." });
	}

	if (!("task" in req.body) || helpers.name_validate(req.body["task"])) {
		return res.status(400).json({ message: "The task is missing or invalid." });
	}

	const zip_path = req.file.destination + req.file.filename;
	const zip = new AdmZip(zip_path);

	const dest_path = "./files/course_" + res.locals["course_id"] + "/" + req.body["task"];
	if (!fs.existsSync(dest_path)) {
		fs.mkdirSync(dest_path, { recursive: true });
	}

	zip.extractAllTo(dest_path, true);
	res.status(200).json({ message: "The file has been uploaded." });
})

module.exports = router;