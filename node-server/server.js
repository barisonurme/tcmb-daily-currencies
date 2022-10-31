require("dotenv").config();

const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());
app.use(cors());

const authTest = [
  {
    username: "a",
    data: "post1",
  },
  {
    username: "b",
    data: "post2",
  },
];

const users = [];

//  Token Geçerlilik Testi (Geçerlilik süresi 15saniye.)
app.get("/authTest", authenticateToken, (req, res) => {
  res.json(authTest.filter((auth) => auth.username === req.user.name));
  res.json(req.user.name);
});

//  User Register
app.post("/register", (req, res) => {
  let isUserNameTaken = false;
  users.forEach((user) => {
    if (user.username === req.body.username) {
      res.sendStatus(409);
      isUserNameTaken = true;
    }
  });
  if (!isUserNameTaken) {
    users.push({
      id: Date.now().toString(),
      username: req.body.username,
      password: req.body.password,
    });
    res.json(users);
  }
});

//  Token Auth
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

let refreshTokens = [];

//  Token Yenileme
app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

// Token Silme.
app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

//  Token Oluşturma.
app.post("/generateTokens", async (req, res) => {
  // Kullanıcı Authenticate
  try {
    if (users.length === 0) {
      res.sendStatus(409);
      return;
    }
    users.forEach(async (user) => {
      let passMatch = false;
      // Request Username ve users[] eşleşmesi
      if (user.username === req.body.username) {
        // Request Password ve Hash password eşlemesi
        passMatch = await bcrypt.compare(req.body.password, user.password);
      }
      if (passMatch) {
        const username = req.body.username;
        const user = { name: username };
        // Token Oluşturma
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken);
        res.json({ accessToken, refreshToken });
      } else {
        res.sendStatus(409);
      }
    });
  } catch (error) {}
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

app.listen(3000);
