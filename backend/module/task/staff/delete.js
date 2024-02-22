const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const { Task } = require("../../../models");

router.delete("/", async (req, res) => {

  // if (res.locals["task"] === "") {
  //   res.status(400).json({ message: "The task is missing or invalid." });
  //   return;
  // }
  //
  // let sql_delete_task = "DELETE FROM tasks WHERE task = ($1)";
  //
  // client.query(sql_delete_task, [res.locals["task"]], (err, pg_res) => {
  //   if (err) {
  //     res.status(404).json({ message: "Unknown error." });
  //     console.log(err);
  //   } else {
  //     if (pg_res.rowCount === 0) {
  //       res.status(400).json({ message: "The task is invalid." });
  //     } else {
  //       res.status(200).json({ message: "The task is deleted." });
  //     }
  //   }
  // });

  try {
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ message: "The task is missing or invalid." });
    }
    // Find the task by name
    const taskToDelete = await Task.findOne({ where: { task } });

    // If task not found, return error
    if (!taskToDelete) {
      return res.status(400).json({ message: "The task is missing or invalid." });
    }

    // Delete the task
    await taskToDelete.destroy();

    // Respond with success message
    return res.status(200).json({ message: "The task is deleted." });
  } catch (error) {
    console.error("Error deleting task: ", error);
    return res.status(500).json({message: "Unknown error occurred."});
  }
})

module.exports = router;