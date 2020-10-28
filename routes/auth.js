const express = require("express");
const router = express.Router();
const passport = require("passport");
const { User } = require("../models");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { getUserWithFullAttributes } = require("../lib/utils");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares/authMiddleware");
const { FRONTEND_URL } = require("../lib/constValue");
const md5 = require("md5");

/*  구글 로그인 */
router.get(
  "/login/google",
  isNotLoggedIn,
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login`
  }),
  (req, res) => {
    res.redirect(FRONTEND_URL);
  }
);

/*  페이스북 로그인 */
router.get(
  "/login/facebook",
  isNotLoggedIn,
  passport.authenticate("facebook", { scope: "email" })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${FRONTEND_URL}/login`
  }),
  (req, res) => {
    res.redirect(FRONTEND_URL);
  }
);

/*  네이버 로그인 */
router.get(
  "/login/naver",
  isNotLoggedIn,
  passport.authenticate("naver", {
    failureRedirect: `${FRONTEND_URL}/login`
  })
);

router.get(
  "/naver/callback",
  passport.authenticate("naver", {
    failureRedirect: `${FRONTEND_URL}/login`
  }),
  (req, res) => {
    res.redirect(FRONTEND_URL);
  }
);

/*  회원가입 */
router.post("/register", isNotLoggedIn, async (req, res, next) => {
  const { nickname, email, password, selfIntro, location } = req.body;

  try {
    // 중복 닉네임 방지
    const isSameNickname = await User.findOne({
      where: { nickname: nickname.trim() }
    });
    if (isSameNickname) {
      return res.status(403).send("이미 사용중인 닉네임 입니다.");
    }

    // 중복 이메일('local') 방지
    const isSameEmail = await User.findOne({
      where: { email: email.trim(), loginType: "local" }
    });

    if (isSameEmail) {
      return res.status(403).send("이미 사용중인 이메일 입니다.");
    }

    // 초기 아바타 생성
    const response = await axios.get(
      `http://gravatar.com/avatar/${md5(email)}?d=identicon`
    );
    const avatarURL = response.config.url;

    // 암호 해쉬화
    const passwordHash = await bcrypt.hash(password, 10);

    // 유저 정보 생성
    const user = await User.create({
      email,
      password: passwordHash,
      nickname,
      selfIntro,
      location,
      avatarURL
    });

    // 자동 로그인
    req.login(user, async passportLoginError => {
      if (passportLoginError) {
        console.error(passportLoginError);
        return next(passportLoginError);
      }

      return res.status(201).end();
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*  로컬 로그인 */
router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (serverError, user, errorInfo) => {
    if (serverError) {
      console.error(serverError);
      return next(serverError);
    }

    if (errorInfo) {
      console.error(errorInfo);
      return res.status(401).send(errorInfo.reason);
    }

    // 로그인 실행
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

/*  로그아웃 */
router.get("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.end();
});

/*  로그인 유저 정보 전송 */
router.get("/login-user", async (req, res, next) => {
  console.log("req.session", req.session);

  if (req.user) {
    try {
      const fullUser = await getUserWithFullAttributes(req.user.id);

      return res.json(fullUser);
    } catch (error) {
      console.error(error);
      next(error);
    }
  } else {
    return res.end();
  }
});

/*  중복 닉네임 검사 */
router.get("/nicknames/:nickname", async (req, res, next) => {
  const user = await User.findOne({
    where: { nickname: req.params.nickname.trim() }
  });
  console.log("/users/:nickname");

  if (user) {
    res.json({ isAvailable: false });
  } else {
    res.json({ isAvailable: true });
  }
});

/*  중복 이메일 검사 */
router.get("/emails/:email", isNotLoggedIn, async (req, res, next) => {
  const user = await User.findOne({
    where: { email: req.params.email.trim() }
  });
  console.log("/users/:email");

  if (user) {
    res.json({ isAvailable: false });
  } else {
    res.json({ isAvailable: true });
  }
});

module.exports = router;
