import express from "express";
import { authorize } from "../../middlewares/auth.js";
import RolesControllerObj from "../../controllers/admin/RolesController.js";

const  RoleRoutes  = express.Router();

RoleRoutes.post("/add",authorize,RolesControllerObj.add_);
RoleRoutes.get("/get", authorize,RolesControllerObj.get_All);

RoleRoutes.put("/status_edit",authorize, RolesControllerObj.edit_status);
RoleRoutes .delete("/delete",authorize, RolesControllerObj.deleteData);

export default RoleRoutes;
