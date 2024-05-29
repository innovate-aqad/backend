import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  updateUserSchema,
  loginSchema,
  otpSchema,
  getDataByEmailSchema,
  VerifyEmailWithOtpSchema,
  loginWithOtpSchema,
  AddSubUserSchema,
  GetSubUserSchema,
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
import { addProductVariantschema, addProductchema } from "../../helpers/validateProduct.js";
import ProductServicesServicesObj from "../../services/admin/ProductServices.js";
import ProductServicesObj from "../../services/admin/ProductServices.js";
// import axios from "axios";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

class ProductController {
  async addProduct(req, res) {
    try {
      const { id } = req.body;
      // console.log(req.body, "req.bodyyyyyyyy =", req.userData, "req.userdata  AAA  TT ");
      if (req.userData?.user_type != 'vendor' && req.userData?.user_type != 'super_admin' && req.userData?.user_type != 'employee') {
        return res.status(400).json({ message: "Not authorise to add product", statusCode: 400, success: false })
      }
      if (!id) {
        let { error } = addProductchema.validate(req.body, options);
        if (error) {
          return res.status(400).json({
            message: error.details[0]?.message,
            success: false,
            statusCode: 400,
          });
        }
      }
      await ProductServicesObj.add(req, res);
    } catch (err) {
      console.error(err, "errrrrrrrrr");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }


  async addProductVariants(req, res) {
    try {
      const { id } = req.body;
      // console.log(req.body, "req.bodyyyyyyyy =", req.userData, "req.userdata  AAA  TT ");
      if (req.userData?.user_type != 'vendor' && req.userData?.user_type != 'super_admin' && req.userData?.user_type != 'employee') {
        return res.status(400).json({ message: "Not auithorise to add product", statusCode: 400, success: false })
      }
      if (!id) {
        let { error } = addProductVariantschema.validate(req.body, options);
        if (error) {
          return res.status(400).json({
            message: error.details[0]?.message,
            success: false,
            statusCode: 400,
          });
        }
      }
      if (req.files && req.files?.product_images_arr?.length) {
        for (let el of req.files?.product_images_arr) {
          let name = el?.filename;
          let size = el?.size;
          let get = await ImageFileCheck(name, "product_add", size);
          if (get == "invalid file") {
            return res.status(400).json({
              message:
                "Image must be png or jpeg or webp file and size must be less than 500 kb",
              statusCode: 400,
              success: false,
            });
          } else {
            // uploadImageToS3(name, el?.path);////
          }
        }
      } else {
        if (!id) {
          return res.status(400).json({
            message: "Atleast one Product_images_arr is required",
            statusCode: 400,
            success: false,
          });
        }
      }
      await ProductServicesObj.add_variant_data(req, res);
    } catch (err) {
      console.error(err, "errrrrrrrrr");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }







  async get_data(req, res) {
    try {
      await ProductServicesObj.get_dataOf(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }











  async delete_product(req, res) {
    try {
      // let { error } = GetSubUserSchema.validate(req.body, options);
      // if (error) {
      //   return res.status(400).json({
      //     message: error.details[0]?.message,
      //     success: false,
      //     statusCode: 400,
      //   });
      // }
      await ProductServicesObj.delete(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, status: false, statusCode: 500 });
    }
  }



  async add(req, res) {
    try {
      if (!req.body.id) {
        let { error } = addEducationInfochema.validate(req?.body, options);
        if (error) {
          return res
            .status(400)
            .json({ message: error.details[0]?.message, success: false });
        }
      }
      if (req.file && req.file?.filename) {
        let name = req.file?.filename;
        let size = req.files?.size;
        let data = "educationInfo";
        let get = await ImageFileCheck(name, data, size);
        if (get == "invalid file") {
          return res.status(400).json({
            message:
              "Id card image must be png or jpeg or webp file and size must be less than 500 kb",
            statusCode: 400,
            success: false,
          });
        }
      }
      EducationServiceObj.addData(req, res);
    } catch (err) {
      console.log(err, "Error ");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  // my code line locally store image
  async userUploadImage(req, res) {
    try {
      if (!req.body.id) {
        let { error } = addEducationInfochema.validate(req?.body, options);
        if (error) {
          return res
            .status(400)
            .json({ message: error.details[0]?.message, success: false });
        }
      }
      if (req.file && req.file?.filename) {
        let name = req.file?.filename;
        let size = req.files?.size;
        let data = "educationInfo";
        let get = await ImageFileCheck(name, data, size);
        if (get == "invalid file") {
          return res.status(400).json({
            message:
              "Id card image must be png or jpeg or webp file and size must be less than 500 kb",
            statusCode: 400,
            success: false,
          });
        }
      }
      EducationServiceObj.addData(req, res);
    } catch (err) {
      console.log(err, "Error ");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  // s3 bucket file upload start

  async uploadImageS3Bucket(req, res) {
    try {
      const fileName = req.file.originalname;
      const filePath = req.file.path;

      const imageUrl = await uploadImageToS3(fileName, filePath);
      // await storeImageMetadata(fileName, imageUrl);

      res.status(200).json({
        message: "File uploaded successfully",
        image: imageUrl,
        status: 201,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error uploading file",
        error: err.message,
        status: 404,
      });
    }
  }

  // email send

  async sendEmailUserToAnother(req, res) {
    try {
      let { error } = forgotPasswordSchema.validate(req?.body, options);

      if (error) {
        return res
          .status(400)
          .json({ message: error.details[0]?.message, success: false });
      }
      UserServicesObj.sendEmailUserToAnother(req, res);
    } catch (err) {
      // console.log(err, "error user contrl");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  // Customer API

  async customerAddNew(req, res) {
    console.log(req, "res==============>");
    try {
      let { error } = registerSchema.validate(req?.body, options);

      if (error) {
        if (error?.details[0]?.message?.includes("Phone")) {
          return res.status(400).json({
            message: "Invalid phone number",
            success: false,
            statusCode: 400,
          });
        } else {
          return res.status(400).json({
            message: error.details[0]?.message,
            success: false,
            statusCode: 400,
          });
        }
      }
      // Check if 'name' field exists and is not empty or only whitespace
      if (!req.body.name || req.body.name.trim() === "") {
        return res.status(400).json({
          message: "Name is required",
          success: false,
          statusCode: 400,
        });
      }
      await UserServicesObj.createUser(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async getUserAccountInfo(req, res) {
    UserServicesObj.getUserAccountInfo(req, res);
  }

  // uploaded document api
  async uploadsDocument(req, res) {
    try {
      const fileName = req.file.originalname;
      const filePath = req.file.path;
      const typeOfUser = req.body.typeOfUser;
      const typeOfDocument = req.body.typeOfDocument;
      const nameOfDocument = req.body.nameOfDocument;
      const id = req.body.id;

      const imageUrl = await uploadImageToS3(fileName, filePath);
      // await storeImageMetadata(fileName, imageUrl);

      const params = {
        TableName: "documents",
        Item: {
          id: parseInt(id),
          typeOfUser: typeOfUser,
          typeOfDocument: typeOfDocument,
          nameOfDocument: nameOfDocument,
          choose_documents: imageUrl,
        },
      };

      docClient.put(params, (err, data) => {
        if (err) {
          console.error("Error inserting item:", err);
        } else {
          console.log("Successfully inserted item:", data);
        }
      });
      // UploadsDocumentModel
      const documentsData = await UploadsDocumentModel.create(params, {
        raw: true,
      });
      // console.log(documentsData, "success");
      res.json({
        message: "documents uploaded successfully",
        data: documentsData,
        status: 200,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error uploading documents",
        error: err.message,
        status: 404,
      });
    }
  }

  // vendor on boarding Api
  async vendorOnBoarding(req, res) {
    try {
      const companyName = req.body.companyName;
      const contactPerson = req.body.contactPerson;
      const roleOfPerson = req.body.roleOfPerson;
      const emailAddress = req.body.emailAddress;
      const contactNumber = req.body.contactNumber;
      const BusinessAddress = req.body.BusinessAddress;
      const id = req.body.id;

      const params = {
        TableName: "vendorOnBoard",
        Item: {
          id: parseInt(id),
          companyName: companyName,
          contactPerson: contactPerson,
          roleOfPerson: roleOfPerson,
          emailAddress: emailAddress,
          contactNumber: contactNumber,
          BusinessAddress: BusinessAddress,
        },
      };

      console.log(params, "paramsparams");

      docClient.put(params, (err, data) => {
        if (err) {
          console.error("Error inserting item:", err);
        } else {
          console.log("Successfully inserted item:", data);
        }
      });

      console.log("llllllllllllllllllll====>");
      // UploadsDocumentModel
      const vendorOnBoardData = await vendorOnBoardModel.create(params, {
        raw: true,
      });
      res.json({
        message: "Vendor On Board successfully",
        data: vendorOnBoardData,
        status: 200,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error Vendor On Board",
        error: err.message,
        status: 404,
      });
    }
  }
}

const ProductControllerObj = new ProductController();
export default ProductControllerObj;
