const express = require("express");
const router = express.Router();

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
router.post("/register", (req, res, next) => {});

// 로컬 로그인
router.post("/login", (req, res, next) => {});

module.exports = router;
