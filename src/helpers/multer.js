import multer from "multer";

const storageForBeautifulEyewearCollection = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/ui");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const storageForGender = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(file,"@222222weqwe");
    cb(null, "./src/uploads/filterProduct/gender");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadForGender = multer({
  storage: storageForGender,
});

const storageForCategory = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(file,"@222222weqwe");
    cb(null, "./src/uploads/filterProduct/category");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadForCategry = multer({
  storage: storageForCategory,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(file,"@222222weqwe");
    cb(null, "./src/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({
  storage: storage,
});

const storageOfBestSeller = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(file,"@222222weqwe");
    cb(null, "./src/uploads/bestSeller");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadOfBestSeller = multer({
  storage: storageOfBestSeller,
});

const storageOfFilterProductCategory = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(file,"@222222weqwe");
    cb(null, "./src/uploads/category");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadOfFilterProductCategory = multer({
  storage: storageOfFilterProductCategory,
});

export const uploadOfBeautifulCollection = multer({
  storage: storageForBeautifulEyewearCollection,
});



const educationCertificatestorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/educationCertificate/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const educationImage = multer({
  storage: educationCertificatestorage,
});




//  my code Line


const userFileUploadStore = multer.diskStorage({

  destination: function (req, file, cb) {
    console.log(file,"user imag===>");
    cb(null, "src/uploads/userFileUpload/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const userImage = multer({
  storage: userFileUploadStore,
});