import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  updateUserSchema,
  loginSchema,
  otpSchema,
} from "../../helpers/validateUser.js";
import bcrypt from "bcrypt";
import UserServicesObj from "../../services/user/UserServices.js";
import jwt from "jsonwebtoken";
import { environmentVars } from "../../config/environmentVar.js";
import UserModel from "../../models/UserModel.js";
import { storeImageMetadata, uploadImageToS3 } from "../../helpers/s3.js";
import UploadsDocumentModel from "../../models/UploadsDocumentModel.js";
import docClient from "../../config/dbConfig.js";
import vendorOnBoardModel from "../../models/VendorOnBoard.js";
import { ImageFileCheck } from "../../helpers/validateImageFile.js";
import {
  CategorySchema,
  changeStatusSchema,
  deleteCategorySchema,
} from "../../helpers/validateCategory.js";
import CategoryServicesObj from "../../services/admin/CategoryServices.js";
// import axios from "axios";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

class CategoryController {
  async add_cat(req, res) {
    try {
      if (!req.body.id) {
        let { error } = CategorySchema.validate(req.body, options);
        if (error) {
          return res.status(400).json({
            message: error.details[0]?.message,
            success: false,
            statusCode: 400,
          });
        }
      }
      if (req.files && req.files?.category_image?.length) {
        for (let el of req.files?.category_image) {
          let name = el?.filename;
          let size = el?.size;
          let get = await ImageFileCheck(name, "category", size);
          if (get == "invalid file") {
            return res.status(400).json({
              message:
                "Image must be png or jpeg or webp file and size must be less than 500 kb",
              statusCode: 400,
              success: false,
            });
          } else {
            // uploadImageToS3(name, el?.path);
          }
        }
      }
      await CategoryServicesObj.add(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async get_cat(req, res) {
    try {
      // let { error } = CategorySchema.validate(req.body, options);
      // if (error) {
      //   return res.status(400).json({
      //     message: error.details[0]?.message,
      //     success: false,
      //     statusCode: 400,
      //   });
      // }

      await CategoryServicesObj.get_cat_data(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async editStatus(req, res) {
    try {
      let { error } = changeStatusSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }

      await CategoryServicesObj.changeStatus(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async deleteData(req, res) {
    try {
      let { error } = deleteCategorySchema.validate(req.query, options);
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

const CategoryControllerObj = new CategoryController();
export default CategoryControllerObj;
