const express = require('express');
const app = express();
const port = 3001;

app.get('/reset-password', (req, res) => {
  const { token } = req.query;
  console.log("redirect");
  const expoGoUrl = `exp://10.163.254.199:8081/--/Resetpassword/${token}`;
  res.redirect(expoGoUrl);
});

app.listen(port, () => {
  console.log(`Redirect server started on port ${port}`);
});