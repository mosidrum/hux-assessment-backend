import express from 'express';
import mysql from 'mysql';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const salt = 10;
const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET"],
  credentials: true
}));
app.use(cookieParser());

const dbase = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "signup"
})

app.post('/register', (req, res) => {
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
        return res.json(result);
      });
    });
});

const confirmUser = (req, res, next) => {
  const token = req.cookies.token;
  if(!token) {
    return res.json({Error: 'You are not authenticated'})
  } else {
    jwt.verify(token, 'jwt-secret-key', (err, decoded) => {
      if(err) {
        return res.json({Error: 'Wrong token'});
      } else {
         req.name = decoded.name;
         next();
      }
    })
  }
}

app.get('/', confirmUser, (req, res) => {
  return res.json({Status: 'Success', name: req.name});
})


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
          const token = jwt.sign({name}, "jwt-secret-key", {expiresIn: '1d'})
          res.cookie('token', token);
          res.cookie('user', name);
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

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({Status: 'Success'});
})

app.listen(8081, () => {
  console.log("Server working...");
})