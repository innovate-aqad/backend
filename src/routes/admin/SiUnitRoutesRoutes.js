import express from "express";
import { authorize } from "../../middlewares/auth.js";
import SiunitControllerObj from "../../controllers/admin/SiUnitController.js";

const SiUnitRoutes = express.Router();


SiUnitRoutes.post("/add",authorize, SiunitControllerObj.add_);
SiUnitRoutes.get("/get", authorize,SiunitControllerObj.get_All);

SiUnitRoutes.put("/status_edit",authorize, SiunitControllerObj.edit_status);
SiUnitRoutes .delete("/delete",authorize, SiunitControllerObj.deleteData);




// SiUnitRoutes.get("/get_active",authorize, ApiEndpointControllerObj.get_active);

export default SiUnitRoutes;
