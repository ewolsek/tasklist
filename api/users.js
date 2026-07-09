import { Router } from "express";
import bcrypt from "bcrypt";

import { createUser, getUserByUsername } from "#db/queries/users";
import { createToken } from "#utils/jwt";

const router = Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ error: "Missing username or password" });
  }

  const existing = await getUserByUsername(username);
  if (existing) {
    return res.status(400).send({ error: "Username already taken" });
  }

  const user = await createUser(username, password);
  const token = createToken(user);

  res.status(201).send({ token });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ error: "Missing username or password" });
  }

  const user = await getUserByUsername(username);
  if (!user) {
    return res.status(400).send({ error: "Invalid username or password" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).send({ error: "Invalid username or password" });
  }

  const token = createToken(user);

  res.status(200).send({ token });
});

export default router;