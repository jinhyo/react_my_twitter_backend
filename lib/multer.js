"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
/* AWS 세팅 */
aws_sdk_1.default.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: "ap-northeast-2",
});
/*  multer 세팅 */
let storage;
if (process.env.NODE_ENV === "production") {
    storage = multer_s3_1.default({
        s3: new aws_sdk_1.default.S3(),
        bucket: "jtwitter-images",
        key(req, file, cb) {
            cb(null, `images/${Date.now()}_${path_1.default
                .basename(file.originalname)
                .trim()
                .replace(" ", "_")}`);
        },
    });
}
else {
    storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "images");
        },
        filename: (req, file, cb) => {
            const ext = path_1.default.extname(file.originalname);
            const basename = path_1.default.basename(file.originalname, ext);
            cb(null, basename + "_" + Date.now() + ext);
        },
    });
}
const upload = multer_1.default({
    storage,
    limits: { fileSize: 10 * 1204 * 1204 },
});
exports.default = upload;
