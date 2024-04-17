const express = require("express");
const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const session = require("express-session");

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

app.use((_req, _res, next) => {
  console.log("Я в hoppscotch.io ");
  next();
});

app.use(
  session({
    secret: "your_secretkey_here",
    resave: false,
    saveUninitialized: true,
  })
);

const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
});

app.get("/status", (reg, res) => {
  res.status(200).send("Сервер працює");
});

app.get("/users", async (_req, res) => {
  const page = parseInt(_req.query.page) || 1;
  const limit = parseInt(_req.query.limit) || 3;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const users = await prisma.user.findMany();
    const usersSlice = users.slice(startIndex, endIndex);
    res.json(usersSlice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
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
});

app.post("/register", async (req, res) => {
  const { name, password, email } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        hashedPassword,
        email,
      },
    });

    res.status(200).send("Користувач зареєстровано успішно");
  } catch (err) {
    res.status(500).send("Помилка під час реєстрації користувача");
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(401).send("No user found");
    }
    const isValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isValid) {
      return res.status(401).send("Invalid password");
    }
    req.session.username = user.name;
    req.session.userId = user.id;
    res.status(200).send("Вхід успішний");
  } catch (err) {
    res.status(500).send("Невдача");
    console.log(err);
  }
});

// app.post("/change-password", async (req, res) => {
//   const { email, password, changePassword } = req.body;

//   try {
//     let user = await prisma.user.findUnique({
//       where: {
//         email: email,
//       },
//     });
//     if (!user) {
//       return res.status(401).send("Користувачів не знайдено");
//     }
//     const isValid = await bcrypt.compare(password, user.hashedPassword);

//     if (!isValid) {
//       return res.status(401).send("Недійсний пароль");
//     }
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(changePassword, salt);

//     user = await prisma.user.update({
//       where: {
//         email: email,
//       },
//       data: {
//         hashedPassword,
//       },
//     });
//     res.status(200).send("Пароль оновлено");
//   } catch (err) {
//     res.status(500).send("Виникла ​​помилка при оновленні пароля");
//     console.log(err);
//   }
// });

app.get("/profile", async (req, res) => {
  if (req.session.username) {
    res.send(`Привіт, ${req.session.username}`);
  } else {
    res.send("Де твій логін");
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Відповідь з сервера на порт http://localhost:${port}`);
  });
}

module.exports = app;
