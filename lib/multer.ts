import multer from "multer";
import path from "path";
import multerS3 from "multer-s3";
import AWS from "aws-sdk";

/* AWS 세팅 */
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});

/*  multer 세팅 */
let storage;
if (process.env.NODE_ENV === "production") {
  storage = multerS3({
    s3: new AWS.S3(),
    bucket: "jtwitter-images",
    key(req, file, cb) {
      cb(
        null,
        `images/${Date.now()}_${path
          .basename(file.originalname)
          .trim()
          .replace(" ", "_")}`
      );
    },
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
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1204 * 1204 },
});

export default upload;
