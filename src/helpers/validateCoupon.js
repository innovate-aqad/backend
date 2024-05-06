import Joi from "joi";

export const addCouponSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().required().label("Name"),
  code: Joi.string().min(1).max(100).trim().required().label("Code"),
  type: Joi.string().min(1).max(10).trim().allow("", null).label("Type"),
  value: Joi.string().min(1).max(10).trim().required().label("Value"),
  start_date: Joi.string().min(1).trim().required().label("Start Date"),
  expired_date: Joi.string()
    .min(1)
    .trim()
    .required()
    .label("Expired Date")
    .custom((value, helpers) => {
      const startDate = helpers.state.ancestors[0].start_date; // Accessing start_date value
      if (new Date(value) <= new Date(startDate)) {
        return helpers.message(
          '"Expired Date" must be later than "Start Date"'
        );
      }
      return value;
    }),
  min_purchase: Joi.string()
    .min(1)
    .max(10)
    .trim()
    .required()
    .label("Min Purchase"),
  max_purchase: Joi.string()
    .min(1)
    .max(10)
    .trim()
    .required()
    .label("Max Purchase")
    .custom((value, helpers) => {
      const minPurchase = helpers.state.ancestors[0].min_purchase; // Accessing min_purchase value
      if (parseInt(value, 10) <= parseInt(minPurchase, 10)) {
        return helpers.message(
          '"Max Purchase" must be greater than "Min Purchase"'
        );
      }
      return value;
    }),
  limit: Joi.string().min(1).max(10).trim().required().label("Limit"),
});
export const updateCouponSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().label("Name"),
  code: Joi.string().min(1).max(100).trim().required().label("Code"),
  type: Joi.string().min(1).max(10).trim().label("Type"),
  value: Joi.string().min(1).max(10).trim().label("Value"),
  start_date: Joi.string().min(1).trim().label("Start Date"),
  expired_date: Joi.string()
    .min(1)
    .trim()
    .label("Expired Date")
    .custom((value, helpers) => {
      const startDate = helpers.state.ancestors[0].start_date; // Accessing start_date value
      if (new Date(value) <= new Date(startDate)) {
        return helpers.message(
          '"Expired Date" must be later than "Start Date"'
        );
      }
      return value;
    }),
  min_purchase: Joi.string().min(1).max(10).trim().label("Min Purchase"),
  max_purchase: Joi.string()
    .min(1)
    .max(10)
    .trim()
    .label("Max Purchase")
    .custom((value, helpers) => {
      const minPurchase = helpers.state.ancestors[0].min_purchase; // Accessing min_purchase value
      if (parseInt(value, 10) <= parseInt(minPurchase, 10)) {
        return helpers.message(
          '"Max Purchase" must be greater than "Min Purchase"'
        );
      }
      return value;
    }),
  limit: Joi.string().min(1).max(10).trim().label("Limit"),
});
