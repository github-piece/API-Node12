var mysql = require('mysql2/promise');
const db = process.env.db;
var con = mysql.createPool({
    host: "db-39220nkn3.aliwebs.com",
    user: "39220nkn3",
    password: "Sunpassword2",
    database: "39220nkn3",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  module.exports = con;