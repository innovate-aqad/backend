import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  updateUserSchema,
  loginSchema,
  otpSchema,
} from "../../helpers/validateUser.js";
import bcrypt from "bcrypt";
import UserServicesObj from "../../services/user/UserServices.js";
import jwt from "jsonwebtoken";
import { environmentVars } from "../../config/environmentVar.js";
import UserModel from "../../models/UserModel.js";
import { storeImageMetadata, uploadImageToS3 } from "../../helpers/s3.js";
import UploadsDocumentModel from "../../models/UploadsDocumentModel.js";
import docClient from "../../config/dbConfig.js";
// import axios from "axios";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

class UserController {
  async register(req, res) {
    try {
      // Commented out captcha verification for future purpose
      // const capchaSecret = process.env.GOOGLE_SECRET_KEY;
      // const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${capchaSecret}&response=${req.body?.captchaValue}`);
      // if (!response?.data?.success) {
      //   return res.status(400).json({ message: "Invalid captcha", success: false, statusCode: 400 });
      // }

      let { error } = registerSchema.validate(req?.body, options);

      if (error) {
        if (error?.details[0]?.message?.includes("Phone")) {
          return res.status(400).json({
            message: "Invalid phone number",
            success: false,
            statusCode: 400,
          });
        } else {
          return res.status(400).json({
            message: error.details[0]?.message,
            success: false,
            statusCode: 400,
          });
        }
      }
      // Check if 'name' field exists and is not empty or only whitespace
      if (!req.body.name || req.body.name.trim() === "") {
        return res.status(400).json({
          message: "Name is required",
          success: false,
          statusCode: 400,
        });
      }
      await UserServicesObj.createUser(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async login(req, res) {
    try {
      let { error } = loginSchema.validate(req?.body, options);

      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }
      UserServicesObj.loginUser(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async forgotPassword(req, res) {
    try {
      let { error } = forgotPasswordSchema.validate(req?.body, options);

      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }
      UserServicesObj.sendForgotPasswordEmail(req, res);
    } catch (err) {
      // console.log(err, "error user contrl");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async verify_otp(req, res) {
    try {
      let { error } = otpSchema.validate(req?.body, options);
      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }

      UserServicesObj.verify_otp_data(req, res);
    } catch (err) {
      // console.log(err, "Eeee reset password");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async resetPassword(req, res) {
    try {
      let { error } = resetPasswordSchema.validate(req?.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }

      UserServicesObj.resetUserPassword(req, res);
    } catch (err) {
      // console.log(err, "Eeee reset password");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async FetchUsers(req, res) {
    // console.log(req.cookies._token);
  }

  async getAllUser(req, res) {
    try {
      UserServicesObj.getAllUSerData(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
  async check_user_logged_in(req, res) {
    try {
      let _secrate = req?.cookies?._token;
      let proof = {};
      if (_secrate) {
        proof = jwt.verify(_secrate, process.env.JWT_SECRET, {
          algorithm: "HS512",
        });
      }
      let userData = {};
      if (proof && proof?.id) {
        userData = await UserModel.findOne({
          where: { id: proof.id },
          raw: true,
        });
      }
      // console.log(userData);
      if (proof && proof?.id) {
        return res.status(200).json({
          message: "User logged in",
          success: true,
          statusCode: 200,
          data: userData,
        });
      } else {
        return res.status(400).json({
          message: "User logged out",
          success: false,
          statusCode: 400,
        });
      }
    } catch (err) {
      console.log(err, "EEEEEEEEEE");
      return res.status(500).json({
        message: err?.message,
        success: false,
        statusCode: 500,
      });
    }
  }
  async user_logout(req, res) {
    try {
      return (
        res
          .clearCookie("_token")
          // .clearCookie()

          .status(200)
          .json({ success: true, message: "Logout successful" })
      );
    } catch (err) {
      return res
        .status(500)
        .json({ mesaage: err?.message, success: false, statusCode: 500 });
    }
  }

  async logoutUser(req, res) {}

  async updateUserInfo(req, res) {
    try {
      const { error } = updateUserSchema.validate(req.body, options);

      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
      let data = {};
      data.name = req.body?.name || req.userData.name;
      data.phone = req.body?.phone || req.userData.phone;

      if (req.body.password) {
        let hashPassword = await bcrypt.hash(
          `${req.body.password}`,
          `${environmentVars?.salt}`
        );
        data.password = hashPassword;
      }
      UserServicesObj.updateUserDetails(req.userData.id, data, res);
    } catch (err) {
      return res.status(500).json({ success: false, message: err?.message });
    }
  }

  async add(req, res) {
    try {
      if (!req.body.id) {
        let { error } = addEducationInfochema.validate(req?.body, options);
        if (error) {
          return res
            .status(400)
            .json({ message: error.details[0]?.message, success: false });
        }
      }
      if (req.file && req.file?.filename) {
        let name = req.file?.filename;
        let size = req.files?.size;
        let data = "educationInfo";
        let get = await ImageFileCheck(name, data, size);
        if (get == "invalid file") {
          return res.status(400).json({
            message:
              "Id card image must be png or jpeg or webp file and size must be less than 500 kb",
            statusCode: 400,
            success: false,
          });
        }
      }
      EducationServiceObj.addData(req, res);
    } catch (err) {
      console.log(err, "Error ");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  // my code line locally store image
  async userUploadImage(req, res) {
    try {
      if (!req.body.id) {
        let { error } = addEducationInfochema.validate(req?.body, options);
        if (error) {
          return res
            .status(400)
            .json({ message: error.details[0]?.message, success: false });
        }
      }
      if (req.file && req.file?.filename) {
        let name = req.file?.filename;
        let size = req.files?.size;
        let data = "educationInfo";
        let get = await ImageFileCheck(name, data, size);
        if (get == "invalid file") {
          return res.status(400).json({
            message:
              "Id card image must be png or jpeg or webp file and size must be less than 500 kb",
            statusCode: 400,
            success: false,
          });
        }
      }
      EducationServiceObj.addData(req, res);
    } catch (err) {
      console.log(err, "Error ");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  // s3 bucket file upload start

  async uploadImageS3Bucket(req, res) {
    try {
      const fileName = req.file.originalname;
      const filePath = req.file.path;

      const imageUrl = await uploadImageToS3(fileName, filePath);
      // await storeImageMetadata(fileName, imageUrl);

      res.status(200).json({
        message: "File uploaded successfully",
        image: imageUrl,
        status: 201,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error uploading file",
        error: err.message,
        status: 404,
      });
    }
  }

  // email send

  async sendEmailUserToAnother(req, res) {
    try {
      let { error } = forgotPasswordSchema.validate(req?.body, options);

      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }
      UserServicesObj.sendEmailUserToAnother(req, res);
    } catch (err) {
      // console.log(err, "error user contrl");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  // Customer API

  async customerAddNew(req, res) {
    console.log(req, "res==============>");
    try {
      let { error } = registerSchema.validate(req?.body, options);

      if (error) {
        if (error?.details[0]?.message?.includes("Phone")) {
          return res.status(400).json({
            message: "Invalid phone number",
            success: false,
            statusCode: 400,
          });
        } else {
          return res.status(400).json({
            message: error.details[0]?.message,
            success: false,
            statusCode: 400,
          });
        }
      }
      // Check if 'name' field exists and is not empty or only whitespace
      if (!req.body.name || req.body.name.trim() === "") {
        return res.status(400).json({
          message: "Name is required",
          success: false,
          statusCode: 400,
        });
      }
      await UserServicesObj.createUser(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async getUserAccountInfo(req, res) {
    UserServicesObj.getUserAccountInfo(req, res);
  }

  // uploaded document api
  async uploadsDocument(req, res) {
    try {
      const fileName = req.file.originalname;
      const filePath = req.file.path;
      const typeOfUser = req.body.typeOfUser;
      const typeOfDocument = req.body.typeOfDocument;
      const nameOfDocument = req.body.nameOfDocument;
      const id = req.body.id;

      const imageUrl = await uploadImageToS3(fileName, filePath);
      // await storeImageMetadata(fileName, imageUrl);

      const params = {
        TableName: "documents",
        Item: {
        id: parseInt(id),
        typeOfUser: typeOfUser,
        typeOfDocument: typeOfDocument,
        nameOfDocument: nameOfDocument,
        choose_documents: imageUrl,
        },
      };

      console.log(params, "paramsparams");

      docClient.put(params, (err, data) => {
        if (err) {
          console.error("Error inserting item:", err);
        } else {
          console.log("Successfully inserted item:", data);
        }
      });

      console.log("llllllllllllllllllll====>");
      // UploadsDocumentModel
      const documentsData = await UploadsDocumentModel.create(params, {
        raw: true,
      });
      // console.log(documentsData, "success");
      res.json({
        message: "documents uploaded successfully",
        data: documentsData,
        status: 200,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error uploading documents",
        error: err.message,
        status: 404,
      });
    }
  }
}

const UserControllerObj = new UserController();
export default UserControllerObj;
