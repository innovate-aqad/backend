import Joi from "joi";
import jwt from "jsonwebtoken";
import { environmentVars } from "../config/environmentVar.js";
import { phone } from "phone";
// const phonePattern = /^\+\d{3}-\d{10,15}$/; // Regex pattern for +xx-xxxxxxxxxx format
const phonePattern = /^\+\d{1,3}-\d{10,16}$/; // Regex pattern for +xx-xxxxxxxxxx format

//vendor  // slide 1 //retail 
export  const registerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(55)
    .trim()
    .label("Full Name"),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .label("Email"),
  phone: Joi.string()
    .trim()
    .regex(phonePattern)
    .messages({
      "string.pattern.base":
        "Invalid Phone number format. It should be in the format +xx-xxxxxxxxxx",
    })
    .label("Phone Number"),
  country: Joi.string().trim(),
  dob: Joi.string().trim(),
  emirate_id: Joi.string().trim(),
  residence_visa: Joi.string().trim(),
  passport: Joi.string().trim(),
  vat_certificate: Joi.string().trim(),
  trade_license: Joi.string().trim(),
});








// export const registerSchema = (req) => {
//   const { slide, user_type } = req.body;

//   let schema = Joi.object({
//     name: Joi.string()
//       .min(3)
//       .max(55)
//       .trim()
//       .label("Full Name"),
//     email: Joi.string()
//       .trim()
//       .email({ tlds: { allow: false } })
//       .label("Email"),
//     phone: Joi.string()
//       .trim()
//       .regex(phonePattern)
//       .messages({
//         "string.pattern.base":
//           "Invalid Phone number format. It should be in the format +xx-xxxxxxxxxx",
//       })
//       .label("Phone Number"),
//     country: Joi.string().trim(),
//     dob: Joi.string().trim(),
//     emirate_id: Joi.string().trim(),
//     residence_visa: Joi.string().trim(),
//     passport: Joi.string().trim(),
//     vat_certificate: Joi.string().trim(),
//     trade_license: Joi.string().trim(),
//   });

//   // Adjust schema based on conditions
//   if (slide === 1) {
//     schema = schema.concat(
//       Joi.object({
//         name: Joi.string().required(),
//         email: Joi.string().email().required(),
//         phone: Joi.string().regex(phonePattern).required(),
//       })
//     );
//     if (user_type === "employee") {
//       schema = schema.concat(
//         Joi.object({
//           dob: Joi.string().required(),
//           emirate_id: Joi.string().required(),
//           residence_visa: Joi.string().required(),
//           passport: Joi.string().required(),
//         })
//       );
//     }
//   } else if (slide === 3) {
//     schema = schema.concat(
//       Joi.object({
//         vat_certificate: Joi.string().required(),
//       })
//     );
//     if (user_type === "logistic") {
//       schema = schema.concat(
//         Joi.object({
//           trade_license: Joi.string().required(),
//         })
//       );
//     }
//   }

//   return schema;
// };

// export const registerSchema = Joi.object({
//   name: Joi.string()
//     .min(3)
//     .max(55)
//     .trim()
//     .required()
//     .pattern(/^[a-zA-Z\s]+$/)
//     .label("Full Name"),
//   email: Joi.string()
//     .trim()
//     .email({ tlds: { allow: false } })
//     .required()
//     .label("Email"),
//   phone: Joi.string()
//     .trim()
//     .required()
//     .regex(phonePattern)
//     .messages({
//       "string.pattern.base":
//         "Invalid Phone number format. It should be in the format +xx-xxxxxxxxxx",
//       "any.required": "Phone number is required",
//       "string.empty": "Phone number must not be empty",
//     })
//     .label("Phone Number"),
//   country: Joi.string()
//     .trim()
//     .required("Selecting Country Code is Required"),
// });

export const registerAdminSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(25)
    .trim()
    .required()
    .label("Full Name"),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  role_id: Joi.string().required(),
  // phone: Joi.string()
  //   .trim()
  //   .required()
  //   .min(10)
  //   .label("Phone Number"),
  country: Joi.string()
    .trim()
    .required("Selecting Country Code is Required"),
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
  id: Joi.number()
    .required()
    .label("id"),
  status: Joi.string()
    .required()
    .valid("active", "inactive")
    .label("status"),
});
export const editAdminSchema = Joi.object({
  id: Joi.number()
    .required()
    .label("id"),
  name: Joi.string()
    .min(3)
    .required()
    .label("name"),
});

export const updateUserSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(25)
    .allow("", null)
    .trim()
    .label("Full Name"),

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

  country: Joi.string()
    .trim()
    .required("Selecting Country Code is Required"),
});
