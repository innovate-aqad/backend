import Joi from "joi";

export const uiSectionSchema = Joi.object({
  slug: Joi.string()
    .min(3)
    .max(45)
    .trim()
    .required()
    .label("slug"),
  module_heading: Joi.string()
    .min(3)
    .max(55)
    .trim()
    .empty('')
    .label("module_heading")
    .optional(),
  module_description: Joi.string()
    .min(3)
    .max(1000)
    .trim()
    .empty('')
    .label("description")
    .optional(),
  status: Joi.string()
    .valid("active", "inactive")
    .label("status"),
  remarks: Joi.string()
    .min(3)
    .max(255)
    .trim()
    .label("remarks"),
  image: Joi.string()
    .min(3)
    .max(255)
    .trim()
    .label("image"),
});
