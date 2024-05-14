import express from "express";
import CategoryControllerObj from "../../controllers/category/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import { educationImage, userImage } from "../../helpers/multer.js";
import { upload } from "../../helpers/s3.js";
import SubCategoryControllerObj from "../../controllers/admin/SubCategoryController.js";

const SubCategoryRoutes = express.Router();

SubCategoryRoutes .post("/add", SubCategoryControllerObj.add_sub_cat);
// SubCategoryRoutes .delete("/delete", SubCategoryControllerObj.deleteData);

export default SubCategoryRoutes ;
