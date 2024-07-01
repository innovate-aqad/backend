import express from "express";
import CategoryControllerObj from "../../controllers/admin/CategoryController.js";
import { authorize } from "../../middlewares/auth.js";
import ApiEndpointControllerObj from "../../controllers/admin/ApiEndpointController.js";
import PermissionControllerObj from "../../controllers/admin/PermissionController.js";

const PermissionRoutes = express.Router();

PermissionRoutes.post("/add", 
 // authorize,
   PermissionControllerObj.add_endpoint);
PermissionRoutes.get("/get", 
  //authorize,
   PermissionControllerObj.get_All);

PermissionRoutes.put(
  "/status_edit",
  //authorize,
  PermissionControllerObj.edit_status
);
PermissionRoutes.delete(
  "/delete",
//authorize,
  PermissionControllerObj.deleteData
);

export default PermissionRoutes;
