import Joi from "joi";
import jwt from "jsonwebtoken";
import { environmentVars } from "../config/environmentVar.js";

export const newsletterSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
});
