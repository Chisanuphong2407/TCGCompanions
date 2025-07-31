const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const socketIo = require("socket.io");
const http = require("http");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const crypto = require("crypto");/

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

// const secrKey = crypto.randomBytes(32).toString("hex");
const secrKey = "hahaha";

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

io.on("Connection", async (socket) => {
  console.log(`Connected:${socket.id}`);
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
    const token = jwt.sign(payload, secrKey, { expiresIn });
    // console.log(secrKey);
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
    const user = jwt.verify(authToken, secrKey);
    return res.json(user.username);
  } catch (error) {
    return res.json(error);
  }
});

//fetch กิจกรรมทั่วไป
app.get("/api/events", async (req, res) => {
  try {
    // console.log("Event");
    const [result] = await conn.query(
      "SELECT event.EventID ,event.EventName ,event.Address, user.UserName FROM `event` INNER JOIN user ON user.UserID = event.OwnerUserID"
    );
    // console.log(result);
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
      "SELECT EVENT.EventID,EVENT.EventName,EVENT.Address,user.UserName FROM `event` INNER JOIN USER ON user.UserID = EVENT.OwnerUserID WHERE user.UserName = ?",
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
      "SELECT EVENT.EventID,EVENT.EventName,EVENT.Address,user.UserName,contestants.UserName AS 'contestants' FROM `event`INNER JOIN contestants ON contestants.FighterTable = event.Fightertable INNER JOIN  user ON user.UserID = event.OwnerUserID WHERE contestants.UserID = ?",
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
  try {
    console.log("start");
    const [details] = await conn.query(
      "SELECT event.Status, event.Fightertable,event.Condition,event.Rule,event.Time,event.Amount,DATE_FORMAT(event.CloseDate,'%d-%m-%Y')  AS CloseDate,event.MoreDetail,event.EventID ,event.EventName ,event.Address, user.UserName FROM `event` INNER JOIN user ON user.UserID = event.OwnerUserID WHERE event.EventID = ?",
      [req.body.EventID]
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
    if (username) {
      const [contestants] = await conn.query(
        "SELECT * FROM `contestants` WHERE FighterTable = ? AND UserName = ?",
        [fightertable, username]
      );
      if (contestants.length > 0) {
        return res.status(200).json({ message: "สมัครแล้ว" });
      }
    }
    const [contestants] = await conn.query(
      "SELECT * FROM `contestants` WHERE FighterTable = ?",
      [fightertable]
    );
    return res.status(200).json(contestants);
  } catch (error) {
    return res.status(404);
  }
});

//ค้นหากิจกรรมทั่วไป
app.get("/api/search/:eventname", async (req, res) => {
  try {
    const name = req.params.eventname;
    console.log(name);
    const [result] = await conn.query(
      "SELECT event.EventID ,event.EventName ,event.Address, user.UserName FROM `event` INNER JOIN user ON user.UserID = event.OwnerUserID WHERE event.EventName LIKE ?",
      [`%${name}%`]
    );

    console.log("result", result);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400);
  }
});

//ค้นหากิจกรรมของฉัน
app.get("/api/Mysearch/:eventname/:contestant", async (req, res) => {
  try {
    console.log("fetch");
    const name = req.params.eventname;
    const contestant = req.params.contestant;
    const [ID] = await conn.query(
      "SELECT `UserID` FROM `user` WHERE UserName = ?",
      [contestant]
    );

    const [result] = await conn.query(
      "SELECT EVENT.EventID,EVENT.EventName,EVENT.Address,user.UserName,contestants.UserName AS 'contestants' FROM `event`INNER JOIN contestants ON contestants.FighterTable = event.Fightertable INNER JOIN  user ON user.UserID = event.OwnerUserID WHERE contestants.UserID = ? AND event.EventName LIKE ?",
      [ID[0].UserID, `%${name}%`]
    );

    console.log("result", result);
    return res.status(200).json(result);
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
      const token = jwt.sign(payload, secrKey, { expiresIn });
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
      io.emit("refreshing", true);
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
    // return res.json(UserID);
    const table = await conn.query(
      "INSERT INTO `fightertable`(`table`) VALUES (Null)"
    );
    console.log(table[0].insertId);
    const fightertable = table[0].insertId;

    const create = await conn.query(
      "INSERT INTO `event`(`OwnerUserID`, `Fightertable`, `EventName`, `Condition`, `Rule`, `Time`, `Amount`, `Address`, `CloseDate`, `MoreDetail`, `Status`) VALUES (?,?,?,?,'swiss',?,?,?,?,?,0)",
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
      ]
    );
    io.emit("refreshing", true);
    return res.status(201).json(create);
  } catch (error) {
    return res.json(error);
  }
});

