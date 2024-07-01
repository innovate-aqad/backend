import express from "express";
import CategoryControllerObj from "../../controllers/admin/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import { educationImage, userImage } from "../../helpers/multer.js";
import { upload } from "../../helpers/s3.js";
import SubCategoryControllerObj from "../../controllers/admin/SubCategoryController.js";

const SubCategoryRoutes = express.Router();

SubCategoryRoutes.post("/add", authorize, SubCategoryControllerObj.add_sub_cat);
SubCategoryRoutes.put(
  "/edit_status_sub_cat",
  SubCategoryControllerObj.edit_status_sub_cat
);

SubCategoryRoutes.get("/get", authorize, SubCategoryControllerObj.get_cat);
SubCategoryRoutes.get(
  "/get_by_main_cat_id",
  authorize,
  SubCategoryControllerObj.get_by_main_cat_id
);

SubCategoryRoutes.delete(
  "/delete",
  authorize,
  SubCategoryControllerObj.deleteData
);

export default SubCategoryRoutes;
