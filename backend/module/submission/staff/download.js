const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");

router.get("/", (req, res) => {
	helpers.download_all_submissions(res.locals["course_id"], req.body["task"]).then(result => {
		res.status(200).json({ result: result });
	});
})

module.exports = router;