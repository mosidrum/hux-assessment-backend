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

const dbase1 = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "signup"
})

const dbase2 = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hux"
})

app.get('/', (req, res) => {
  const sql = 'SELECT * FROM contacts';
  dbase2.query(sql, (err, result) => {
    if(err) return res.json({Message: 'Error in server'});
    return  res.json(result);
  })
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

      dbase1.query(sql, [values], (err, result) => {
        if(err) return res.json({ Error: "Inserting data error in server" });
        return res.json(result);
      });
    });
});

app.post('/create', (req, res) => {
  const sql = 'INSERT INTO contacts (`name`, `phone`) VALUES (?)';
  const values = [
    req.body.name,
    req.body.phone,
  ];
  dbase2.query(sql, [values], (err, result) => {
    if(err) return res.json({ Error: 'An error occurred inserting data'});
    return res.json(result);
  })
})


app.post('/login', (req, res) => {
  const sql = 'SELECT * FROM login WHERE email = ?';
  dbase1.query(sql, [req.body.email], (err, data) => {
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