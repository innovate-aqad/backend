import Joi from "joi";

export const uiSectionSchema = Joi.object({
  slug: Joi.string()
    .min(3)
    .max(45)
    .trim()
    .required()
    .label("slug"),
  heading: Joi.string()
    .min(3)
    .max(45)
    .trim()
    .required()
    .label("heading"),
  description: Joi.string()
    .min(3)
    .max(1000)
    .trim()
    .label("description"),
  category_id: Joi.string()
    .required()
    .label("category id"),
  sub_category_id: Joi.string()
    .required()
    .label("sub_category_id"),
  status: Joi.string()
    .valid("active", "inactive")
    .label("status"),
  remarks: Joi.string()
    .min(3)
    .max(255)
    .trim()
    .label("remarks"),
});
