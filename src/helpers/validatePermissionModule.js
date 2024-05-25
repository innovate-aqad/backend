import Joi from "joi";

export const addPermissionModuleSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .trim()
    .label("title")
    .required().label('title'),
  backend_routes: Joi.array()
    .min(1)
    .required()
    .label("backend_routes"),
  frontend_routes: Joi.array()
    .min(1)
    .label("frontend_routes"),
  status: Joi.string().valid("active",'inactive')
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

export const deletePermmissionSchema = Joi.object({
  id: Joi.string().max(40).required().label("id"),
});
