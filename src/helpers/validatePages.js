import Joi from "joi";

export const addPagesSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .trim()
    .label("Title")
    .required(),
  parent_id: Joi.string()
    .min(1)
    .trim()
    .label("Parent ID"),
  slug: Joi.string()
    .min(1)
    .trim()
    .label("Slug"),
  content: Joi.string()
    .min(1)
    .trim()
    .label("Content")
    .required(),
  meta_keyword: Joi.string()
    .min(1)
    .trim()
    .label("Meta Keyword"),
  meta_title: Joi.string()
    .min(1)
    .trim()
    .label("Meta Title"),
  meta_description: Joi.string()
    .min(1)
    .trim()
    .label("Meta Description"),
  status: Joi.string()
    .min(1)
    .trim()
    .label("Status"),
  display_in_menu: Joi.string()
    .min(1)
    .trim()
    .label("Display in Menu"),
});
