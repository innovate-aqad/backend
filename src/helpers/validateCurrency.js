import Joi from "joi";

export const addCurrencySchema = Joi.object({
  name: Joi.string().min(1).max(25).trim().required().label("Name"),
  symbol: Joi.string().min(1).max(10).trim().required().label("Symbol"),
  country_code: Joi.string().min(1).max(10).trim().required().label("Country Code"),
});
