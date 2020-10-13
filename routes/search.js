const express = require("express");
const router = express.Router();
const { User, Hashtag } = require("../models");
const { Op } = require("sequelize");

/* 검색 결과 반환 */
router.get("/:searchWord", async (req, res, next) => {
  const { searchWord } = req.params;

  // 검색 유형 파악(1.해시태그, 2.유저, 3.모두)
  const { type } = req.query;

  const result = { hashtags: [], users: [] };
  try {
    if (type === "hashtag") {
      // 해시태그 검색
      const hashtags = await Hashtag.findAll({
        where: {
          tag: { [Op.substring]: searchWord }
        },
        attributes: ["tag"]
      });
      result.hashtags = hashtags;
    } else if (type === "user") {
      // 유저 검색
      const users = await User.findAll({
        where: {
          nickname: { [Op.substring]: searchWord }
        },
        attributes: ["id", "nickname", "avatarURL"]
      });
      result.users = users;
    } else {
      // 둘 다 검색
      const hashtags = await Hashtag.findAll({
        where: {
          tag: { [Op.substring]: searchWord }
        },
        attributes: ["tag"]
      });
      result.hashtags = hashtags;

      const users = await User.findAll({
        where: {
          nickname: { [Op.substring]: searchWord }
        },
        attributes: ["id", "nickname", "avatarURL"]
      });
      result.users = users;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
