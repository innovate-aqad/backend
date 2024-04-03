import Joi from "joi";

export const ApiEndpointSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .label("name"),
  type: Joi.string()
    .valid("backend", "frontend")
    .required()
    .label("type"),
  status: Joi.string()
    .valid("active", "inactive")
    .label("status"),
});
export const ChangeStatusSchema = Joi.object({
  status: Joi.string()
    .valid("active", "inactive")
    .required()
    .label("status"),
  id: Joi.number().required(),
});
