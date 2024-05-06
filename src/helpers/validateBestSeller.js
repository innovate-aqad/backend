import Joi from "joi";

export const BestSellerSchema = Joi.object({
  product_id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("product_id cannot be negative");
      }
      return value;
    })
    .required()
    .label("product_id"),
  variant_id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("variant_id cannot be negative");
      }
      return value;
    })
    .required()
    .label("variant_id"),
  type: Joi.string()
    .trim()
    .required()
    .label("type"),
  status: Joi.string()
    .valid("active", "inactive")
    .label("status"),
});
