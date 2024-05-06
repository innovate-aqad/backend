import Joi from "joi";

  
export const ContactUS = Joi.object({
  full_name: Joi.string().min(3).max(100).trim().required().label("Name"),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  phone: Joi.string().trim().required().label("Phone Number"),
  subject: Joi.string().min(3).trim().allow("", null).label("Subject"),
  message: Joi.string().min(3).trim().allow("", null).label("Message"),
});
