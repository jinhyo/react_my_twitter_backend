const express = require("express");
const router = express.Router();
const passport = require("passport");
const { Op } = require("sequelize");
const { Tweet, Image, User, Hashtag } = require("../models");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { getUserWithFullAttributes } = require("../lib/utils");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares/authMiddleware");

// 구글 로그인
router.get("/login/google", (req, res, next) => {});

router.get("/google/callback", (req, res, next) => {});

// 페이스북 로그인
router.get("/login/facebook", (req, res, next) => {});

router.get("/facebook/callback", (req, res, next) => {});

// 네이버 로그인
router.get("/login/naver", (req, res, next) => {});

router.get("/naver/callback", (req, res, next) => {});

// 회원가입
router.post("/register", async (req, res, next) => {
  const { nickname, email, password, selfIntro, location } = req.body;

  try {
    // 중복 닉네임 방지
    const isSameNickname = await User.findOne({ where: { nickname } });
    if (isSameNickname) {
      console.log("isSameNickname", isSameNickname);
      return res.status(403).send("이미 사용중인 닉네임 입니다.");
    }

    // 중복 이메일 방지
    const isSameEmail = await User.findOne({ where: { email } });
    if (isSameEmail) {
      console.log("isSameEmail", isSameEmail);
      return res.status(403).send("이미 사용중인 이메일 입니다.");
    }

    // 초기 아바타 생성
    const emailHash = await bcrypt.hash(email, 10);
    const response = await axios.get(
      `http://gravatar.com/avatar/${emailHash}?d=identicon`
    );
    const avatarURL = response.config.url;

    // 암호 해쉬화
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("passwordHash", passwordHash);

    await User.create({
      email,
      password: passwordHash,
      nickname,
      selfIntro,
      location,
      avatarURL
    });

    res.status(201).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 로컬 로그인
router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (serverError, user, errorInfo) => {
    console.log("~~user", user);

    if (serverError) {
      console.error(serverError);
      return next(serverError);
    }

    if (errorInfo) {
      console.error(errorInfo);
      return res.status(401).send(errorInfo.reason);
    }

    return req.login(user, async passportLoginError => {
      if (passportLoginError) {
        console.error(passportLoginError);
        return next(passportLoginError);
      }

      const fullUser = await getUserWithFullAttributes(user.id);

      return res.json(fullUser);
    });
  })(req, res, next);
});

module.exports = router;
