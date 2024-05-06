import Joi from "joi";

export const addPermissionModuleSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .trim()
    .label("name")
    .required(),
  backend_routes: Joi.array()
    // .min(1)
    // .required()
    .label("backend_routes"),
  frontend_routes: Joi.array()
    // .min(1)
    .label("frontend_routes"),
  status: Joi.string()
    .trim()
    .label("Status"),
});
export const editPermissionModuleSchema = Joi.object({
  id: Joi.number()
    .label("id")
    .required(),
  name: Joi.string()
    .min(1)
    .trim()
    .label("name")
    .required(),
  status: Joi.string()
    .trim()
    .label("Status"),
});
