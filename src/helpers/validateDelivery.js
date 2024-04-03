import Joi from "joi";

export const addDeliverySchema = Joi.object({
  discount: Joi.number()
  .custom((value, helpers) => {
    if (value < 0||value>100) {
      return helpers.message("discount cannot be negative or cannot be greator than 100 %");
    }
    return value;
  })  
  .required()
    .label("discount"),
  country_code: Joi.string()
    .trim()
    .required()
    .label("country_code"),
  delivery_charges: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (value < 0) {
        return helpers.message("delivery_charges cannot be negative");
      }
      return value;
    })
    .label("delivery_charges"),
});
