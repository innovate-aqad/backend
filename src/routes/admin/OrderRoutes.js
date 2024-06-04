import express from "express";
import CategoryControllerObj from "../../controllers/category/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import { upload } from "../../helpers/s3.js";
import OrderControllerObj from "../../controllers/admin/OrderController.js";

const OrderRoutes = express.Router();

OrderRoutes.post("/add", authorize, OrderControllerObj.create_order);
OrderRoutes.put("/edit_status", authorize, OrderControllerObj.edit_status_);

OrderRoutes.get("/get", OrderControllerObj.get_);
OrderRoutes.get("/get_by_main_cat_id", OrderControllerObj.get_by_main_cat_id);

OrderRoutes.delete("/delete", authorize, OrderControllerObj.deleteData);

export default OrderRoutes;
