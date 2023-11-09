import express from 'express';
import mysql from 'mysql';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


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

app.listen(8081, () => {
  console.log("Server working...");
})