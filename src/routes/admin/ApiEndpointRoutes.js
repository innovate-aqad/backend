import express from "express";
import CategoryControllerObj from "../../controllers/category/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import ApiEndpointControllerObj from "../../controllers/admin/ApiEndpointController.js";

const ApiEndpointRoutes = express.Router();


ApiEndpointRoutes.post("/add",authorize, ApiEndpointControllerObj.add_endpoint);
ApiEndpointRoutes.put("/edit_status_sub_cat",authorize, ApiEndpointControllerObj.edit_status);

ApiEndpointRoutes.get("/get_active",authorize, ApiEndpointControllerObj.get_active);
ApiEndpointRoutes.get("/get_All", authorize,ApiEndpointControllerObj.get_All);


ApiEndpointRoutes .delete("/deleteData",authorize, ApiEndpointControllerObj.deleteData);

export default ApiEndpointRoutes;
