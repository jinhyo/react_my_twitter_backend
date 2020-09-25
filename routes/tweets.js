const express = require("express");
const router = express.Router();
const { Tweet, Image, User, Hashtag } = require("../models");

// 트윗 생성
router.post("/", async (req, res, next) => {
  console.log("contents: ", req.body.contents, "images: ", req.body.images);
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
    console.log("hashtagResults", hashtagResults);
    await tweet.addHashtags(hashtagResults.map(result => result[0]));
  }

  console.log("tweet", tweet.toJSON());

  res.status(201).json(tweet);
});

module.exports = router;
