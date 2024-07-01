import UserModel from "../../models/UserModel.js";
import bcrypt from "bcrypt";
import {
  sendPasswordViaEmail,
  forgotPasswordEmail,
  encryptStringWithKey,
  sendEmailUser,
} from "../../helpers/common.js";
import { environmentVars } from "../../config/environmentVar.js";
import { generateAccessToken } from "../../helpers/validateUser.js";
import jwt from "jsonwebtoken";
import Sequence from "../../models/SequenceModel.js";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  DeleteItemCommand,
  BatchGetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

import {
  forgotPasswordSendOtp,
  pinePointServices,
  sendEmailOtp,
  sendOtpForLogin,
  sendPasswordViaEmailOf,
} from "../../helpers/aswSesServices.js";
import { generateOTP } from "../../helpers/generateOtp.js";
import {
  deleteImageFRomLocal,
  deleteImageFromS3,
  uploadImageToS3,
} from "../../helpers/s3.js";
import { removefIle } from "../../helpers/validateImageFile.js";
import {
  del_image_local_and_s3_and_upload_image,
  simplifyDynamoDBResponse,
} from "../../helpers/datafetch.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import generatePassword from 'generate-password';
import { signup, signin, confirmUser, resendOTP, getUserStatus, updatePassword, confirmUserByEmail } from "../../services/cognito/cognito.js";
import User from "../../models/UserModel.js";
import UserOtp from "../../models/UserOtpModel.js";
// const dynamoDBClient = new DynamoDBClient({ region: process.env.Aws_region });
const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

