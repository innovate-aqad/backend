import Joi from "joi";

export const BrandSchema = Joi.object({
  title: Joi.alternatives().conditional('id', {
    is: Joi.exist(),  // If 'id' exists
    then: Joi.string().min(2).max(50).trim().optional(),  // Make 'title' optional
    otherwise: Joi.string().min(2).max(50).trim().required().label("sub-category title")  // Make 'title' required if 'id' does not exist
  }),
  id: Joi.string().optional(),
  category_id: Joi.string().max(100).required().label("category_id"),
  // category_id: Joi.string().max(20).required().label("status"),
});


export const BrandStatusSchema = Joi.object({
  id: Joi.string().optional(),
  status: Joi.string().valid('active','inactive').required().label("status"),
});
export const deleteBrandSchema = Joi.object({
  id: Joi.string().max(40).required().label("id"),
});


export const SubBrandFetchByMainCategoryIdSchema = Joi.object({
  category_id: Joi.string().max(50).required().label("category_id"),
});
