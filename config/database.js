const mysql = require("mysql");

const pool = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.MYSQL_DB,
  connectionLimit: 10
  });

// Checking if the database is connected or not
pool.connect(function(err) {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to database!');
  }
});

module.exports = pool;

