import Joi from "joi";
import jwt from "jsonwebtoken";

export const OfferDatachema = Joi.object({
  title: Joi.string()
    .required()
    .label("title"),
  description: Joi.string().label("description"),
  status: Joi.string()
    .valid("active", "inactive")
    .label("status"),
});
