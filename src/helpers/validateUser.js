import Joi from "joi";
import jwt from "jsonwebtoken";
import { environmentVars } from "../config/environmentVar.js";
import { phone } from "phone";

const phonePattern = /^5(0|2|5|6)\d{7}$/; // New Regex pattern for phone numbers

// Vendor, Retailer, Logistic, Employee schemas
export const registerSchema = Joi.object({
  slide: Joi.string()
    .required()
    .custom((value, helpers) => {
      const intValue = parseInt(value);
      if (isNaN(intValue) || intValue <= 0) {
        return helpers.message("Slide must be a positive number");
      }
      return value;
    })
    .label("slide"),
  trade_license_number: Joi.when("user_type", {
    is: "vendor",
    then: Joi.when("slide", {
      is: "2",
      then: Joi.string().required().label("Trade License Number"),
      otherwise: Joi.string().trim().allow(""),
    }),
    otherwise: Joi.string().trim().allow(""),
  }),
  name: Joi.when("slide", {
    is: "1",
    then: Joi.string().min(3).max(55).trim().required(),
    otherwise: Joi.string().min(3).max(55).trim().allow(""),
  }).label("Full Name"),
  email: Joi.when("slide", {
    is: "1",
    then: Joi.string()
      .trim()
      .required()
      .email({ tlds: { allow: false } }),
    otherwise: Joi.string()
      .trim()
      .allow("")
      .email({ tlds: { allow: false } }),
  }).label("Email"),
  // phone: Joi.when("slide", {
  //   is: "1",
  //   then: Joi.string().trim().required().regex(phonePattern).messages({
  //     "string.pattern.base":
  //       "Invalid Phone number format. It should match the pattern 5(0|2|5|6)xxxxxxxx",
  //   }),
  //   otherwise: Joi.string().trim().allow("").regex(phonePattern).messages({
  //     "string.pattern.base":
  //       "Invalid Phone number format. It should match the pattern 5(0|2|5|6)xxxxxxxx",
  //   }),
  // }).label("Phone Number"),
  country: Joi.string().trim().label("Country"),
  term_and_condition: Joi.string().valid().label("Terms and Conditions"),
  dob: Joi.when("user_type", {
    is: "employee",
    then: Joi.when("slide", {
      is: "1",
      then: Joi.string().required().label("Date of Birth"),
      otherwise: Joi.string().trim().allow(""),
    }),
    otherwise: Joi.string().trim().allow(""),
  }),
  user_type: Joi.string()
    .valid("vendor", "seller", "logistic", "employee")
    .required()
    .label("User Type"),
  emirates_id: Joi.when("user_type", {
    is: "employee",
    then: Joi.when("slide", {
      is: "2",
      then: Joi.string().trim().required().label("Emirates ID"),
      otherwise: Joi.string().trim().allow(""),
    }),
    otherwise: Joi.string().trim().allow(""),
  }),
  doc_id: Joi.when("slide", {
    is: Joi.valid("2", "3"),
    then: Joi.string().required().label("Document ID"),
    otherwise: Joi.string().trim().allow(""),
  }),
});

// Other schemas
export const getDataByEmailSchema = Joi.object({
  email: Joi.string()
    .trim()
    .required()
    .email({ tlds: { allow: false } })
    .label("Email"),
});

export const VerifyEmailWithOtpSchema = Joi.object({
  email: Joi.string()
    .trim()
    .required()
    .email({ tlds: { allow: false } })
    .label("Email"),
  otp: Joi.number().positive().required().label("OTP"),
});

export const AddSubUserSchema = Joi.object({
  email: Joi.string()
    .trim()
    .required()
    .email({ tlds: { allow: false } })
    .label("Email"),
<<<<<<< HEAD
  name: Joi.string().trim().min(3).max(40).required().label("Name"),
  permission: Joi.array()
    .items(Joi.string())
    .min(1)
    .max(100)
    .required()
    .label("Permission"),
  // phone: Joi.string()
  //   .trim()
  //   .required()
  //   .regex(phonePattern)
  //   .messages({
  //     "string.pattern.base":
  //       "Invalid Phone number format. It should match the pattern 5(0|2|5|6)xxxxxxxx",
  //   })
  //   .label("Phone"),
=======
  name: Joi.string().trim().min(3).max(40).required().label("name"),
  permission: Joi.when('user_type', {
    is: 'logistic',
    then: Joi.array().items(Joi.string()).max(100).label("Permission"),
    otherwise: Joi.array().items(Joi.string()).min(1).max(100).required().label("Permission")
  }),
  // permission: Joi.array()
  //   .items(Joi.string())
  //   .min(1)
  //   .max(100)
  //   .required()
  //   .label("permission"),
  phone: Joi.string()
    .trim()
    .required()
    .regex(phonePattern)
    .messages({
      "string.pattern.base":
        "Invalid Phone number format. It should be in the format +xx-xxxxxxxxxx",
    })
    .label("phone"),
>>>>>>> e56e7f4381e5c9bfbdefe48aabf68b9dae4b3ddc
});

