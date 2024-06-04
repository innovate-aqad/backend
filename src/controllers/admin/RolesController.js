import {
  SubCategoryStatusSchema,
  deleteSubCategorySchema,
} from "../../helpers/validateSubCategory.js";
import {
  ApiEndpointSchema,
  ChangeStatusSchema,
} from "../../helpers/validateApiEndpoint.js";
import ApiEndpointServicesObj from "../../services/admin/ApiEndpointServices.js";
import {
  addPermissionModuleSchema,
  deletePermmissionSchema,
} from "../../helpers/validatePermissionModule.js";
import PermissionServicesObj from "../../services/admin/PermissionServices.js";
import RoleServicesObj from "../../services/admin/RoleServices.js";
import { addRoleSchema, deleteRoleSchema, editRoleSchema } from "../../helpers/validateRole.js";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};
//
class RolesController {
  async add_(req, res) {
    try {
      // console.log(req.body, "req.# !@#!@# ")
      let { error } = addRoleSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
      await RoleServicesObj.addData(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
  async get_All(req, res) {
    try {
      await RoleServicesObj.getAllData(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async edit_status(req, res) {
    try {
      // console.log(req.body, "req.bod yy!@#!@# !# ")
      let { error } = editRoleSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }

      await RoleServicesObj.changeStatus(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  // async get_active(req, res) {
  //   try {
  //     await RoleServicesObj.getActiveData(req, res);
  //   } catch (err) {
  //     return res
  //       .status(500)
  //       .json({ message: err?.message, success: false, statusCode: 500 });
  //   }
  // }

  async deleteData(req, res) {
    try {
      let { error } = deleteRoleSchema.validate(req.query, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
      await RoleServicesObj.deleteById(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
}

const RolesControllerObj = new RolesController();
export default RolesControllerObj;
