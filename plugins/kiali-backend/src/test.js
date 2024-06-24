const express = require('express');
const csurf = require('tiny-csrf');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const port = 4000;
app.disable('x-powered-by');

app.use(cookieParser('cookie-parser-secret'));

const token = '8348yrhjfhey8fy39xhiudhh272hfuw2';
app.use(express.urlencoded({ extended: true }));
app.use(csurf(token, ['POST']));
//const csrfProtection = csurf({ cookie: true });
//app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.get('/form', (req, res) => {
  res.send(`
    <form action="/process" method="POST">
      <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
      <input type="text" name="data">
      <button type="submit">Submit</button>
    </form>
  `);
});
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/process', (req, res) => {
  res.send('Data received successfully');
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