export const assignRoleToSubUserSchema = Joi.object({
  user_id: Joi.string().trim().required().label("User ID"),
  role_id: Joi.string().trim().max(40).required().label("Role ID"),
});

export const AddSuperUserSchema = Joi.object({
  email: Joi.string()
    .trim()
    .required()
    .email({ tlds: { allow: false } })
    .label("Email"),
  name: Joi.string().trim().min(3).max(40).required().label("Name"),
  // phone: Joi.string()
  //   .trim()
  //   .required()
  //   .regex(phonePattern)
  //   .messages({
  //     "string.pattern.base":
  //       "Invalid Phone number format. It should match the pattern 5(0|2|5|6)xxxxxxxx",
  //   })
  //   .label("Phone"),
});

export const GetSubUserSchema = Joi.object({
  page: Joi.number().positive().label("Page"),
  limit: Joi.number().positive().label("Limit"),
});

export const AddWarehouseSchema = Joi.object({
  address: Joi.string().required().max(200).label("address"),
  po_box: Joi.string().required().max(20).label("po_box"),
  is_default: Joi.boolean().label("status"),
});

export const DeleteWarehouseSchema = Joi.object({
  po_box: Joi.string().required().max(20).label("po_box"),
});

export const registerAdminSchema = Joi.object({
  name: Joi.string().min(3).max(25).trim().required().label("Full Name"),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  role_id: Joi.string().required(),
  country: Joi.string().trim().required().label("Country"),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(6)
    .regex(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .required()
    .label("Password")
    .messages({
      "string.pattern.base":
        "Password must contain at least one digit, one special character, one lowercase letter, and one uppercase letter.",
    }),
});

export const otpSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  otp_code: Joi.string()
    .trim()
    .length(4)
    .regex(/^\d+$/)
    .required()
    .label("OTP Code"),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  password: Joi.string().min(6).trim().required().label("Password"),
});

export const loginWithOtpSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  otp: Joi.number().min(4).required().label("OTP"),
});

export const statusChangeSchema = Joi.object({
  id: Joi.string().max(60).required().label("ID"),
  account_status: Joi.string()
    .required()
    .valid("activated", "deactivated")
    .label("Status"),
});

export const delete_sub_user_schema = Joi.object({
  id: Joi.string().max(60).required().label("ID"),
});

export const verifyAccountSchema = Joi.object({
  user_id: Joi.string().max(50).required().label("ID"),
  status: Joi.boolean().required().label("Status"),
});

export const AccountDeactivateOrActiveSchema = Joi.object({
  user_id: Joi.string().max(50).required().label("ID"),
  status: Joi.string()
    .required()
    .valid("deactivated", "activated")
    .label("Status"),
});

export const editAdminSchema = Joi.object({
  id: Joi.number().required().label("ID"),
  name: Joi.string().min(3).required().label("Name"),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(25).allow("", null).trim().label("Full Name"),
  phone: Joi.string()
    .custom((value, helpers) => {
      const phoneNumber = phone(value);
      if (!phoneNumber.isValid) {
        return helpers.message(
          "Please provide a valid phone number, including the country code if applicable."
        );
      }
      return value;
    })
    .allow(null, "")
    .label("Phone Number"),
  password: Joi.string()
    .min(6)
    .allow(null, "")
    .regex(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .label("Password")
    .messages({
      "string.pattern.base":
        "Password must contain at least one digit, one special character, one lowercase letter, and one uppercase letter.",
    }),
});

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, environmentVars.jwtSecret);
};

export const generateAccessTokenForAdmin = (payload) => {
  return jwt.sign(payload, environmentVars.jwtSecretAdmin);
};

export const customerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(25)
    .trim()
    .required()
    .pattern(/^[a-zA-Z\s]+$/)
    .label("Full Name"),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  // phone: Joi.string()
  //   .trim()
  //   .required()
  //   .regex(phonePattern)
  //   .messages({
  //     "string.pattern.base":
  //       "Invalid Phone number format. It should match the pattern 5(0|2|5|6)xxxxxxxx",
  //     "any.required": "Phone number is required",
  //     "string.empty": "Phone number must not be empty",
  //   })
  //   .label("Phone Number"),
  country: Joi.string().trim().required().label("Country"),
});
