import Joi from "joi";

export const addRoleSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .required()
    .label("Name"),
  permissions: Joi.array()
    .items(Joi.any())
    .min(1)
    .max(50)
    .required()
    .label("Permission"),
});

export const editRoleSchema = Joi.object({
  id: Joi.number()
    .required()
    .label("id"),
  status: Joi.string()
    .valid("active", "inactive")
    .trim()
    .required()
    .label("status"),
});
