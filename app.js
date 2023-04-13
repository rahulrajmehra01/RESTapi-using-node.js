require("dotenv").config();
const db = require("./config/database")
const express = require('express');
const app = express();

// const bodyParser = require("body-parser")
// app.use(bodyParser.json());
app.use(express.json());

// End point to create a new emoployee
app.post('/employees', (req, res) => {

  const { full_name, job_title, phone_number, email, address, emergency_cname, emergency_cphone, emergency_crelationship } = req.body;

  const query = `INSERT INTO employees (full_name, job_title) VALUES (?, ?)`;

  db.query(query, [full_name, job_title], (err, result) => {
    if (err) {
      res.send('Error inserting employee data');
    } else {
      const cquery = `INSERT INTO employee_contacts (employee_id, phone_number, email, address, emergency_cname, emergency_cphone, emergency_crelationship) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      db.query(cquery, [result.insertId, phone_number, email, address, emergency_cname, emergency_cphone, emergency_crelationship], (err, result) => {
        if (err) {
          res.send('Error: please insert employee contact data');
        } else {
          res.send('Employee data created successfully');
        }
      });
    }
  });
});


// Endpoint to delete data by employee id 😎
app.delete('/employees/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM employee_contacts WHERE employee_id = ?', [id], (err, result) => {
    if (err) {
      return res.send({ message:'Error deleting employee contact data or employee contact data not found at given id' });
    }
    db.query('DELETE FROM employees WHERE id = ?', [id], (err, result) => {
      if (err) {
        return res.send({ message:'Error deleting employee data' });
      }
      if (result.affectedRows === 0) {
        return res.send({ message:'No Employee found at given id' });
      }
      res.send({ message:'Employee data deleted successfully' });
    });
  });
});


// Endpoint to retrieve all employees with pagination 😎
app.get('/employees', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * 5;

  db.query('SELECT * FROM employees LIMIT 5 OFFSET ?', [offset], (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else if (results.length === 0) {
      res.status(404).send({ message:'No more Data found'});
    } else {
      res.send(results);
    }
  });
});
// http://localhost:3000/employees?page=2  for page 2 and so on


// Endpoint to retrieve a specific employee by id 😎
app.get('/employees/:id', (req, res) => {
    const { id } = req.params;
  
    const query = `
    SELECT e.id, e.full_name, e.job_title, ec.phone_number, ec.email, ec.address, ec.emergency_cname, 
    ec.emergency_cphone, ec.emergency_crelationship
    FROM employees e
    LEFT JOIN employee_contacts ec ON e.id = ec.employee_id
    WHERE e.id = ?
    `;
  
    db.query(query, [id], (error, results) => {
      if (error) {
        res.status(500).send({ message:'Error retrieving employee data'});
      } else if (results.length === 0) {
        res.status(404).send({ message:'Employee not found'});
      } else {
        res.send({ data:results[0] });
      }
    });
  });

// Endpoint to update a specific employee by id 😎
app.put('/employees/:id', (req, res) => {
  const id = req.params.id;
  const {
    full_name, job_title, phone_number, email, address, emergency_cname, emergency_cphone, emergency_crelationship,
  } = req.body;

  db.query(
    'UPDATE employees AS e JOIN employee_contacts AS ec ON e.id = ec.employee_id SET e.full_name=?, e.job_title=?, ec.phone_number=?, ec.email=?, ec.address=?, ec.emergency_cname=?, ec.emergency_cphone=?, ec.emergency_crelationship=? WHERE e.id=?',
    [
      full_name, job_title, phone_number, email, address, emergency_cname, emergency_cphone, emergency_crelationship, id,
    ],
    (error, results) => {
      if (error)
        throw error;
      res.status(200).send(`Employee data updated successfully.`);
    }
  );
});


app.listen(process.env.APP_PORT, () => {
    console.log("server up and running on PORT :", process.env.APP_PORT);
});