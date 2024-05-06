import Joi from "joi";

export const BeautifulEyewearCollectionSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
});

