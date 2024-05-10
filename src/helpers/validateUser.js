import Joi from "joi";
import jwt from "jsonwebtoken";
import { environmentVars } from "../config/environmentVar.js";
import { phone } from "phone";
const phonePattern = /^\+\d{1,3}-\d{10,16}$/; // Regex pattern for +xx-xxxxxxxxxx format

//vendor  // slide 1 //retail
export const registerSchema = Joi.object({
  slide: Joi.string()
    .required()
    .custom((value, helpers) => {
      const intValue = parseInt(value);
      if (isNaN(intValue) || intValue <= 0) {
        return helpers.message({ custom: "Slide must be a positive number" });
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

  phone: Joi.when("slide", {
    is: "1",
    then: Joi.string().trim().required().regex(phonePattern).messages({
      "string.pattern.base":
        "Invalid Phone number format. It should be in the format +xx-xxxxxxxxxx",
    }),
    otherwise: Joi.string().trim().allow("").regex(phonePattern).messages({
      "string.pattern.base":
        "Invalid Phone number format. It should be in the format +xx-xxxxxxxxxx",
    }),
  }).label("Phone Number"),

  // phone: Joi.string()
  //   .trim()
  //   .required()
  //   .regex(phonePattern)
  //   .messages({
  //     "string.pattern.base":
  //       "Invalid Phone number format. It should be in the format +xx-xxxxxxxxxx",
  //   })
  //   .label("Phone Number"),
  country: Joi.string().trim(),
  dob: Joi.when("user_type", {
    is: "employee",
    then: Joi.when("slide", {
      is: "1",
      then: Joi.string().required().label("Date of Birth"),
      otherwise: Joi.string().trim().allow(""),
    }),
    otherwise: Joi.string().trim().allow(""),
  }),
  // vat_certificate: Joi.string().trim(),
  // trade_license: Joi.string().trim(),
  user_type: Joi.string()
    .valid("vendor", "seller", "logistic", "employee")
    .required()
    .label("User Type"),
  emirates_id: Joi.when("user_type", {
    is: "employee",
    then: Joi.when("slide", {
      is: "2",
      then: Joi.string().trim().required().label("Emirate ID"),
      otherwise: Joi.string().trim().allow(""),
    }),
    otherwise: Joi.string().trim().allow(""),
  }),
  // residence_visa: Joi.when("user_type", {
  //   is: "employee",
  //   then: Joi.when("slide", {
  //     is: "2",
  //     then: Joi.string().trim().required().label("Residence Visa"),
  //     otherwise: Joi.string().trim().allow(""),
  //   }),
  //   otherwise: Joi.string().trim().allow(""),
  // }),
  // passport: Joi.when("user_type", {
  //   is: "employee",
  //   then: Joi.when("slide", {
  //     is: "2",
  //     then: Joi.string().trim().required().label("Passport"),
  //     otherwise: Joi.string().trim().allow(""),
  //   }),
  //   otherwise: Joi.string().trim().allow(""),
  // }),
  doc_id: Joi.when("slide", {
    is: Joi.valid("2", "3"),
    then: Joi.string().required().label("Document ID"),
    otherwise: Joi.string().trim().allow(""),
  }),
  drive_name: Joi.when(["slide", "user_type"], {
    is: Joi.object({
      slide: "4",
      user_type: "vendor",
    }),
    then: Joi.array()
      .items(Joi.string())
      .min(1)
      .max(10)
      .required()
      .label("Drive Name"),
    otherwise: Joi.array().items(Joi.string()).optional(),
  }),
});

export const registerAdminSchema = Joi.object({
  name: Joi.string().min(3).max(25).trim().required().label("Full Name"),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  role_id: Joi.string().required(),
  country: Joi.string().trim().required("Selecting Country Code is Required"),
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
    .regex(/^\d+$/) // Ensure it contains only digits
    .required()
    .label("OTP Code"),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  password: Joi.string()
    .min(6)
    .trim()
    // .regex(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .required()
    .label("Password"),
});

export const loginWithOtpSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  otp_code: Joi.number()
    .min(6)
    // .regex(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/)
    .required()
    .label("Otp"),
});

export const statusChangeSchema = Joi.object({
  id: Joi.number().required().label("id"),
  status: Joi.string().required().valid("active", "inactive").label("status"),
});
export const editAdminSchema = Joi.object({
  id: Joi.number().required().label("id"),
  name: Joi.string().min(3).required().label("name"),
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
  let token = jwt.sign(payload, environmentVars.jwtSecret);
  return token;
};

export const generateAccessTokenForAdmin = (payload) => {
  let token = jwt.sign(payload, environmentVars.jwtSecretAdmin);
  return token;
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
  //   .min(10)
  //   .max(17)
  //   .messages({
  //     "any.required": "Invalid Phone number",
  //   })
  //   // .custom((value, helpers) => {
  //   //   const phoneNumberPattern = /^\+(?:[0-9] ?){6,14}[0-9]$/;
  //   //   if (!phoneNumberPattern.test(value)) {
  //   //     return helpers.error("any.invalid");
  //   //   }
  //   //   return value;
  //   // }, "Phone Number Validation")
  //   .label("Phone Number"),
  phone: Joi.string()
    .trim()
    .required()
    .regex(phonePattern)
    .messages({
      "string.pattern.base":
        "Invalid Phone number format. It should be in the format +xx-xxxxxxxxxx",
      "any.required": "Phone number is required",
      "string.empty": "Phone number must not be empty",
    })
    .label("Phone Number"),

  country: Joi.string().trim().required("Selecting Country Code is Required"),
});
