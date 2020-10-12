const express = require("express");
const router = express.Router();
const { Tweet, Image, User, Hashtag } = require("../models");
const { getUserWithFullAttributes } = require("../lib/utils");
const {
  getSpecificUsersTweets,
  getSpecificUsersComments,
  getSpecificUsersMedias,
  getSpecificUsersFavorits
} = require("../lib/utils");
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
      joinTableAttributes: []
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

//// 특정 유저의 팔로잉들 반환
router.get("/:userId/followings", async (req, res, next) => {
  const userId = parseInt(req.params.userId);

  try {
    const user = await User.findOne({ where: { id: userId } });

    const followings = await user.getFollowings({
      attributes: ["id", "nickname", "selfIntro", "avatarURL"],
      joinTableAttributes: []
    });

    res.json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 특정 유저의 팔로워들 반환
router.get("/:userId/followers", async (req, res, next) => {
  const userId = parseInt(req.params.userId);

  try {
    const user = await User.findOne({ where: { id: userId } });

    const followers = await user.getFollowers({
      attributes: ["id", "nickname", "selfIntro", "avatarURL"],
      joinTableAttributes: []
    });

    res.json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 특정 유저의 트윗들 반환 (댓글 제외)
router.get("/:userId/tweets", async (req, res, next) => {
  const userId = parseInt(req.params.userId);

  try {
    tweets = await getSpecificUsersTweets(userId);

    res.json(tweets);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 특정 유저의 댓글 트윗들 반환
router.get("/:userId/comments", async (req, res, next) => {
  const userId = parseInt(req.params.userId);

  try {
    comments = await getSpecificUsersComments(userId);

    res.json(comments);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 특정 유저의 미디어 트윗들 반환
router.get("/:userId/medias", async (req, res, next) => {
  const userId = parseInt(req.params.userId);

  try {
    mediaTweets = await getSpecificUsersMedias(userId);

    res.json(mediaTweets);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 특정 유저가 좋아요 누른 트윗들 반환
router.get("/:userId/favorites", async (req, res, next) => {
  const userId = parseInt(req.params.userId);

  try {
    const tweets = await getSpecificUsersFavorits(userId);

    res.json(tweets);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//// 프로필 수정
router.patch("/profile", async (req, res, next) => {
  const { nickname, selfIntro, location } = req.body;

  try {
    // 중복 닉네임 방지
    const currentUser = await User.findByPk(req.user.id);
    const isSameNickname = await User.findOne({ where: { nickname } });
    if (isSameNickname && req.user.nickname !== currentUser.nickname) {
      return res.status(403).send("이미 사용중인 닉네임 입니다.");
    }

    await User.update(
      { nickname, selfIntro, location },
      { where: { id: req.user.id } }
    );

    res.end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
