import Joi from "joi";

// export const CategorySchema = Joi.object({
//   title: Joi.string()
//     .min(3)
//     .max(50)
//     .trim()
//     .required()
//     .label("title"),
//   value: Joi.string()
//     .min(3)
//     .max(150)
//     .trim()
//     // .required()
//     .label("summary"),
// });

// export const CategorySchema = Joi.object({
//   data: Joi.array()
//     .items(
//       Joi.object({
//         mainTitle: Joi.string()
//           .valid(
//             "categories",
//             "weight_group",
//             "size",
//             "material",
//             "gender",
//             "shape",
//             "color",
//             "price_range"
//           )
//           .trim()
//           .required()
//           .label("mainTitle"),
//         value: Joi.when("title", {
//           is: Joi.not("price_range"),
//           then: Joi.string()
//             .min(3)
//             .max(150)
//             .trim()
//             .required()
//             .label("value"),
//           otherwise: Joi.string()
//             .min(3)
//             .max(150)
//             .trim()
//             .allow("")
//             .label("value"),
//         }),
//         status: Joi.string()
//           .trim()
//           .required()
//           .label("status"),
//         min: Joi.when("title", {
//           is: "price_range",
//           then: Joi.string()
//             .required()
//             .label("min"),
//           otherwise: Joi.forbidden(),
//         }),
//         max: Joi.when("title", {
//           is: "price_range",
//           then: Joi.string()
//             .optional()
//             .label("max"),
//           otherwise: Joi.forbidden(),
//         }),
//         // price_range: Joi.when("title", {
//         //   is: "price_range",
//         //   then: Joi.object({
//         //     min: Joi.number()
//         //       .required()
//         //       .label("min"),
//         //     max: Joi.number()
//         //       .optional()
//         //       .label("max"),
//         //   })
//         //     .required()
//         //     .label("price_range, min"),
//         //   otherwise: Joi.forbidden(),
//         // }),
//       })
//     )
//     .min(1)
//     .required()
//     .label("data"),
// });

export const CategorySchema = Joi.object({
  mainTitle: Joi.string()
    .valid(
      "categories",
      "weight_group",
      "size",
      "material",
      "gender",
      "shape",
      "color",
      "price_range"
    )
    .trim()
    .required()
    .label("mainTitle"),
  value: Joi.when("mainTitle", {
    is: Joi.not("price_range"),
    then: Joi.string()
      .min(1)
      .max(150)
      .trim()
      .required()
      .label("value"),
    otherwise: Joi.string()
      .min(3)
      .max(150)
      .trim()
      .allow("")
      .label("value"),
  }),
  status: Joi.string()
    .trim()
    .required()
    .label("status"),
  min: Joi.when("mainTitle", {
    is: "price_range",
    then: Joi.string()
      .required()
      .label("min"),
    otherwise: Joi.forbidden(),
  }),
  max: Joi.when("mainTitle", {
    is: "price_range",
    then: Joi.string()
      .optional()
      .label("max"),
    otherwise: Joi.forbidden(),
  }),
});



export const onlyCategorySchema = Joi.object({
  title: Joi.string()
    .trim()
    .required()
    .label("title"),
  slug: Joi.string()
    .trim()
    .required()
    .label("slug"),
  value: Joi.when("title", {
    is: Joi.not("price_range"),
    then: Joi.string()
      .min(3)
      .max(150)
      .trim()
      .required()
      .label("value"),
    otherwise: Joi.string()
      .min(3)
      .max(150)
      .trim()
      .allow("")
      .label("value"),
  }),
  status: Joi.string()
    .trim()
    .required()
    .label("status"),
});

export const onlyGenderSchema = Joi.object({
  value: Joi.string()
    .trim()
    .required()
    .label("value"),
  status: Joi.string()
    .trim()
    .required()
    .label("status"),
});

export const CategoryStatusChangeSchema = Joi.object({
  title: Joi.string()
    .valid(
      "categories",
      "weight_group",
      "size",
      "material",
      "gender",
      "shape",
      "color",
      "price_range"
    )
    .required()
    .trim()
    .label("title"),

  value: Joi.string()
    .trim()
    .label("value"),

  status: Joi.string()
    .valid("active", "inactive")
    .trim()
    .required()
    .label("status"),
  id: Joi.string()
    .required()
    .label("id"),
  min: Joi.when("title", {
    is: "price_range",
    then: Joi.number()
      .required()
      .label("min"),
    otherwise: Joi.forbidden(),
  }),

  max: Joi.when("title", {
    is: "price_range",
    then: Joi.number()
      .required()
      .label("max"),
    otherwise: Joi.forbidden(),
  }),
});

export const CategoryEditSchema = Joi.object({
  id: Joi.string()
    .required()
    .label("category id"),
  title: Joi.string()
    .valid(
      "categories",
      "weight_group",
      "size",
      "material",
      "gender",
      "shape",
      "color",
      "price_range"
    )
    .trim()
    .required()
    .label("title"),

  summary: Joi.string()
    .min(3)
    .max(150)
    .trim()
    .when(Joi.ref("$data"), {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .label("summary"),
});

export const CategoryDeletedSchema = Joi.object({
  id: Joi.string()
    .required()
    .label("id"),
  title: Joi.string()
    .valid(
      "categories",
      "weight_group",
      "size",
      "material",
      "gender",
      "shape",
      "color",
      "price_range"
    )
    .trim()
    .required()
    .label("title"),
});
