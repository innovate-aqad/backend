import express from "express";
import CategoryControllerObj from "../../controllers/category/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import ApiEndpointControllerObj from "../../controllers/admin/ApiEndpointController.js";

const ApiEndpointRoutes = express.Router();


ApiEndpointRoutes.post("/add",authorize, ApiEndpointControllerObj.add_endpoint);
ApiEndpointRoutes.get("/get", authorize,ApiEndpointControllerObj.get_All);

ApiEndpointRoutes.put("/status_edit",authorize, ApiEndpointControllerObj.edit_status);
ApiEndpointRoutes .delete("/delete",authorize, ApiEndpointControllerObj.deleteData);




// ApiEndpointRoutes.get("/get_active",authorize, ApiEndpointControllerObj.get_active);

export default ApiEndpointRoutes;
