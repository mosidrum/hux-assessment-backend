import express from 'express';
import mysql from 'mysql';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const salt = 10;
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const dbase = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "signup"
})

app.post('/register', (req, res) => {
  if (!req.body.name) {
    return res.json({ Error: "Name is required." });
  }

  if (!req.body.email) {
    return res.json({ Error: "Email is required." });
  }

  if (!req.body.password) {
    return res.json({ Error: "Password is required." });
  }

  const email = req.body.email;

  const checkDuplicateEmailQuery = 'SELECT COUNT(*) AS count FROM login WHERE email = ?';
  dbase.query(checkDuplicateEmailQuery, [email], (err, result) => {
    if (err) return res.json({ Error: "Error checking duplicate email in the server." });

    const emailCount = result[0].count;

    if (emailCount > 0) {
      return res.json({ Error: "Email is already registered." });
    }

    const sql = 'INSERT INTO login (`name`,`email`,`password`) VALUES (?)';

    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
      if(err) return res.json({ Error: "Error for hashing password" });

      const values = [
        req.body.name,
        req.body.email,
        hash,
      ];

      dbase.query(sql, [values], (err, result) => {
        if(err) return res.json({ Error: "Inserting data error in server" });
        return res.json({ Status: "Success" });
      });
    });
  });
});


app.post('/login', (req, res) => {
  const sql = 'SELECT * FROM login WHERE email = ?';
  dbase.query(sql, [req.body.email], (err, data) => {
    console.log('Received request with body:', req.body.email);
    console.log('Data from database:', data);
    if (err) return res.json({Error: "Login error in server"});
    if (data.length > 0) {
      bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
        if (err) return res.json({Error: "Password compared error"});
        if (response) {
          const name = data[0].name;
          const token = jwt.sign({name}, "jw-secret-key", {expiresIn: '1d'});
          return res.json({Status: "Success"});
        } else {
          return res.json({Error: "Password not matched"});
        }
      })
    } else {
      return res.json({Error: 'email does not exists'});
    }
  })
})

app.listen(8081, () => {
  console.log("Server working...");
})