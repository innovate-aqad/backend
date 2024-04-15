import UserModel from "../../models/UserModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
// import CartModel from "../../models/CartModel.js";
// import WishlistModel from "../../models/WishlistModel.js";
// import CouponModel from "../../models/couponModel.js";
import {
  sendPasswordViaEmail,
  forgotPasswordEmail,
  encryptStringWithKey,
  sendEmailUser,
  sendEmailOTP,
} from "../../helpers/common.js";
import { Op, where } from "sequelize";
// import userOtpModel from "../../models/userOtpModel.js";
import { environmentVars } from "../../config/environmentVar.js";
import { generateAccessToken } from "../../helpers/validateUser.js";
import jwt from "jsonwebtoken";
import docClient from "../../config/dbConfig.js";
import Sequence from "../../models/SequenceModel.js";
import { v4 as uuidv4 } from "uuid";

import formidable from "formidable";
import userRegisterModel from "../../models/UserRegisterModel.js";
import vendorRegisterModel from "../../models/VendorRegisterModel.js";
import retailerRegisterModel from "../../models/RetailerRegisterModel.js";
import logisticPartnerRegisterModel from "../../models/LogisticPartnerModel.js";
import { log } from "console";
import { vendorSendEmail } from "../../helpers/awsCognitoServices.js";
import { sendEmailOtp, sendPhoneOTP } from "../../helpers/aswSesServices.js";

async function getNextSequenceValue(sequenceName) {
  let sequenceDoc = await Sequence.get({ sequenceName });
  if (!sequenceDoc) {
    // If sequence does not exist, create a new one
    sequenceDoc = new Sequence({
      sequenceName,
      value: 0,
    });
  }
  sequenceDoc.value++; // Increment the sequence value
  await sequenceDoc.save(); // Save the updated sequence value
  return sequenceDoc.value;
}

let salt = environmentVars.salt;

