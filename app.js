const express = require("express");
const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
// const sqlite3 = require("sqlite3");

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

app.use((reg, res, next) => {
  console.log("А все таки як працювати в hoppscotch.io ");
  next();
});

const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
});
// const db = new sqlite3.Database(":memory:");

// db.serialize(() => {
//   db.run(
//     "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)"
//   );
// });

// let users = {};

app.get("/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
  // db.all(` SELECT * FROM users`, [], (err, rows) => {
  //   if (err) {
  //     return res.status(400).json({ error: err.message });
  //   }
  //   res.json(rows);
  // });
});

app.get("/users/:id", async (_reg, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
  // const user = users[id];

  // if (!user) {
  //   res.status(404).json({ error: "User not found" });
  //   return;
  // }

  // res.status(200).json({ user: users[id] });
});

app.post("/users", async (req, res) => {
  const userData = req.body;
  const { value, error } = userSchema.validate(userData);
  if (error) {
    return res.status(400).json(`Error: ${error.message}`);
  }
  const { name, email } = value;
  // const { name, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }

  // db.run(
  //   `INSERT INTO users (name, age, email) VALUES (?, ?)`,
  //   [name, email],
  //   (err) => {
  //     if (err) {
  //       return res.status(400).json({ error: err.message });
  //     }
  //     res.status(201).json({ id: this.lastID });
  //   }
  // );
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email },
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
  // db.run(
  //   `UPDATE users SET name = ?, email = ? WHERE id = ?`,
  //   [name, email, id],
  //   function (err) {
  //     if (err) {
  //       return res.status(400).json({ error: err.message });
  //     }
  //     res.json({ message: `Row update: ${this.changes}` });
  //   }
  // );
  // const user = users[id];

  // if (!user) {
  //   res.status(404).json({ error: "User not found" });
  //   return;
  // }
  // users[id] = { name, email };
  // res.status(200).json({ user: users[id] });
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }

  // db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
  //   if (err) {
  //     return res.status(400).json({ error: err.message });
  //   }
  //   res.json({ message: `Row deleted: ${this.changes}` });
  // });
  // const user = users[id];

  // if (!user) {
  //   res.status(404).json({ error: "User not found" });
  //   return;
  // }
  // delete users[id];
  // res.status(200).json({ message: "User deleted successfully" });
});

app.listen(port, () => {
  console.log(`Відповідь з сервера на порт http://localhost:${port}`);
});
