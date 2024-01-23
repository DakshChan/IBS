const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.use("/", function (req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        res.status(401).json({ message: "You need to provide a valid token." });
    } else {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, token_data) => {
            if (err) {
                res.status(401).json({ message: "Your token is invalid. Please generate a new one." });
            } else {
                if (!token_data["admin"]) {
                    res.status(403).json({ message: "You don't have permission to access." });
                } else {
                    res.locals["username"] = token_data["username"];
                    res.locals["email"] = token_data["email"];
                    res.locals["type"] = "admin";
                    next();
                }
            }
        })
    }
})

module.exports = router;