import multer from "multer";

const uistorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/ui/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploaduiimage = multer({
  storage: uistorage,
});
