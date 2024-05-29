import Joi from "joi";

export const SiUnitSchema = Joi.object({
  title: Joi.string()
    .trim().max(100)
    .required()
    .label("title"),
  // type: Joi.string()
  //   .valid("backend", "frontend")
  //   .required()
  //   .label("type"),
  status: Joi.string()
    .valid("active", "inactive")
    .label("status"),
});
export const ChangeStatusSiUnitSchema = Joi.object({
  status: Joi.string()
    .valid("active", "inactive")
    .required()
    .label("status"),
  id: Joi.string().required(),
});
export const DeleteSiUnitSchema = Joi.object({
  // status: Joi.string()
  //   .valid("active", "inactive")
  //   .required()
  //   .label("status"),
  id: Joi.string().required(),
});
// export const SubCategoryStatusSchema = Joi.object({
//   id: Joi.string().optional(),
//   status: Joi.string().valid('active','inactive').required().label("status"),
// });