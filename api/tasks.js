import { Router } from "express";

import requireUser from "#middleware/requireUser";
import {
  createTask,
  getTasksByUserId,
  getTaskById,
  updateTask,
  deleteTask,
} from "#db/queries/tasks";

const router = Router();

router.post("/", requireUser, async (req, res) => {
  const { title, done } = req.body;

  if (title === undefined || done === undefined) {
    return res.status(400).send({ error: "Missing title or done" });
  }

  const task = await createTask(title, done, req.user.id);
  res.status(201).send(task);
});

router.get("/", requireUser, async (req, res) => {
  const tasks = await getTasksByUserId(req.user.id);
  res.send(tasks);
});

router.put("/:id", requireUser, async (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;

  if (title === undefined || done === undefined) {
    return res.status(400).send({ error: "Missing title or done" });
  }

  const task = await getTaskById(id);

  if (!task) {
    return res.status(404).send({ error: "Task not found" });
  }

  if (task.user_id !== req.user.id) {
    return res.status(403).send({ error: "Forbidden" });
  }

  const updated = await updateTask(id, title, done);
  res.send(updated);
});

router.delete("/:id", requireUser, async (req, res) => {
  const { id } = req.params;

  const task = await getTaskById(id);

  if (!task) {
    return res.status(404).send({ error: "Task not found" });
  }

  if (task.user_id !== req.user.id) {
    return res.status(403).send({ error: "Forbidden" });
  }

  const deleted = await deleteTask(id);
  res.status(204).send();
});

export default router;