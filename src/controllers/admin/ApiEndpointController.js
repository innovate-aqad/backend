import jwt from "jsonwebtoken";
import { storeImageMetadata, uploadImageToS3 } from "../../helpers/s3.js";
import UploadsDocumentModel from "../../models/UploadsDocumentModel.js";
import docClient from "../../config/dbConfig.js";
import { ImageFileCheck } from "../../helpers/validateImageFile.js";
import { CategorySchema, deleteCategorySchema } from "../../helpers/validateCategory.js";
import { SubCategoryStatusSchema, deleteSubCategorySchema } from "../../helpers/validateSubCategory.js";
import SubCategoryServicesObj from "../../services/admin/SubCategoryServices.js";
import { ApiEndpointSchema, ChangeStatusSchema } from "../../helpers/validateApiEndpoint.js";
import ApiEndpointServicesObj from "../../services/admin/ApiEndpointServices.js";
// import axios from "axios";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

class ApiEndpointController {
  async add_endpoint(req, res) {
    try {
      // console.log(req.body, "req.# !@#!@# ")
      let { error } = ApiEndpointSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }

      await ApiEndpointServicesObj.addData(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
      }
    }
    
    async get_All(req, res) {
      try {
        await ApiEndpointServicesObj.getAllData(req, res);
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
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }

      await ApiEndpointServicesObj.changeStatus(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async get_active(req, res) {
    try {
      await ApiEndpointServicesObj.getActiveData(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async deleteData(req, res) {
    try {
      let { error } = deleteSubCategorySchema.validate(req.query, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
      await ApiEndpointServicesObj.deleteEndpointById(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

}

const ApiEndpointControllerObj = new ApiEndpointController();
export default ApiEndpointControllerObj;
