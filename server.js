const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const myParser = require('body-parser');

const port = process.env.PORT || '3001';
const authTable = {};
const usernamePassMap = {};
function findRand() {
  do {
    var rand = parseInt(Math.random() * 10000);
    authTable[rand] = true;
  } while (authTable[rand] === undefined);
  return rand;
}

const getForm = (user = '') => {
  return `<form method="post" action='/login-details' >
    <h1>Login Form</h1>
    <input type='text' name='username' value=${JSON.stringify(
      user
    )} placeholder="Enter UserName" />
    <input type='password' name='password' value='' placeholder="Enter Password" />
    <button type='submit'>Submit</button>
    <button><a href="/sign-up" >Sign Up</a></button>
  </form>`;
};

const signupForm = `
  <form action='/post-sign-up' method="POST">
    <h1>Signup Form</h1>
    <input type='text' name='username' value='' placeholder="Enter UserName" />
    <input type='password' name='password' value='' placeholder="Enter Password" />
    <button type='submit'>Submit</buton>
  </form>
`;

app.use(cookieParser());
app.use(myParser.urlencoded({ extended: true }));

function authorizationInfo(req) {
  const cookieArr = (req.headers.cookie && req.headers.cookie.split(';')) || [];
  let authToken = null;
  cookieArr.some((cookie) => {
    var cookieArr = cookie.split('=');
    if (cookieArr[0] === 'Auth-Token') {
      authToken = cookieArr[1];
      return true;
    }
    return false;
  });
  return {
    isAuthorized: !!authTable[authToken],
    authToken: authToken,
  };
}

app.get('/', (req, res) => {
  if (!authorizationInfo(req).isAuthorized) {
    res.redirect('/login');
  } else {
    res.redirect('/users');
  }
});
app.get('/login', (req, res) => {
  if (authorizationInfo(req).isAuthorized) {
    res.redirect('/users');
  }
  res.send(`<div>${getForm()}</div>`);
});

app.get('/logout', (req, res) => {
  const { isAuthorized, authToken } = authorizationInfo(req);
  console.log(authTable);
  if (isAuthorized) {
    console.log(authTable);
    delete authTable[authToken];
    res.send(`<div>${getForm()}</div>`);
  }
});

app.post('/login-details', (req, res) => {
  const { username, password } = req.body;
  if (usernamePassMap[username]) {
    if (usernamePassMap[username] === password) {
      const AuthToken = findRand();
      res.cookie('Auth-Token', AuthToken);
      res.send(
        `<div>LoggedIn <br /> <br />  <br /> <a href='/users'>Click for users</a></div >`
      );
    } else {
      res.send(
        `<div>Not valid password. Please re-enter password<br /><div>${getForm(
          username
        )} </div ></div >`
      );
    }
  } else {
    res.send(
      `<div>Not valid User. Please re-enter<br /><div>${getForm()} </div ></div >`
    );
  }
});

app.get('/users', (req, res) => {
  if (authorizationInfo(req)) {
    res.send(
      '<div>Authorized successfully</div><br/><form action = "/logout" method = "GET" > <button type="submit">Logout</button></form> '
    );
  } else {
    res.redirect('/');
  }
});

app.get('/sign-up', (req, res) => {
  res.send(signupForm);
});

app.post('/post-sign-up', (req, res) => {
  const { username, password } = req.body;
  usernamePassMap[username] = password;
  const AuthToken = findRand();
  res.cookie('Auth-Token', AuthToken);
  res.redirect('/users');
});

app.listen(port, () => {
  console.log('Listening on port', port);
});
