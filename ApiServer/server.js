require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const socketIo = require("socket.io");
const http = require("http");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { json } = require("body-parser");
const nodemailer = require("nodemailer");
// const crypto = require("crypto");/

//account ในการส่งเมล์
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});

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
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("Connect", async (socket) => {
  console.log("connected");
  const refresh = true;
  socket.emit("refreshing", refresh);

  socket.on("Disconnect"),
    () => {
      console.log("Disconnected");
    };
});

//สมัคร
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

//เข้าสู่ระบบ
app.post("/api/login", async (req, res) => {
  //สร้าง token
  const genToken = (payload) => {
    const expiresIn = "1h";
    const token = jwt.sign(payload, process.env.secrKey, { expiresIn });
    // console.log(process.env.secrKey);
    return res.status(200).json(token);
  };

  console.log(req.body);
  const query = "SELECT * FROM `user` WHERE `UserName` = ?"; //คำสั่ง query
  try {
    //เช็คข้อมูลผู้ใช้งาน
    const [userVef] = await conn.query(query, [req.body.username]);
    console.log(userVef);
    if (userVef.length === 0) {
      console.log("User not found.");
      return res.status(401).json({ message: "ชื่อผู้ใช้ไม่ถูกต้อง" }); // หรือ "รหัสไม่ถูกต้อง"
    }
    const passVef = await bcrypt.compare(
      req.body.password,
      userVef[0].Password
    );
    console.log("start");
    if (userVef.length > 0 && passVef) {
      // console.log(userVef[0].UserID);
      //set payload ใส่ token
      const payload = {
        username: req.body.username,
        userID: userVef[0].UserID,
      };
      //สร้าง token
      genToken(payload);
      console.log("login");
      console.log(payload.username);
    } else {
      return res.status(401).json({ message: "รหัสไม่ถูกต้อง" });
    }
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
});

//authorize
app.get("/api/profile/", async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    // console.log({ token: authHeader });
    const authToken = authHeader.split(" ")[1];
    // console.log(authToken);
    const user = jwt.verify(authToken, process.env.secrKey);
    return res.json(user.username);
  } catch (error) {
    return res.json(error);
  }
});

//reset password authorize
app.get("/api/getEmail/", async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    // console.log({ token: authHeader });
    const authToken = authHeader.split(" ")[1];
    // console.log(authToken);
    const user = jwt.verify(authToken, process.env.secrKey);
    return res.json(user.email);
  } catch (error) {
    return res.json(error);
  }
});

//fetch กิจกรรมทั่วไป
app.get("/api/events", async (req, res) => {
  try {
    // console.log("Event");
    const [result] = await conn.query(
      "SELECT event.EventID ,event.EventName ,event.Address, user.UserName ,event.Status FROM `event` INNER JOIN user ON user.UserID = event.OwnerUserID WHERE isDelete = 0"
    );
    console.log(result);
    return res.json(result);
  } catch (error) {
    console.log(error);
  }
});

//fetch กิจกรรมที่สร้าง
app.get("/api/fetchcreateevent/:owner", async (req, res) => {
  try {
    const owner = req.params.owner;
    console.log(owner);
    const [result] = await conn.query(
      "SELECT EVENT.EventID,EVENT.EventName,EVENT.Address,user.UserName,EVENT.isDelete,EVENT.Status FROM `event` INNER JOIN USER ON user.UserID = EVENT.OwnerUserID WHERE user.UserName = ? AND isDelete = 0",
      [owner]
    );
    console.log(result);
    return res.status(201).json(result);
  } catch (error) {
    return res.json(error);
  }
});

//fetch กิจกรรมของฉัน
app.get("/api/fetchmyevent/:contestant", async (req, res) => {
  try {
    const contestant = req.params.contestant;
    const [ID] = await conn.query(
      "SELECT `UserID` FROM `user` WHERE UserName = ?",
      [contestant]
    );

    const [result] = await conn.query(
      "SELECT EVENT.EventID,EVENT.EventName,EVENT.Address,user.UserName,contestants.UserName AS 'contestants',EVENT.Status FROM `event`INNER JOIN contestants ON contestants.FighterTable = event.Fightertable INNER JOIN  user ON user.UserID = event.OwnerUserID WHERE contestants.UserID = ? AND EVENT.isDelete = 0 GROUP BY EVENT.EventID",
      [ID[0].UserID]
    );
    console.log(result);
    return res.status(201).json(result);
  } catch (error) {
    return res.json(error);
  }
});

