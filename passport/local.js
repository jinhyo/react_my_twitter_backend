"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_local_1 = require("passport-local");
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.default = (passport) => {
    passport.use(new passport_local_1.Strategy({ usernameField: "email", passwordField: "password" }, async (email, password, done) => {
        try {
            const loginUser = await user_1.default.findOne({
                where: { email, loginType: "local" },
            });
            if (loginUser) {
                const passwordResult = await bcrypt_1.default.compare(password, loginUser.password); // true or false 반환
                if (passwordResult) {
                    done(null, loginUser.toJSON());
                }
                else {
                    done(null, false, { message: "비밀번호가 일치하지 않습니다." });
                }
            }
            else {
                done(null, false, { message: "가입되지 않은 이메일 입니다." });
            }
        }
        catch (error) {
            // 서버 에러 판별
            console.error(error);
            done(error); // done의 첫 번쨰 인자는 서버에러 데이터
        }
    }));
};
