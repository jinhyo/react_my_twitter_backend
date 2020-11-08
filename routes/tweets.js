"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const tweet_1 = __importDefault(require("../models/tweet"));
const image_1 = __importDefault(require("../models/image"));
const hashtag_1 = __importDefault(require("../models/hashtag"));
const multer_1 = __importDefault(require("../lib/multer"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const utils_1 = require("../lib/utils");
const constValue_1 = require("../lib/constValue");
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = express_1.default.Router();
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.naver.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.NAVER_EMAIL,
        pass: process.env.NAVER_EMAIL_PWD,
    },
});
/*  트윗 추가 */
router.post("/", authMiddleware_1.isLoggedIn, multer_1.default.array("images", 5), async (req, res, next) => {
    try {
        // 트윗 생성
        const tweet = await tweet_1.default.create({
            contents: req.body.contents,
            userId: req.user.id,
        });
        const hashtags = req.body.contents.match(/#[^\s#]+/g);
        // 해쉬태그가 있는 경우
        if (hashtags) {
            const hashtagResults = await Promise.all(hashtags.map((hashtag) => {
                return hashtag_1.default.findOrCreate({
                    where: { tag: hashtag.slice(1).toLowerCase() },
                });
            })); // 결과물 ex) hashtagResult = [[hashtag1, true],[hashtag2, false]]
            await tweet.addHashtags(hashtagResults.map((result) => result[0]));
            // 기존에 있는 해시태그면 카운트 증가
            hashtagResults.forEach(async (result) => {
                const hashtag = result[0];
                const newlyCreated = result[1];
                if (!newlyCreated) {
                    hashtag.count++;
                    await hashtag.save();
                }
            });
        }
        // 이미지 파일이 있는 경우
        if (req.files.length > 0 && Array.isArray(req.files)) {
            req.files.forEach(async (file) => {
                let src;
                if (process.env.NODE_ENV === "production") {
                    const newFile = file;
                    src = newFile.location; // S3용
                }
                else {
                    src = `${constValue_1.BACKEND_URL}/images/${file.filename}`; // 로컬용
                }
                await image_1.default.create({
                    src,
                    tweetId: tweet.id,
                });
            });
            await tweet.update({ hasMedia: true });
        }
        const tweetWithOthers = await utils_1.getTweetWithFullAttributes(tweet.id);
        // 관리자에게 메일 보내기
        transporter.verify((error) => {
            if (error) {
                console.error(error);
            }
            else {
                console.log("메일 전송 완료");
            }
        });
        transporter.sendMail({
            from: '"My Twitter 관리자" <sosilion@naver.com>',
            to: '"My Twitter 관리자" <sosilion@naver.com>',
            subject: "My Twitter에 트윗 추가됨",
            html: `
        <div>
          <a href="${constValue_1.FRONTEND_URL}/tweets/${tweet.id}">트윗이 추가 되었습니다.</a>
          <p>트윗 내용: ${req.body.contents}</p>
        </div>
        `,
        });
        // 방금 추가된 트윗의 경우 원본 이미지 파일을 쓰기 위해 newlyAdded 속성을 추가
        const newTweet = tweetWithOthers.toJSON();
        newTweet.newlyAdded = true;
        res.status(201).json(newTweet);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  트윗들 반환 */
router.get("/", async (req, res, next) => {
    const lastId = parseInt(req.query.lastId);
    const limit = parseInt(req.query.limit);
    const where = { commentedOriginId: null };
    if (lastId) {
        where.id = { [sequelize_1.Op.lt]: lastId };
    }
    try {
        const tweetsWithOthers = await utils_1.getTweetsWithFullAttributes(where, limit);
        res.status(200).json(tweetsWithOthers);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  트윗 좋아요 표시 */
router.post("/:tweetId/like", authMiddleware_1.isLoggedIn, async (req, res, next) => {
    const { tweetId } = req.params;
    try {
        const tweet = await tweet_1.default.findOne({ where: { id: tweetId } });
        if (!tweet) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        await tweet.addLiker(req.user.id);
        res.status(201).end();
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  트윗 좋아요 삭제 */
router.delete("/:tweetId/like", authMiddleware_1.isLoggedIn, async (req, res, next) => {
    const { tweetId } = req.params;
    try {
        const tweet = await tweet_1.default.findOne({ where: { id: tweetId } });
        if (!tweet) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        await tweet.removeLiker(req.user.id);
        res.end();
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  트윗 & 다른 트윗을 인용한 트윗 & 리트윗된 원본 트윗 & 댓글 트윗 삭제 */
router.delete("/:tweetId", authMiddleware_1.isLoggedIn, async (req, res, next) => {
    const tweetId = parseInt(req.params.tweetId);
    try {
        const tweet = await tweet_1.default.findOne({ where: { id: tweetId } });
        if (!tweet) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        let deletedTweetIds = [tweetId];
        // 리트윗된 원본 트윗을 삭제하는 경우
        const retweets = await tweet_1.default.findAll({
            where: { retweetOriginId: tweetId },
        });
        if (retweets) {
            // 해당 트윗을 리트윗하는 트윗들도 삭제한다.
            await tweet.setChoosers([]);
            retweets.forEach(async (retweet) => {
                deletedTweetIds.push(retweet.id);
                await retweet.destroy();
            });
        }
        // 다른 트윗을 인용한 트윗인 경우
        if (tweet.quotedOriginId) {
            const quotedOrigin = await tweet_1.default.findOne({
                where: { id: tweet.quotedOriginId },
                paranoid: false,
            });
            // - junction table(userquotedtweets)에서 삭제
            await quotedOrigin.removeWriter(req.user.id);
            // 인용된 트윗의 리트윗 카운트 -1
            await quotedOrigin.decrement("retweetedCount");
        }
        //// 해당 트윗이 해시태그를 가지고 있을 경우
        const hashtags = await tweet.getHashtags();
        if (hashtags) {
            hashtags.forEach(async (hashtag) => {
                // tweetHashtags 테이블에서 삭제
                await hashtag.removeHashtagTweet(tweet.id);
                // 마지막 해시태그면 삭제
                if (hashtag.count === 1) {
                    await hashtag.destroy();
                }
                else {
                    // 아닐 경우 카운트 감소
                    hashtag.count--;
                    await hashtag.save();
                }
            });
        }
        // 트윗 삭제
        await tweet_1.default.destroy({ where: { id: tweetId } });
        res.json(deletedTweetIds);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  리트윗 */
router.post("/:tweetId/retweet", authMiddleware_1.isLoggedIn, async (req, res, next) => {
    const retweetOriginId = parseInt(req.params.tweetId);
    try {
        const retweetOrigin = await tweet_1.default.findOne({
            where: { id: retweetOriginId },
        });
        if (!retweetOrigin) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        // 트윗 생성
        const newTweet = await tweet_1.default.create({
            contents: "",
            userId: req.user.id,
            retweetOriginId,
        });
        // junction table(userretweets)에 추가
        await retweetOrigin.addChooser(req.user.id);
        // 리트윗 원본의 리트윗 카운트 1증가
        await retweetOrigin.increment("retweetedCount");
        const tweetWithOthers = await utils_1.getTweetWithFullAttributes(newTweet.id);
        res.status(201).json(tweetWithOthers);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  리트윗 취소 */
router.delete("/:tweetId/retweet", authMiddleware_1.isLoggedIn, async (req, res, next) => {
    const retweetOriginId = parseInt(req.params.tweetId);
    try {
        const retweetOrigin = await tweet_1.default.findOne({
            where: { id: retweetOriginId },
        });
        const tweetToDelete = await tweet_1.default.findOne({
            where: {
                retweetOriginId,
                userId: req.user.id,
            },
        });
        if (!retweetOrigin || !tweetToDelete) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        const deletedTweetId = tweetToDelete.id;
        // 리트윗한 트윗 삭제
        await tweetToDelete.destroy();
        // junction table(userretweets)에서 제거
        await retweetOrigin.removeChooser(req.user.id);
        // 리트윗 원본의 리트윗 카운트 1감소
        await retweetOrigin.decrement("retweetedCount");
        res.json({ deletedTweetId });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  트윗 인용하기 */
router.post("/:tweetId/quotation", authMiddleware_1.isLoggedIn, multer_1.default.array("images", 5), async (req, res, next) => {
    const quotedOriginId = parseInt(req.params.tweetId);
    try {
        const quotedOrigin = await tweet_1.default.findOne({
            where: { id: quotedOriginId },
        });
        if (!quotedOrigin) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        // 트윗 생성
        const tweet = await tweet_1.default.create({
            contents: req.body.contents,
            userId: req.user.id,
            quotedOriginId,
        });
        const hashtags = req.body.contents.match(/#[^\s#]+/g);
        // 해쉬태그가 있는 경우
        if (hashtags) {
            const hashtagResults = await Promise.all(hashtags.map((hashtag) => {
                return hashtag_1.default.findOrCreate({
                    where: { tag: hashtag.slice(1).toLowerCase() },
                });
            }));
            await tweet.addHashtags(hashtagResults.map((result) => result[0]));
            // 기존에 있는 해시태그면 카운트 증가
            hashtagResults.forEach(async (result) => {
                const hashtag = result[0];
                const newlyCreated = result[1];
                if (!newlyCreated) {
                    hashtag.count++;
                    await hashtag.save();
                }
            });
        }
        // 이미지 파일이 있는 경우
        if (req.files.length > 0 && Array.isArray(req.files)) {
            req.files.forEach(async (file) => {
                let src;
                if (process.env.NODE_ENV === "production") {
                    const newFile = file;
                    src = newFile.location; // S3용
                }
                else {
                    src = `${constValue_1.BACKEND_URL}/images/${file.filename}`; // 로컬용
                }
                await image_1.default.create({
                    src,
                    tweetId: tweet.id,
                });
            });
            await tweet.update({ hasMedia: true });
        }
        // junction table(userquotedtweets)에 추가
        await quotedOrigin.addWriter(req.user.id);
        // 리트윗 원본의 리트윗 카운트 1증가
        await quotedOrigin.increment("retweetedCount");
        const tweetWithOthers = await utils_1.getTweetWithFullAttributes(tweet.id);
        // 방금 추가된 트윗의 경우 원본 이미지 파일을 쓰기 위해 newlyAdded 속성을 추가
        const newTweet = tweetWithOthers.toJSON();
        newTweet.newlyAdded = true;
        res.status(201).json(newTweet);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  트윗 댓글 추가 */
router.post("/:tweetId/comment", authMiddleware_1.isLoggedIn, multer_1.default.array("images", 5), async (req, res, next) => {
    const commentedOriginId = parseInt(req.params.tweetId);
    try {
        const commentedOrigin = await tweet_1.default.findOne({
            where: { id: commentedOriginId },
        });
        if (!commentedOrigin) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        // 트윗 생성
        const tweet = await tweet_1.default.create({
            contents: req.body.contents,
            userId: req.user.id,
            commentedOriginId,
        });
        const hashtags = req.body.contents.match(/#[^\s#]+/g);
        // 해쉬태그가 있는 경우
        if (hashtags) {
            const hashtagResults = await Promise.all(hashtags.map((hashtag) => {
                return hashtag_1.default.findOrCreate({
                    where: { tag: hashtag.slice(1).toLowerCase() },
                });
            }));
            await tweet.addHashtags(hashtagResults.map((result) => result[0]));
            // 기존에 있는 해시태그면 카운트 증가
            hashtagResults.forEach(async (result) => {
                const hashtag = result[0];
                const newlyCreated = result[1];
                if (!newlyCreated) {
                    hashtag.count++;
                    await hashtag.save();
                }
            });
        }
        // 이미지 파일이 있는 경우
        if (req.files.length > 0 && Array.isArray(req.files)) {
            req.files.forEach(async (file) => {
                let src;
                if (process.env.NODE_ENV === "production") {
                    const newFile = file;
                    src = newFile.location; // S3용
                }
                else {
                    src = `${constValue_1.BACKEND_URL}/images/${file.filename}`; // 로컬용
                }
                await image_1.default.create({
                    src,
                    tweetId: tweet.id,
                });
            });
            await tweet.update({ hasMedia: true });
        }
        const tweetWithOthers = await utils_1.getTweetWithFullAttributes(tweet.id);
        // 방금 추가된 트윗의 경우 원본 이미지 파일을 쓰기 위해 newlyAdded 속성을 추가
        const newTweet = tweetWithOthers.toJSON();
        newTweet.newlyAdded = true;
        res.status(201).json(newTweet);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 트윗 정보 반환 */
router.get("/:tweetId", async (req, res, next) => {
    const tweetId = parseInt(req.params.tweetId);
    try {
        const tweet = await tweet_1.default.findOne({
            where: { id: tweetId },
        });
        if (!tweet) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        const tweetsWithOthers = await utils_1.getTweetStatus(tweetId);
        res.status(200).json(tweetsWithOthers);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 트윗을 인용한 트윗들 반환 */
router.get("/:tweetId/quotation", async (req, res, next) => {
    const tweetId = parseInt(req.params.tweetId);
    try {
        const targetTweet = await tweet_1.default.findOne({ where: { id: tweetId } });
        if (!targetTweet) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        const tweets = await utils_1.getQuotationsWithFullAttributes(tweetId);
        res.json(tweets);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 트윗의 댓글 트윗들 반환 */
router.get("/:tweetId/comment", async (req, res, next) => {
    const tweetId = parseInt(req.params.tweetId);
    try {
        const targetTweet = await tweet_1.default.findOne({ where: { id: tweetId } });
        if (!targetTweet) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        const tweets = await utils_1.getCommentsWithFullAttributes(tweetId);
        res.json(tweets);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.default = router;
