"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const constValue_1 = require("../lib/constValue");
dotenv_1.default.config();
exports.default = (passport) => {
    passport.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: `${constValue_1.BACKEND_URL}/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const exUser = await user_1.default.findOne({
                where: { snsId: profile.id, loginType: "google" },
            });
            if (exUser) {
                done(undefined, exUser.toJSON());
            }
            else {
                // 구글 로그인용 닉네임 생성
                let nickname = "g" + "_" + profile.displayName;
                // 같은 닉네임이 있을 경우 변경
                const exNick = await user_1.default.findOne({
                    where: { nickname },
                });
                if (exNick) {
                    nickname = await bcrypt_1.default.hash(exNick.nickname, 10);
                    nickname = nickname.slice(0, 20);
                }
                const newUser = await user_1.default.create({
                    email: profile.emails[0].value,
                    snsId: profile.id,
                    password: "google",
                    nickname,
                    loginType: "google",
                    avatarURL: profile.photos[0].value,
                });
                done(undefined, newUser.toJSON());
            }
        }
        catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
