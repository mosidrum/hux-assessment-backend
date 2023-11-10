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
  const sql = "INSERT INTO login (`name`,`email`,`password`) VALUES (?)";
  bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if(err) return res.json({Error: "Error for hashing password"})
    const values = [
      req.body.name,
      req.body.email,
      hash,
    ]
    dbase.query(sql, [values], (err, result) => {
      if(err) return res.json({ Error: "Inserting data error in server"});
      return res.json({Status: "Success"});
    })
  })
})

app.listen(8081, () => {
  console.log("Server working...");
})