let salt = environmentVars.salt;
class UserServices {
  async createUser(req, res) {
    try {
      console.log("phonenumber--->", req.body.phone);
      let {
        name,
        email,
        phone,
        country,
        user_type,
        slide,
        password,
        role,
        dob,
        company_name,
        company_address,
        company_address_line_2,
        designation,
        doc_id,
        emirates_id,
        trade_license_number,
        po_box,
        warehouse_addresses,
        outlet_addresses,
        iban,
        vehicle_details_array,
        driver_name_array,
        driver_license_number_array,
        db_driver_details_array,
        term_and_condition,
      } = req.body;
      console.log(req.body, " @@@  a  aaaaaa!@#!@#aa req.body");
      console.log(req.files, "req.filesssss");
      email = email?.trim();

      let findData;
      if ((slide == 1 || slide == 2 || slide == 3 || slide == 4) && !doc_id) {
        return res.status(400).json({
          message: "Doc_id is mandatory",
          statusCode: 400,
          success: false,
        });
      }

      if (slide == 1 || slide == 2 || slide == 3 || doc_id) {

        console.log(req.files, "req.files is here");

        findData = await User.findOne({ where: { uuid: doc_id } });

        if (!findData) {
          return res.status(400).json({
            message: "Doc_id is mandatory",
            statusCode: 400,
            success: false,
          });
        }
      }

      if (slide == 2 || slide == 3 || doc_id) {
        console.log(req.files, "req.files is here");

        findData = await User.findOne({ where: { uuid: doc_id } });

        if (!findData) {
          return res.status(400).json({
            message: "User not found",
            statusCode: 400,
            success: false,
          });
        }
      }

      console.log(findData, "findDatafindData22", "findData");

      if (findData && slide == 1 && !password) {
        let profile_photo = findData.profile_photo;
        if (req.files && req.files.profile_photo.length) {
          profile_photo = req.files.profile_photo[0].filename;
          let filePath = `./uploads/${user_type}/${findData.profile_photo}`;
          try {
            deleteImageFromLocal(filePath);
          } catch (err) {
            console.error(err, "deleteImageFromLocal");
          }
          try {
            deleteImageFromS3(findData.profile_photo, user_type);
          } catch (err) {
            console.error(err, "deleteImageFromS3");
          }
          try {
            uploadImageToS3(
              req.files.profile_photo[0].filename,
              req.files.profile_photo[0].path,
              user_type
            );
          } catch (er) {
            console.error(er, "uploadImageToS3 ");
          }
        }
        await findData.update({
          profile_photo,
          name: name || findData.name,
          dob: dob || findData.dob,
          updatedAt: new Date(),
        });

        return res.status(200).json({
          message: "User data updated successfully",
          statusCode: 200,
          success: true,
          data: { id: doc_id },
        });
      }

      if (findData && slide == 2) {
        if (["vendor", "seller", "logistic"].includes(user_type.toLowerCase()) && slide == 2) {
          if (slide == 2 && user_type == "vendor" && (!warehouse_addresses || warehouse_addresses.length == 0)) {
            return res.status(400).json({
              message: "At least one warehouse is mandatory",
              statusCode: 400,
              success: false,
            });
          } else if (slide == 2 && user_type == "seller" && (!outlet_addresses || outlet_addresses.length == 0)) {
            return res.status(400).json({
              message: "At least one outlet address is mandatory",
              statusCode: 400,
              success: false,
            });
          }

          await findData.update({
            company_name: company_name || findData.company_name,
            company_address: company_address || findData.company_address,
            company_address_line_2: company_address_line_2 || findData.company_address_line_2,
            designation: designation || findData.designation,
            trade_license_number: trade_license_number || findData.trade_license_number,
            country: country || findData.country,
            po_box: po_box || findData.po_box,
            warehouse_addresses: warehouse_addresses || findData.warehouse_addresses,
            outlet_addresses: outlet_addresses || findData.outlet_addresses,
            updatedAt: new Date(),
          });

          return res.status(200).json({
            message: "User data updated successfully",
            statusCode: 200,
            success: true,
            data: { id: doc_id },
          });
        } else if (user_type == "employee" && slide == 2) {
          if (req.files?.residence_visa && req.files?.residence_visa[0]?.filename) {
            let filePath = `./uploads/${user_type}/${findData.residence_visa}`;
            try {
              deleteImageFromLocal(filePath);
            } catch (err) {
              console.error(err, "deleteImageFromLocal");
            }
            try {
              deleteImageFromS3(findData.residence_visa, user_type);
            } catch (err) {
              console.error(err, "deleteImageFromS3");
            }
            try {
              uploadImageToS3(
                req.files.residence_visa[0].filename,
                req.files.residence_visa[0].path,
                user_type
              );
            } catch (er) {
              console.error(er, "uploadImageToS3 ");
            }
          }

          const passport = req.files?.passport?.[0]?.filename;
          const residence_visa = req.files?.residence_visa?.[0]?.filename;
          const emirate_id_pic = req.files?.emirate_id_pic?.[0]?.filename;

          await findData.update({
            emirates_id: emirates_id || findData.emirates_id,
            passport: passport || findData.passport,
            residence_visa: residence_visa || findData.residence_visa,
            emirate_id_pic: emirate_id_pic || findData.emirate_id_pic,
            updatedAt: new Date(),
          });

          return res.status(200).json({
            message: "User data updated successfully",
            statusCode: 200,
            success: true,
            data: { id: doc_id },
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Email already exists!..",
            statusCode: 400,
          });
        }
      }

      if (findData && slide == 3) {
        let trade_license = req?.files?.trade_license?.[0]?.filename || findData.trade_license || "";
        if (req.files?.trade_license?.[0]?.filename) {
          let filePath = `./uploads/${user_type}/${findData.trade_license}`;
          try {
            deleteImageFromLocal(filePath);
          } catch (err) {
            console.error(err, "deleteImageFromLocal");
          }
          try {
            deleteImageFromS3(findData.trade_license, user_type);
          } catch (err) {
            console.error(err, "deleteImageFromS3");
          }
          try {
            uploadImageToS3(
              req.files.trade_license[0].filename,
              req.files.trade_license[0].path,
              user_type
            );
          } catch (er) {
            console.error(er, "uploadImageToS3 ");
          }
        }

        let cheque_scan = req.files?.cheque_scan?.[0]?.filename || findData.cheque_scan || "";
        if (req.files?.cheque_scan?.[0]?.filename) {
          let filePath = `./uploads/${user_type}/${findData.cheque_scan}`;
          try {
            deleteImageFromLocal(filePath);
          } catch (err) {
            console.error(err, "deleteImageFromLocal");
          }
          try {
            deleteImageFromS3(findData.cheque_scan, user_type);
          } catch (err) {
            console.error(err, "deleteImageFromS3");
          }
          try {
            uploadImageToS3(
              req.files.cheque_scan[0].filename,
              req.files.cheque_scan[0].path,
              user_type
            );
          } catch (er) {
            console.error(er, "uploadImageToS3 ");
          }
        }

        let vat_certificate = req.files?.vat_certificate?.[0]?.filename || findData.vat_certificate || "";
        if (req.files?.vat_certificate?.[0]?.filename) {
          let filePath = `./uploads/${user_type}/${findData.vat_certificate}`;
          try {
            deleteImageFromLocal(filePath);
          } catch (err) {
            console.error(err, "deleteImageFromLocal");
          }
          try {
            deleteImageFromS3(findData.vat_certificate, user_type);
          } catch (err) {
            console.error(err, "deleteImageFromS3");
          }
          try {
            uploadImageToS3(
              req.files.vat_certificate[0].filename,
              req.files.vat_certificate[0].path,
              user_type
            );
          } catch (er) {
            console.error(er, "uploadImageToS3 ");
          }
        }

        let residence_visa = req.files?.residence_visa?.[0]?.filename || findData.residence_visa || "";
        if (req.files?.residence_visa?.[0]?.filename) {
          let filePath = `./uploads/${user_type}/${findData.residence_visa}`;
          try {
            deleteImageFromLocal(filePath);
          } catch (err) {
            console.error(err, "deleteImageFromLocal");
          }
          try {
            deleteImageFromS3(findData.residence_visa, user_type);
          } catch (err) {
            console.error(err, "deleteImageFromS3");
          }
          try {
            uploadImageToS3(
              req.files.residence_visa[0].filename,
              req.files.residence_visa[0].path,
              user_type
            );
          } catch (er) {
            console.error(er, "uploadImageToS3 ");
          }
        }

        let emirate_id_pic = req.files?.emirate_id_pic?.[0]?.filename || findData.emirate_id_pic || "";
        if (req.files?.emirate_id_pic?.[0]?.filename) {
          let filePath = `./uploads/${user_type}/${findData.emirate_id_pic}`;
          try {
            deleteImageFromLocal(filePath);
          } catch (err) {
            console.error(err, "deleteImageFromLocal");
          }
          try {
            deleteImageFromS3(findData.emirate_id_pic, user_type);
          } catch (err) {
            console.error(err, "deleteImageFromS3");
          }
          try {
            uploadImageToS3(
              req.files.emirate_id_pic[0].filename,
              req.files.emirate_id_pic[0].path,
              user_type
            );
          } catch (er) {
            console.error(er, "uploadImageToS3 ");
          }
        }

        if (["vendor", "seller", "logistic"].includes(user_type.toLowerCase()) && slide == 3) {
          await findData.update({
            trade_license,
            cheque_scan,
            vat_certificate,
            residence_visa,
            emirates_id: emirates_id || "",
            iban: iban || "",
            emirate_id_pic,
            updatedAt: new Date(),
            term_and_condition: term_and_condition || "inactive",
          });

          return res.status(200).json({
            message: "User data updated successfully",
            statusCode: 200,
            success: true,
            data: { id: doc_id },
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Email already exists!..",
            statusCode: 400,
          });
        }
      }

      if (findData && slide == 4 && user_type == "logistic") {
        if (
          !db_driver_details_array &&
          (driver_name_array.length == 0 ||
            req.files.driver_image.length == 0 ||
            req.files.driving_license.length == 0)
        ) {
          return res.status(400).json({
            message: "At least one driver detail is required",
            statusCode: 400,
            success: false,
          });
        }

        if (vehicle_details_array.length == 0) {
          return res.status(400).json({
            message: "At least one vehicle detail is required",
            statusCode: 400,
            success: false,
          });
        }

        let driver_details_array = db_driver_details_array?.length ? [...db_driver_details_array] : [];
        let driver_images_arr = req.files.driver_images;
        let driving_license_arr = req.files.driving_license;
        for (let i = 0; i < driver_name_array.length; i++) {
          let obj = {
            id: Date.now(),
            name: driver_name_array[i],
            drive_image: driver_images_arr[i]?.filename || "",
            driving_license: driving_license_arr[i]?.filename || "",
            driving_license_number: driver_license_number_array ? driver_license_number_array[i] : "",
          };
          driver_details_array.push(obj);
          if (driving_license_arr?.[i]?.filename) {
            try {
              uploadImageToS3(
                driving_license_arr[i].filename,
                driving_license_arr[i].path,
                user_type
              );
            } catch (er) {
              console.error(er, "uploadImageToS3 ");
            }
          }
          if (driver_images_arr?.[i]?.filename) {
            try {
              uploadImageToS3(
                driver_images_arr[i].filename,
                driver_images_arr[i].path,
                user_type
              );
            } catch (er) {
              console.error(er, "uploadImageToS3 ");
            }
          }
        }

        await findData.update({
          vehicle_details_array,
          driver_details_array,
          updatedAt: new Date(),
        });

        return res.status(200).json({
          message: "User data updated successfully",
          statusCode: 200,
          success: true,
          data: { id: doc_id },
        });
      }

      if (doc_id && !findData) {
        return res.status(400).json({
          message: "Data not found",
          statusCode: 400,
          success: false,
        });
      }

      const findEmailExist = await User.findOne({ where: { email } });
      if (findEmailExist && !password) {
        if (req.files?.profile_photo?.length) {
          try {
            deleteImageFromLocal(req.files.profile_photo[0].path);
          } catch (err) {
            console.error(err, "deleteImageFromLocal");
          }
        }
        return res.status(400).json({
          success: false,
          message: "Email already exists!",
          statusCode: 400,
        });
      }

      let salt = bcrypt.genSaltSync(10);
      let breakPassword = password.slice(0, 13)
      console.log(breakPassword, "breakpassword---->")
      let hashPassword = password ? bcrypt.hashSync(breakPassword, salt) : null;
      const phoneNumber = parsePhoneNumberFromString(phone, "IN");

      if (!phoneNumber || !phoneNumber.isValid()) {
        return res.status(400).send({
          success: false,
          message: "Invalid phone number format.",
          error: {
            name: "InvalidParameterException",
            code: "InvalidParameterException",
          },
        });
      }

      const formattedPhoneNumber = phoneNumber.number;

      const cognitoParams = {
        email,
        name,
        dob,
        phone: formattedPhoneNumber,
        password: "Fathima@123",
      };

      let id = uuidv4();
      id = id.replace(/-/g, "");

      let profile_photo;
      if (req.files?.profile_photo?.length) {
        profile_photo = req.files.profile_photo[0].filename;
      }

      await findData.update({
        id,
        profile_photo: profile_photo || "",
        name,
        email,
        phone,
        dob,
        user_type,
        role: role || "",
        country,
        password: hashPassword,
        account_status: "activated",
        is_verified: true,
      });
      let slicedPassword = password.slice(0, 13)
      let obj = {
        email,
        randomPassword: slicedPassword,
        name,
      };
      console.log(obj, "password data is here---->");
      sendPasswordViaEmailOf(obj);

      let setPassword = await updatePassword(email, slicedPassword);
      console.log(setPassword, "reset password--->")
      if (req.files?.profile_photo?.length) {
        try {
          uploadImageToS3(
            req.files.profile_photo[0].filename,
            req.files.profile_photo[0].path,
            user_type
          );
        } catch (er) {
          console.error(er, "uploadImageToS3 ");
        }
      }
      return res.status(201).json({
        message: "User registered successfully",
        statusCode: 201,
        success: true,
        data: { id },
      });
    } catch (err) {
      try {
        if (req.files) {
          for (let el in req.files) {
            for (let ele of req.files[el]) {
              try {
                await deleteImageFromS3(ele.filename, req.body.user_type);
              } catch (err) {
                console.log("error delete image from s3");
              }
              try {
                await removeFile(ele.filename, req.body.user_type);
              } catch (error) {
                console.log("remove file");
              }
            }
          }
        }
      } catch (err) {
        console.error(err, "eee");
      }
      console.log(err, "errorororro");
      return res.status(500).json({ message: err.message, success: false, statusCode: 500 });
    }

  }
  async getUserByEmail(req, res) {
    try {
      // const find = await dynamoDBClient.send(
      //   new ScanCommand({
      //     TableName: "users",
      //     FilterExpression: "email = :email",
      //     ExpressionAttributeValues: {
      //       ":email": { S: req.query.email },
      //     },
      //   })
      // );
      const find = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          IndexName: "email",
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: req.query.email },
          },
        })
      );

      const simplifyDynamoDBResponse = (data) => {
        const simpleData = {};

        const simplifyAttribute = (value) => {
          if (value.S !== undefined) {
            return value.S;
          } else if (value.N !== undefined) {
            return Number(value.N);
          } else if (value.BOOL !== undefined) {
            return value.BOOL;
          } else if (value.NULL !== undefined) {
            return null;
          } else if (value.L !== undefined) {
            return value.L.map(simplifyAttribute); // Recursively simplify each item in the list
          } else if (value.M !== undefined) {
            return simplifyDynamoDBResponse(value.M); // Recursively simplify map
          }
          throw new Error("Unrecognized or unsupported DynamoDB data type");
        };

        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            simpleData[key] = simplifyAttribute(data[key]);
          }
        }
        return simpleData;
      };

      let rawData = simplifyDynamoDBResponse(find?.Items[0]);
      // console.log(rawData, "rawDataaaaaaaaaaaaa")
      delete rawData?.password;
      return res.status(200).json({
        message: "Get data",
        data: rawData,
        statusCode: 200,
        success: true,
      });
    } catch (err) {
      console.error(err, "erroror");
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async sendOtpEmail(req, res) {
    try {
      console.log("floww---->1")
      let salt = environmentVars.salt;
      let randomPassword = generatePassword.generate({
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        lowercase: true,
        excludeSimilarCharacters: true,
        strict: true
      });
      const saniPassword = randomPassword.replace(/"/g, 'a');
      let hashPassword = await bcrypt.hash(`${saniPassword}`, `${salt}`);
      let tempPassword = generatePassword.generate({
        length: 24,
        numbers: true,
        symbols: true,
        uppercase: true,
        lowercase: true,
        excludeSimilarCharacters: true,
        strict: true
      });

      const findData = await User.findOne({
        where: {
          email: req.query.email,
          account_status: "activated",
          is_verified: 1
        },
      });
      if (findData != null) {
        return res.status(400).json({
          message: "Email already exist",
          statusCode: 400,
          success: false,
        });
      }
      const userStatus = await getUserStatus(req.query.email);
      console.log(userStatus, "userStatus--->")
      if (userStatus && userStatus.UserStatus != 'CONFIRMED') {
        const findData = await User.findOne({
          where: {
            email: req.query.email,
          },
        });
        //let rawData = simplifyDynamoDBResponse(findData?.Items[0]);
        await findData.update({
          password: hashPassword
        })
        let sendData = { name: saniPassword + tempPassword, doc_id: findData.uuid }
        console.log('User exists but is not verified, resending OTP...');
        let result = await resendOTP(req.query.email, sendData);
        if (result == 1) {
          return res.status(200).json({
            message: "OTP resent successfully",
            data: sendData,
            statusCode: 200,
            success: true,
          });
        } else {
          return res.status(500).json({
            message: "Internal error,Please try again",
            statusCode: 500,
            success: false,
          });
        }
        console.log(result, "result----->")
      } else if (userStatus == 0) {

        let id = uuidv4();
        id = id?.replace(/-/g, "");

        const newUser = await User.create({
          uuid: id,
          email: req.query.email,
          password: hashPassword, // Ensure hashPassword is defined and contains the hashed password
          createdAt: new Date(),
          updatedAt: new Date(),
          is_verified: false,
        });

        const cognitoUser = await new Promise((resolve, reject) => {
          signup(req.query.email, saniPassword, (err, user) => {
            if (err) {
              reject(err);
            } else {
              console.log(user, "user-->data")
              resolve(user);
            }
          });
        });
        let data = {
          name: saniPassword + tempPassword,
          doc_id: id
        }
      }
    } catch (err) {
      if (err.code === 'UsernameExistsException') {
        console.log('Email already exists, resending OTP...');
        await resendOTP(req.query.email);
      } else {
        console.error('Error signing up:', err);
        console.error(err, "Eeee");
        return res
          .status(500)
          .json({ message: err?.message, statusCode: 500, success: false });
      }
    }
  }

  async verifyEmailWithOtpCheck(req, res) {
    try {
      let { otp, email, name, docId } = req.query;
      // console.log(email, otp, "email----->")
      // const find = await dynamoDBClient.send(
      //   new ScanCommand({
      //     TableName: "users",
      //     FilterExpression: "email = :email",
      //     ExpressionAttributeValues: {
      //       ":email": { S: email },
      //     },
      //   })
      // );
      //  console.log(email,"email----->")
      // if(find && find?.Count >0){
      //   let username = find?.Items[0]?.email?.S;
      //   console.log(find,username,otp)
      let data = await confirmUser(email, otp);
      console.log(Object.keys(data).length, data.success, "data length--->")
      if (data.success == true) {
        const updatedUser = await User.update(
          {
            is_verified: 1,
            account_status: "activated"
          },
          {
            where: {
              email: email,
            },
            returning: true, // This option returns the updated object
            plain: true, // This option returns only the updated object, not an array
          }
        );
        return res.status(200).json({
          message: "Email verified successfully",
          data: { name: name, docId: docId },
          statusCode: 200,
          success: true,
        });
      } else {
        return res.status(400).json({
          message: data.code,
          statusCode: data.statusCode,
          success: false,
        });
      }

      //}
      // console.log(find, "Asdad", find?.Items[0]);
      // if (find && find?.Count > 0) {
      //   let otpDb = find?.Items[0]?.otp?.S;
      //   let creationTime = parseInt(find?.Items[0]?.creationTime?.S, 10);
      //   let nowTime = Date.now();
      //   const timeDifference = nowTime - creationTime; // Difference in milliseconds
      //   const tenMinutes = 600000; //10 minutes in milliseconds
      //   if (timeDifference > tenMinutes) {
      //     return res.status(400).json({
      //       message: "Otp is expired",
      //       statusCode: 400,
      //       success: false,
      //     });
      //   } else if (otpDb != otp) {
      //     return res
      //       .status(400)
      //       .json({ message: "In-valid otp", statusCode: 400, success: false });
      //   } else {
      //     return res.status(200).json({
      //       message: "Email verified successfully",
      //       statusCode: 200,
      //       success: true,
      //     });
      //   }
      //   // console.log("otpDb", "as",
      //   //   creationTime,
      //   //   nowTime, "timeDifferencetimeDifference", timeDifference)
      //   // const findData = await dynamoDBClient.send(new QueryCommand({
      //   //   TableName: "users",
      //   //   IndexName: "email", // replace with your GSI name
      //   //   KeyConditionExpression: "email = :email",
      //   //   ExpressionAttributeValues: {
      //   //     ":email": { S: email },
      //   //   },
      //   // }));
      //   // console.log(findData, "findDatafindData")

      //   // if (findData && findData?.Count == 0) {
      //   //   return res.status(400).json({ message: "No data found", statusCode: 400, success: false })
      //   // // } else if (findData&&findData?.Items[0]?.is_email_verified?.) {
      //   // } else  {
      //   //   const params = {
      //   //     TableName: "users",
      //   //     Key: { id: { S: findData?.Items[0]?.id?.S } },
      //   //     UpdateExpression:
      //   //       "SET #is_email_verified = :is_email_verified",
      //   //     ExpressionAttributeNames: {
      //   //       "#is_email_verified": "is_email_verified",
      //   //       "#is_email_verified": "is_email_verified",
      //   //     },
      //   //     ExpressionAttributeValues: {
      //   //       ":is_email_verified": {
      //   //         Bool: true
      //   //       },
      //   //     },
      //   //   };
      //   //   await dynamoDBClient.send(new UpdateItemCommand(params));
      //   // }
      // } else {
      //   return res
      //     .status(400)
      //     .json({ message: "No data found", statusCode: 400, success: false });
      // }
    } catch (err) {
      console.error(err, "Eeee");

      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async loginUser(req, res) {
    try {
      let { email, password } = req.body;
      console.log(req.body, "jai sriram--->")
      const findData = await User.findOne({
        where: {
          email: email,
        }, raw: true
      });
      // console.log(findData, "findData----->")
      if (!findData) {
        return res.staatus(400).json({ message: "Email not found", statusCode: 400, success: false })
      }
      if (
        findData?.user_type != "super_admin" &&
        findData?.account_status != "activated"
      ) {
        return res.status(400).json({
          message: "This account de-activated",
          statusCode: 400,
          success: false,
        });
      }
        let checkpassword = await bcrypt.compare(
          password,
          findData.password
        );
        if (!checkpassword) {
          return res.status(400).json({
            message: "Password invalid",
            success: false,
            statusCode: 400,
          });
        }
        let otp = await generateOTP();
        otp=Number(otp)
        // console.log(otp, "otptptptp",otp?.length,"{{{{");
        if (otp?.toString().length == 3) {
          otp = otp + "0";
        } else if (otp?.toString().length == 2) {
          otp = otp + "00";
        } else if (otp?.toString().length == 1) {
          otp = otp + "000";
        }
        // console.log(otp, "otp$$$$$$$333");
        let currentTime = Date.now();
        currentTime = currentTime?.toString();
         sendOtpForLogin(email, otp);
        const find = await UserOtp.findOne({
          where: {
            email: email,
          },
        });
        // console.log(find, "Asdad", find);
        if (find && find?.id) {
           await UserOtp.update(
            {
              otp: otp,
              creationTime: currentTime,
              updatedAt: currentTime,
            },
            {
              where: {
                email: email,
              },
            }
          );
        } else {
          console.log("flow2----->")
          let id = uuidv4()?.replace(/-/g, "");
          const newUserOtp = await UserOtp.create({
            id: id,
            email: req.body.email,
            otp: otp,
            creationTime: currentTime,
            createdAt: currentTime,
            updatedAt: currentTime,
          });
        }
        const tokens = await signin(req.body, (err, user) => {
          // console.log(err, "error---->")
          if (err) {
            console.log("hiiiiii---->")
            return res.status(400).json({
              message: `Authentication failed`,
              statusCode: 400,
              success: false,
            });
          } else {
            // console.log(user, "user-->data")
            return res.status(200).json({
              message: "Otp sent to registered email",
              statusCode: 200,
              success: true,
            });
          }
        });
    } catch (err) {
      console.log(err, "Error in login api user");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async loginWithOtp(req, res) {
    try {
      let { email, otp } = req.body;
      const findData = await User.findOne({
        where: { email }, raw: true
      });
      if (!findData) {
        return res.status(400).json({ message: "User not found", statusCode: 400, success: false })
      }
      const find = await UserOtp.findOne({
        where: { email }, raw: true
      });
      if (!find) {
        return res.status(400).json({ message: "User otp not found", statusCode: 400, success: False })
      }
      let otpDb = find?.otp;
      let creationTime = parseInt(find?.creationTime, 10);
      let nowTime = Date.now();
      const timeDifference = nowTime - creationTime; // Difference in milliseconds
      const tenMinutes = 600000; // 10 minutes in milliseconds

      if (timeDifference > tenMinutes) {
        return res.status(400).json({
          message: "Otp is expired",
          statusCode: 400,
          success: false,
        });
      } else if (otpDb != otp) {
        return res.status(400).json({
          message: "In-valid otp",
          statusCode: 400,
          success: false,
        });
      }

      let unique_token_id = uuidv4().replace(/-/g, "");
      let obj = {
        unique_token_id,
        name: findData.name,
        email: findData.email,
        user_type: findData.user_type,
        id: findData.id,
        is_verified: findData.is_verified,
        account_status: findData.account_status,
      };

      if (
        obj.user_type != "vendor" &&
        obj.user_type != "seller" &&
        obj.user_type != "logistic" &&
        obj.user_type != "super_admin"
      ) {
        let api_endpoint_arr = permissions.map(p => p.backend_routes).flat();
        api_endpoint_arr.push(...permissions.map(p => p.frontend_routes).flat());
        // Remove duplicates
        api_endpoint_arr = [...new Set(api_endpoint_arr)];
        let apiEndpoints = await ApiEndpoint.findAll({
          where: {
            id: {
              [Op.in]: api_endpoint_arr
            }
          }
        });

        let temp = {};
        apiEndpoints.forEach(el => {
          if (temp[el?.type]) {
            temp[el?.type].push({
              id: el?.id,
              title: el?.title,
              type: el?.type,
            });
          } else {
            temp[el?.type] = [{
              id: el?.id,
              title: el?.title,
              type: el?.type,
            }];
          }
        });
        obj.permission = temp;
        //obj.permission_raw_arr = simplifySequelizeResponse(permissions);
      }

      let token = generateAccessToken(obj);
      // let expiryDate = new Date();
      // expiryDate.setDate(expiryDate.getDate() + 1); // Expires in 1 day

      await User.update(
        { unique_token_id },
        { where: { id: obj.id } }
      );
      res.cookie("_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        // expires: expiryDate,
      }).status(200).json({
        success: true,
        message: "Logged in successful",
        statusCode: 200,
        data: {
          user_type: obj.user_type,
          id: obj.id,
          token: token,
          is_verified: obj.is_verified,
          account_status: obj.account_status,
          permission: obj.permission || [],
          permission_raw_arr: obj.permission_raw_arr || [],
        },
      });


    } catch (err) {
      console.log(err, "Error in login api user");
      return res.status(500).json({
        message: err.message,
        success: false,
        statusCode: 500,
      });
    }
  }

  async verifyUserAccount(req, res) {
    try {
      if (req.userData.user_type != "super_admin") {
        return res
          .status(400)
          .json({ message: "Not authorise", statusCode: 400, success: false });
      }
      let { user_id, status } = req.body;
      // let get=await new
      const findData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          // IndexName: "email", // replace with your GSI name
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: user_id },
          },
        })
      );
      if (findData && findData?.Count == 0) {
        return res
          .status(400)
          .json({ message: "User not found", statusCode: 400, success: false });
      }
      const params = {
        TableName: "users",
        Key: {
          id: { S: user_id }, // Assuming id is the partition key
        },
        UpdateExpression: "SET is_verified = :verified",
        ExpressionAttributeValues: {
          ":verified": { BOOL: status }, // Assuming you want to set it to true
        },
        ReturnValues: "ALL_NEW", // Specify what values you want to return after the update
      };
      await dynamoDBClient.send(new UpdateItemCommand(params));
      return res.status(200).json({
        message: "Verify status changed successfully",
        statusCode: 400,
        success: false,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async user_logout_data(req, res) {
    try {
      const updateParams = {
        TableName: "users",
        Key: {
          id: { S: req.userData?.id }, // Replace with actual product ID
        },
        UpdateExpression: "SET unique_token_id = :unique_token_id",
        ExpressionAttributeValues: {
          ":unique_token_id": { S: "" },
        },
        ReturnValues: "UPDATED_NEW",
      };
      await dynamoDBClient.send(new UpdateItemCommand(updateParams));
      return res
        .status(200)
        .json({ message: "logout successful", statusCode: 200, success: true });
    } catch (er) {
      return res
        .status(500)
        .json({ message: er, statusCode: 500, success: false });
    }
  }
  async UserAccountDeactivateOrActivate(req, res) {
    try {
      let { user_id, status } = req.body;
      if (req.userData.user_type != "super_admin") {
        return res
          .status(400)
          .json({ message: "Not authorise", statusCode: 400, success: false });
      }
      const findData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          // IndexName: "email", // replace with your GSI name
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: user_id },
          },
        })
      );
      if (findData && findData?.Count == 0) {
        return res
          .status(400)
          .json({ message: "User not found", statusCode: 400, success: false });
      }
      const params = {
        TableName: "users",
        Key: {
          id: { S: user_id }, // Assuming id is the partition key
        },
        UpdateExpression: "SET account_status = :status",
        ExpressionAttributeValues: {
          ":status": { S: status }, // Assuming you want to set it to true
        },
        ReturnValues: "ALL_NEW", // Specify what values you want to return after the update
      };
      await dynamoDBClient.send(new UpdateItemCommand(params));
      return res.status(200).json({
        message: "User's account status changed successfully",
        statusCode: 400,
        success: false,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async addSubUser(req, res) {
    try {
      let { email, phone, name, country, doc_id, permission, account_status } =
        req.body;
      if (req.userData?.user_type != "logistic") {
        const paramsOf = {
          RequestItems: {
            permission: {
              Keys: permission.map((id) => ({
                id: { S: id },
              })),
              ProjectionExpression:
                "title, id, backend_routes, frontend_routes",
            },
          },
        };
        const commandOf = new BatchGetItemCommand(paramsOf);
        const result = await dynamoDBClient.send(commandOf);
        let dataOf = result?.Responses?.permission;
        if (dataOf?.length == 0) {
          return res.status(400).json({
            message: "In-valid permission",
            status: 400,
            success: false,
          });
        }
        let invalid_permission_arr = [];
        for (let le of permission) {
          // console.log(le, "lelelelele");
          let findPermissionObj = dataOf?.find((el) => el?.id?.S == le);
          if (!findPermissionObj) {
            invalid_permission_arr.push(le);
          }
        }
        if (invalid_permission_arr && invalid_permission_arr?.length > 0) {
          return res.status(400).json({
            message: `This permission ${invalid_permission_arr} are not exist`,
            statusCode: 400,
            success: false,
          });
        }
      }
      // console.log(dataOf, "dataofffffff");
      if (doc_id) {
        const findEmailExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "users",
            // IndexName: "email",
            KeyConditionExpression: "id= :id",
            // ProjectionExpression: "email, phone, id",
            ExpressionAttributeValues: {
              ":id": { S: doc_id },
            },
          })
        );
        if (findEmailExist && findEmailExist?.Count == 0) {
          return res.status(404).json({
            message: "Data not found",
            statuscode: 404,
            success: false,
          });
        }
        let profile_photo =
          req.files.profile_photo[0]?.filename ||
          findEmailExist?.Items[0]?.profile_photo?.S ||
          "";
        // console.log(findEmailExist ?.Items[0]?.,"aa")   
        const params = {
          TableName: "users",
          Key: { id: { S: doc_id } },
          UpdateExpression:
            "SET #name = :name, #phone = :phone, #permission =:permission, #country= :country , #updated_at=:updated_at, #profile_photo = :profile_photo, #account_status = :account_status ",
          ExpressionAttributeNames: {
            "#name": "name",
            "#phone": "phone",
            "#permission": "permission",
            "#country": "country",
            "#updated_at": "updated_at",
            "#profile_photo": "profile_photo",
            "#account_status": "account_status",
          },
          ExpressionAttributeValues: {
            ":name": { S: name || findEmailExist?.Items[0]?.name?.S },
            ":phone": { S: phone || findEmailExist?.Items[0]?.phone?.S || "" },
            ":permission": {
              L:
                permission?.map((el) => ({
                  S: el,
                })) ||
                findEmailExist?.Items[0]?.permission?.L ||
                [],
            },
            ":country": {
              S: country || findEmailExist?.Items[0]?.country?.S || "",
            },
            ":updated_at": { S: new Date().toISOString() },
            ":profile_photo": { S: profile_photo || "" },
            ":account_status": {
              S:
                account_status ||
                findEmailExist?.Items[0]?.account_status?.S ||
                "active",
            },
          },
        };
        // console.log(params, "apramnsnssnsm");
        await dynamoDBClient.send(new UpdateItemCommand(params));
        let obj = { id: doc_id };
        return res.status(200).json({
          message: "User's details update successfully",
          data: obj,
          statusCode: 200,
          success: true,
        });
      }
      const findEmailExist = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          IndexName: "email", // Replace with your GSI name for email
          KeyConditionExpression: "email = :email",
          ProjectionExpression: "email, phone, id",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
        })
      );
      if (findEmailExist.Count > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists!",
          statusCode: 400,
        });
      }
      const findPhoneExist = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          IndexName: "phone", // Replace with your GSI name for phone like phone-index
          KeyConditionExpression: "phone = :phone",
          ProjectionExpression: "email, phone, id",
          ExpressionAttributeValues: {
            ":phone": { S: phone },
          },
        })
      );
      if (findPhoneExist.Count > 0) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists!",
          statusCode: 400,
        });
      }
      // console.log(req.userData, "aaaaaasdj","fnd", "findUserExist?.Items", "asdsd")
      let user_type = "vendor_sub_user";
      if (req.userData?.user_type == "logistic") {
        user_type = "logistic_sub_user";
      } else if (req.userData?.user_type == "seller") {
        user_type = "seller_sub_user";
      }
      let salt = environmentVars.salt;
      let randomPassword = encryptStringWithKey(
        email.toLowerCase()?.slice(0, 6)
      );
      // console.log(randomPassword, "randomPasswordrandomPassword");
      let hashPassword = await bcrypt.hash(`${randomPassword}`, `${salt}`);

      let id = uuidv4();
      id = id?.replace(/-/g, "");
      const params = {
        TableName: "users",
        Item: {
          id: { S: id },
          name: { S: name || "" },
          email: { S: email || "" },
          phone: { S: phone || "" },
          user_type: { S: user_type },
          country: { S: country || "" },
          password: { S: hashPassword },
          created_by: { S: req.userData?.id },
          profile_photo: {
            S: req.files?.profile_photo
              ? req.files?.profile_photo[0]?.filename
              : "",
          },
          permission: {
            L:
              permission?.map((el) => ({
                S: el,
              })) ||
              findEmailExist?.Items[0]?.permission?.L ||
              [],
          },
          created_at: { S: new Date().toISOString() },
          updated_at: { S: new Date().toISOString() },
          account_status: { S: "activated" },
        },
      };
      // console.log("user_type", "docccleint", params);
      await dynamoDBClient.send(new PutItemCommand(params));
      let obj = {
        email,
        randomPassword,
        name,
      };
      sendPasswordViaEmailOf(obj);
      let obj2 = { id };
      res.status(201).json({
        message: "User added successfully",
        statusCode: 200,
        success: true,
        data: obj2,
      });
    } catch (err) {
      console.error(err, "error ");
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async role_id_assign_to_user(req, res) {
    try {
      let { user_id, role_id } = req.body;
      let findRoleExist = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "role",
          KeyConditionExpression: "id= :id",
          ExpressionAttributeValues: {
            ":id": { S: role_id },
          },
        })
      );
      if (findRoleExist && findRoleExist?.Count == 0) {
        return res.status(404).json({
          message: "Role_id not found",
          statuscode: 404,
          success: false,
        });
      }
      const findExist = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          // IndexName: "email",
          KeyConditionExpression: "id= :id",
          // ProjectionExpression: "email, phone, id",
          ExpressionAttributeValues: {
            ":id": { S: user_id },
          },
        })
      );
      if (findExist && findExist?.Count == 0) {
        return res
          .status(404)
          .json({ message: "Data not found", statuscode: 404, success: false });
      }
      // console.log(findEmailExist ?.Items[0]?.,"aa")
      const params = {
        TableName: "users",
        Key: { id: { S: user_id } },
        UpdateExpression: "SET #role_id = :role_id, updated_at = :updated_at",
        ExpressionAttributeNames: {
          "#role_id": "role_id",
          "#updated_at": "updated_at",
        },
        ExpressionAttributeValues: {
          ":role_id": {
            S: role_id || findEmailExist?.Items[0]?.role_id?.S || "",
          },
          ":updated_at": { S: new Date().toISOString() },
        },
      };
      // console.log(params, "apramnsnssnsm");
      await dynamoDBClient.send(new UpdateItemCommand(params));
      return res.status(200).json({
        message: "User's role update successfully",
        statusCode: 200,
        success: true,
      });
      // console.log("user_type", "docccleint", params);
    } catch (err) {
      console.error(err, "error ");
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async get_all_user(req, res) {
    try {
      let { page, limit, lastEvaluatedKey, created_at } = req.query;
      // page = parseInt(page) || 1;
      // limit = parseInt(limit) || 10;
      // const offset = (page - 1) * limit;
      // console.log(req.userData?.id, "req.userData?.idreq.userData?.id");
      const queryParams = {
        TableName: "users",
        IndexName: "created_by-index",
        KeyConditionExpression: "created_by = :created_by",
        ExpressionAttributeValues: {
          ":created_by": { S: req.userData?.id }, // Assuming req.userData?.id is a string
        },
        // Limit: limit,
        ScanIndexForward: false,
        Select: "ALL_ATTRIBUTES", // Retrieve all attributes
        Count: true,
      };

      // if (offset > 0) {
      //   // If offset is greater than 0, set ExclusiveStartKey to start from the correct position
      //   if (lastEvaluatedKey) {
      //     queryParams.ExclusiveStartKey = {
      //       id: {
      //         S: lastEvaluatedKey,
      //       },
      //       created_by: {
      //         S: req.userData.id, //"adab625867164c819584ee15e94c887c"
      //       },
      //       created_at: {
      //         S: created_at,
      //       },
      //     };
      //   }
      // }
      // console.log(queryParams, "asdasdadadsasd")
      const data = await dynamoDBClient.send(new QueryCommand(queryParams));
      let nextToken = null;
      if (data?.LastEvaluatedKey) {
        let dataFetch = await simplifyDynamoDBResponse(data.LastEvaluatedKey);
        nextToken = dataFetch;
      }
      let arr = [];
      for (let el of data?.Items) {
        let rawData = await simplifyDynamoDBResponse(el);
        delete rawData.password;
        arr.push(rawData);
      }
      //fetch total count here

      // const queryParams2 = {
      //   TableName: "users",
      //   IndexName: "created_by-index",
      //   KeyConditionExpression: "created_by = :created_by",
      //   ExpressionAttributeValues: {
      //     ":created_by": { S: req.userData?.id },
      //   },
      //   Select: "COUNT", // Select COUNT to retrieve the count of matching items
      // };

      // const countResponse = await dynamoDBClient.send(
      //   new QueryCommand(queryParams2)
      // );
      // const totalCount = countResponse?.Count || 0; // Get the count of matching items

      res.status(200).json({
        message: "Fetch User data",
        statusCode: 200,
        success: true,
        data: arr,
        // nextPageToken: nextToken,
        // pagination: { totalCount, page, limit },
      });
      return;
    } catch (err) {
      console.error(err, "error ");
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async delete_user(req, res) {
    try {
      let { id } = req.query;
      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          // IndexName: "created_by-index", // Replace with your GSI name for phone like phone-index
          KeyConditionExpression: "id = :id",
          // ProjectionExpression: "email, phone, id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (data?.Count == 0) {
        return res.status(400).json({
          message: "User not found or deleted already",
          statusCode: 400,
          success: false,
        });
      }
      // console.log(data?.Items[0], "@@@@@ @@@@ @@@ @@@@@ @@ @@");
      if (data?.Items[0]?.created_by?.S != req.userData?.id) {
        return res.status(400).json({
          message: "Not authorise to perform this action",
          statusCode: 400,
          success: false,
        });
      }
      const params = {
        TableName: "users",
        Key: {
          id: { S: id }, // Replace with your primary key attributes
        },
      };
      const command = new DeleteItemCommand(params);
      await dynamoDBClient.send(command);

      return res.status(200).json({
        message: "User deleted successfully",
        statusCode: 200,
        success: true,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async change_status_user(req, res) {
    try {
      let { id, account_status } = req.query;
      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (data?.Count == 0) {
        return res.status(400).json({
          message: "User not found or deleted already",
          statusCode: 400,
          success: false,
        });
      }
      if (
        req.userData?.user_type != "super_admin" &&
        data?.Items[0]?.created_by?.S != req.userData?.id
      ) {
        return res.status(400).json({
          message: "Not authorise to perform this action",
          statusCode: 400,
          success: false,
        });
      }
      const params = {
        TableName: "users",
        Key: { id: { S: id } },
        UpdateExpression: "SET #account_status = :account_status",
        ExpressionAttributeNames: {
          "#account_status": "account_status",
        },
        ExpressionAttributeValues: {
          ":account_status": {
            S:
              account_status ||
              findEmailExist?.Items[0]?.account_status?.S ||
              "activated",
          },
        },
      };
      await dynamoDBClient.send(new UpdateItemCommand(params));
      return res.status(200).json({
        message: "User status changed successfully",
        statusCode: 200,
        success: true,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async all_user_fetch(req, res) {
    try {
      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          // IndexName: "created_by-index", // Replace with your GSI name for phone like phone-index
          KeyConditionExpression: "id = :id",
          // ProjectionExpression: "email, phone, id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );

      const params = {
        TableName: "users",
        Key: {
          id: { S: id }, // Replace with your primary key attributes
        },
      };
      const command = new DeleteItemCommand(params);
      // console.log(command, "command command ")
      const response = await dynamoDBClient.send(command);
      // console.log(response, "response response")
      return res.status(200).json({
        message: "User deleted successfully",
        statusCode: 200,
        success: true,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async super_admin(req, res) {
    try {
      let { email, phone, name, user_type } = req.body;
      const findEmailExist = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          IndexName: "email", // Replace with your actual email index name
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
          Limit: 1,
        })
      );
      if (findEmailExist.Count > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exist!",
          statusCode: 400,
        });
      }
      if (phone) {
        const findPhoneExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "users",
            IndexName: "phone", // Replace with your actual phone index name
            KeyConditionExpression: "phone = :phone",
            ExpressionAttributeValues: {
              ":phone": { S: phone },
            },
            Limit: 1,
          })
        );
        if (findPhoneExist.Count > 0) {
          return res.status(400).json({
            success: false,
            message: "Phone number already exists!",
            statusCode: 400,
          });
        }
      }
      let salt = environmentVars.salt;
      let randomPassword = encryptStringWithKey(
        req.body.email.toLowerCase()?.slice(0, 6)
      );
      let hashPassword = await bcrypt.hash(`${randomPassword}`, `${salt}`);

      let id = uuidv4();
      id = id?.replace(/-/g, "");

      let profile_photo;
      if (req.files && req.files?.profile_photo?.length) {
        profile_photo = req.files?.profile_photo[0]?.filename;
      }
      const params = {
        TableName: "users",
        Item: {
          profile_photo: { S: profile_photo || "" },
          id: { S: id },
          name: { S: name },
          email: { S: email },
          phone: { S: phone || "" },
          // dob: { S: dob || "" },
          user_type: { S: user_type },
          // role: { S: role || "" },
          // country: { S: country || "" },
          password: { S: hashPassword },
          created_at: { S: new Date().toISOString() },
          updated_at: { S: new Date().toISOString() },
        },
      };
      console.log("docClient", "docccleint", params);
      await dynamoDBClient.send(new PutItemCommand(params));
      let obj = {
        email,
        randomPassword,
        name,
      };
      sendPasswordViaEmailOf(obj);
      return res.status(201).json({
        message: "Admin register successfully",
        statusCode: 201,
        success: false,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async sendForgotPasswordEmail(req, res) {
    try {
      let email = req.body.email?.trim();
      const findEmailExist = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          IndexName: "email", // Replace with your GSI name for email
          KeyConditionExpression: "email = :email",
          ProjectionExpression: "email, phone, id, #nm",
          ExpressionAttributeNames: {
            "#nm": "name",
          },
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
        })
      );
      if (findEmailExist.Count == 0) {
        return res.status(400).json({
          success: false,
          message: "Email not found",
          statusCode: 400,
        });
      }
      let get = simplifyDynamoDBResponse(findEmailExist?.Items[0]);
      // console.log(get, "Getgetget");
      let otp = await generateOTP();
      // console.log(otp, "otptptptp");
      if (otp.length == 3) {
        otp = otp + "0";
      } else if (otp.length == 2) {
        otp = otp + "00";
      } else if (otp.length == 1) {
        otp = otp + "000";
      }
      let currentTime = Date.now();
      currentTime = currentTime?.toString();

      let obj = {
        user_id: get?.id,
        otp: otp,
        email: get?.email,
        name: get?.name,
        creationTime: currentTime,
      };

      const find = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "userOtp",
          IndexName: "email", // replace with your GSI name
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
        })
      );
      // console.log(find, "Asdad", find);
      if (find && find?.Count > 0) {
        const params = {
          TableName: "userOtp",
          Key: { id: { S: find?.Items[0]?.id?.S } },
          UpdateExpression:
            "SET #otp = :otp, #creationTime = :creationTime, #updatedAt =:updatedAt ",
          ExpressionAttributeNames: {
            "#otp": "otp",
            "#creationTime": "creationTime",
            "#updatedAt": "updatedAt",
          },
          ExpressionAttributeValues: {
            ":otp": { S: otp },
            ":creationTime": { S: currentTime },
            ":updatedAt": { S: currentTime },
          },
        };
        await dynamoDBClient.send(new UpdateItemCommand(params));
      } else {
        let id = uuidv4()?.replace(/-/g, "");
        const params = {
          TableName: "userOtp",
          Item: {
            email: { S: req.body.email },
            otp: { S: otp },
            creationTime: { N: currentTime },
            createdAt: { N: currentTime },
            updatedAt: { N: currentTime },
            id: { S: id },
          },
        };
        // console.log(params, "parasnsns");
        await dynamoDBClient.send(new PutItemCommand(params));
      }
      res.status(200).json({
        message: "Otp sent to registered email",
        statusCode: 200,
        success: true,
      });
      forgotPasswordSendOtp(obj);
      return;
    } catch (err) {
      // console.log(err);
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async verify_otp_data(req, res) {
    try {
      let { email, otp_code } = req.body;
      email = email?.trim();
      const find = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "userOtp",
          IndexName: "email", // replace with your GSI name
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
        })
      );
      if (find && find?.Count == 0) {
        return res.status(400).json({
          success: false,
          message: "Email not found",
          statusCode: 400,
        });
      }
      let extractData = simplifyDynamoDBResponse(find?.Items[0]);
      // console.log(extractData, "rextradataaaaaaaa");
      let creation_time = extractData?.creationTime;
      let current_time = Date.now();
      const differenceInMilliseconds = current_time - creation_time;
      const differenceInMinutes = Math.floor(
        differenceInMilliseconds / (1000 * 60)
      );
      if (differenceInMinutes > 5) {
        return res
          .status(400)
          .json({ message: "OTP expired", success: false, statusCode: 400 });
      }
      if (extractData?.otp != otp_code) {
        return res
          .status(400)
          .json({ message: "Invalid OTP", success: false, statusCode: 400 });
      }
      return res.status(200).json({
        message: "Verify otp successfully",
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      console.log(err, "verify otp , err Error ");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async resetUserPassword(req, res) {
    try {
      let password = req.body.password;
      let emailData = "";
      let otp_code = req.body.otp_code;
      let id;
      if (req.body.email) {
        if (!otp_code || otp_code?.length != 4) {
          return res.status(400).json({
            message: "Otp is mandatory and lengh must be 4 character",
            statusCode: 400,
            success: false,
          });
        }
        let email = req.body?.email?.trim();
        emailData = email;
        const findEmail = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "users",
            IndexName: "email", // replace with your GSI name
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
              ":email": { S: email },
            },
          })
        );
        if (findEmail && findEmail?.Count == 0) {
          res.status(400).json({
            message: "User not found",
            success: false,
            statusCode: 400,
          });
          return;
        }
        let emailExist = simplifyDynamoDBResponse(findEmail?.Items[0]);
        id = emailExist?.id;
        const find = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "userOtp",
            IndexName: "email", // replace with your GSI name
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
              ":email": { S: email },
            },
          })
        );
        if (find && find?.Count == 0) {
          res.status(400).json({
            message: "User not found",
            success: false,
            statusCode: 400,
          });
          return;
        }
        let fetchDoc = simplifyDynamoDBResponse(find?.Items[0]);
        console.log(fetchDoc, "eeeeeeeeee");
        let creation_time = fetchDoc?.creation_time;
        let current_time = Date.now();
        const differenceInMilliseconds = current_time - creation_time;
        const differenceInMinutes = Math.floor(
          differenceInMilliseconds / (1000 * 60)
        );
        if (differenceInMinutes > 5) {
          return res
            .status(400)
            .json({ message: "OTP expired", success: false, statusCode: 400 });
        }
        if (fetchDoc?.otp != otp_code) {
          return res
            .status(400)
            .json({ message: "Invalid OTP", success: false, statusCode: 400 });
        }
        let checkpassword = await bcrypt.compare(
          password,
          emailExist?.password
        );
        if (checkpassword) {
          return res.status(400).json({
            message: "Password must be unique, previous password not allowed",
            statusCode: 400,
            success: false,
          });
        }
      } else {
        let _secrate = req?.cookies?._token;
        const proof = jwt.verify(_secrate, process.env.JWT_SECRET, {
          algorithm: "HS512",
        });
        // console.log(proof,"prooo");
        emailData = proof?.email;
        id = proof?.id;
        const findEmail = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "users",
            IndexName: "email", // replace with your GSI name
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
              ":email": { S: emailData },
            },
          })
        );
        if (findEmail && findEmail?.Count == 0) {
          res.status(400).json({
            message: "User not found",
            success: false,
            statusCode: 400,
          });
          return;
        }
        let checkpassword = await bcrypt.compare(
          password,
          findEmail?.Items[0]?.password?.S
        );
        console.log(checkpassword, "qweqopwe");
        if (checkpassword) {
          return res.status(400).json({
            message: "Password must be unique, previous password not allowed",
            statusCode: 400,
            success: false,
          });
        }
      }
      let hashPassword = await bcrypt.hash(`${password}`, `${salt}`);
      const params = {
        TableName: "users",
        Key: { id: { S: id } },
        UpdateExpression: "SET #password = :password",
        ExpressionAttributeNames: {
          "#password": "password",
        },
        ExpressionAttributeValues: {
          ":password": {
            S: hashPassword,
          },
        },
      };
      await dynamoDBClient.send(new UpdateItemCommand(params));
      return res.status(200).json({
        message: "Password change successfully",
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async getAllUSerData(req, res) {
    try {
      let fetchArray = await UserModel.findAll();
      res.status(200).json({
        message: "fetch user data",
        data: fetchArray,
        success: true,
        statusCode: 200,
      });
      return;
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async updateUserDetails(id, data, res) {
    try {
      UserModel.update(data, { where: { id: id } })
        .then((response) => {
          return res
            .status(201)
            .json({ success: true, message: "values updated" });
        })
        .catch((error) => {
          return res
            .status(500)
            .json({ success: false, message: error?.message });
        });
    } catch (err) {
      return res.status(500).json({ success: false, message: err?.message });
    }
  }

  async sendEmailUserToAnother(req, res) {
    try {
      let email = req.body.email?.trim();
      // let findEmailExist = await UserModel.findOne({
      //   where: { email },
      //   attributes: ["email", "id", "name"],
      // });
      // const findEmailExist = await UserModel.queryOne("email")
      //   .eq(email)
      //   .attributes(["email", "id", "name"])
      //   .exec();

      let findEmailExist = await UserModel.scan()
        .where("email")
        .eq(email)
        .exec();

      console.log(findEmailExist, "kkkkkkkkkkkkkk===>");

      if (!findEmailExist) {
        return res.status(404).json({
          message: "Email not found",
          success: false,
          statusCode: 400,
        });
      } else {
        let getRandomNumber = Math.round(Math.random() * 10000);
        let obj = {
          user_id: findEmailExist?.id,
          otp_code: getRandomNumber,
          email: findEmailExist?.email,
          name: findEmailExist?.name,
          creation_time: Date.now(),
        };
        // console.log(obj,"EEEEEEEEEEEEEEEEEEEEEEEEEEEE")
        let getEmailCheck = await userOtpModel.findOne({
          where: { user_id: findEmailExist?.id },
          attributes: ["id"],
        });
        if (getEmailCheck && getEmailCheck?.id) {
          await userOtpModel.update(
            { otp_code: getRandomNumber, creation_time: Date.now() },
            { where: { user_id: findEmailExist?.id } }
          );
        } else {
          await userOtpModel.create(obj);
        }
        await sendEmailUser(req, res, obj);
      }
    } catch (err) {
      // console.log(err);
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
}

const UserServicesObj = new UserServices();
export default UserServicesObj;
