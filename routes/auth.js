"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const md5_1 = __importDefault(require("md5"));
const axios = require("axios");
const utils_1 = require("../lib/utils");
const constValue_1 = require("../lib/constValue");
const router = express_1.default.Router();
/*  구글 로그인 */
router.get("/login/google", authMiddleware_1.isNotLoggedIn, passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
}));
router.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: `${constValue_1.FRONTEND_URL}/login`,
}), (req, res) => {
    res.redirect(constValue_1.FRONTEND_URL);
});
/*  페이스북 로그인 */
router.get("/login/facebook", authMiddleware_1.isNotLoggedIn, passport_1.default.authenticate("facebook", { scope: "email" }));
router.get("/facebook/callback", passport_1.default.authenticate("facebook", {
    failureRedirect: `${constValue_1.FRONTEND_URL}/login`,
}), (req, res) => {
    res.redirect(constValue_1.FRONTEND_URL);
});
/*  네이버 로그인 */
// router.get(
//   "/login/naver",
//   isNotLoggedIn,
//   passport.authenticate("naver", {
//     failureRedirect: `${FRONTEND_URL}/login`,
//   })
// );
// router.get(
//   "/naver/callback",
//   passport.authenticate("naver", {
//     failureRedirect: `${FRONTEND_URL}/login`,
//   }),
//   (req, res) => {
//     res.redirect(FRONTEND_URL);
//   }
// );
/*  회원가입 */
router.post("/register", authMiddleware_1.isNotLoggedIn, async (req, res, next) => {
    const { nickname, email, password, selfIntro, location } = req.body;
    try {
        // 중복 닉네임 방지
        const isSameNickname = await user_1.default.findOne({
            where: { nickname: nickname.trim() },
        });
        if (isSameNickname) {
            return res.status(403).send("이미 사용중인 닉네임 입니다.");
        }
        // 중복 이메일('local') 방지
        const isSameEmail = await user_1.default.findOne({
            where: { email: email.trim(), loginType: "local" },
        });
        if (isSameEmail) {
            return res.status(403).send("이미 사용중인 이메일 입니다.");
        }
        // 초기 아바타 생성
        const response = await axios.get(`http://gravatar.com/avatar/${md5_1.default(email)}?d=identicon`);
        const avatarURL = response.config.url;
        // 암호 해쉬화
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        // 유저 정보 생성
        const user = await user_1.default.create({
            email: email.trim(),
            password: passwordHash,
            nickname: nickname.trim(),
            selfIntro,
            location,
            avatarURL,
        });
        // 자동 로그인
        req.login(user, async (passportLoginError) => {
            if (passportLoginError) {
                console.error(passportLoginError);
                return next(passportLoginError);
            }
            return res.status(201).end();
        });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  로컬 로그인 */
router.post("/login", authMiddleware_1.isNotLoggedIn, (req, res, next) => {
    passport_1.default.authenticate("local", (serverError, user, errorInfo) => {
        if (serverError) {
            console.error(serverError);
            return next(serverError);
        }
        if (errorInfo) {
            console.error(errorInfo);
            return res.status(401).send(errorInfo.message);
        }
        // 로그인 실행
        return req.login(user, async (passportLoginError) => {
            if (passportLoginError) {
                console.error(passportLoginError);
                return next(passportLoginError);
            }
            const fullUser = await utils_1.getUserWithFullAttributes(user.id);
            return res.json(fullUser);
        });
    })(req, res, next);
});
/*  로그아웃 */
router.get("/logout", authMiddleware_1.isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy(() => {
        res.end();
    });
});
/*  로그인 유저 정보 전송 */
router.get("/login-user", async (req, res, next) => {
    console.log("req.session", req.session);
    if (req.user) {
        try {
            const fullUser = await utils_1.getUserWithFullAttributes(req.user.id);
            return res.json(fullUser);
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    }
    else {
        return res.end();
    }
});
/*  중복 닉네임 검사 */
router.get("/nicknames/:nickname", async (req, res, next) => {
    const user = await user_1.default.findOne({
        where: { nickname: req.params.nickname.trim() },
    });
    console.log("/users/:nickname");
    if (user) {
        res.json({ isAvailable: false });
    }
    else {
        res.json({ isAvailable: true });
    }
});
/*  중복 이메일 검사 */
router.get("/emails/:email", authMiddleware_1.isNotLoggedIn, async (req, res, next) => {
    const user = await user_1.default.findOne({
        where: { email: req.params.email.trim() },
    });
    console.log("/users/:email");
    if (user) {
        res.json({ isAvailable: false });
    }
    else {
        res.json({ isAvailable: true });
    }
});
exports.default = router;
