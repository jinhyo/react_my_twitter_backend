"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
const passport_1 = __importDefault(require("passport"));
const local_1 = __importDefault(require("./local"));
const google_1 = __importDefault(require("./google"));
const facebook_1 = __importDefault(require("./facebook"));
exports.default = () => {
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await user_1.default.findOne({ where: { id } });
            done(null, user.toJSON()); // req.user에 넣어줌
        }
        catch (error) {
            console.error(error);
            done(error);
        }
    });
    local_1.default(passport_1.default);
    google_1.default(passport_1.default);
    facebook_1.default(passport_1.default);
};
