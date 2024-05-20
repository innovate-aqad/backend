import express from "express";
import CategoryControllerObj from "../../controllers/category/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import { educationImage, userImage } from "../../helpers/multer.js";
import ProductControllerObj from "../../controllers/admin/ProductController.js";
import { uploadProduct } from "../../helpers/s3.js";

const ProductRoutes = express.Router();

ProductRoutes.post("/add", uploadProduct.fields([
    {
        name: "product_image",
        maxCount: 1,
    },
    {
        name: "product_images_arr",
        maxCount: 5,
    },
]), ProductControllerObj.addProduct);


// ProductRoutes.put("/edit_status_sub_cat", ProductControllerObj.edit_status_sub_cat);

// ProductRoutes.get("/get", ProductControllerObj.get_cat);
// 

// ProductRoutes.delete("/delete", ProductControllerObj.deleteData);

export default ProductRoutes;
