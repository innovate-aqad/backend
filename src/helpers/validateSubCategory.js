import Joi from "joi";

export const SubCategorySchema = Joi.object({
  title: Joi.alternatives().conditional('id', {
    is: Joi.exist(),  // If 'id' exists
    then: Joi.string().min(2).max(50).trim().optional(),  // Make 'title' optional
    otherwise: Joi.string().min(2).max(50).trim().required().label("sub-category title")  // Make 'title' required if 'id' does not exist
  }),
  id: Joi.string().optional(),

});
export const deleteCategorySchema = Joi.object({
  id: Joi.string().max(40).required().label("id"),
});


