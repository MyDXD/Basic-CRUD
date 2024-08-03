const bcrypt = require("bcrypt");
const express = require("express");
const connectMySQL = require("./db.js")
const jwt = require("jsonwebtoken");
const secret = "mysecret";


const router = express.Router();

//สมัครสมาชิก
router.post("/register", async (req, res) => {

  const conn = await connectMySQL()

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

router.post("/login", async (req, res) => {
    const conn = await connectMySQL()

  const { email, password } = req.body;

  const [result] = await conn.query(
    "SELECT * from users WHERE email = ?",
    email
  );
  // ตรวจสอบว่ามี user ที่มี email นี้หรือไม่
  if (result.length === 0) {
    return res.status(400).send({ message: "Invalid email or password" });
  }
  
  const user = result[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).send({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ email, role: "admin" }, secret, { expiresIn: "1h" });
  
  // res.cookie("token", token, {
  //   maxAge: 3600000, // 1 hour
  //   secure: true,
  //   httpOnly: true,
  //   sameSite: 'None'
  // });

  // console.log("get session", req.sessionID);
  // req.session.user = user;
  // req.session.userId = user.id;
  
  res.send({ message: "Login successful" ,token});
});

module.exports = router;
