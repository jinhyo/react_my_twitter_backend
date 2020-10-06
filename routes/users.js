const express = require("express");
const router = express.Router();
const { Tweet, Image, User, Hashtag } = require("../models");
const { getUserWithFullAttributes } = require("../lib/utils");

//// 팔로우
router.post("/:userId/follow", async (req, res, next) => {
  const { userId } = req.params;
  try {
    const targetUser = await User.findOne({ where: { id: userId } });
    if (!targetUser) {
      return res.status(404).send("해당 유저가 존재하지 않습니다.");
    }
    await targetUser.addFollower(req.user.id);

    res.status(201).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 언팔로우
router.delete("/:userId/follow", async (req, res, next) => {
  const { userId } = req.params;
  try {
    const targetUser = await User.findOne({ where: { id: userId } });
    if (!targetUser) {
      return res.status(404).send("해당 유저가 존재하지 않습니다.");
    }
    await targetUser.removeFollower(req.user.id);

    res.end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 특정 트윗을 리트윗한 유저들 반환
router.get("/retweet/:tweetId", async (req, res, next) => {
  const tweetId = parseInt(req.params.tweetId);

  try {
    const targetTweet = await Tweet.findOne({ where: { id: tweetId } });
    if (!targetTweet) {
      return res.status(404).send("해당 트윗이 존재하지 않습니다.");
    }

    const users = await targetTweet.getChoosers({
      attributes: ["id", "nickname", "selfIntro", "avatarURL"]
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 특정 트윗을 좋아요 누른 유저들 반환
router.get("/like/:tweetId", async (req, res, next) => {
  const tweetId = parseInt(req.params.tweetId);

  try {
    const targetTweet = await Tweet.findOne({ where: { id: tweetId } });
    if (!targetTweet) {
      return res.status(404).send("해당 트윗이 존재하지 않습니다.");
    }

    const users = await targetTweet.getLikers({
      attributes: ["id", "nickname", "selfIntro", "avatarURL"],
      through: {
        attributes: []
      }
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 특정 유저 정보 전송
router.get("/:userId", async (req, res, next) => {
  const userId = parseInt(req.params.userId);
  try {
    const user = await getUserWithFullAttributes(userId);

    if (!user) {
      return res.status(404).send("해당 유저가 존재하지 않습니다.");
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
