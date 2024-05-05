const express = require("express");
const router = express.Router();
const { Interview } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.put("/", async (req, res) => {
    try {

        if (!res.locals["task"]) {
            return res.status(400).json({ message: "The task is missing or invalid." });
        }

        let set = helpers.interview_data_set_new(req.body);

        if (Object.keys(set).length === 0) {
            return res.status(400).json({ message: "There is nothing to change." });
        }

        let filter = {};
        if (res.locals["type"] === "instructor") {
            filter = helpers.interview_data_filter(req.body, true, res.locals["username"]);
        } else {
            filter = helpers.interview_data_filter(req.body, false, res.locals["username"]);
        }

        if (!filter) {
            return res.status(400).json({ message: "Please add at least one condition." });
        }

        // Update interview records
        const [rowCount] = await Interview.update(set, { where: filter });

        if (rowCount <= 1) {
            return res.status(200).json({ message: rowCount + " interview has been changed." });
        } else {
            return res.status(200).json({ message: rowCount + " interviews have been changed." });
        }
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Unknown error." });
    }
});

module.exports = router;
