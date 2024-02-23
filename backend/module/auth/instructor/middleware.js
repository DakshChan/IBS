const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const helpers = require("../../../utilities/helpers");

router.use("/:course_id/", function (req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        res.status(401).json({ message: "You need to provide a valid token." });
    } else {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, token_data) => {
            // Add a check to ensure token_data and token_data["roles"] is defined
            if (!token_data || typeof token_data["roles"] !== 'object') {
                return res.status(401).json({ message: "Invalid token structure." });
            }

            // Existing check for course_id and role
            if (helpers.number_validate(req.params["course_id"]) || token_data["roles"][req.params["course_id"]] !== "instructor") {
                return res.status(400).json({ message: "Invalid or unauthorized access to course." });
            }
            if (err) {
                res.status(401).json({ message: "Your token is invalid. Please generate a new one." });
            } else {
                if (helpers.number_validate(req.params["course_id"])) {
                    res.status(400).json({ message: "The course id is missing or invalid." });
                    return;
                }

                if (token_data["roles"][req.params["course_id"]] !== "instructor") {
                    res.status(403).json({ message: "You don't have permission to access." });
                    return;
                }

                retrieve_data(req).then(data => {
                    res.locals["course_id"] = req.params["course_id"];
                    res.locals["task"] = data["task"];
                    res.locals["username"] = token_data["username"];
                    res.locals["email"] = token_data["email"];
                    res.locals["type"] = "instructor";
                    next();
                });
            }
        })
    }
})

async function retrieve_data(req) {
    if (req.method === "GET") {
        if ("task" in req.query && !helpers.name_validate(req.query["task"])) {
            var data = await helpers.task_validate(req.params["course_id"], req.query["task"], false);
        } else {
            return { task: "" };
        }
    } else {
        if ("task" in req.body && !helpers.name_validate(req.body["task"])) {
            var data = await helpers.task_validate(req.params["course_id"], req.body["task"], false);
        } else {
            return { task: "" };
        }
    }

    return { task: data["task"] };
}

module.exports = router;