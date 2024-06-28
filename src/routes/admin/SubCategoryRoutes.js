import express from "express";
import CategoryControllerObj from "../../controllers/admin/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import { educationImage, userImage } from "../../helpers/multer.js";
import { upload } from "../../helpers/s3.js";
import SubCategoryControllerObj from "../../controllers/admin/SubCategoryController.js";

const SubCategoryRoutes = express.Router();

SubCategoryRoutes.post("/add", SubCategoryControllerObj.add_sub_cat);
SubCategoryRoutes.put(
  "/edit_status_sub_cat",
  SubCategoryControllerObj.edit_status_sub_cat
);

SubCategoryRoutes.get("/get", SubCategoryControllerObj.get_cat);
SubCategoryRoutes.get(
  "/get_by_main_cat_id",
  SubCategoryControllerObj.get_by_main_cat_id
);

SubCategoryRoutes.delete("/delete", SubCategoryControllerObj.deleteData);

export default SubCategoryRoutes;
