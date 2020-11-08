"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_2 = __importDefault(require("./passport"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const dotenv_1 = __importDefault(require("dotenv"));
/* 라우터 */
const sequelize_1 = __importDefault(require("./models/sequelize"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const tweets_1 = __importDefault(require("./routes/tweets"));
const hashtags_1 = __importDefault(require("./routes/hashtags"));
const search_1 = __importDefault(require("./routes/search"));
dotenv_1.default.config();
const app = express_1.default();
// images 폴더가 없을 경우 자동 생성
try {
    fs_1.default.accessSync("images");
}
catch (error) {
    console.log("images 폴더가 없으므로 생성합니다.");
    fs_1.default.mkdirSync("images");
}
// db 접속
sequelize_1.default
    //   .sync()
    // .sync({ alter: true })
    .sync({ force: true })
    .then(() => {
    console.log("db connection success!");
    console.log("process.env.NODE_ENV", process.env.NODE_ENV);
})
    .catch((err) => console.error(err));
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    app.use(morgan_1.default("combined"));
    app.use(helmet_1.default());
    app.use(hpp_1.default());
    app.use(cors_1.default({
        origin: ["https://jtwitter.me", "https://www.jtwitter.me"],
        credentials: true,
    }));
}
else {
    app.use(morgan_1.default("dev"));
    app.use(cors_1.default({
        origin: true,
        credentials: true,
    }));
}
// view engine setup
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "images")));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookie_parser_1.default(process.env.COOKIE_SECRET));
app.use(express_session_1.default({
    proxy: process.env.NODE_ENV === "production" ? true : false,
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        domain: process.env.NODE_ENV === "production" ? ".jtwitter.me" : undefined,
    },
}));
// 패스포트 적용
passport_2.default();
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/auth", auth_1.default);
app.use("/users", users_1.default);
app.use("/tweets", tweets_1.default);
app.use("/hashtags", hashtags_1.default);
app.use("/search", search_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(http_errors_1.default(404));
});
// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    console.error(err);
    // render the error page
    res.status(err.status || 500);
    res.render("error");
});
module.exports = app;
