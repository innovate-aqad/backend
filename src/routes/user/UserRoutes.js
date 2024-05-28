import express from "express";
import UserControllerObj from "../../controllers/user/UserController.js";
import { authorize } from "../../middlewares/auth.js";
import { educationImage, userImage } from "../../helpers/multer.js";
import { upload } from "../../helpers/s3.js";

const UserRoutes = express.Router();

UserRoutes.post(
  "/register",
  upload.fields([
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
    },
    {
      name: "driver_images",
      maxCount: 5,
    },
    {
      name: "driving_license",
      maxCount: 5,
    },
    {
      name: "emirate_id_pic",
      maxCount: 1,
    },
  ]),
  UserControllerObj.register
);

//create
UserRoutes.post("/super_admn", UserControllerObj.super_admin);

UserRoutes.get("/get_by_email", UserControllerObj.getByEmail);
UserRoutes.get("/send_otp_to_email", UserControllerObj.sendOtpOnEmailData);
UserRoutes.get("/verfy_otp_with_email", UserControllerObj.verifyEmailWithOtp);

UserRoutes.post("/login", UserControllerObj.login);
UserRoutes.post("/login_with_otp", UserControllerObj.login_with_otp);
<<<<<<< HEAD
UserRoutes.get("/get_data", authorize, UserControllerObj.get_data); //logged in data
UserRoutes.post("/add_sub_user", authorize, UserControllerObj.add_sub_user); //vendor , seller, logistic ->sub_user
UserRoutes.get("/get_sub_user", authorize, UserControllerObj.get_sub_user);
UserRoutes.delete(
  "/delete_sub_user",
  authorize,
  UserControllerObj.delete_sub_user
);
=======
UserRoutes.get("/get_data", authorize ,UserControllerObj.get_data);//logged in data
UserRoutes.post("/add_sub_user", authorize ,UserControllerObj.add_sub_user);//vendor , seller, logistic ->sub_user
UserRoutes.get("/get_sub_user", authorize ,UserControllerObj.get_sub_user);
UserRoutes.delete("/delete_sub_user", authorize ,UserControllerObj.delete_sub_user);
UserRoutes.put("/role_id_to_aqad_employee ", authorize ,UserControllerObj.add_sub_user);//assign role_id to aqad_employee 
>>>>>>> 850365ea9d2ea3900a6702fb21d612553c8e1854

//get all vendor or logistic or seller fetch with its sub_user
// UserRoutes.get("/fetch_all_user",authorize,UserControllerObj)

<<<<<<< HEAD
=======






>>>>>>> 850365ea9d2ea3900a6702fb21d612553c8e1854
UserRoutes.put("/forgot_password", UserControllerObj.forgotPassword);
UserRoutes.put("/verify_otp", UserControllerObj.verify_otp);

UserRoutes.get("/check_user_logged_in", UserControllerObj.check_user_logged_in);
UserRoutes.get("/user_logout", UserControllerObj.user_logout);

UserRoutes.put("/reset_password", UserControllerObj.resetPassword);
// UserRoutes.get("/fetch_users", UserControllerObj.FetchUsers);
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
UserRoutes.post(
  "/uploads_document",
  upload.single("image"),
  UserControllerObj.uploadsDocument
);
// vendor on boarding api
UserRoutes.post("/vendor_on_board", UserControllerObj.vendorOnBoarding);

export default UserRoutes;
// userImage
