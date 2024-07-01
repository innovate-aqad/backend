import Joi from "joi";

export const addProductchema = Joi.object({
  universal_standard_code: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .required()
    .label("universal_standard_code"),
  title: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .required()
    .label("title"),
  summary: Joi.string().min(10).max(1000).trim().label("Summary"),
  brand_id: Joi.string().max(90).trim().required().label("brand_id"),
  description: Joi.string()
    .min(10)
    .max(3000)
    .trim()
    .required()
    .label("description"),
  category_id: Joi.string().trim().required().label("category_id"),
  sub_category_id: Joi.string().trim().required().label("sub_category_id"),
  condition:Joi.string().allow("",null).valid("top_sales",'features','popular'),
  shape_id: Joi.string()
    .trim()
    // .required()
    .label("shape"),
  material_id: Joi.string()
    .trim()
    // .required()
    .label("material_id"),
  gender: Joi.array()
    .items(Joi.string().trim())
    // .required()
    .label("Gender"),
  weight_group_id: Joi.string().trim(),
  // .required(),
  size_id: Joi.string().trim(),
  // .required(),
});

export const addProductVariantschema = Joi.object({
  title: Joi.string().min(3).max(50).trim().optional().allow("",null).label("title"),
  product_id: Joi.string().min(3).max(50).trim().required().label("product_id"),
  sku: Joi.string().min(3).max(50).required().label("sku"),
  variation: Joi.string().min(1).max(60).required().label("variation"),
  input_field: Joi.number().min(1).max(60).required().label("input_field"),
  // product_id: Joi.string().min(3).max(50).required().label("product_id"),
  price: Joi.number().positive().required().label("price"),
  // quantity: Joi.number().positive().required().label("quantity"),
  compare_price_at: Joi.number()
    .positive()
    .required()
    .label("compare_price_at"),
    warehouse_arr: Joi.array().items(
      Joi.object({
        // address: Joi.string().required().label("address"),
        quantity: Joi.string().required().label("quantity"),
        po_box: Joi.string().allow("", null).label("po_box"),
      })
    ).min(1).required().label("warehouse_arr"),
  country_code: Joi.string().min(3).max(10)
  // .required()
  .allow("",null)
  .label("country_code"),
  currency: Joi.string().min(3).max(10)
  // .required()
  .allow("",null).label("currency"),
});

export const editProductchema = Joi.object({
  title: Joi.string().min(3).max(50).trim().label("Title"),
  sku: Joi.string().trim().label("sku"),
  summary: Joi.string().min(10).max(125).trim().label("Summary"),
  product_id: Joi.string().trim().required().label("product_id"),
  description: Joi.string().min(10).max(325).trim().label("description"),
  gender: Joi.array().items(Joi.string().trim()).label("Gender"),
});

export const addProductVariantchema = Joi.object({
  product_id: Joi.string().required().label("Product id"),
  color_id: Joi.string().required().label("color id"),
});

export const deleteVariantImagechema = Joi.object({
  product_id: Joi.string().max(50).required().label("Product id"),
  variant_id: Joi.string().max(50).required().label("variant_id"),
  image: Joi.string().max(200) .required().label("image_name"),
});

export const getProductByIdchema = Joi.object({
  product_id: Joi.string().max(90).required().label("Product id"),
});

export const getProducttByCategoryIdchema = Joi.object({
  category_id: Joi.string().max(90).required().label("Category id"),
});

export const getProductAndVariantByIdchema = Joi.object({
  product_id: Joi.string().max(90).required().label("Product id"),
  variant_id: Joi.string().max(90).required().label("variant id"),
});

export const editProductVariantchema = Joi.object({
  variant_id: Joi.string().required().label("variant_id"),
});

export const addProductVariantImageschema = Joi.object({
  product_id: Joi.string().required().label("Product id"),
  variant_id: Joi.string().required().label("Variant id"),
});

export const editProductVariantImageschema = Joi.object({
  variantImageName: Joi.string().required().label("varaintImageName"),
  variant_id: Joi.string().required().label("Variant id"),
});

export const addProductVariantStockschema = Joi.object({
  // product_id: Joi.string()
  //   .required()
  //   .label("product_id"),
  variant_id: Joi.string().required().label("variant_id"),
  country_code: Joi.string().required().label("country_code"),
  stock: Joi.number()
    .required()
    .custom((value, helpers) => {
      if (value <= 0) {
        return helpers.message("Stock cannot be negative or zero");
      }
      return value;
    })
    .label("stock"),
});

export const addProductCountryschema = Joi.object({
  variant_id: Joi.string().required().label("variant_id"),
  country_code: Joi.string().required().label("country_code"),
  price: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (value <= 0) {
        return helpers.message("Price cannot be negative or zero");
      }
      return value;
    })
    .label("price"),
  purchase_price: Joi.string()
    // .required()
    .custom((value, helpers) => {
      if (value <= 0) {
        return helpers.message("Purchase price cannot be negative or zero");
      }
      return value;
    })
    .label("purchase_price"),
  // country: Joi.string()
  //   // .required()
  //   .label("country"),
  discount: Joi.number()
    .required()
    .custom((value, helpers) => {
      if (value <= 0) {
        return helpers.message("Disocunt cannot be negative or zero");
      }
      return value;
    })
    .label("discount"),
  // currency_symbol: Joi.string()
  //   // .required()
  //   .label("currency_symbol"),
  status: Joi.string().valid("active", "inactive").label("status"),
  stock: Joi.number()
    .required()
    .custom((value, helpers) => {
      if (value <= 0) {
        return helpers.message("Stock cannot be negative or zero");
      }
      return value;
    })
    .label("stock"),
});

export const addProductCountryOnlyschema = Joi.object({
  variant_id: Joi.string().required().label("variant_id"),
  country_data: Joi.array()
    .items(
      Joi.object({
        country_code: Joi.string().required().label("country_code"),
        country: Joi.string().required().label("country"),
        currency_symbol: Joi.string().required().label("currency_symbol"),
        status: Joi.string().valid("active", "inactive").label("status"),
      })
    )
    .min(1)
    .required()
    .label("country_details"),
});

export const editVariantCountryStatusschema = Joi.object({
  variant_id: Joi.string().required().label("variant_id"),
  country_code: Joi.string().required().label("country_code"),
  status: Joi.string().valid("active", "inactive").label("status"),
});
