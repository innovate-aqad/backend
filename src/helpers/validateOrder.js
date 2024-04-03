import Joi from "joi";

export const OrderSchema = Joi.object({
  address_id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("address_id cannot be negative");
      }
      return value;
    })
    .required()
    .label("address id"),
  country_code: Joi.string()
    .trim()
    .required()
    .label("country code"),

  variant_quantity: Joi.array()
    .min(1)
    .items(
      Joi.object({
        variant_id: Joi.string()
          .custom((value, helpers) => {
            if (parseFloat(value) < 0) {
              return helpers.message("variant_id cannot be negative");
            }
            return value;
          })
          .trim()
          .required(),
        quantity: Joi.number()
          .custom((value, helpers) => {
            if (parseFloat(value) < 0) {
              return helpers.message("quantity cannot be negative");
            }
            return value;
          })
          .required(),
        // thumbnail_url: Joi.string().label("thumbnail_img"),
        // variant_name: Joi.string().label("variant_name"),
      })
    )
    .required()
    .label("variant_quantity"),
  coupon_id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("coupon_id cannot be negative");
      }
      return value;
    }),
  sub_total: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("Sub_total cannot be negative");
      }
      return value;
    })
    .label("sub_total"),
  delivery_charges: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("delivery_charges cannot be negative");
      }
      return value;
    })
    .label("delivery_charges  "),
  payment_method: Joi.string()
    .valid("Cash on Delivery", "Paypal", "Stripe", "Razorpay")
    .required()
    .label("payment_method"),
  payment_status: Joi.string()
    .valid("complete", "failed", "pending")
    .label("payment_status"),
  status: Joi.string()
    .valid("new", "processing", "delivered", "cancelled", "returned")
    .label("status"),
});

export const UpdateOrderSchema = Joi.object({
  order_id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("order id cannot be negative");
      }
      return value;
    })
    .required()
    .label("order id"),
  card_details: Joi.string()
    .trim()
    .required()
    .label("card_details"),
  card_data: Joi.string()
    .min(1)
    .required()
    .label("card_data"),
  txn_id: Joi.string()
    .trim()
    .required()
    .label("txn_id"),
  delivery_instruction: Joi.string()
    .trim()
    .label("delivery_instruction"),
  payment_status: Joi.string()
    .trim()
    .valid("complete", "failed", "pending")
    .required()
    .label("payment_status"),
});

export const update_order_status_schema = Joi.object({
  order_id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("order id cannot be negative");
      }
      return value;
    })
    .required()
    .label("order id"),
  status: Joi.string()
    .trim()
    .valid("cancelled")
    .required()
    .label("status"),
});

export const request_return_schema = Joi.object({
  order_id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("order id cannot be negative");
      }
      return value;
    })
    .required()
    .label("order id"),
  status: Joi.string()
    .trim()
    .required()
    .label("status"),
});

export const cancel_order_schema = Joi.object({
  order_id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("order id cannot be negative");
      }
      return value;
    })
    .required()
    .label("order id"),
});

//admin
export const UpdateDeliveryDateSchema = Joi.object({
  order_id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("order id cannot be negative");
      }
      return value;
    })
    .required()
    .label("order id"),
  delivery_date: Joi.date()
    .required()
    .min(new Date())
    .label("delivery_date"),
  shipping_date: Joi.date()
    .required()
    .min(new Date())
    .label("shipping_date"),
  out_for_delivery_date: Joi.date()
    .required()
    .min(new Date())
    .label("out_for_delivery_date"),
});

export const UpdateOrderStatusSchema = Joi.object({
  order_id: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("order id cannot be negative");
      }
      return value;
    })
    .required()
    .label("order id"),
  status: Joi.string()
    .trim()
    .valid(
      "outfordelivery",
      "new",
      "processing",
      "cancelled",
      "delivered",
      "return-failed",
      "return-success"
    )
    .required()
    .label("status"),
});

export const createPaymentIntentSchema = Joi.object({
  amount: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (parseFloat(value) < 0) {
        return helpers.message("amount cannot be negative");
      }
      return value;
    })
    .required()
    .label("amount"),
  currency: Joi.string()
    .trim()
    .required()
    .label("currency"),
});
