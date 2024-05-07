import express from "express";
import UserControllerObj from "../../controllers/user/UserController.js";
import { authorize } from "../../middlewares/auth.js";
import { educationImage, userImage } from "../../helpers/multer.js";
import { upload } from "../../helpers/s3.js";

const UserRoutes = express.Router();


UserRoutes.post("/register",  upload.fields([
  {
    name: "profile_photo",
    maxCount: 1,
  },
  {
    name: "passport",
    maxCount: 1,
  },
  {
    name: "trade_license",
    maxCount: 1,
  },
  {
    name: "cheque_scan",
    maxCount: 1,
  },
  {
    name: "vat_certificate",
    maxCount: 1,
  },
  {
    name: "residence_visa",
    maxCount: 1,
  }
]), UserControllerObj.register);





UserRoutes.post("/login", UserControllerObj.login);

UserRoutes.put("/forgot_password", UserControllerObj.forgotPassword);
UserRoutes.put("/verify_otp", UserControllerObj.verify_otp);

UserRoutes.get("/check_user_logged_in", UserControllerObj.check_user_logged_in);
UserRoutes.get("/user_logout", UserControllerObj.user_logout);

UserRoutes.put("/reset_password", UserControllerObj.resetPassword);
UserRoutes.get("/fetch_users", UserControllerObj.FetchUsers);
UserRoutes.get("/get_allusers", authorize, UserControllerObj.getAllUser);

UserRoutes.post(
  "/update_user_details",
  authorize,
  UserControllerObj.updateUserInfo
);
UserRoutes.get(
  "/get_user_account_info_data",
  authorize,
  UserControllerObj.getUserAccountInfo
);

UserRoutes.post(
  "/add",
  educationImage.single("id_card_img"),
  authorize,
  UserControllerObj.add
);



//  start code router ram
UserRoutes.post(
  "/user_file_uploads",
  userImage.single("user_image"),
  UserControllerObj.userUploadImage
);


// image upload se bucket 
UserRoutes.post(
  "/upload_image_s3_bucket",
  upload.single("image"),
  UserControllerObj.uploadImageS3Bucket
);

// User Send Email
UserRoutes.post("/send_email", UserControllerObj.sendEmailUserToAnother);

// Customer All API
UserRoutes.post("/customer_add", UserControllerObj.customerAddNew);

// Uploads documents start
UserRoutes.post("/uploads_document",upload.single("image"), UserControllerObj.uploadsDocument);
// vendor on boarding api 
UserRoutes.post("/vendor_on_board", UserControllerObj.vendorOnBoarding);



export default UserRoutes;

// userImage
