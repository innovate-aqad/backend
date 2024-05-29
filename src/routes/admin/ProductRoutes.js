import express from "express";
import CategoryControllerObj from "../../controllers/category/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import { educationImage, userImage } from "../../helpers/multer.js";
import ProductControllerObj from "../../controllers/admin/ProductController.js";
import { uploadProduct } from "../../helpers/s3.js";

const ProductRoutes = express.Router();

ProductRoutes.post("/add", authorize, ProductControllerObj.addProduct);//ain product
ProductRoutes.get("/get", authorize, ProductControllerObj.get_data);
ProductRoutes.delete(
  "/delete_product",
  authorize,
  ProductControllerObj.delete_product
);

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

//

// ProductRoutes.delete("/delete", ProductControllerObj.deleteData);

export default ProductRoutes;
