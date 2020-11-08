"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tweet_1 = __importDefault(require("../models/tweet"));
const user_1 = __importDefault(require("../models/user"));
const multer_1 = __importDefault(require("../lib/multer"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const utils_1 = require("../lib/utils");
const constValue_1 = require("../lib/constValue");
const router = express_1.default.Router();
/*  팔로우 */
router.post("/:userId/follow", authMiddleware_1.isLoggedIn, async (req, res, next) => {
    const { userId } = req.params;
    try {
        const targetUser = await user_1.default.findOne({ where: { id: userId } });
        if (!targetUser) {
            return res.status(404).send("해당 유저가 존재하지 않습니다.");
        }
        await targetUser.addFollower(req.user.id);
        res.status(201).end();
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  언팔로우 */
router.delete("/:userId/follow", authMiddleware_1.isLoggedIn, async (req, res, next) => {
    const { userId } = req.params;
    try {
        const targetUser = await user_1.default.findOne({ where: { id: userId } });
        if (!targetUser) {
            return res.status(404).send("해당 유저가 존재하지 않습니다.");
        }
        await targetUser.removeFollower(req.user.id);
        res.end();
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 트윗을 리트윗한 유저들 반환 */
router.get("/retweet/:tweetId", async (req, res, next) => {
    const tweetId = parseInt(req.params.tweetId);
    console.log("tweetId", tweetId);
    try {
        const targetTweet = await tweet_1.default.findOne({ where: { id: tweetId } });
        if (!targetTweet) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        const users = await targetTweet.getChoosers({
            attributes: ["id", "nickname", "selfIntro", "avatarURL", "location"],
            joinTableAttributes: [],
        });
        res.json(users);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 트윗을 좋아요 누른 유저들 반환 */
router.get("/like/:tweetId", async (req, res, next) => {
    const tweetId = parseInt(req.params.tweetId);
    try {
        const targetTweet = await tweet_1.default.findOne({ where: { id: tweetId } });
        if (!targetTweet) {
            return res.status(404).send("해당 트윗이 존재하지 않습니다.");
        }
        const users = await targetTweet.getLikers({
            attributes: ["id", "nickname", "selfIntro", "avatarURL", "location"],
            joinTableAttributes: [],
        });
        res.json(users);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 유저 정보 반환 */
router.get("/:nickname", async (req, res, next) => {
    const nickname = decodeURIComponent(req.params.nickname);
    try {
        const user = await utils_1.getUserWithFullAttributesByNickname(nickname);
        if (!user) {
            return res.status(404).send("해당 유저가 존재하지 않습니다.");
        }
        res.json(user);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 유저의 팔로잉들 반환 */
router.get("/:userId/followings", async (req, res, next) => {
    const userId = parseInt(req.params.userId);
    try {
        const user = await user_1.default.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).send("해당 유저가 존재하지 않습니다.");
        }
        const followings = await user.getFollowings({
            attributes: ["id", "nickname", "selfIntro", "avatarURL", "location"],
            joinTableAttributes: [],
        });
        res.json(followings);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 유저의 팔로워들 반환 */
router.get("/:userId/followers", async (req, res, next) => {
    const userId = parseInt(req.params.userId);
    try {
        const user = await user_1.default.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).send("해당 유저가 존재하지 않습니다.");
        }
        const followers = await user.getFollowers({
            attributes: ["id", "nickname", "selfIntro", "avatarURL", "location"],
            joinTableAttributes: [],
        });
        res.json(followers);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 유저의 트윗들 반환 (댓글 제외) */
router.get("/:userId/tweets", async (req, res, next) => {
    const userId = parseInt(req.params.userId);
    try {
        const tweets = await utils_1.getSpecificUsersTweets(userId);
        res.json(tweets);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 유저의 댓글 트윗들 반환 */
router.get("/:userId/comments", async (req, res, next) => {
    const userId = parseInt(req.params.userId);
    try {
        const comments = await utils_1.getSpecificUsersComments(userId);
        res.json(comments);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 유저의 미디어 트윗들 반환 */
router.get("/:userId/medias", async (req, res, next) => {
    const userId = parseInt(req.params.userId);
    try {
        const mediaTweets = await utils_1.getSpecificUsersMedias(userId);
        res.json(mediaTweets);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 유저가 좋아요 누른 트윗들 반환 */
router.get("/:userId/favorites", async (req, res, next) => {
    const userId = parseInt(req.params.userId);
    try {
        const tweets = await utils_1.getSpecificUsersFavorits(userId);
        res.json(tweets);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/* 프로필 수정 */
router.patch("/profile", authMiddleware_1.isLoggedIn, async (req, res, next) => {
    const { nickname, selfIntro, location } = req.body;
    try {
        // 중복 닉네임 방지
        const currentUser = await user_1.default.findByPk(req.user.id);
        const isSameNickname = await user_1.default.findOne({ where: { nickname } });
        if (isSameNickname && req.user.nickname !== currentUser.nickname) {
            return res.status(403).send("이미 사용중인 닉네임 입니다.");
        }
        await user_1.default.update({ nickname, selfIntro, location }, { where: { id: req.user.id } });
        res.end();
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/* 아바타 사진 변경 */
router.patch("/avatar", authMiddleware_1.isLoggedIn, multer_1.default.single("image"), async (req, res, next) => {
    const imageFile = { ...req.file, location: "" };
    if (!imageFile) {
        return res.status(404).send("이미지 파일이 없습니다.");
    }
    let avatarURL;
    if (process.env.NODE_ENV === "production") {
        avatarURL = imageFile.location; // S3용
    }
    else {
        avatarURL = `${constValue_1.BACKEND_URL}/images/${imageFile.filename}`; // 로컬용
    }
    try {
        await user_1.default.update({
            avatarURL,
        }, { where: { id: req.user.id } });
        res.json({ avatarURL });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.default = router;
