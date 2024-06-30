import express from "express";
import CategoryControllerObj from "../../controllers/admin/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import { upload } from "../../helpers/s3.js";
import BrandControllerObj from "../../controllers/admin/BrandController.js";

const BrandRoutes = express.Router();

BrandRoutes.post("/add", /*authorize,*/  BrandControllerObj.add_);
BrandRoutes.put("/edit_status", /*authorize,*/  BrandControllerObj.edit_status_);

BrandRoutes.get("/get", BrandControllerObj.get_);
BrandRoutes.get("/get_by_main_cat_id", BrandControllerObj.get_by_main_cat_id);

BrandRoutes.delete("/delete", /*authorize,*/  BrandControllerObj.deleteData);

export default BrandRoutes;
