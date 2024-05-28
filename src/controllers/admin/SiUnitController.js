import { CategorySchema, deleteCategorySchema } from "../../helpers/validateCategory.js";
import { SubCategoryStatusSchema, deleteSubCategorySchema } from "../../helpers/validateSubCategory.js";
import { ApiEndpointSchema, ChangeStatusSchema } from "../../helpers/validateApiEndpoint.js";
import ApiEndpointServicesObj from "../../services/admin/ApiEndpointServices.js";
import { ChangeStatusSiUnitSchema, DeleteSiUnitSchema, SiUnitSchema } from "../../helpers/validateSiUnit.js";
import SiUnitServicesObj from "../../services/admin/SiUnitServices.js";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

class SiunitController {
  async add_(req, res) {
    try {
      
// ChangeStatusSchema
      // console.log(req.body, "req.# !@#!@# ")
      let { error } = SiUnitSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }

      await SiUnitServicesObj.addData(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
      }
    }
    
    async get_All(req, res) {
      try {
        await SiUnitServicesObj.getAllData(req, res);
      } catch (err) {
        return res
          .status(500)
          .json({ message: err?.message, success: false, statusCode: 500 });
      }
    }
    
  async edit_status(req, res) {
    try {
      let { error } = ChangeStatusSiUnitSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
      await SiUnitServicesObj.changeStatus(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async get_active(req, res) {
    try {
      await SiUnitServicesObj.getActiveData(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async deleteData(req, res) {
    try {
      let { error } = DeleteSiUnitSchema.validate(req.query, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
      await SiUnitServicesObj.deleteById(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

}

const SiunitControllerObj = new SiunitController ();
export default SiunitControllerObj ;
