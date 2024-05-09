import express from "express";
import CategoryControllerObj from "../../controllers/category/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import { educationImage, userImage } from "../../helpers/multer.js";
import { upload } from "../../helpers/s3.js";

const CategoryRoutes = express.Router();

CategoryRoutes.post("/add", CategoryControllerObj.add_cat);
CategoryRoutes.delete("/delete", CategoryControllerObj.deleteData);

export default CategoryRoutes ;
