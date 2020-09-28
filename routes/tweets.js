const express = require("express");
const router = express.Router();
const { Tweet, Image, User, Hashtag } = require("../models");
const multer = require("multer");
const path = require("path");
const {
  getTweetWithFullAttributes,
  getTweetsWithFullAttributes
} = require("../lib/utils");
const { BACKEND_URL } = require("../lib/constValue");
const { Op } = require("sequelize");

//// multer 세팅
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);

    cb(null, basename + "_" + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1204 * 1204 }
});

//// 트윗 추가
router.post("/", upload.array("images", 5), async (req, res, next) => {
  // 트윗 생성
  const tweet = await Tweet.create({
    contents: req.body.contents,
    userId: /* req.user.id */ 1
  });

  const hashtags = req.body.contents.match(/#[^\s#]+/g);
  // 해쉬태그가 있는 경우
  if (hashtags) {
    console.log("hashtags", hashtags);

    const hashtagResults = await Promise.all(
      hashtags.map(hashtag => {
        return Hashtag.findOrCreate({
          where: { tag: hashtag.slice(1).toLowerCase() }
        });
      })
    ); // 결과물 ex) hashtagResult = [[hashtag1, true],[hashtag2, true]]
    await tweet.addHashtags(hashtagResults.map(result => result[0]));
  }

  // 이미지 파일이 있는 경우
  if (req.files.length > 0) {
    req.files.forEach(async file => {
      await Image.create({
        src: `${BACKEND_URL}/images/${file.filename}`,
        tweetId: tweet.id
      });
    });
    await tweet.update({ hasMedia: true });
  }

  const tweetWithOthers = await getTweetWithFullAttributes(tweet.id);

  console.log("tweetWithOthers", tweetWithOthers.toJSON());

  res.status(201).json(tweetWithOthers);
});

//// 트윗들 전송
router.get("/", async (req, res, next) => {
  const lastId = req.query.lastId;
  const limit = parseInt(req.query.limit);
  const where = {};

  if (lastId) {
    where.id = { [Op.lt]: lastId };
  }

  const tweetsWithOthers = await getTweetsWithFullAttributes(where, limit);
  res.status(200).json(tweetsWithOthers);
});

//// 트윗 좋아요 표시
router.post("/:tweetId/like", async (req, res, next) => {
  const { tweetId } = req.params;
  try {
    const tweet = await Tweet.findOne({ where: { id: tweetId } });
    if (!tweet) {
      return res.status(404).send("해당 트윗이 존재하지 않습니다.");
    }
    await tweet.addLikers(req.user.id);

    res.status(201).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 트윗 좋아요 삭제
router.delete("/:tweetId/like", async (req, res, next) => {
  const { tweetId } = req.params;
  try {
    const tweet = await Tweet.findOne({ where: { id: tweetId } });
    if (!tweet) {
      return res.status(404).send("해당 트윗이 존재하지 않습니다.");
    }
    await tweet.removeLikers(req.user.id);

    res.status(204).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
