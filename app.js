const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { sequelize } = require("./models");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");

const app = express();

// db 접속
sequelize
  .sync(/* { alter: true } */)
  .then(() => {
    console.log("db connection success!");
  })
  .catch(err => console.error(err));

app.use(
  cors({
    origin: /* "http://localhost:3003" */ true, // or true로 해도 됨
    credentials: true // 브라우저와 백엔드 서버의 도메인이 다를 경우 쿠키 공유가 불가능
    // 이를 해결하기 위해 credentials: true 입력(기본값은 false)
    // 브라우저에서 사용하는 API에는 {withCredentials: true}를 넣어줘야 한다.
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET
    // cookie: {
    // httpOnly: true // 자바스크립트로 장난치는 것 금지 (브라우저의 console창에서의 해킹 방지)
    // secure: true // https에서만 사용 가능
    // }
  })
);

// 패스포트 적용
passportConfig();
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.error(err);

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