class UserServices {
  async createUser(req, res) {
    try {
      let email = req.body.email.trim();
      let phone = req.body.phone;
      let country = req.body.country;
      let salt = environmentVars.salt;
      let randomPassword = encryptStringWithKey(
        req.body.email.toLowerCase()?.slice(0, 6)
      );
      let hashPassword = await bcrypt.hash(`${randomPassword}`, `${salt}`);

      const id = await getNextSequenceValue("userSequence"); // Get serial-like ID

      // console.log("ASDFASDF",id)

      const params = {
        TableName: "users",
        Item: {
          id: String(id),
          // _id: uuidv4(),
          name: req.body.name?.trim(),
          role: req.body.role,
          email: email,
          phone: phone,
          country: country,
          password: hashPassword,
          is_verified: false,
          is_social_login: 0,
        },
      };
      let findEmailExist = await UserModel.scan()
        .where("email")
        .eq(email)
        .exec();
      let findPhoneExist = await UserModel.scan()
        .where("phone")
        .eq(phone)
        .exec();

      if (findPhoneExist.count > 0) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists!",
          statusCode: 400,
        });
      }
      if (findEmailExist.count > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exist!",
          statusCode: 400,
        });
      }
      docClient.put(params, (err, data) => {
        if (err) {
          console.error("Error inserting item:", err);
        } else {
          console.log("Successfully inserted item:", data);
        }
      });
      const userData = await UserModel.create(params, { raw: true });
      console.log("userData:", userData);
      if (userData) {
        await sendPasswordViaEmail(res, data);
      }
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async loginUser(req, res) {
    try {
      let { email, password } = req.body;
      let emailExistCheck = await UserModel.findOne({
        where: { email },
        raw: true,
      });
      if (!emailExistCheck) {
        return res.status(400).json({
          message: "Email not found",
          success: false,
          statusCode: 400,
        });
      }
      let checkpassword = await bcrypt.compare(
        password,
        emailExistCheck?.password
      );

      if (!checkpassword) {
        return res.status(400).json({
          message: "Password invalid",
          success: false,
          statusCode: 400,
        });
      }
      delete emailExistCheck?.password;
      // console.log(emailExistCheck, "emailExistCheck22222emailExistCheck");
      let token = generateAccessToken(emailExistCheck);
      let expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1); // Expires in 1 days
      // expiryDate.setTime(expiryDate.getTime() + (60 * 1000)); // Current time + 1 minute

      res
        .cookie("_token", token, {
          httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
          secure: true, // Requires HTTPS connection
          sameSite: "strict", // Restricts the cookie to be sent only in same-site requests
          expires: expiryDate, // Set the expiry date
        })
        .status(200)
        .json({
          success: true,
          message: "Logged in successful",
          statusCode: 200,
        });
      // console.log(emailExistCheck?.is_verified,"emailExistCheck?.is_verifiedemailExistCheck?.is_verified")
      if (emailExistCheck?.is_verified == 0) {
        await UserModel.update(
          { is_verified: true },
          { where: { id: emailExistCheck?.id } }
        );
      }
      return;
    } catch (err) {
      console.log(err, "Error in login api user");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async sendForgotPasswordEmail(req, res) {
    try {
      let email = req.body.email?.trim();
      let findEmailExist = await UserModel.findOne({
        where: { email },
        attributes: ["email", "id", "name"],
      });

      if (!findEmailExist) {
        return res.status(404).json({
          message: "Email not found",
          success: false,
          statusCode: 400,
        });
      } else {
        let getRandomNumber = Math.round(Math.random() * 10000);
        let obj = {
          user_id: findEmailExist?.id,
          otp_code: getRandomNumber,
          email: findEmailExist?.email,
          name: findEmailExist?.name,
          creation_time: Date.now(),
        };
        // console.log(obj,"EEEEEEEEEEEEEEEEEEEEEEEEEEEE")
        let getEmailCheck = await userOtpModel.findOne({
          where: { user_id: findEmailExist?.id },
          attributes: ["id"],
        });
        if (getEmailCheck && getEmailCheck?.id) {
          await userOtpModel.update(
            { otp_code: getRandomNumber, creation_time: Date.now() },
            { where: { user_id: findEmailExist?.id } }
          );
        } else {
          await userOtpModel.create(obj);
        }
        await forgotPasswordEmail(req, res, obj);
      }
    } catch (err) {
      // console.log(err);
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async verify_otp_data(req, res) {
    try {
      let { email, otp_code } = req.body;
      email = req.body.email?.trim();
      let emailExist = await UserModel.findOne({ where: { email }, raw: true });
      if (!emailExist) {
        res
          .status(400)
          .json({ message: "User not found", success: false, statusCode: 400 });
        return;
      }
      let fetchDoc = await userOtpModel.findOne({
        where: { user_id: emailExist?.id },
      });

      if (!fetchDoc) {
        return res.status(400).json({
          message: "Internal server error",
          success: false,
          statusCode: 400,
        });
      }
      let creation_time = fetchDoc?.creation_time;
      let current_time = Date.now();
      const differenceInMilliseconds = current_time - creation_time;
      const differenceInMinutes = Math.floor(
        differenceInMilliseconds / (1000 * 60)
      );
      if (differenceInMinutes > 5) {
        return res
          .status(400)
          .json({ message: "OTP expired", success: false, statusCode: 400 });
      }
      if (fetchDoc?.otp_code != otp_code) {
        return res
          .status(400)
          .json({ message: "Invalid OTP", success: false, statusCode: 400 });
      }
      return res.status(200).json({
        message: "Verify otp successfully",
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      // console.log(err, "Error ");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async resetUserPassword(req, res) {
    try {
      let password = req.body.password;
      let emailData = "";

      if (req.body.email) {
        let email = req.body?.email?.trim();
        emailData = email;
        let emailExist = await UserModel.findOne({
          where: { email: emailData },
          attributes: ["email", "id", "password"],
        });
        if (!emailExist) {
          return res.status(400).json({
            message: "User not found",
            success: false,
            statusCode: 400,
          });
        }
        let checkpassword = await bcrypt.compare(
          password,
          emailExist?.password
        );
        if (checkpassword) {
          return res.status(400).json({
            message: "Password must be unique, previous password not allowed",
            statusCode: 400,
            success: false,
          });
        }
      } else {
        let _secrate = req?.cookies?._token;
        const proof = jwt.verify(_secrate, process.env.JWT_SECRET, {
          algorithm: "HS512",
        });
        emailData = proof?.email;
      }
      // console.log(emailData,"emailDataemailDataemailDataemailData")

      let hashPassword = await bcrypt.hash(password, salt);
      await UserModel.update(
        { password: hashPassword },
        { where: { email: emailData } }
      );
      return res.status(200).json({
        message: "Password change successfully",
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      // console.log(err, "Error");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async getAllUSerData(req, res) {
    try {
      let fetchArray = await UserModel.findAll();
      res.status(200).json({
        message: "fetch user data",
        data: fetchArray,
        success: true,
        statusCode: 200,
      });
      return;
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async updateUserDetails(id, data, res) {
    try {
      UserModel.update(data, { where: { id: id } })
        .then((response) => {
          return res
            .status(201)
            .json({ success: true, message: "values updated" });
        })
        .catch((error) => {
          return res
            .status(500)
            .json({ success: false, message: error?.message });
        });
    } catch (err) {
      return res.status(500).json({ success: false, message: err?.message });
    }
  }

  // async getUserAccountInfo(req, res) {
  //   try {
  //     const carts = await CartModel.count({
  //       where: { user_id: req.userData.id },
  //     });
  //     const wishlists = await WishlistModel.count({
  //       where: { user_id: req.userData.id },
  //     });
  //     const coupons = await CouponModel.count();
  //     return res.status(200).json({
  //       success: true,
  //       message: "Data fetched successfully",
  //       data: { carts, wishlists, coupons },
  //     });
  //   } catch (err) {
  //     return res.status(500).json({ success: false, message: err?.message });
  //   }
  // }

  // email send success fully code start
  async sendEmailUserToAnother(req, res) {
    try {
      let email = req.body.email?.trim();
      // let findEmailExist = await UserModel.findOne({
      //   where: { email },
      //   attributes: ["email", "id", "name"],
      // });
      // const findEmailExist = await UserModel.queryOne("email")
      //   .eq(email)
      //   .attributes(["email", "id", "name"])
      //   .exec();

      let findEmailExist = await UserModel.scan()
        .where("email")
        .eq(email)
        .exec();

      console.log(findEmailExist, "kkkkkkkkkkkkkk===>");

      if (!findEmailExist) {
        return res.status(404).json({
          message: "Email not found",
          success: false,
          statusCode: 400,
        });
      } else {
        let getRandomNumber = Math.round(Math.random() * 10000);
        let obj = {
          user_id: findEmailExist?.id,
          otp_code: getRandomNumber,
          email: findEmailExist?.email,
          name: findEmailExist?.name,
          creation_time: Date.now(),
        };
        // console.log(obj,"EEEEEEEEEEEEEEEEEEEEEEEEEEEE")
        let getEmailCheck = await userOtpModel.findOne({
          where: { user_id: findEmailExist?.id },
          attributes: ["id"],
        });
        if (getEmailCheck && getEmailCheck?.id) {
          await userOtpModel.update(
            { otp_code: getRandomNumber, creation_time: Date.now() },
            { where: { user_id: findEmailExist?.id } }
          );
        } else {
          await userOtpModel.create(obj);
        }
        await sendEmailUser(req, res, obj);
      }
    } catch (err) {
      // console.log(err);
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async createUserRegister(req, res) {
    try {
      // let id = req.body.id;
      let email = req.body.email;
      let password = req.body.password;
      let salt = environmentVars.salt;
      let hashPassword = await bcrypt.hash(`${password}`, `${salt}`);
      const findById = await (await userRegisterModel.scan().exec()).length;
      const params = {
        TableName: "userRegister",
        Item: {
          id: Number(findById + 1),
          email: email,
          password: hashPassword,
        },
      };

      console.log(params, "params");

      let findEmailExist = await userRegisterModel
        .scan()
        .where("email")
        .eq(email)
        .exec();

      if (findEmailExist.count > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exist!",
          statusCode: 400,
        });
      }
      docClient.put(params, (err, data) => {
        if (err) {
          console.error("Error inserting item:", err);
        } else {
          console.log("Successfully inserted item:", data);
        }
      });
      const userData = await userRegisterModel.create(params, { raw: true });
      console.log("userData:", userData);
      return res.json({
        success: true,
        status_code: 201,
        data: userData,
        message: "User Register Successfully",
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  //   company_name
  // register_company_name
  // company_phone_no
  async createVendorrRegister(req, res) {
    try {
      let data = req.body;
      let role = req.body.role;
      let name = req.body.name;
      let email = req.body.email;
      let phone = req.body.phone;
      let company_name = req.body.company_name;
      let register_company_name = req.body.register_company_name;
      let company_phone_no = req.body.company_phone_no;
      const otp = Math.floor(10000 + Math.random() * 90000);
      // sendEmailOtp(email,otp)
      sendEmailOTP(req, res, email, otp);
      // console.log(phone,"phone");
      // sendPhoneOTP(phone,otp)
      // console.log(otp,"getRandomNumber");
      const phoneOTP = Math.floor(10000 + Math.random() * 90000);
      const findById = await (await vendorRegisterModel.scan().exec()).length;
      console.log(findById, "findByIdfindByIdfindById");

      if (!data.name) {
        return res.status(400).json({ error: "name is required" });
      }
      if (!data.email) {
        return res.status(400).json({ error: "email is required" });
      }
      if (!data.phone) {
        return res.status(400).json({ error: "phone number is required" });
      }
      if (!data.role) {
        return res.status(400).json({ error: "role is required" });
      }
      if (!data.company_phone_no) {
        return res.status(400).json({ error: "company phone no. is required" });
      }
      if (!data.company_name) {
        return res.status(400).json({ error: "company name is required" });
      }
      if (!data.register_company_name) {
        return res
          .status(400)
          .json({ error: "Register company name is required" });
      }

      const params = {
        TableName: "vendorRegister",
        Item: {
          id: findById != 0 ? Number(findById)+1 : 1,
          role: role,
          name: name,
          email: email,
          email_otp: otp,
          phone: phone,
          phone_otp: phoneOTP,
          company_name: company_name,
          register_company_name: register_company_name,
          company_phone_no: company_phone_no,
          check_email: false,
          check_phone: false,
        },
      };

      let findEmailExist = await vendorRegisterModel
        .scan()
        .where("email")
        .eq(email)
        .exec();
      let findPhoneExist = await vendorRegisterModel
        .scan()
        .where("phone")
        .eq(email)
        .exec();

      if (findEmailExist.count > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exist!",
          statusCode: 400,
        });
      }
      if (findPhoneExist.count > 0) {
        return res.status(400).json({
          success: false,
          message: "Phone Number already exist!",
          statusCode: 400,
        });
      }
      docClient.put(params, (err, data) => {
        if (err) {
          console.error("Error inserting item:", err);
        } else {
          console.log("Successfully inserted item:", data);
        }
      });
      const userData = await vendorRegisterModel.create(params, { raw: true });
      return res.json({
        success: true,
        status_code: 201,
        data: userData,
        message: "OTP Send Your Email and Phone No. to verify frather step.",
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  // verifyEmailVendorService

  async verifyEmailVendorService(req, res) {
    try {
      var email = req.body.email;
      var email_otp = req.body.email_otp;
      var findEmailExist = await vendorRegisterModel
        .scan()
        .where("email")
        .eq(email)
        .exec();

      console.log(findEmailExist, "findEmailExist");
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is Required",
          statusCode: 400,
        });
      }
      if (!email_otp) {
        return res.status(400).json({
          success: false,
          message: "OTP is Required",
          statusCode: 400,
        });
      }
      console.log("trueueeuueeuue");
      const user = await vendorRegisterModel.update(
        { id: findEmailExist?.[0]?.id },
        { check_email: true }
      );

      console.log(user, "kkkkkkkk");

      if (Number(findEmailExist?.[0]?.email_otp) === Number(email_otp)) {
        return res.status(400).json({
          success: true,
          data: user,
          message: "Email Verify Successfully",
          statusCode: 201,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Wrong OTP",
          statusCode: 400,
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async verifyPhoneVendorService(req, res) {
    try {
      let phone = req.body.phone;
      let phone_otp = req.body.phone_otp;
      let findphoneExist = await vendorRegisterModel
        .scan()
        .where("phone")
        .eq(phone)
        .exec();

      console.log(findphoneExist);
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: "phone is Required",
          statusCode: 400,
        });
      }
      if (!phone_otp) {
        return res.status(400).json({
          success: false,
          message: "OTP is Required",
          statusCode: 400,
        });
      }

      if (Number(findphoneExist?.[0]?.phone_otp) === Number(phone_otp)) {
        const user = await vendorRegisterModel.update(
          { id: findphoneExist?.[0]?.id },
          { check_phone: true }
        );
        return res.status(400).json({
          success: true,
          data: user,
          message: "Phone Verify Successfully",
          statusCode: 201,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Wrong OTP",
          statusCode: 400,
        });
      }

      // return res.json({
      //   success: true,
      //   status_code: 201,
      //   data: userData,
      //   message: "OTP Send Your Email and Phone No. to verify frather step.",
      // });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async createRetailerRegister(req, res) {
    try {
      // let id = req.body.id;
      let email = req.body.email;
      let password = req.body.password;
      let salt = environmentVars.salt;
      let hashPassword = await bcrypt.hash(`${password}`, `${salt}`);
      const findById = await (
        await logisticPartnerRegisterModel.scan().exec()
      ).length;
      const params = {
        TableName: "logisticPartnerRegister",
        Item: {
          id: Number(findById + 1),
          email: email,
          password: hashPassword,
        },
      };

      console.log(params, "params");

      let findEmailExist = await logisticPartnerRegisterModel
        .scan()
        .where("email")
        .eq(email)
        .exec();

      if (findEmailExist.count > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exist!",
          statusCode: 400,
        });
      }
      docClient.put(params, (err, data) => {
        if (err) {
          console.error("Error inserting item:", err);
        } else {
          console.log("Successfully inserted item:", data);
        }
      });
      const userData = await logisticPartnerRegisterModel.create(params, {
        raw: true,
      });
      console.log("userData:", userData);
      return res.json({
        success: true,
        status_code: 201,
        data: userData,
        message: "logistic Partner Register Successfully",
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
}

const UserServicesObj = new UserServices();
export default UserServicesObj;