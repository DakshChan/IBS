const express = require('express');
const router = express.Router();
const helpers = require("../../../utilities/helpers");
const { Task } = require("../../../models");

router.put('/', async (req, res) => {
  try {
    // Validate request body
    if (!('task' in req.body) || helpers.name_validate(req.body['task'])) {
      return res.status(400).json({ message: 'The task is missing or invalid.' });
    }
    if ('long_name' in req.body && helpers.string_validate(req.body['long_name'])) {
      return res.status(400).json({ message: 'The long name is invalid.' });
    }
    // Add validations for other fields as needed
    if (!("due_date" in req.body) || helpers.time_validate(req.body["due_date"])) {
      return res.status(400).json({ message: "The due date is missing or not correct." });
    }
    if (!("weight" in req.body) || helpers.number_validate(req.body["weight"])) {
      return res.status(400).json({ message: "The weight property is missing or invalid." });
    }
    let isWeightExceeded = await helpers.weight_validate(
        typeof req.body["weight"] === "string"
            ? parseInt(req.body["weight"])
            : req.body["weight"],
        res.locals["course_id"]
    );
    if (isWeightExceeded) {
      return res.status(400).json({ message: "The accumulated weight of all tasks exceeds 100" });
    }
    if (!("hidden" in req.body) || helpers.boolean_validate(req.body["hidden"])) {
      res
          .status(400)
          .json({ message: "The hidden property is missing or not correct." });
      return;
    }
    if (!("min_member" in req.body) || helpers.number_validate(req.body["min_member"])) {
      return res.status(400).json({ message: "The min member is missing or invalid." });
    }
    if (!("max_member" in req.body) || helpers.number_validate(req.body["max_member"])
    ) {
      return res.status(400).json({ message: "The max member is missing or invalid." });
    }
    if (!("max_token" in req.body) || helpers.number_validate(req.body["max_token"])) {
      return res.status(400).json({ message: "The max token is missing or invalid." });
    }
    if (!("hide_interview" in req.body) || helpers.boolean_validate(req.body["hide_interview"])) {
      return res.status(400).json({message: "The hide interview property is missing or not correct.",});
    }
    if (!("hide_file" in req.body) || helpers.boolean_validate(req.body["hide_file"])) {
      return res.status(400).json({ message: "The hide file property is missing or not correct." });

    }
    if (!("change_group" in req.body) || helpers.boolean_validate(req.body["change_group"])) {
      return res.status(400).json({message: "The change group property is missing or not correct.",});
    }
    if (!("interview_group" in req.body) || helpers.name_validate(req.body["interview_group"])) {
      return res.status(400).json({ message: "The interview group is invalid." });
    }

    if (!("task_group_id" in req.body) || helpers.number_validate(req.body["task_group_id"])) {
      return res.status(400).json({ message: "The task group id is invalid." });
    }

    if (!("starter_code_url" in req.body) || helpers.string_validate(req.body["starter_code_url"]) || !req.body["starter_code_url"].includes(".git")) {
      return res.status(400).json({message: "The starter code url is invalid. It should start with https:// and end with .git",});
    }

    // Find the existing task
    const existingTask = await Task.findOne({
      where: {
        course_id: req.body.course_id,
        task: req.body.task
      }
    });

    if (!existingTask) {
      return res.status(400).json({ message: 'The task does not exist.' });
    }

    // Update the task using Sequelize
    await existingTask.update({
      long_name: req.body.long_name || req.body.task,
      due_date: req.body.due_date,
      weight: req.body.weight,
      hidden: req.body.hidden,
      min_member: req.body.min_member,
      max_member: req.body.max_member,
      max_token: req.body.max_token,
      hide_interview: req.body.hide_interview,
      hide_file: req.body.hide_file,
      change_group: req.body.change_group,
      interview_group: req.body.interview_group,
      task_group_id: req.body.task_group_id,
      starter_code_url: req.body.starter_code_url
    });

    // Respond with success message
    return res.status(200).json({ message: 'The task is updated.', task: existingTask });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Unknown error occurred.' });
  }
});

module.exports = router;
