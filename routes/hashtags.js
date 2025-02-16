const express = require("express");
const router = express.Router();
const { getTweetsWithHashtag } = require("../lib/utils");
const { Hashtag } = require("../models");

/*  가장 많이 사용된 해시태그 3개 전송 */
router.get("/trend", async (req, res, next) => {
  try {
    const hashtags = await Hashtag.findAll({
      order: [["count", "DESC"]],
      attributes: ["id", "tag", "count"],
      limit: 3
    });

    res.status(200).json(hashtags);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*  특정 해시태그를 가진 트윗들 전송 */
router.get("/tag/:tagName", async (req, res, next) => {
  const lastId = req.query.lastId;
  const limit = parseInt(req.query.limit);
  const tagName = req.params.tagName;

  const whereInTweet = {};

  if (lastId) {
    whereInTweet.id = { [Op.lt]: lastId };
  }

  try {
    const tweetsWithOthers = await getTweetsWithHashtag(
      whereInTweet,
      limit,
      tagName
    );

    if (!tweetsWithOthers) {
      return res.status(404).send("해당 해시태그가 존재하지 않습니다.");
    }

    res.status(200).json(tweetsWithOthers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
