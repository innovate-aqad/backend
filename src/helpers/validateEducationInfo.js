import Joi from "joi";
import jwt from "jsonwebtoken";

export const addEducationInfochema = Joi.object({
  full_name: Joi.string()
    .min(3)
    .max(70)
    .trim()
    .required()
    .label("full_name"),
  university_name: Joi.string()
    .min(3)
    .max(170)
    .required()
    .label("university_name"),
  university_id: Joi.number()
    .min(1)
    .required()
    .label("university_id"),
  status: Joi.string()
    .valid("active", "inactive")
    .label("status"),
});
export const changeStatusEducationInfochema = Joi.object({
  id: Joi.number()
    .required()
    .label("id"),
  status: Joi.string()
    .valid("active", "inactive")
    .label("status"),
});

export const changeApproveStatusEducationInfochema = Joi.object({
  id: Joi.number()
    .required()
    .label("id"),
  approve: Joi.number()
    .valid(true, false)
    .required()
    .label("approve"),
});
