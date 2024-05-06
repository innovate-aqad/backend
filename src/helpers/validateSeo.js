import Joi from "joi";

export const SeoSchema = Joi.object({
  meta_title: Joi.string()
    .trim()
    .required()
    .label("meta_title"),
  product_id: Joi.number()
    .required()
    .label("product_id"),
  meta_description: Joi.string()
    .trim()
    .required()
    .label("meta_description"),
  tags: Joi.array()
    .min(1)
    .required()
    .label("tags"),
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
