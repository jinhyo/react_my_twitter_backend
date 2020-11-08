"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const hashtag_1 = __importDefault(require("../models/hashtag"));
const sequelize_1 = require("sequelize");
const router = express_1.default.Router();
/* 검색 결과 반환 */
router.get("/:searchWord", async (req, res, next) => {
    const { searchWord } = req.params;
    // 검색 유형 파악(1.해시태그, 2.유저, 3.모두)
    const { type } = req.query;
    const result = { hashtags: [], users: [] };
    try {
        if (type === "hashtag") {
            // 해시태그 검색
            const hashtags = await hashtag_1.default.findAll({
                where: {
                    tag: { [sequelize_1.Op.substring]: searchWord },
                },
                attributes: ["tag"],
            });
            result.hashtags = hashtags;
        }
        else if (type === "user") {
            // 유저 검색
            const users = await user_1.default.findAll({
                where: {
                    nickname: { [sequelize_1.Op.substring]: searchWord },
                },
                attributes: ["id", "nickname", "avatarURL"],
            });
            result.users = users;
        }
        else {
            // 둘 다 검색
            const hashtags = await hashtag_1.default.findAll({
                where: {
                    tag: { [sequelize_1.Op.substring]: searchWord },
                },
                attributes: ["tag"],
            });
            result.hashtags = hashtags;
            const users = await user_1.default.findAll({
                where: {
                    nickname: { [sequelize_1.Op.substring]: searchWord },
                },
                attributes: ["id", "nickname", "avatarURL"],
            });
            result.users = users;
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.default = router;
