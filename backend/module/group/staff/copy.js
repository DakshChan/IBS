const express = require("express");
const router = express.Router();
const helpers = require("../../../utilities/helpers");

router.post("/", (req, res) => {
	if (!req.body.from_task || helpers.name_validate(req.body.from_task)) {
		return res.status(400).json({ message: "The from task is missing or has invalid format." });
	}

	if (!req.body.to_task || helpers.name_validate(req.body.to_task)) {
		return res.status(400).json({ message: "The to task is missing or has invalid format." });
	}

	helpers.copy_groups(res.locals["course_id"], req.body["from_task"], req.body["to_task"]).then(results => {
		if (results.length === 0) {
			res.status(200).json({ message: "Groups have been copied successfully." });
		} else {
			res.status(404).json({ message: "Some groups cannot be copied.", details: results });
		}
	});
})

module.exports = router;