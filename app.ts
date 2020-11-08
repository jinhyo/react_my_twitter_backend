import createError from "http-errors";
import fs from "fs";
import path from "path";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";
import passport from "passport";
import passportConfig from "./passport";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import dotenv from "dotenv";

/* 라우터 */
import sequelize from "./models/sequelize";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import tweetRouter from "./routes/tweets";
import hashtagRouter from "./routes/hashtags";
import searchRouter from "./routes/search";

dotenv.config();
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
  //   .sync()
  // .sync({ alter: true })
  .sync({ force: true })
  .then(() => {
    console.log("db connection success!");
    console.log("process.env.NODE_ENV", process.env.NODE_ENV);
  })
  .catch((err: Error) => console.error(err));

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use(logger("combined"));
  app.use(helmet());
  app.use(hpp());
  app.use(
    cors({
      origin: ["https://jtwitter.me", "https://www.jtwitter.me"],
      credentials: true,
    })
  );
} else {
  app.use(logger("dev"));
  app.use(
    cors({
      origin: true,
      credentials: true,
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
    secret: process.env.COOKIE_SECRET!,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      domain:
        process.env.NODE_ENV === "production" ? ".jtwitter.me" : undefined,
    },
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
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: Request, res: Response) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.error(err);

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
