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
const helmet = require("helmet");
const hpp = require("hpp");
const fs = require("fs");
require("dotenv").config();

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const tweetRouter = require("./routes/tweets");
const hashtagRouter = require("./routes/hashtags");
const searchRouter = require("./routes/search");

const app = express();

// images 폴더가 없을 경우 자동 생성
try {
  fs.accessSync("images");
} catch (error) {
  console.log("images 폴더가 없으므로 생성합니다.");
  fs.mkdirSync("images");
}

// db 접속
sequelize
  .sync()
  // .sync({ alter: true })
  // .sync({ force: true })
  .then(() => {
    console.log("db connection success!");
    console.log("process.env.NODE_ENV", process.env.NODE_ENV);
  })
  .catch(err => console.error(err));

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use(logger("combined"));
  app.use(helmet());
  app.use(hpp());
  app.use(
    cors({
      origin: ["https://jtwitter.me", "https://www.jtwitter.me"],
      credentials: true
    })
  );
} else {
  app.use(logger("dev"));
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  session({
    proxy: process.env.NODE_ENV === "production" ? true : false,
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      domain: process.env.NODE_ENV === "production" && ".jtwitter.me"
    }
  })
);

// 패스포트 적용
passportConfig();
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/tweets", tweetRouter);
app.use("/hashtags", hashtagRouter);
app.use("/search", searchRouter);

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
