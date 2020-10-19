const multer = require("multer");
const path = require("path");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");

/* AWS 세팅 */
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2"
});

/*  multer 세팅 */
let storage;
if (process.env.NODE_ENV === "production") {
  storage = multerS3({
    s3: new AWS.S3(),
    bucket: "jtwitter-images",
    key(req, file, cb) {
      cb(null`original/${Date.now()}_${path.basename(file.originalname)}`);
    }
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images");
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);

      cb(null, basename + "_" + Date.now() + ext);
    }
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1204 * 1204 }
});

module.exports = { upload };
