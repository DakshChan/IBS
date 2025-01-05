const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Mark } = require("../../../models");
const helpers = require("../../../utilities/helpers");

router.get("/", async(req, res) => {

  // res.locals is a query not from body
  if (res.locals["task"] === "") {
    res.status(400).json({ message: "The task is missing or invalid." });
    return;
  }
  
  let task = res.locals["task"];

  try {
    const marks = await Mark.findAll({
      where : {task_name: task},
      attributes: ["hidden"]
    })
    res.status(200).json(marks[0]);

  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Unknown error." });
  }
})

module.exports = router;