//ข้อมูลกิจกรรม
app.post("/api/edetails", async (req, res) => {
  const eventID = req.body.EventID;
  try {
    console.log("start");
    const [details] = await conn.query(
      "SELECT event.Status, event.Fightertable,event.Condition,event.Rule,event.Time,event.Amount,DATE_FORMAT(event.CloseDate,'%d-%m-%Y') AS CloseDate,DATE_FORMAT(event.RaceDate,'%d-%m-%Y') AS RaceDate,event.MoreDetail,event.EventID ,event.EventName ,event.Address, user.UserName FROM `event` INNER JOIN user ON user.UserID = event.OwnerUserID WHERE event.EventID = ?",
      [eventID]
    );

    return res.json(details);
  } catch (error) {
    console.log(error);
  }
});

//เช็คว่าเป็นผู้เข้าแข่งขันหรือไม่
app.post("/api/contestants", async (req, res) => {
  try {
    const fightertable = req.body.fightertable;
    const username = req.body.username;
    console.log(fightertable);
    console.log(username);
    if (username) {
      const [contestants] = await conn.query(
        "SELECT * FROM `contestants` WHERE FighterTable = ? AND UserName = ? AND isDelete = 0",
        [fightertable, username]
      );
      if (contestants.length > 0) {
        return res.status(200).json({ message: "สมัครแล้ว" });
      }
    }
    const [contestants] = await conn.query(
      "SELECT * FROM `contestants` WHERE FighterTable = ? AND isDelete = 0",
      [fightertable]
    );
    return res.status(200).json(contestants);
  } catch (error) {
    return res.status(404);
  }
});

//ค้นหากิจกรรมทั่วไป
app.get("/api/search/:name", async (req, res) => {
  try {
    const name = req.params.name;
    console.log(name);
    const [result] = await conn.query(
      "SELECT event.EventID ,event.EventName ,event.Address, user.UserName ,event.Status FROM `event` INNER JOIN user ON user.UserID = event.OwnerUserID WHERE (event.EventName LIKE ? OR user.UserName LIKE ?) AND isDelete = 0",
      [`%${name}%`, `%${name}%`]
    );

    console.log("result", result);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400);
  }
});

//ค้นหากิจกรรมของฉัน
app.get("/api/Mysearch/:name/:contestant", async (req, res) => {
  try {
    console.log("fetch");
    const name = req.params.name;
    const contestant = req.params.contestant;
    const [ID] = await conn.query(
      "SELECT `UserID` FROM `user` WHERE UserName = ?",
      [contestant]
    );

    const [result] = await conn.query(
      "SELECT EVENT.EventID,EVENT.EventName,EVENT.Address,user.UserName,EVENT.Status ,contestants.UserName AS 'contestants' FROM `event`INNER JOIN contestants ON contestants.FighterTable = event.Fightertable INNER JOIN  user ON user.UserID = event.OwnerUserID WHERE contestants.UserID = ? AND (event.EventName LIKE ? OR user.UserName LIKE ?) AND isDelete = 0",
      [ID[0].UserID, `%${name}%`, `%${name}%`]
    );

    console.log("result", result);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400);
  }
});

app.get("/api/Csearch/:search/:username", async (req, res) => {
  try {
    const search = req.params.search;
    const username = req.params.username;

    const [userid] = await conn.query(
      "SELECT `UserID` FROM `user` WHERE `UserName`= ?",
      [username]
    );

    const id = userid[0].UserID;
    console.log(id);
    const [event] = await conn.query(
      "SELECT event.EventID ,event.EventName ,event.Address, user.UserName ,event.Status FROM `event` INNER JOIN user ON user.UserID = event.OwnerUserID WHERE `OwnerUserID` = ? AND `isDelete` = 0 AND `EventName` LIKE ?",
      [id, `%${search}%`]
    );
    // console.log(event);

    return res.status(200).json(event);
  } catch (error) {
    return res.status(400);
  }
});

//get ข้อมูลบัญชี
app.get("/api/getprofile/:accname", async (req, res) => {
  try {
    const pname = req.params.accname;
    const [profile] = await conn.query(
      "SELECT * FROM `user` WHERE `UserName`= ?",
      [pname]
    );
    // console.log(profile);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(400);
  }
});

