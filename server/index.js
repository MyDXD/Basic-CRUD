const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectMySQL = require("./db");
const userRoutes = require("./userRoutes");
const authenticateToken = require('./auth');
const authRoutes = require('./authRoutes');


// ประกาศเริ่มต้นการใช้ express
const app = express();
const port = 8000;

app.use(bodyParser.json());

app.use(
  cors({
    credentials: true,
    origin: ["http://127.0.0.1:5500"],
  })
);

app.use(cookieParser());

app.use("/users",authenticateToken, userRoutes);
app.use('/api', authRoutes);

app.listen(port, async () => {
  await connectMySQL();
  console.log(`Server is running on port ${port}`);
});
