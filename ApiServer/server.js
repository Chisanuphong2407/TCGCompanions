const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
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

// const authen = () => {

// };

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

app.post("/api/login", async (req, res) => {
  //สร้าง token
  const genToken = (payload) => {
    const expiresIn = "1h";
    const token = jwt.sign(payload, secrKey, { expiresIn });
    console.log(secrKey);
    return res.status(200).json(token);
  };

  console.log(req.body);
  const query = "SELECT * FROM `user` WHERE `UserName` = ?"; //คำสั่ง query
  try {
    //เช็คข้อมูลผู้ใช้งาน
    const [userVef] = await conn.query(query, [req.body.username]);
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
      return res.status(401).json("รหัสไม่ถูกต้อง");
    }
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
});

app.get("/api/profile/", async (req, res, next) => {
  try {
    const authHeader = await req.headers["authorization"];
    // console.log({ token: authHeader });
    const authToken = authHeader.split(" ")[1];
    // console.log(authToken);
    const user = await jwt.verify(authToken, secrKey);
    return res.json(user.username);
  } catch (error) {
    return res.json(error);
  }
});

app.get("/api/events", async (req, res) => {
  try {
    // console.log("Event");
    const [result] = await conn.query(
      "SELECT event.EventID ,event.EventName ,event.Address, user.UserName FROM `event` INNER JOIN user ON user.UserID = event.UserID"
    );
    // console.log(result);
    return res.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/fetchcreateevent/:owner", async (req, res) => {
  try {
    const owner = req.params.owner;
    console.log(owner);
    const [result] = await conn.query(
      "SELECT EVENT.EventID,EVENT.EventName,EVENT.Address,user.UserName FROM `event` INNER JOIN USER ON user.UserID = EVENT.UserID WHERE user.UserName = ?",
      [owner]
    );
    console.log(result);
    return res.status(201).json(result);
  } catch (error) {
    return res.json(error);
  }
});

app.post("/api/edetails", async (req, res) => {
  try {
    console.log("start");
    const [details] = await conn.query(
      "SELECT event.Status, event.Fighter,event.Condition,event.Rule,event.Time,event.Amount,DATE_FORMAT(event.CloseDate,'%d-%m-%Y')  AS CloseDate,event.MoreDetail,event.EventID ,event.EventName ,event.Address, user.UserName FROM `event` INNER JOIN user ON user.UserID = event.UserID WHERE event.EventID = ?",
      [req.body.EventID]
    );

    return res.json(details);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/contestants", async (req, res) => {
  try {
    const fightertable = req.body.fightertable;
    const username = req.body.username;
    if (username) {
      const [contestants] = await conn.query(
        "SELECT * FROM `contestants` WHERE FighterTable = ? AND UserName = ?",
        [fightertable,username]
      );
      if(contestants.length > 0){
        console.log("server",true)
        return res.status(200).json(true);
      }
    } else{
      
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

app.get("/api/search/:eventname", async (req, res) => {
  try {
    const name = req.params.eventname;
    // console.log(name);
    const [result] = await conn.query(
      "SELECT event.EventID ,event.EventName ,event.Address, user.UserName FROM `event` INNER JOIN user ON user.UserID = event.UserID WHERE event.EventName = ?",
      [name]
    );

    // console.log(result);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400);
  }
});

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

app.put("/api/updateprofile", async (req, res) => {
  try {
    console.log("Start");
    const [existuser] = await conn.query(
      "SELECT * FROM `user` WHERE `UserName`= ? OR `Email` = ?",
      [req.body.name, req.body.email]
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
      // const unhash = await bcrypt.compare(req.body.password, hashedPassword);
      // console.log(unhash);
      return res.status(201).json({ message: "แก้ไขสำเร็จ" });
    }
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการแก้ไข:", err);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
});

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
      "INSERT INTO `fightertable`(`Fighter`) VALUES (Null)"
    );
    console.log(table[0].insertId);
    const fightertable = table[0].insertId;

    const create = await conn.query(
      "INSERT INTO `event`(`UserID`, `Fighter`, `EventName`, `Condition`, `Rule`, `Time`, `Amount`, `Address`, `CloseDate`, `MoreDetail`, `Status`) VALUES (?,?,?,?,'swiss',?,?,?,?,?,0)",
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
    return res.status(201).json(create);
  } catch (error) {
    return res.json(error);
  }
});

app.delete("/api/deleteEvent/:EventID", async (req, res) => {
  try {
    const ID = req.params.EventID;
    const [fetchTable] = await conn.query(
      "SELECT `Fighter` FROM `event` WHERE EventID = ?",
      [ID]
    );
    const table = fetchTable[0].Fighter;

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
    const [delTable] = await conn.query(
      "DELETE from `fightertable` WHERE Fighter = ?",
      [table]
    );

    if (delEvent.affectedRows > 0 && delTable.affectedRows > 0) {
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
      "UPDATE `event` SET `EventName`= ?,`Condition`= ?,`Time`= ?,`Amount`= ?,`Address`= ?,`CloseDate`= ?,`MoreDetail`= ? WHERE UserID = ?",
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
    return res.status(201).json(update);
  } catch (error) {
    return res.json(error);
  }
});

app.post("/api/apply", async (req, res) => {
  try {
    const username = req.body.username;
    const architype = req.body.architype;
    const nation = req.body.nation;
    // const EventID = req.body.EventID;
    const fighterTable = req.body.table;
    console.log("apply");
    let fighterID;

    const [totalFighter] = await conn.query(
      "SELECT * FROM `contestants` WHERE `Fightertable` = ?",
      [fighterTable]
    );

    if (totalFighter.length === 0) {
      fighterID = 1;
    } else {
      fighterID = totalFighter.length + 1;
    }

    const [userID] = await conn.query(
      "SELECT `UserID` FROM `user` WHERE UserName = ?",
      [username]
    );

    // return res.json(userID[0].UserID);
    await conn.query(
      "INSERT INTO `contestants`(`FighterTable`, `FighterID`, `UserName`, `UserID`, `Nation`, `Archtype`) VALUES (?,?,?,?,?,?)",
      [fighterTable, fighterID, username, userID[0].UserID, nation, architype]
    );

    return res.status(201).send({ message: "สมัครสำเร็จ" });
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

app.listen(3000, function () {
  conn.query(
    "UPDATE `event` SET `Status` = 1 WHERE `CloseDate` <= CURRENT_DATE  "
  );
  console.log("CORS-enabled web server listening on port 3000");
});
