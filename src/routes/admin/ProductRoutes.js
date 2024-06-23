import express from "express";
import CategoryControllerObj from "../../controllers/category/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import { educationImage, userImage } from "../../helpers/multer.js";
import ProductControllerObj from "../../controllers/admin/ProductController.js";
import { uploadProduct } from "../../helpers/s3.js";

const ProductRoutes = express.Router();

ProductRoutes.post("/add", authorize, ProductControllerObj.addProduct);//main product
ProductRoutes.get("/get", authorize, ProductControllerObj.get_data);
ProductRoutes.get("/get_by_id", authorize, ProductControllerObj.get_data_by_id);
ProductRoutes.get("/get_product_by_cat_id", authorize, ProductControllerObj.get_product_by_cat_id);
ProductRoutes.get("/get_specific_data", authorize, ProductControllerObj.get_data_specific_only);
ProductRoutes.get("/get_cateory_product_count", authorize, ProductControllerObj.get_cateory_product_count);
ProductRoutes.delete(
  "/delete_product",
  authorize,
  ProductControllerObj.delete_product
  );
//VARIANT API'S
ProductRoutes.post(
  "/add_product_variant",
  authorize,
  uploadProduct.fields([
    {
      name: "product_images_arr",
      maxCount: 10,
    },
  ]),
  ProductControllerObj.addProductVariants
);

ProductRoutes.get("/get_variant_by_id", authorize, ProductControllerObj.get_variant_data_by_id);

ProductRoutes.delete(
  "/delete_product_variant",
  authorize,
  ProductControllerObj.delete_product_variant
);

ProductRoutes.delete(
  "/delete_variant_image",
  authorize,
  ProductControllerObj.delete_variant_image
);


// ProductRoutes.delete("/delete", ProductControllerObj.deleteData);

export default ProductRoutes;
