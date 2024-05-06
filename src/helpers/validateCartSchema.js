import Joi from "joi";

export const cartSchema = Joi.object({
  product_id: Joi.string().min(1).max(25).trim().required().label("Product Id"),
  product_variant_id: Joi.string()
    .min(1)
    .max(10)
    .trim()
    .required()
    .label("Product Variant Id"),
  quantity: Joi.string().min(1).max(10).trim().required().label("Quantity"),
});
export const cartSchemaUpdate = Joi.object({
  product_variant_id: Joi.string()
    .min(1)
    .max(10)
    .trim()
    .required()
    .label("Product Variant Id"),
  quantity: Joi.string().min(1).max(10).trim().required().label("Quantity"),
});
