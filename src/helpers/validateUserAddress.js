import Joi from "joi";

export const addAddressSchema = Joi.object({
  full_name: Joi.string().min(3).max(25).trim().required().label("full_name"),
  country: Joi.string().min(3).max(25).trim().required().label("country"),
  landmark: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .allow(null, "")
    .label("landmark"),
  address: Joi.string().min(3).max(125).trim().required().label("address"),
  house_no: Joi.string().min(3).max(100).allow(null, "").label("house_no"),
  city: Joi.string().min(3).max(55).trim().required().label("city"),
  state: Joi.string().min(2).max(55).trim().required().label("state"),
  mobile: Joi.string().trim().required().min(8).label("mobile"),
  is_default: Joi.boolean(),
  zipcode: Joi.string().min(3).max(10).trim().required().label("zipcode"),
});

export const editAddressSchema = Joi.object({
  full_name: Joi.string()
    .min(3)
    .max(25)
    .trim()
    .allow(null, "")
    .optional()
    .label("full_name"),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .allow(null, "")
    .optional()
    .label("email"),
  mobile: Joi.string().trim().optional().min(8).allow(null, "").label("mobile"),
  country: Joi.string()
    .min(3)
    .max(25)
    .trim()
    .optional()
    .allow(null, "")
    .label("country"),
  address: Joi.string()
    .min(3)
    .max(125)
    .trim()
    .optional()
    .allow(null, "")
    .label("address"),
  house_no: Joi.string().min(3).max(100).allow(null, "").label("house_no"),
  city: Joi.string().min(3).max(55).trim().optional().label("city"),
  state: Joi.string().min(2).max(55).trim().optional().label("state"),
  landmark: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .allow(null, "")
    .label("landmark"),
  zipcode: Joi.string().min(3).max(10).trim().optional().label("zipcode"),
});
