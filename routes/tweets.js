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
    userId: req.user.id
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

    res.end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 트윗 삭제
router.delete("/:tweetId", async (req, res, next) => {
  const { tweetId } = req.params;
  try {
    const tweet = await Tweet.findOne({ where: { id: tweetId } });
    if (!tweet) {
      return res.status(404).send("해당 트윗이 존재하지 않습니다.");
    }
    await Tweet.destroy({ where: { id: tweetId } });

    res.end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 리트윗
router.post("/:tweetId/retweet", async (req, res, next) => {
  const retweetOriginId = parseInt(req.params.tweetId);

  try {
    const retweetOrigin = await Tweet.findOne({
      where: { id: retweetOriginId }
    });
    if (!retweetOrigin) {
      return res.status(404).send("해당 트윗이 존재하지 않습니다.");
    }

    // 트윗 생성
    const newTweet = await Tweet.create({
      contents: "",
      userId: req.user.id,
      retweetOriginId
    });

    // junction table(userretweets)에 추가
    await retweetOrigin.addWriter(req.user.id);

    // 리트윗 원본의 리트윗 카운트 1증가
    await retweetOrigin.increment("retweetedCount");

    const tweetWithOthers = await getTweetWithFullAttributes(newTweet.id);

    res.status(201).json(tweetWithOthers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 리트윗 취소
router.delete("/:tweetId/retweet", async (req, res, next) => {
  const retweetOriginId = parseInt(req.params.tweetId);

  try {
    const retweetOrigin = await Tweet.findOne({
      where: { id: retweetOriginId }
    });
    const tweetToDelete = await Tweet.findOne({
      where: {
        retweetOriginId,
        isQuoted: false,
        userId: req.user.id
      }
    });

    if (!retweetOrigin || !tweetToDelete) {
      return res.status(404).send("해당 트윗이 존재하지 않습니다.");
    }

    const deletedTweetId = tweetToDelete.id;

    // 리트윗한 트윗 삭제
    await tweetToDelete.destroy();

    // junction table(userretweets)에서 제거
    await retweetOrigin.removeWriter(req.user.id);

    // 리트윗 원본의 리트윗 카운트 1감소
    await retweetOrigin.decrement("retweetedCount");

    res.json({ deletedTweetId });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