//update profile
app.put("/api/updateprofile", async (req, res) => {
  try {
    console.log("Start");

    const genToken = (payload) => {
      const expiresIn = "1h";
      const token = jwt.sign(payload, process.env.secrKey, { expiresIn });
      console.log(token);
      return res.status(200).json(token);
    };

    const [existuser] = await conn.query(
      "SELECT * FROM `user` WHERE (`UserName`= ? OR `Email` = ?) AND NOT UserID = ?",
      [req.body.name, req.body.email, req.body.id]
    );
    // console.log(existuser[0].Email);
    console.log(req.body.email);
    console.log(existuser.length);

    if (existuser.length > 0) {
      const errormessage = "username หรือ email นี้มีผู้ใช้งานแล้ว";
      return res.status(409).json(errormessage);
    } else {
      await conn.query(
        "UPDATE `user` SET `FirstName` = ?, `LastName`= ?, `PhoneNumber` = ?, `UserName` = ?, `Email` = ? WHERE UserID = ?",
        [
          req.body.name,
          req.body.lastname,
          req.body.phone,
          req.body.user,
          req.body.email,
          req.body.id,
        ]
      );

      await conn.query(
        "UPDATE `contestants` SET `UserName` = ? WHERE UserID = ?",
        [req.body.user, req.body.id]
      );

      const payload = {
        username: req.body.user,
        userID: req.body.id,
      };
      console.log(payload);
      //สร้าง token
      genToken(payload);
      io.emit("fighter refreshing", true);
    }
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการแก้ไข:", err);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
});

//เปลี่ยนรหัสผ่าน
app.put("/api/changepass", async (req, res) => {
  try {
    console.log("change");
    const Newpass = req.body.Npass;
    const id = req.body.id;
    const Opass = req.body.Opass;
    const [checkQ] = await conn.query(
      "SELECT `Password` FROM `user` WHERE `UserID` = ?",
      [id]
    );
    const Opasscheck = await bcrypt.compare(Opass, checkQ[0].Password);
    console.log(Opass);
    console.log(checkQ.length);
    if (checkQ.length > 0 && !Opasscheck) {
      console.log(Opasscheck);
      return res.json({ message: "รหัสผ่านเดิมไม่ถูกต้อง" });
    } else {
      const passcheck = await bcrypt.compare(Newpass, checkQ[0].Password);
      console.log(passcheck);
      if (checkQ.length > 0 && passcheck) {
        return res.json({ message: "ท่านกรอกรหัสผ่านเดิม" });
      } else {
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(Newpass, salt);
        await conn.query("UPDATE `user` SET `Password` = ? WHERE UserID = ?", [
          hashedPassword,
          id,
        ]);
      }
      return res.status(201).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
    }
  } catch (error) {
    return res.json(error);
  }
});

//สร้างกิจกรรม
app.post("/api/createevent", async (req, res) => {
  try {
    console.log("start create");
    const [user] = await conn.query(
      "SELECT `UserID` FROM `user` WHERE `UserName`= ?",
      [req.body.Username]
    );
    console.log(user[0].UserID);
    const UserID = user[0].UserID;
    const table = await conn.query(
      "INSERT INTO `fightertable`(`table`) VALUES (Null)"
    );
    console.log(table[0].insertId);
    const fightertable = table[0].insertId;

    const create = await conn.query(
      "INSERT INTO `event`(`OwnerUserID`, `Fightertable`, `EventName`, `Condition`, `Rule`, `Time`, `Amount`, `Address`, `CloseDate`, `MoreDetail`, `Status`,`RaceDate`) VALUES (?,?,?,?,'swiss',?,?,?,?,?,0,?)",
      [
        UserID,
        fightertable,
        req.body.eventname,
        req.body.condition,
        req.body.time,
        req.body.amount,
        req.body.address,
        req.body.closedate,
        req.body.moredetail,
        req.body.racedate,
      ]
    );
    io.emit("refreshing", true);
    return res.status(201).json(create);
  } catch (error) {
    return res.json(error);
  }
});

//ลบกิจกรรม
app.put("/api/deleteEvent", async (req, res) => {
  try {
    const ID = req.body.EventID;

    const [delEvent] = await conn.query(
      "UPDATE event SET `isDelete`= 1  WHERE `EventID` = ?",
      [ID]
    );

    if (delEvent.affectedRows > 0) {
      console.log("deleted");
      io.emit("refreshing", true);
      return res.status(204).send("ลบสำเร็จ");
    } else {
      return res.status(500).json({
        message: "ลบไม่สำเร็จ",
        success: false,
      });
    }
    // console.log();
  } catch (error) {
    console.log(error);
    return res.status(404);
  }
});

//แก้ไขกิจกรรม
app.put("/api/editevent", async (req, res) => {
  try {
    console.log("start edit");
    const [user] = await conn.query(
      "SELECT `UserID` FROM `user` WHERE `UserName`= ?",
      [req.body.Username]
    );
    console.log(user[0].UserID);
    const UserID = user[0].UserID;

    const update = await conn.query(
      "UPDATE `event` SET `EventName`= ?,`Condition`= ?,`Time`= ?,`Amount`= ?,`Address`= ?,`CloseDate`= ?,`RaceDate`= ?,`MoreDetail`= ? WHERE OwnerUserID = ? AND EventID = ?",
      [
        req.body.eventname,
        req.body.condition,
        req.body.time,
        req.body.amount,
        req.body.address,
        req.body.closedate,
        req.body.racedate,
        req.body.moredetail,
        UserID,
        req.body.eventID,
      ]
    );
    io.emit("refreshing", true);
    return res.status(201).json(update);
  } catch (error) {
    return res.json(error);
  }
});

//สมัครแข่ง เพิ่มข้อมูลผู้เข้าแข่งขัน
app.post("/api/apply", async (req, res) => {
  try {
    const username = req.body.username;
    const architype = req.body.architype;
    const nation = req.body.nation;
    // const EventID = req.body.EventID;
    const fighterTable = req.body.table;
    console.log("apply");
    let userID;
    let note;

    const [reAddCheck] = await conn.query(
      "SELECT `UserName` FROM `contestants` WHERE `FighterTable` = ? AND `UserName` = ? AND isDelete = 0",
      [fighterTable, username]
    );

    if (reAddCheck.length != 0) {
      return res.status(200).send({ message: "รายชื่อซ้ำ" });
    }

    const [fetchuserID] = await conn.query(
      "SELECT `UserID` FROM `user` WHERE UserName = ?",
      [username]
    );
    if (fetchuserID.length == 0) {
      userID = null;
      note = req.body.phone;
      await conn.query(
        "INSERT INTO `contestants`(`FighterTable`, `UserName`, `UserID`, `Nation`, `Archtype`,`contact`) VALUES (?,?,?,?,?,?)",
        [fighterTable, username, userID, nation, architype, note]
      );
    } else {
      userID = await fetchuserID[0].UserID;
      const [apply] = await conn.query(
        "INSERT INTO `contestants`(`FighterTable`, `UserName`, `UserID`, `Nation`, `Archtype`) VALUES (?,?,?,?,?)",
        [fighterTable, username, userID, nation, architype]
      );
      console.log(apply);
    }
    io.emit("fighter refreshing", true);
    // return res.json(userID[0].UserID);

    return res.status(201).send({ message: "สมัครสำเร็จ" });
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

//สละสิทธิ์ ลบผู้เข้าแข่งขัน
app.put("/api/waive", async (req, res) => {
  try {
    const fightertable = req.body.fightertable;
    const username = req.body.username;
    console.log(fightertable, username);
    const [waived] = await conn.query(
      "UPDATE `contestants` SET `isDelete`= 1 WHERE `UserName` = ? AND `FighterTable` = ?",
      [username, fightertable]
    );

    console.log("waived", waived.affectedRows);
    if (waived.affectedRows > 0) {
      console.log("waived");
      io.emit("fighter refreshing", true);
      io.emit("Deleted", username, fightertable);
      return res.sendStatus(204);
    } else {
      return res
        .status(400)
        .json({ message: "ไม่พบผู้ใช้หรือตารางที่ต้องการสละสิทธิ์" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//ปิดรับวมัคร
app.put("/api/close", async (req, res) => {
  try {
    const EventID = req.body.EventID;
    const [closeresult] = await conn.query(
      "UPDATE `event` SET `Status`= 1 WHERE EventID = ?",
      [EventID]
    );

    if (closeresult.affectedRows > 0) {
      io.emit("refreshing", true);
      return res.status(200).json({ message: "ปิดรับสมัครเสร็จสิ้น" });
    } else {
      return res
        .status(404)
        .json({ message: "เกิดข้อผิดพลาดในการปิดรับสมัคร" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(404).json({ message: "ปิดรับสมัครไม่สำเร็จ" });
  }
});

//ข้อมูลผู้เข้าแข่งขัน
app.get("/api/fetchcontestants/:table", async (req, res) => {
  const tableID = req.params.table;
  console.log(tableID);
  try {
    const [data] = await conn.query(
      "SELECT * FROM `contestants` WHERE `FighterTable` = ? AND isDelete = 0",
      [tableID]
    );
    console.log("result", data);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json(error);
  }
});

//fetch ข้อมูลผู้เข้าแข่งขันรายคน
app.post("/api/contestantprofile", async (req, res) => {
  try {
    // console.log("fetch cont");
    const table = req.body.table;
    const username = req.body.contestantName;
    const userID = req.body.userID;

    console.log(table);
    console.log(username);
    const [fetchuser] = await conn.query(
      "SELECT `PhoneNumber`,`UserName`,userID FROM `user` WHERE `UserID`= ?",
      [userID]
    );
    // console.log(fetchuser.length);
    if (fetchuser.length > 0) {
      const [fetchdetail] = await conn.query(
        "SELECT contestants.`UserName`, `Nation`, `Archtype`, user.PhoneNumber FROM `contestants` INNER JOIN user ON user.UserID = contestants.UserID WHERE UserID = ? AND `FighterTable` = ?",
        [userID, table]
      );
      return res.status(200).json(fetchdetail);
    } else {
      const [fetchdetail] = await conn.query(
        "SELECT `UserName`, `Nation`, `Archtype`, `contact` AS PhoneNumber FROM `contestants` WHERE `UserName` = ? AND `FighterTable` = ?",
        [username, table]
      );
      return res.status(200).json(fetchdetail);
    }
  } catch (error) {
    return res.status(404).json(error);
  }
});

//อัพเดตสถานะกิจกรรมเป็น กำลังแข่งขันและแจกเลขประจำตัว
app.put("/api/eventbegin/:EventID/:tableID", async (req, res) => {
  try {
    const EventID = req.params.EventID;
    const table = req.params.tableID;

    const [begin] = await conn.query(
      "UPDATE `event` SET `Status`= 2 WHERE `EventID` = ?",
      [EventID]
    );

    if (begin.affectedRows > 0) {
      io.emit("refreshing", true);

      const [AllFighter] = await conn.query(
        "SELECT * FROM `contestants` WHERE `FighterTable` = ? AND `isDelete` = 0",
        [table]
      );

      const updateID = AllFighter.map((item, index) => {
        const id = index + 1;
        const fighter = item.ContestantID;

        return conn.query(
          "UPDATE `contestants` SET `FighterID`= ? WHERE `ContestantID` = ? AND `FighterTable` = ? AND isDelete = 0",
          [id, fighter, table]
        );
      });

      const giveID = await Promise.all(updateID);
      console.log(giveID.length);
      return res.status(200).json({ message: "อัพเดตสำเร็จ", begin });
    } else {
      return res.status(404).json({ message: "อัพเดตไม่สำเร็จ", begin });
    }
  } catch (error) {
    return res.status(404).json({ message: JSON.stringify(error) });
  }
});

//ดึงรอบการแข่งขัน
app.get("/api/getRound/:tableID", async (req, res) => {
  const tableID = req.params.tableID;
  try {
    const [round] = await conn.query(
      "SELECT `EventID`, `Round` FROM `matchschedule` WHERE `Fightertable` = ? GROUP BY Round",
      [tableID]
    );
    return res.status(200).json(round.length);
  } catch (error) {
    return res.status(404).json(error);
  }
});

//ดึงสถิติทั้งหมดในการแข่งขัน
app.get("/api/getAllMatchpart/:tableID", async (req, res) => {
  const tableID = req.params.tableID;
  try {
    const [round] = await conn.query(
      "SELECT `HistoryID`, `MatchID`, `Round`, `fightertable`, `Fighter1st`, `Fighter1st_Score`, `Fighter2nd`, `Fighter2nd_Score` FROM `match_participants` WHERE `fightertable` = ? GROUP BY Round",
      [tableID]
    );

    return res.status(200).json(round);
  } catch (error) {
    return res.status(404).json(error);
  }
});

//สร้างตารางการแข่งขัน
app.post("/api/insertTable", async (req, res) => {
  try {
    const table = req.body.Fightertable;
    let fighter1 = req.body.fighter1st;
    let fighter2 = req.body.fighter2nd;
    const [Event] = await conn.query(
      "SELECT `EventID` FROM `event` WHERE `Fightertable` = ?",
      [table]
    );
    const EventID = Event[0].EventID;
    const [round] = await conn.query(
      "SELECT `EventID`, `Round` FROM `matchschedule` WHERE `EventID` = ? GROUP BY Round",
      [EventID]
    );

    for (let index = 0; index < fighter1.length; index++) {
      const [insert] = await conn.query(
        "INSERT INTO `matchschedule`(`EventID`, `Round`,`Fightertable`, `Fighter1st`, `Fighter2nd`) VALUES (?,?,?,?,?)",
        [EventID, round.length + 1, table, fighter1[index], fighter2[index]]
      );
      if (insert.affectedRows == 0) {
        return res.status(404).json({ message: "failed" });
      }
    }

    io.emit("matched", table);
    return res
      .status(200)
      .json({ message: "success", round: round.length + 1 });
  } catch (error) {
    return res.status(404);
  }
});

//สร้าง leaderboard
app.get("/api/createLeaderboard/:tableID", async (req, res) => {
  const tableID = req.params.tableID;
  try {
    const [contestant] = await conn.query(
      "SELECT * FROM `contestants` WHERE `FighterTable`= ? AND `isDelete` = 0",
      [tableID]
    );
    console.log(contestant);
    const contestantsList = contestant.map((item, index) => [
      tableID,
      item.FighterID,
      0,
      0,
    ]);

    const [create] = await conn.query(
      "INSERT INTO `leaderboard`(`Fightertable`, `FighterID`, `TotalScore`, `solkolf_score`) VALUES ?",
      [contestantsList]
    );
    return res.status(200).json(contestantsList);
  } catch (error) {
    return res.status(404).json(error);
  }
});

//ดึงข้อมูลตารางการแข่งขัน
app.get("/api/getMatch/:table/:round", async (req, res) => {
  try {
    const table = req.params.table;
    const round = req.params.round;

    const [schedule] = await conn.query(
      'SELECT `MatchID`, `EventID`,matchschedule.Fightertable, `Round`, matchschedule.Fighter1st, conts1.UserName AS "fighter1stName",matchschedule.Fighter2nd, conts2.UserName AS "fighter2ndName" FROM `matchschedule` JOIN contestants AS conts1 ON conts1.FighterID = matchschedule.Fighter1st LEFT JOIN contestants AS conts2 ON conts2.FighterID = matchschedule.Fighter2nd WHERE matchschedule.`Fightertable` = ? AND ROUND = ? AND (conts2.FighterTable = ? OR conts2.FighterTable IS NULL ) AND conts1.FighterTable = ? AND conts1.isDelete=0 AND conts2.isDelete=0 GROUP BY MatchID',
      [table, round, table, table]
    );

    return res.status(200).json(schedule);
  } catch (error) {
    return res.status(404).json(error);
  }
});

//บันทึกผลคะแนน บันทึกคะแนน
app.post("/api/submitScore", async (req, res) => {
  console.log("submit start");
  const schedule = req.body.schedule;
  const firstScore = req.body.firstScore;
  const secondScore = req.body.secondScore;
  const scheduleValue = schedule.map((item, index) => [
    item.Fightertable,
    item.MatchID,
    item.Round,
    item.Fighter1st,
    item.Fighter2nd,
    firstScore[index],
    secondScore[index],
  ]);

  console.log(scheduleValue);
  try {
    const [SubmitScore] = await conn.query(
      "INSERT INTO `match_participants`(`fightertable`, `MatchID`, `Round`, `Fighter1st`, `Fighter2nd`, `Fighter1st_Score`, `Fighter2nd_Score`) VALUES ?",
      [scheduleValue]
    );

    return res.status(200).json(SubmitScore.affectedRows);
  } catch (error) {
    return res.status(500), json(error);
  }
});

//อัพเดต leaderboard
app.put("/api/updateLeaderboard", async (req, res) => {
  const tableID = req.body.tableID;
  const round = req.body.round;
  try {
    console.log("update");
    console.log("round", round);
    const [leaderboardfetch] = await conn.query(
      "SELECT leaderboard.Fightertable,CASE WHEN leaderboard.FighterID = match_participants.Fighter1st THEN Fighter1st WHEN leaderboard.FighterID = match_participants.Fighter2nd THEN Fighter2nd END AS MatchedFighter, CASE WHEN leaderboard.FighterID = match_participants.Fighter1st THEN Fighter1st_Score WHEN leaderboard.FighterID = match_participants.Fighter2nd THEN Fighter2nd_Score END AS MatchScore, leaderboard.TotalScore, leaderboard.solkolf_score FROM leaderboard JOIN match_participants ON leaderboard.FighterID = match_participants.Fighter1st OR leaderboard.FighterID = match_participants.Fighter2nd WHERE match_participants.fightertable = ? AND leaderboard.Fightertable = ? AND Round = ? GROUP BY FighterID",
      [tableID, tableID, round]
    );

    // console.log(leaderboardfetch);
    for (let index = 0; index < leaderboardfetch.length; index++) {
      const NewTotalScore =
        parseInt(leaderboardfetch[index].TotalScore) +
        parseInt(leaderboardfetch[index].MatchScore);
      console.log(NewTotalScore);
      console.log(leaderboardfetch[index].TotalScore);
      console.log(leaderboardfetch[index].MatchScore);
      console.log("Fighter", leaderboardfetch[index].MatchedFighter);

      await conn.query(
        "UPDATE `leaderboard` SET `TotalScore`= ? WHERE FighterID = ? AND Fightertable = ?",
        [NewTotalScore, leaderboardfetch[index].MatchedFighter, tableID]
      );
    }

    return res.status(200).json(leaderboardfetch);
  } catch (error) {
    return res.status(404).json(error);
  }
});

//ดึงข้อมูล leaderboard
app.get("/api/getLeaderboard/:tableID", async (req, res) => {
  const tableID = req.params.tableID;
  try {
    const [leaderboard] = await conn.query(
      "SELECT `LeaderboardID`, leaderboard.`Fightertable`, leaderboard.`FighterID`,contestants.UserName,contestants.Nation, `TotalScore`, `solkolf_score` FROM `leaderboard` JOIN contestants ON contestants.FighterTable = leaderboard.Fightertable AND contestants.FighterID = leaderboard.FighterID WHERE leaderboard.`Fightertable` = ? AND contestants.isDelete = 0 GROUP BY leaderboard.FighterID",
      [tableID]
    );

    return res.status(200).json(leaderboard);
  } catch (error) {
    return res.status(404).json(error);
  }
});

//รวมคะแนน solkoft
app.post("/api/solkoftSum", async (req, res) => {
  const tableID = req.body.tableID;
  const fighterID = req.body.fighterID;
  console.log("table", tableID);
  console.log("ID", fighterID);
  try {
    const [history] = await conn.query(
      "SELECT `MatchID`,`Round`,CASE WHEN `Fighter1st` = ? THEN `Fighter2nd_Score` WHEN `Fighter2nd` = ? THEN `Fighter1st_Score` END AS 'OppomentScore' FROM `match_participants` WHERE (`Fighter1st` = ? OR `Fighter2nd` = ?) AND `fightertable` = ?",
      [fighterID, fighterID, fighterID, fighterID, tableID]
    );

    const [leaderboard] = await conn.query(
      "SELECT  `FighterID`, `TotalScore`, `solkolf_score` FROM `leaderboard` WHERE `FighterID` = ? AND `Fightertable` = ?",
      [fighterID, tableID]
    );
    const allScore = await history.map((item) => {
      return item.OppomentScore;
    });

    console.log(allScore);

    const sumScore = allScore.reduce((sum, current) => sum + current, 0);
    console.log(sumScore);

    const solkoft = sumScore + leaderboard[0].TotalScore;
    console.log("solkoft", solkoft);

    await conn.query(
      "UPDATE `leaderboard` SET `solkolf_score`= ? WHERE `FighterID` = ? AND `Fightertable` = ?",
      [solkoft, fighterID, tableID]
    );

    return res.status(200).json(leaderboard);
  } catch (error) {
    return res.status(404).json(error);
  }
});

//ดึงประวัติการแข่งขัน
app.post("/api/getHistory", async (req, res) => {
  const userName = req.body.account;
  const tableID = req.body.tableID;
  let fighterID;

  try {
    const [fetchfighterID] = await conn.query(
      "SELECT `FighterID`, `UserName`, `UserID` FROM `contestants` WHERE UserName = ? AND fightertable = ? AND isDelete = 0 GROUP BY UserName",
      [userName, tableID]
    );

    fighterID = fetchfighterID[0].FighterID;
    console.log(fighterID);

    const [history] = await conn.query(
      "SELECT DISTINCT Round,`MatchID` ,`Fighter1st`,C1.UserName AS firstName, `Fighter1st_Score`, `Fighter2nd`,C2.UserName AS secondName, `Fighter2nd_Score` FROM `match_participants` JOIN contestants AS C1 ON C1.FighterID = Fighter1st AND match_participants.fightertable = C1.FighterTable JOIN contestants AS C2 ON C2.FighterID = match_participants.Fighter2nd AND match_participants.fightertable = C2.FighterTable WHERE match_participants.`fightertable` = ? AND (Fighter1st = ? OR Fighter2nd = ?) AND C1.isDelete =0 AND C2.isDelete =0 ORDER BY match_participants.Round",
      [tableID, fighterID, fighterID]
    );
    console.log(history);
    return res.status(200).json(history);
  } catch (error) {
    return res.status(404).json(error);
  }
});

//ดึง EventID
app.get("/api/getEventID/:tableID", async (req, res) => {
  const tableID = req.params.tableID;
  try {
    const [EventID] = await conn.query(
      "SELECT `EventID` FROM `event` WHERE `Fightertable` = ?",
      [tableID]
    );

    return res.status(200).json(EventID[0].EventID);
  } catch (error) {
    return res.status(404).json(error);
  }
});

//เสร็จสิ้นการแข่งขัน
app.put("/api/EventFinish/:tableID", async (req, res) => {
  const tableID = req.params.tableID;
  try {
    const [finish] = await conn.query(
      "UPDATE `event` SET `Status`= 3 WHERE `Fightertable` = ?",
      [tableID]
    );
    if (finish.affectedRows > 0) {
      return res.status(200).json({ message: "success" });
    } else {
      return res.status(400), json({ message: "failed" });
    }
  } catch (error) {
    return res.status(404).json(error);
  }
});

//ส่งreset password
app.post("/api/fotgetPassword", async (req, res) => {
  const email = req.body.email;
  try {
    console.log(email);
    const [DBemail] = await conn.query(
      "SELECT Email,UserID FROM `user` WHERE `Email` = ?",
      [email]
    );

    console.log(DBemail[0].Email);

    console.log(req.headers.host);
    if (DBemail.length > 0) {
      const token = jwt.sign({ email: email }, process.env.secrKey, {
        expiresIn: "10m",
      });
      const resetUrl = `http://10.83.226.199:3001/reset-password?token=${token}`;

      const mailOptions = {
        to: email,
        from: "TCG companion",
        subject: "Password Reset",
        html: `
        <p>เรียน ${email},</p>
        <p>เราได้รับคำร้องขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณาคลิกลิงก์ด้านล่างเพื่อดำเนินการตั้งรหัสผ่านใหม่</p>
          <a href="${resetUrl}">คลิกที่นี่เพื่อรีเซ็ตรหัสผ่าน</a>
        <p>หากคุณไม่ได้เป็นผู้ร้องขอ โปรดละเลยอีเมลฉบับนี้ รหัสผ่านของคุณจะยังคงเดิม</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("send");
      return res.status(200).json("success");
    } else {
      return res.status(404).json("Email not found");
    }
  } catch (error) {
    return res.status(400).json(error);
  }
});

//รีเซ็ตรหัส
app.post("/api/resetPassword", async (req, res) => {
  const newpassword = req.body.newpass;
  const email = req.body.email;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newpassword, salt);

  try {
    await conn.query("UPDATE `user` SET `Password`= ? WHERE `Email` = ?", [
      hashedPassword,
      email,
    ]);

    const mailOptions = {
      to: email,
      from: "TCG companion",
      subject: "Reset password Successful",
      html: `
        <p>เรียน ${email},</p>
        <p>รหัสผ่านของท่านได้ถูกรีเซ็ตแล้ว</p>

        <p>ท่านสามารถเข้าสู่ระบบใหม่ได้ด้วยรหัสผ่านใหม่ของท่านได้หลังจากได้รับข้อความนี้</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    console.log("reset successful");
    return res.status(200).json("success");
  } catch (error) {
    res.status(400).json("failed");
  }
});

server.listen(3000, function () {
  conn.query(
    "UPDATE `event` SET `Status` = 1 WHERE `CloseDate` <= CURRENT_DATE AND `Status` = 0  "
  );
  console.log("CORS-enabled web server listening on port 3000");
});
