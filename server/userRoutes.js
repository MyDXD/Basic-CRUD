const express = require("express");
const router = express.Router();
const connectMySQL = require("./db");

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

router.get("/", async (req, res) => {
  const conn = await connectMySQL();
  try {
    let result = await conn.query("SELECT * FROM users");
    res.json(result[0]);
  } catch (error) {
    console.error("Error fectching users:", error.message);
    res.status(500).json({ error: "Error fectching users" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const conn = await connectMySQL();
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

router.post("/", async (req, res) => {
  try {
    const conn = await connectMySQL();
    const user = req.body;
    console.log(user);
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

router.put("/:id", async (req, res) => {
  const conn = await connectMySQL();

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

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const conn = await connectMySQL();

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

module.exports = router;
