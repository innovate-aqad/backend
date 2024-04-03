import Joi from "joi";
import jwt from "jsonwebtoken";

export const ReviewRatingchema = Joi.object({
  product_id: Joi.string()
    .required()
    .label("product_id"),
  review: Joi.string()
    .min(10)
    .max(125)
    .trim()
    .required()
    .label("review"),
  rate: Joi.custom((value, helpers) => {
    if (parseFloat(value) < 0 || parseFloat(value) > 5) {
      return helpers.message("rating cannot be negative or more than 5 ");
    }
    return value;
  }).required(),
});

export const ReviewRatingStatusChangedchema = Joi.object({
  review_id: Joi.string()
    .required()
    .label("review_id"),
  status: Joi.string()
    .trim()
    .valid("active", "inactive")
    .required()
    .label("status"),
});
