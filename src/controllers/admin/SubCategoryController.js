import jwt from "jsonwebtoken";
import { storeImageMetadata, uploadImageToS3 } from "../../helpers/s3.js";
import UploadsDocumentModel from "../../models/UploadsDocumentModel.js";
import docClient from "../../config/dbConfig.js";
import { ImageFileCheck } from "../../helpers/validateImageFile.js";
import { CategorySchema, deleteCategorySchema } from "../../helpers/validateCategory.js";
import CategoryServicesObj from "../../services/admin/CategoryServices.js";
import { SubCategorySchema, SubCategoryStatusSchema, deleteSubCategorySchema } from "../../helpers/validateSubCategory.js";
import SubCategoryServicesObj from "../../services/admin/SubCategoryServices.js";
// import axios from "axios";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

class SubCategoryController {
  
  async add_sub_cat(req, res) {
    try {
      console.log(req.body, "req.bodyyyyyy!@#!@# !@#!@# ")
      let { error } = SubCategorySchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }

      await SubCategoryServicesObj.add(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }



  async edit_status_sub_cat(req, res) {
    try {
      console.log(req.body, "req.bodyyyyyy!@#!@# !@#!@# ")
      let { error } = SubCategoryStatusSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }

      await SubCategoryServicesObj.change_status(req, res);
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

      await CategoryServicesObj.delete(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

}

const SubCategoryControllerObj = new SubCategoryController();
export default SubCategoryControllerObj;
