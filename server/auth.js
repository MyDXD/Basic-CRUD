const jwt = require("jsonwebtoken");
const secret = "mysecret";

const authenticateToken = (req, res, next) => {
  // const token = req.cookies.token; // เปลี่ยนมาเช็คผ่าน cookie ที่ใส่ไปแทน

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  
  if (!token) return res.status(401).send('Access Denied');

  try {
    const user = jwt.verify(token, secret);
    req.user = user;
    console.log("user", user);
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

module.exports = authenticateToken;
