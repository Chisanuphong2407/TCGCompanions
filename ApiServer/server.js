const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

//Profile ไว้ query register
const conn = mysql
  .createConnection({
    host: "localhost",
    user: "regis",
    password: "1123",
    database: "tcgcompanion",
  })
  .promise();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.post("/api/register", async (req, res) => {
  try {
    console.log("Start");
    const [existuser] = await conn.query(
      "SELECT * FROM `user` WHERE `UserName`= ? OR `Email` = ?",
      [req.body.name, req.body.email]
    );
    console.log("check");
    if (existuser.length > 0) {
      const errormessage = "username หรือ email นี้มีผู้ใช้งานแล้ว";
      return res.status(409).json(errormessage);
    } else {
      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      await conn.query(
        "INSERT INTO `user`(`FirstName`, `LastName`, `PhoneNumber`, `UserName`, `Email`, `Password`) VALUES (?, ?, ?, ?, ?, ?)",
        [
          req.body.name,
          req.body.lastname,
          req.body.phone,
          req.body.user,
          req.body.email,
          hashedPassword,
        ]
      );
      // const unhash = await bcrypt.compare(req.body.password, hashedPassword);
      // console.log(unhash);
      return res.status(201).json({ message: "ลงทะเบียนสำเร็จ" });
    }
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการลงทะเบียน:", err);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
});


app.post('/api/login', async (req,res) => {
  //สร้าง token
  const genToken = (payload) => {
    const secrKey = crypto.randomBytes(32).toString('hex');
    const expiresIn = '1h';
    const token = jwt.sign(payload, secrKey, { expiresIn })
    console.log(secrKey);
    return res.json(token);
  };

  console.log(req.body);
  const query = 'SELECT * FROM `user` WHERE `UserName` = ?' //คำสั่ง query
  try{
    //เช็คข้อมูลผู้ใช้งาน
    const [userVef] = await conn.query(query,[
      req.body.username
    ]);
    const passVef = await bcrypt.compare(req.body.password,userVef[0].Password);
    console.log("start");
    if ( userVef.length > 0 && passVef) {
      console.log(userVef[0].UserID);
      //set payload ใส่ token
      const payload = {
        username: req.body.username
      }
      //สร้าง token
      genToken(payload);
      console.log("login");
    }else{
      return res.json("รหัสไม่ถูกต้อง");
    };

  }catch (error) {
    console.log(error);
    return res.json(error);
  }
});

app.get('/api/events', async (req,res) => {
  try{
    console.log("start");
    const [result] = await conn.query(
      "SELECT * from event"
    );
    console.log(result);
    return res.json(result);
  }catch (error) {
    console.log(error);
  }
});

app.listen(3000, function () {
  console.log("CORS-enabled web server listening on port 3000");
});
