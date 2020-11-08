"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const utils_1 = require("../lib/utils");
const hashtag_1 = __importDefault(require("../models/hashtag"));
const router = express_1.default.Router();
/*  가장 많이 사용된 해시태그 3개 전송 */
router.get("/trend", async (req, res, next) => {
    try {
        const hashtags = await hashtag_1.default.findAll({
            order: [["count", "DESC"]],
            attributes: ["id", "tag", "count"],
            limit: 3,
        });
        res.status(200).json(hashtags);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
/*  특정 해시태그를 가진 트윗들 전송 */
router.get("/tag/:tagName", async (req, res, next) => {
    const lastId = req.query.lastId;
    const tagName = req.params.tagName;
    let whereInTweet = {};
    if (lastId) {
        whereInTweet = { id: { [sequelize_1.Op.lt]: lastId } };
    }
    try {
        const tweetsWithOthers = await utils_1.getTweetsWithHashtag(whereInTweet, tagName);
        if (!tweetsWithOthers) {
            return res.status(404).send("해당 해시태그가 존재하지 않습니다.");
        }
        res.status(200).json(tweetsWithOthers);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.default = router;