//ลบกิจกรรม
app.delete("/api/deleteEvent/:EventID", async (req, res) => {
  try {
    const ID = req.params.EventID;
    const [fetchTable] = await conn.query(
      "SELECT `Fightertable` FROM `event` WHERE EventID = ?",
      [ID]
    );
    const table = fetchTable[0].Fightertable;

    if (fetchTable.length === 0) {
      return res.status(404).json({
        message: "Event not found",
        success: false,
      });
    }

    const [delEvent] = await conn.query(
      "DELETE from `event` WHERE EventID = ?",
      [ID]
    );
    const [delContestants] = await conn.query(
      "DELETE FROM `contestants` WHERE `FighterTable` = ?",
      [table]
    );
    const [delTable] = await conn.query(
      "DELETE from `fightertable` WHERE table = ?",
      [table]
    );

    if (delEvent.affectedRows > 0 && delTable.affectedRows > 0) {
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
      "UPDATE `event` SET `EventName`= ?,`Condition`= ?,`Time`= ?,`Amount`= ?,`Address`= ?,`CloseDate`= ?,`MoreDetail`= ? WHERE OwnerUserID = ?",
      [
        req.body.eventname,
        req.body.condition,
        req.body.time,
        req.body.amount,
        req.body.address,
        req.body.closedate,
        req.body.moredetail,
        UserID,
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
    let fighterID;
    let userID;
    let note;
    const [totalFighter] = await conn.query(
      "SELECT * FROM `contestants` WHERE `Fightertable` = ?",
      [fighterTable]
    );

    if (totalFighter.length === 0) {
      fighterID = 1;
    } else {
      fighterID = totalFighter.length + 1;
    }

    const [fetchuserID] = await conn.query(
      "SELECT `UserID` FROM `user` WHERE UserName = ?",
      [username]
    );
    if (fetchuserID.length == 0) {
      userID = null;
      note = req.body.phone;
      await conn.query(
        "INSERT INTO `contestants`(`FighterTable`, `FighterID`, `UserName`, `UserID`, `Nation`, `Archtype`,`contact`) VALUES (?,?,?,?,?,?,?)",
        [fighterTable, fighterID, username, userID, nation, architype, note]
      );
    } else {
      userID = await fetchuserID[0].UserID;
      await conn.query(
        "INSERT INTO `contestants`(`FighterTable`, `FighterID`, `UserName`, `UserID`, `Nation`, `Archtype`) VALUES (?,?,?,?,?,?)",
        [fighterTable, fighterID, username, userID, nation, architype]
      );
    }

    // return res.json(userID[0].UserID);

    return res.status(201).send({ message: "สมัครสำเร็จ" });
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

//สละสิทธิ์ ลบผู้เข้าแข่งขัน
app.delete(
  "/api/waive/table/:fightertable/userID/:username",
  async (req, res) => {
    try {
      const fightertable = req.params.fightertable;
      const username = req.params.username;
      console.log(fightertable, username);
      const [waived] = await conn.query(
        "DELETE FROM `contestants` WHERE `UserName` = ? AND `FighterTable` = ?",
        [username, fightertable]
      );

      if (waived.affectedRows > 0) {
        console.log(waived);
        io.emit("refreshing", true);
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
  }
);

//ปิดรับวมัคร
app.put("/api/close/:EventID", async (req, res) => {
  try {
    const EventID = req.params.EventID;
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
      "SELECT * FROM `contestants` WHERE `FighterTable` = ?",
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
    const fighterID = req.body.fighterID;
    const userID = req.body.userID;

    const [fetchuser] = await conn.query(
      "SELECT `PhoneNumber`,`UserName` FROM `user` WHERE `UserID`= ?",
      [userID]
    );
    // console.log(fetchuser.length);
    if (fetchuser.length > 0) {
      const [fetchdetail] = await conn.query(
        "SELECT contestants.`UserName`, `Nation`, `Archtype`, user.PhoneNumber FROM `contestants` INNER JOIN user ON user.UserID = contestants.UserID WHERE `FighterID` = ? AND `FighterTable` = ?",
        [fighterID, table]
      );
      return res.status(200).json(fetchdetail);
    } else {
      const [fetchdetail] = await conn.query(
        "SELECT `UserName`, `Nation`, `Archtype`, `contact` AS PhoneNumber FROM `contestants` WHERE `FighterID` = ? AND `FighterTable` = ?",
        [fighterID, table]
      );
      return res.status(200).json(fetchdetail);
    }
  } catch (error) {
    return res.status(404).json(error);
  }
});

//อัพเดตสถานะกิจกรรมเป็น กำลังแข่งขัน
app.put("/api/eventbegin/:EventID", async (req, res) => {
  try {
    const EventID = req.params.EventID;
    const [begin] = await conn.query(
      "UPDATE `event` SET `Status`= 2 WHERE `EventID` = ?",
      [EventID]
    );

    if (begin.affectedRows > 0) {
      io.emit("refreshing", true);
      return res.status(200).json({ message: "อัพเดตสำเร็จ", begin });
    } else {
      return res.status(404).json({ message: "อัพเดตไม่สำเร็จ", begin });
    }
  } catch (error) {
    return res.status(404).json({ message: JSON.stringify(error) });
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
        "INSERT INTO `matchschedule`(`EventID`, `Round`, `Fighter1st`, `Fighter2nd`) VALUES (?,?,?,?)",
        [EventID, round.length + 1, fighter1[index], fighter2[index]] 
      );
      if(insert.affectedRows == 0) {
        return res.status(404).json({message: "failed"} );
      }
    }

    return res.status(200).json({message: 'success',round: round.length+1});
  } catch (error) {
    return res.status(404);
  }
});

//ดึงข้อมูลตารางการแข่งขัน
app.get("/api/getMatch/:table/:round",async(req,res) => {
  try {
    const table = req.params.table;
    const round = req.params.round;
    const [Eventquery] = await conn.query("SELECT `EventID` FROM `event` WHERE `Fightertable` = ?",[
      table
    ]);
    
    const EventID = Eventquery[0].EventID;
    const [schedule] = await conn.query("SELECT * FROM `matchschedule` WHERE `EventID` = ? AND Round = ?" ,[
      EventID,round
    ]);
    return res.status(200).json(schedule);
  } catch (error) {
    return res.status(404).json(error);
  }
})

server.listen(3000, function () {
  conn.query(
    "UPDATE `event` SET `Status` = 1 WHERE `CloseDate` <= CURRENT_DATE AND `Status` = 0  "
  );
  console.log("CORS-enabled web server listening on port 3000");
});
