import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  loginSchema,
  otpSchema,
  registerAdminSchema,
  statusChangeSchema,
  editAdminSchema,
  loginWithOtpSchema,
} from "../../helpers/validateUser.js";
import AdminUserServicesObj from "../../services/admin/adminServices.js";
import jwt from "jsonwebtoken";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

class AdminUserController {
  async register(req, res) {
    try {
      // captcha for future purpose
      //     const capchaSecret = process.env.GOOGLE_SECRET_KEY;
      // const response =await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${capchaSecret}&response=${req.body?.captchaValue}`)
      // if(!response?.data?.success){
      //   return res.status(400).json({message:"Invalid captcha"})
      // }

      let { error } = registerSchema.validate(req?.body, options);
      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }
      AdminUserServicesObj.createUser(req, res);
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
      AdminUserServicesObj.loginUser(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
  async login_with_otp(req, res) {
    try {
      let { error } = loginWithOtpSchema.validate(req?.body, options);

      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }
      AdminUserServicesObj.loginWithOtp(req, res);

    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }
  async check_user_logged_in(req, res) {
    try {
     
      AdminUserServicesObj.check_user_logged_in_data(req, res);

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
          .clearCookie("_tokenAdmin")
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

  async admin_logout(req, res) {
    try {
      return res
        .clearCookie("_tokenSubAdmin")
        .status(200)
        .json({ success: true, message: "Logout successful" });
    } catch (err) {
      return res
        .status(500)
        .json({ mesaage: err?.message, success: false, statusCode: 500 });
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
      AdminUserServicesObj.sendForgotPasswordEmail(req, res);
    } catch (err) {
      // console.log(err, "error user contrl");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async verify_otp(req, res) {
    try {
      // console.log(req.body,"req.bodyyyyyyyyyyyyyyyyyyyyyyyy")
      let { error } = otpSchema.validate(req?.body, options);
      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }

      AdminUserServicesObj.verify_otp_data(req, res);
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

      AdminUserServicesObj.resetUserPassword(req, res);
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
      AdminUserServicesObj.getAllUSerData(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  // admin create
  async create_admin(req, res) {
    try {
      let { error } = registerAdminSchema.validate(req?.body, options);
      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }
      AdminUserServicesObj.createAdminUser(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async login_admin(req, res) {
    try {
      let { error } = loginSchema.validate(req?.body, options);

      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }
      AdminUserServicesObj.loginAdminUser(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async get_admin(req, res) {
    try {
      AdminUserServicesObj.getAdminUser(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
  async adminStatusChangeData(req, res) {
    try {
      let { error } = statusChangeSchema.validate(req?.body, options);

      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }
      AdminUserServicesObj.adminStatusChange(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
  async editAdminData(req, res) {
    try {
      let { error } = editAdminSchema.validate(req?.body, options);

      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }
      AdminUserServicesObj.editAdmin(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async deleteAdminData(req, res) {
    try {
      if (!req.query.id) {
        return res.status(400).json({
          mesaage: "Id is mandatory",
          statusCode: 400,
          success: false,
        });
      }
      AdminUserServicesObj.deleteAdmin(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }



  // send user to another user email start

//   async sendEmailToAnotherUser(req, res) {
//     try {
//       let { error } = forgotPasswordSchema.validate(req?.body, options);

//       if (error) {
//         return res
//           .status(400)
//           .json({ message: error.details[0]?.message, success: false });
//       }
//       AdminUserServicesObj.sendEmailUserToAnother(req, res);
//     } catch (err) {
//       // console.log(err, "error user contrl");
//       return res
//         .status(500)
//         .json({ message: err?.message, success: false, statusCode: 500 });
//     }
//   }
}

const AdminUserControllerObj = new AdminUserController();
export default AdminUserControllerObj;
