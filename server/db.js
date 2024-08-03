const mysql = require("mysql2/promise");

let conn = null;

const connectMySQL = async () => {
  if (!conn) {
    conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "basic-crud",
    });
  }
  return conn;
};

module.exports = connectMySQL;
