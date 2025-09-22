const express = require('express');
const app = express();
const port = 3001;

app.get('/reset-password', (req, res) => {
  const { token } = req.query;
  console.log("redirect");
  const expoGoUrl = `exp://192.168.1.3:8081/--/Resetpassword/${token}`;
  res.redirect(expoGoUrl);
});

app.listen(port, () => {
  console.log(`Redirect server started on port ${port}`);
});