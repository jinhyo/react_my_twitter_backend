const multer = require("multer");
const path = require("path");

/*  multer 세팅 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);

    cb(null, basename + "_" + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1204 * 1204 }
});

module.exports = { upload };
