import { SubCategoryStatusSchema, deleteSubCategorySchema } from "../../helpers/validateSubCategory.js";
import { ApiEndpointSchema, ChangeStatusSchema } from "../../helpers/validateApiEndpoint.js";
import ApiEndpointServicesObj from "../../services/admin/ApiEndpointServices.js";
import { addPermissionModuleSchema, deletePermmissionSchema } from "../../helpers/validatePermissionModule.js";
import PermissionServicesObj from "../../services/admin/PermissionServices.js";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

class PermissionController {
  async add_endpoint(req, res) {
    try {
      // console.log(req.body, "req.# !@#!@# ")
      let { error } = addPermissionModuleSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }

      await PermissionServicesObj.addData(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
      }
    }
    
    async get_All(req, res) {
      try {
        await PermissionServicesObj.getAllData(req, res);
      } catch (err) {
        return res
          .status(500)
          .json({ message: err?.message, success: false, statusCode: 500 });
      }
    }
    
  async edit_status(req, res) {
    try {
      console.log(req.body, "req.bod yy!@#!@# !# ")
      let { error } = ChangeStatusSchema.validate(req.body, options);
      if (error) {
        console.log(error,"message")
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
    
      await PermissionServicesObj.changestatus(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async get_active(req, res) {
    try {
      await PermissionServicesObj.getActiveData(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async deleteData(req, res) {
    try {
      let { error } = deletePermmissionSchema.validate(req.query, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
      await PermissionServicesObj.deleteEndpointById(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

}

const PermissionControllerObj = new PermissionController();
export default PermissionControllerObj ;
