const bodyParser = require("body-parser");
const express = require("express");
const mysql = require("mysql2/promise.js");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");


// ประกาศเริ่มต้นการใช้ express
const app = express();
const port = 8000;
const secret = "mysecret";


app.use(bodyParser.json());
app.use(cors());

app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  }),
);

let conn = null;

// function connectMySQL
const connectMySQL = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "basic-crud",
  });
};

const validateData = (userData) => {
  let errors = [];
  if (!userData.firstname) {
    errors.push("กรุณาใส่ชื่อจริง");
  }
  if (!userData.lastname) {
    errors.push("กรุณาใส่นามสกุล");
  }
  if (!userData.age) {
    errors.push("กรุณาใส่อายุ");
  }
  if (!userData.description) {
    errors.push("กรุณาใส่คำอธิบาย");
  }
  if (!userData.interest) {
    errors.push("กรุณาเลือกความสนใจอย่างน้อย 1 อย่าง");
  }
  return errors;
};

 //สมัครสมาชิก
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await conn.query("SELECT * FROM users WHERE email = ?", email);


  //ตรวจสอบ email ซ้ำ
  if (rows.length) {
    return res.status(400).send({ message: "Email is already registered" });
  }

  // Hash the password
  const hash = await bcrypt.hash(password, 10);

  // 10 = salt (การสุ่มค่าเพื่อเพิ่มความซับซ้อนในการเข้ารหัส)
  // และมันจะถูกนำมาใช้ตอน compare

  // Store the user data
  const userData = { email, password: hash };

  try {
    const result = await conn.query("INSERT INTO users SET ?", userData);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "insert fail",
      error,
    });
  }

  res.status(201).send({ message: "User registered successfully" });
});


app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const [result] = await conn.query("SELECT * from users WHERE email = ?", email);
  const user = result[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).send({ message: "Invalid email or password" });
  }

  res.send({ message: "Login successful" });
});


app.get("/users", async (req, res) => {
  try {
    let result = await conn.query("SELECT * FROM users");
    res.json(result[0]);
  } catch (error) {
    console.error("Error fectching users:", error.message);
    res.status(500).json({ error: "Error fectching users" });
  }
});

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;

  try {
    let [results] = await conn.query("SELECT * FROM users WHERE id = ?", [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(results[0]);
  } catch (error) {
    console.error("Error fectching users:", error.message);
    res.status(500).json({ error: "Error fectching users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = req.body;

    // เพิ่ม code สำหรับ validate
    const errors = validateData(user);

    if (errors.length > 0) {
      throw {
        errorMessage: "กรอกข้อมูลไม่ครบ",
        errors: errors,
      };
    }

    const result = await conn.query("INSERT INTO users SET ?", user);
    const userId = result[0].insertId;
    res.status(201).json({
      message: "User created succedfully",
      userId,
    });
  } catch (error) {
    const message = error.errorMessage || "something wrong"; // เพิ่ม handle message
    res.status(500).json({
      message: message,
      errors: error.errors || [], // ส่ง array error เข้าไปผ่าน body
    });
  }
});

app.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await conn.query("UPDATE users SET ? WHERE id = ?", [
      data,
      id,
    ]);
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User updated successfully", userId: id });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ error: "Error updating user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await conn.query("DELETE FROM users WHERE id = ?", [id]);
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully", userId: id });
  } catch (error) {
    console.error("Error deleted user", error.message);
    res.status(500).json({ error: "Error delect user" });
  }
});

app.listen(port, async () => {
  await connectMySQL();
  console.log(`Server is running on port ${port}`);
});
