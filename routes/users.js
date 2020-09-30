const express = require("express");
const router = express.Router();
const { Tweet, Image, User, Hashtag } = require("../models");

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

module.exports = router;
