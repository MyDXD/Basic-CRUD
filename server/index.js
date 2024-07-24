const bodyParser = require("body-parser");
const { error } = require("console");
const express = require("express");
const mysql = require("mysql2/promise.js");

// ประกาศเริ่มต้นการใช้ express
const app = express();
const port = 8000;

app.use(bodyParser.json());
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
  const data = await req.body;

  try {
    const result = await conn.query("INSERT INTO users SET ?", data);
    const userId = result[0].insertId;
    res.status(201).json({
      message: "User created succedfully",
      userId,
      firstname: data.firstname,
    });
  } catch (error) {
    console.error("Error creating user", error.message);
    res.status(500).json({ error: "Error creating user" });
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
    const result = await conn.query('DELETE FROM users WHERE id = ?', [id])
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
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
