var mysql = require('mysql2/promise');
const db = process.env.db;
var con = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "mse_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  module.exports = con;