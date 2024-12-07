const multer = require("multer");
const DIRimg = "./uploads/images";
const path = require("path");

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIRimg);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const uploadImages = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
});


module.exports = uploadImages