import express from "express";
import CategoryControllerObj from "../../controllers/category/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import { educationImage, userImage } from "../../helpers/multer.js";
import { upload } from "../../helpers/s3.js";

const CategoryRoutes = express.Router();

CategoryRoutes.post("/add",/*authorize,*/ CategoryControllerObj.add_cat);
CategoryRoutes.get("/get",/*authorize,*/ CategoryControllerObj.get_cat);
CategoryRoutes.put("/edit_status",/*authorize,*/ CategoryControllerObj.editStatus);
CategoryRoutes.delete("/delete", CategoryControllerObj.deleteData);

export default CategoryRoutes ;
