import UserModel from "../../models/UserModel.js";
import bcrypt from "bcrypt";
import {
  sendPasswordViaEmail,
  forgotPasswordEmail,
  encryptStringWithKey,
  sendEmailUser,
} from "../../helpers/common.js";
import { Op, where } from "sequelize";
import { environmentVars } from "../../config/environmentVar.js";
import { generateAccessToken } from "../../helpers/validateUser.js";
import jwt from "jsonwebtoken";
import docClient from "../../config/dbConfig.js";
import Sequence from "../../models/SequenceModel.js";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import formidable from "formidable";
import {
  pinePointServices,
  sendEmailOtp,
  sendOtpForLogin,
  sendPasswordViaEmailOf,
} from "../../helpers/aswSesServices.js";
import { generateOTP } from "../../helpers/generateOtp.js";
import { deleteImageFromS3 } from "../../helpers/s3.js";
import { removefIle } from "../../helpers/validateImageFile.js";
import { simplifyDynamoDBResponse } from "../../helpers/datafetch.js";

// const dynamoDBClient = new DynamoDBClient({ region: process.env.Aws_region });
const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

AWS.config.update({
  region: "us-east-1", //process.env.Aws_region //'us-east-1'  // Change to your region
});

async function getNextSequenceValue(sequenceName) {
  console.log(sequenceName, "sequence nameee");
  let sequenceDoc = await Sequence.get({ sequenceName });
  console.log(sequenceDoc, "sequenceDocsequenceDoc");
  if (!sequenceDoc) {
    // If sequence does not exist, create a new one
    sequenceDoc = new Sequence({
      sequenceName,
      value: 0,
    });
  }
  sequenceDoc.value++; // Increment the sequence value
  console.log(sequenceDoc, "sequenceDocsequenceDoc");
  await sequenceDoc.save(); // Save the updated sequence value
  return sequenceDoc.value;
}

let salt = environmentVars.salt;
class UserServices {
  async createUser(req, res) {
    try {
      let {
        name,
        email,
        phone,
        country,
        user_type,
        slide,
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
      } = req.body;
      console.log(req.body, "aaaaaaaaaa!@#!@#aa req.body");
      console.log(req.files, "req.filesssss")
      email = email?.trim();
      let findData;
      if ((slide == 2 || slide == 3 || slide == 4) && doc_id == "") {
        return res
          .status(400)
          .json({
            message: "Doc_id is mandatory",
            statusCode: 400,
            success: false,
          });
      }
      if (slide == 2 || slide == 3 || doc_id) {
        findData = await dynamoDBClient.send(
          new ScanCommand({
            // new QueryCommand({
            TableName: "users",
            FilterExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: doc_id },
            },
          })
        );
      }
      // console.log(
      //   findData?.Items[0]?.profile_photo?.S,
      //   "findDatafindData22",
      //   findData
      // );
      // return
      if (findData?.Count > 0 && slide == 1) {
        let profile_photo = findData?.Items[0]?.profile_photo?.S;
        if (req.files && req.files?.profile_photo?.length) {
          profile_photo = req.files?.profile_photo[0]?.filename;
          // if (findData?.Items[0]?.profile_photo?.S&&req.files?.profile_photo&&req.files?.profile_photo?.length) {
          //   await deleteImageFromS3(findData?.Items[0]?.profile_photo?.S);
          //   await removefIle(findData?.Items[0]?.profile_photo?.S, user_type);
          // }
        }
        const params = {
          TableName: "users",
          Key: { id: { S: doc_id } },
          UpdateExpression:
            "SET #profile_photo = :profile_photo, #name = :name, #dob = :dob",
          ExpressionAttributeNames: {
            "#profile_photo": "profile_photo",
            "#name": "name",
            "#dob": "dob",
            "#updated_at": "updated_at"
          },
          ExpressionAttributeValues: {
            ":profile_photo": { S: profile_photo },
            ":name": { S: name || findData?.Items[0]?.name?.S },
            ":dob": { S: dob || findData?.Items[0]?.dob?.S },
            ":updated_at": { S: new Date().toISOString() }
          },
        };
        await dynamoDBClient.send(new UpdateItemCommand(params));
        return res.status(200).json({
          message: "User data updated successfully",
          statusCode: 200,
          success: true,
          data: { id: doc_id }
        });
      }

      if (findData?.Count > 0 && slide == 2) {
        if (
          ["vendor", "seller", "logistic"].includes(user_type?.toLowerCase()) &&
          slide == 2
        ) {
          if (slide == 2 && user_type == "vendor") {
            if (!warehouse_addresses || warehouse_addresses?.length == 0) {
              return res
                .status(400)
                .json({
                  message: "Atleast one warehouse is mandatory",
                  statusCode: 400,
                  success: false,
                });
            }
          } else if (slide == 2 && user_type == "seller") {
            if (!outlet_addresses || outlet_addresses?.length == 0) {
              return res
                .status(400)
                .json({
                  message: "Atleast one outlet_addresses is mandatory",
                  statusCode: 400,
                  success: false,
                });
            }
          }
          const params = {
            TableName: "users",
            Key: { id: { S: doc_id } },
            UpdateExpression:
              "SET #company_name = :company_name, #company_address = :company_address,#company_address_line_2 = :company_address_line_2, #designation = :designation, #trade_license_number = :trade_license_number, #country = :country, #po_box= :po_box, #warehouse_addresses = :warehouse_addresses, #outlet_addresses = :outlet_addresses, #updated_at = :updated_at ",
            ExpressionAttributeNames: {
              "#company_name": "company_name",
              "#company_address": "company_address",
              "#company_address_line_2": "company_address_line_2",
              "#designation": "designation",
              "#trade_license_number": "trade_license_number",
              "#country": "country",
              "#po_box": "po_box",
              "#warehouse_addresses": "warehouse_addresses",
              "#outlet_addresses": "outlet_addresses",
              "#updated_at": "updated_at"
            },
            ExpressionAttributeValues: {
              ":company_name": {
                S: company_name || findData?.Items[0]?.company_name?.S || "",
              },
              ":company_address": {
                S:
                  company_address ||
                  findData?.Items[0]?.company_address?.S ||
                  "",
              },
              ":company_address_line_2": {
                S:
                  company_address_line_2 ||
                  findData?.Items[0]?.company_address_line_2?.S ||
                  "",
              },
              ":designation": {
                S: designation || findData?.Items[0]?.designation?.S || "",
              },
              ":trade_license_number": {
                S:
                  trade_license_number ||
                  findData?.Items[0]?.trade_license_number?.S ||
                  "",
              },
              ":country": {
                S: country || findData?.Items[0]?.country?.S || "",
              },
              ":po_box": { S: po_box || findData?.Items[0]?.po_box?.S || "" },
              ":warehouse_addresses": {
                L:
                  warehouse_addresses?.map((address) => ({
                    M: {
                      address: { S: address.address },
                      po_box: { S: address.po_box },
                    },
                  })) ||
                  findData?.Items[0]?.warehouse_addresses?.L ||
                  [],
              },
              ":outlet_addresses": {
                L:
                  outlet_addresses?.map((address) => ({
                    M: {
                      address: { S: address.address },
                      po_box: { S: address.po_box },
                    },
                  })) ||
                  findData?.Items[0]?.outlet_addresses?.L ||
                  [],
              },
              ":updated_at": { S: new Date().toISOString() }
            },
          };
          // console.log(params, "paramsmsmsmsssmm", warehouse_addresses,"outlet_addresses",outlet_addresses)
          await dynamoDBClient.send(new UpdateItemCommand(params));
          return res.status(200).json({
            message: "User data updated successfully",
            statusCode: 200,
            success: true,
            data: { id: doc_id }
          });
        } else if (user_type == "employee" && slide == 2) {
          // console.log(req.files, "req.filesssss employee");
          let passport = req?.files?.passport[0]?.filename;
          let residence_visa = req?.files.residence_visa[0]?.filename;
          let emirate_id_pic = req?.files?.emirate_id_pic[0]?.filename;
          const params = {
            TableName: "users",
            Key: { id: { S: doc_id } },
            UpdateExpression:
              "SET #emirates_id = :emirates_id, #passport = :passport, #residence_visa = :residence_visa,#emirate_id_pic = :emirate_id_pic",
            ExpressionAttributeNames: {
              "#emirates_id": "emirates_id",
              "#passport": "passport",
              "#residence_visa": "residence_visa",
              "#emirate_id_pic": "emirate_id_pic",
            },
            ExpressionAttributeValues: {
              ":emirates_id": {
                S: emirates_id || findData?.Items[0]?.emirates_id?.S || "",
              },
              ":passport": {
                S: passport || findData?.Items[0]?.passport?.S || "",
              },
              ":residence_visa": {
                S:
                  residence_visa || findData?.Items[0]?.residence_visa?.S || "",
              },
              ":emirate_id_pic": {
                S:
                  emirate_id_pic || findData?.Items[0]?.emirate_id_pic?.S || "",
              },
            },
          };
          // console.log(params, "paramsnasdas");
          await dynamoDBClient.send(new UpdateItemCommand(params));
          return res.status(200).json({
            message: "User data updated successfully",
            statusCode: 200,
            success: true,
            data: { id: doc_id }
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Email already exist!..",
            statusCode: 400,
          });
        }
      }

      if (findData?.Count > 0 && slide == 3) {
        let trade_license = req?.files?.trade_license?.length
          ? req?.files?.trade_license[0]?.filename
          : findData?.Items[0]?.trade_license?.S || "";
        // if (
        //   findData?.Items[0]?.trade_license?.S &&
        //   req?.files?.trade_license?.length&&req?.files?.trade_license?.length>0
        // ) {
        //   await deleteImageFromS3(findData?.Items[0]?.trade_license?.S);
        //   await removefIle(findData?.Items[0]?.trade_license?.S, user_type);
        // }
        let cheque_scan = req.files?.cheque_scan?.length
          ? req.files?.cheque_scan[0]?.filename
          : findData?.Items[0]?.cheque_scan?.S || "";
        // if (
        //   findData?.Items[0]?.cheque_scan?.S &&
        //   req.files?.cheque_scan?.length&&req.files?.cheque_scan?.length>0
        // ) {
        //   await deleteImageFromS3(findData?.Items[0]?.cheque_scan?.S);
        //   await removefIle(findData?.Items[0]?.cheque_scan?.S, user_type);
        // }
        let vat_certificate = req.files?.vat_certificate?.length
          ? req.files?.vat_certificate[0]?.filename
          : findData?.Items[0]?.vat_certificate?.S || "";
        // if (
        //   findData?.Items[0]?.vat_certificate?.S &&
        //   req.files?.vat_certificate?.length&&req.files?.vat_certificate?.length>0
        // ) {
        //   await deleteImageFromS3(findData?.Items[0]?.vat_certificate?.S);
        //   await removefIle(findData?.Items[0]?.vat_certificate?.S, user_type);
        // }
        let residence_visa = req.files?.residence_visa?.length
          ? req.files?.residence_visa[0]?.filename
          : findData?.Items[0]?.residence_visa?.S || "";
        // if (
        //   req.files?.residence_visa?.length &&req.files?.residence_visa?.length>0 &&
        //   findData?.Items[0]?.residence_visa?.S
        // ) {
        //   await deleteImageFromS3(findData?.Items[0]?.residence_visa?.S);
        //   await removefIle(findData?.Items[0]?.residence_visa?.S, user_type);
        // }
        let emirate_id_pic = req.files?.emirate_id_pic?.length
          ? req.files?.emirate_id_pic[0]?.filename
          : findData?.Items[0]?.emirate_id_pic?.S || "";
        // if (
        //   req.files?.emirate_id_pic?.length &&req.files?.emirate_id_pic?.length>0 &&
        //   findData?.Items[0]?.emirate_id_pic?.S
        // ) {
        //   await deleteImageFromS3(findData?.Items[0]?.emirate_id_pic?.S);
        //   await removefIle(findData?.Items[0]?.emirate_id_pic?.S, user_type);
        // }
        if (
          ["vendor", "seller", "logistic"].includes(user_type?.toLowerCase()) &&
          slide == 3
        ) {
          const params = {
            TableName: "users",
            Key: { id: { S: doc_id } },
            UpdateExpression:
              "SET #trade_license = :trade_license, #cheque_scan = :cheque_scan, #vat_certificate = :vat_certificate, #residence_visa = :residence_visa , #emirates_id = :emirates_id, #iban = :iban , #emirate_id_pic= :emirate_id_pic, #updated_at:updated_at",
            ExpressionAttributeNames: {
              "#trade_license": "trade_license",
              "#cheque_scan": "cheque_scan",
              "#vat_certificate": "vat_certificate",
              "#residence_visa": "residence_visa",
              "#emirates_id": "emirates_id",
              "#iban": "iban",
              "#emirate_id_pic": "emirate_id_pic",
              "#updated_at": "updated_at"
            },
            ExpressionAttributeValues: {
              ":trade_license": { S: trade_license },
              ":cheque_scan": { S: cheque_scan },
              ":vat_certificate": { S: vat_certificate },
              ":residence_visa": { S: residence_visa },
              ":emirates_id": { S: emirates_id || "" },
              ":iban": { S: iban || "" },
              ":emirate_id_pic": { S: emirate_id_pic || "" },
              ":updated_at": { S: new Date().toISOString() }
            },
          };
          console.log(params, "apramnsnssnsm");
          await dynamoDBClient.send(new UpdateItemCommand(params));
          return res.status(200).json({
            message: "User data updated successfully",
            statusCode: 200,
            success: true,
            data: { id: doc_id }
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Email already exist!..",
            statusCode: 400,
          });
        }
      }
      if (findData?.Count > 0 && slide == 4 && user_type == "logistic") {
        if (
          !db_driver_details_array &&
          (driver_name_array?.length == 0 ||
            req.files?.driver_image?.length == 0 ||
            req.files?.driving_license?.length == 0)
        ) {
          return res
            .status(400)
            .json({
              message: "Atleast one driver_details required",
              statusCode: 400,
              success: false,
            });
        }
        // console.log(
        //   vehicle_details_array,
        //   "vehicle_details_array",
        //   JSON.stringify(vehicle_details_array)
        // );

        if (vehicle_details_array?.length == 0) {
          return res
            .status(400)
            .json({
              message: "Atleast one vehicle details required",
              statusCode: 400,
              success: false,
            });
        }
        let driver_details_array = db_driver_details_array?.length
          ? [...db_driver_details_array]
          : [];
        let driver_images_arr = req?.files?.driver_images;
        let driving_license_arr = req.files?.driving_license;
        for (let i = 0; i < driver_name_array?.length; i++) {
          let obj = {
            name: driver_name_array[i],
            drive_image: driver_images_arr[i]?.filename || "",
            driving_license: driving_license_arr[i]?.filename || "",
            driving_license_number: driver_license_number_array[i],
          };
          driver_details_array.push(obj);
        }
        // console.log(driver_details_array, "req.filesssssssssssssss");

        const params = {
          TableName: "users",
          Key: { id: { S: doc_id } },
          UpdateExpression:
            "SET #vehicle_details_array = :vehicle_details_array, #driver_details_array = :driver_details_array , #updated_at=:updated_at",
          ExpressionAttributeNames: {
            "#vehicle_details_array": "vehicle_details_array",
            "#driver_details_array": "driver_details_array",
            "#updated_at": "updated_at"
          },
          ExpressionAttributeValues: {
            ":vehicle_details_array": {
              L:
                vehicle_details_array?.map((el) => ({
                  M: {
                    brand: { S: el?.brand || "" },
                    number: { S: el?.number || "" },
                  },
                })) ||
                findData?.Items[0]?.vehicle_details_array?.L ||
                [],
            },
            ":driver_details_array": {
              L:
                driver_details_array?.map((el) => ({
                  M: {
                    name: { S: el?.name },
                    drive_image: { S: el?.drive_image },
                    driving_license: { S: el?.driving_license },
                    driving_license_number: { S: el?.driving_license_number },
                  },
                })) ||
                findData?.Items[0]?.driver_details_array?.L ||
                [],
            },
            "updated_at": { S: new Date().toISOString() }
          },
        };
        // console.log(
        //   params,
        //   "apransnsnsn params",
        //   slide,
        //   "1!@!@!@@ sl l ideeeeeee"
        // );
        await dynamoDBClient.send(new UpdateItemCommand(params));
        return res.status(200).json({
          message: "User data updated successfully",
          statusCode: 200,
          success: true,
          data: { id: doc_id }
        });
      }
      // console.log("before email check ")
      const findEmailExist = await dynamoDBClient.send(
        new ScanCommand({
          // new QueryCommand({
          TableName: "users",
          FilterExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
        })
      );
      // console.log(" email check ")
      if (findEmailExist.Count > 0) {
        // if (req.files && req.files?.profile_photo?.length&&req.files?.profile_photo?.length>0) {
        //   await deleteImageFromS3(req.files?.profile_photo[0]?.filename);
        //   await removefIle(req.files?.profile_photo[0]?.filename, user_type);
        // }
        return res.status(400).json({
          success: false,
          message: "Email already exist!",
          statusCode: 400,
        });
      }
      if (phone) {
        // if (req.files && req.files?.profile_photo?.length&& req.files?.profile_photo?.length>0) {
        //   await deleteImageFromS3(req.files?.profile_photo[0]?.filename);
        //   await removefIle(req.files?.profile_photo[0]?.filename, user_type);
        // }
        const findPhoneExist = await dynamoDBClient.send(
          new ScanCommand({
            TableName: "users",
            FilterExpression: "phone = :phone",
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
      }
      let salt = environmentVars.salt;
      let randomPassword = encryptStringWithKey(
        req.body.email.toLowerCase()?.slice(0, 6)
      );
      // console.log(randomPassword, "randomPasswordrandomPassword");
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
          dob: { S: dob || "" },
          user_type: { S: user_type },
          role: { S: role || "" },
          country: { S: country || "" },
          password: { S: hashPassword },
          created_at: { S: new Date().toISOString() },
          updated_at: { S: new Date().toISOString() }
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
      // console.log("userData:12", userData);
      // if (userData) {
      // await sendPasswordViaEmail(res, data);
      // }
      return res
        .status(201)
        .json({
          message: "User register successfully",
          statusCode: 201,
          success: true,
          data: { id }
        });
    } catch (err) {
      try {
        if (req.files) {
          for (let el in req?.files) {
            for (let ele of req?.files[el]) {
              // console.log(ele, "eleleellel")
              await deleteImageFromS3(ele?.filename);
              await removefIle(ele?.filename, req.body.user_type);
            }
          }
        }
      } catch (err) {
        console.error(err, "eee");
      }
      console.log(err, "errorororro");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
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
      return res
        .status(200)
        .json({
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
      // let number = Math.round(Math.random() * 10000)
      // if (number.length == 3) {
      //   number = number + "0"
      // } else if (number.length == 2) {
      //   number = number + "00"
      // } else if (number.length == 1) {
      //   number = number + "000"
      // }
      let otp = await generateOTP();
      if (otp.length == 3) {
        otp = otp + "0";
      } else if (otp.length == 2) {
        otp = otp + "00";
      } else if (otp.length == 1) {
        otp = otp + "000";
      }
      let currentTime = Date.now();
      currentTime = currentTime?.toString();
      let get = await pinePointServices(req.query.email, otp);
      if (get) {
        const find = await dynamoDBClient.send(
          new ScanCommand({
            TableName: "userOtp",
            FilterExpression: "email = :email",
            ExpressionAttributeValues: {
              ":email": { S: req.query.email },
            },
          })
        );
        // console.log(find, "Asdad", find?.Items[0])
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
          // console.log(params, "parmansns")
          await dynamoDBClient.send(new UpdateItemCommand(params));
        } else {
          let id = uuidv4()?.replace(/-/g, "");
          const params = {
            TableName: "userOtp",
            Item: {
              email: { S: req.query.email },
              otp: { S: otp },
              creationTime: { N: currentTime },
              createdAt: { N: currentTime },
              updatedAt: { N: currentTime },
              id: { S: id },
            },
          };
          // console.log(params, "parasnsns");
          let Data = await dynamoDBClient.send(new PutItemCommand(params));
          // console.log(Data, "dayayayaya");
        }
        return res
          .status(200)
          .json({
            message: "Otp send to email for verify",
            statusCode: 200,
            success: true,
          });
      } else {
        return res
          .status(400)
          .json({
            message:
              "not able to send otp on email , kindly do after some time",
            statusCode: 400,
            success: false,
          });
      }
    } catch (err) {
      console.error(err, "Eeee");

      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async verifyEmailWithOtpCheck(req, res) {
    try {
      let { otp, email } = req.query;
      const find = await dynamoDBClient.send(
        new ScanCommand({
          TableName: "userOtp",
          FilterExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
        })
      );
      console.log(find, "Asdad", find?.Items[0]);
      if (find && find?.Count > 0) {
        let otpDb = find?.Items[0]?.otp?.S;
        let creationTime = parseInt(find?.Items[0]?.creationTime?.S, 10);
        let nowTime = Date.now();
        const timeDifference = nowTime - creationTime; // Difference in milliseconds
        const tenMinutes = 600000; //10 minutes in milliseconds
        if (timeDifference > tenMinutes) {
          return res
            .status(400)
            .json({
              message: "Otp is expired",
              statusCode: 400,
              success: false,
            });
        } else if (otpDb != otp) {
          return res
            .status(400)
            .json({ message: "In-valid otp", statusCode: 400, success: false });
        } else {
          return res
            .status(200)
            .json({
              message: "Email verified successfully",
              statusCode: 200,
              success: true,
            });
        }
        // console.log("otpDb", "as",
        //   creationTime,
        //   nowTime, "timeDifferencetimeDifference", timeDifference)
        // const findData = await dynamoDBClient.send(new QueryCommand({
        //   TableName: "users",
        //   IndexName: "email", // replace with your GSI name
        //   KeyConditionExpression: "email = :email",
        //   ExpressionAttributeValues: {
        //     ":email": { S: email },
        //   },
        // }));
        // console.log(findData, "findDatafindData")

        // if (findData && findData?.Count == 0) {
        //   return res.status(400).json({ message: "No data found", statusCode: 400, success: false })
        // // } else if (findData&&findData?.Items[0]?.is_email_verified?.) {
        // } else  {
        //   const params = {
        //     TableName: "users",
        //     Key: { id: { S: findData?.Items[0]?.id?.S } },
        //     UpdateExpression:
        //       "SET #is_email_verified = :is_email_verified",
        //     ExpressionAttributeNames: {
        //       "#is_email_verified": "is_email_verified",
        //       "#is_email_verified": "is_email_verified",
        //     },
        //     ExpressionAttributeValues: {
        //       ":is_email_verified": {
        //         Bool: true
        //       },
        //     },
        //   };
        //   await dynamoDBClient.send(new UpdateItemCommand(params));
        // }
      } else {
        return res
          .status(400)
          .json({ message: "No data found", statusCode: 400, success: false });
      }
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
      const findData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          IndexName: "email", // replace with your GSI name
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
        })
      );

      console.log(findData?.Items[0], "dinffdddaa", "findData");
      if (findData?.Count > 0 && findData?.Items?.length) {
        let checkpassword = await bcrypt.compare(
          password,
          findData?.Items[0]?.password?.S
        );

        if (!checkpassword) {
          return res.status(400).json({
            message: "Password invalid",
            success: false,
            statusCode: 400,
          });
        }
        let otp = await generateOTP();
        console.log(otp, "otptptptp");
        if (otp.length == 3) {
          otp = otp + "0";
        } else if (otp.length == 2) {
          otp = otp + "00";
        } else if (otp.length == 1) {
          otp = otp + "000";
        }
        let currentTime = Date.now();
        currentTime = currentTime?.toString();
        // console.log("ddddddddddddd")
        let get = await sendOtpForLogin(email, otp);
        if (get == false) {
          return res
            .status(400)
            .json({
              message: "internal server error",
              statusCode: 400,
              success: false,
            });
        }
        const find = await dynamoDBClient.send(
          new ScanCommand({
            TableName: "userOtp",
            FilterExpression: "email = :email",
            ExpressionAttributeValues: {
              ":email": { S: email },
            },
          })
        );
        console.log(find, "Asdad", find);
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
          // console.log(params, "parmansns")
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
          console.log(params, "parasnsns");
          let Data = await dynamoDBClient.send(new PutItemCommand(params));
          console.log(Data, "dayayayaya");
        }
        return res
          .status(200)
          .json({
            message: "Otp sent to registered email",
            statusCode: 200,
            success: true,
          });

        let obj = {
          name: findData?.Items[0]?.name?.S,
          email: findData?.Items[0]?.email?.S,
          user_type: findData?.Items[0]?.user_type?.S,
        };
        let token = generateAccessToken(obj);
        let expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1); // Expires in 1 days
        // expiryDate.setTime(expiryDate.getTime() + (60 * 1000)); // Current time + 1 minute

        res
          .cookie("_token", token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: true, // Requires HTTPS connection
            sameSite: "strict", // Restricts the cookie to be sent only in same-site requests
            expires: expiryDate, // Set the expiry date
          })
          .status(200)
          .json({
            success: true,
            message: "Logged in successful",
            statusCode: 200,
          });
      } else {
        console.log("enddddd");
        return res
          .status(400)
          .json({ message: "No data found", statusCode: 400, success: false });
      }
      return;
      if (emailExistCheck?.is_verified == 0) {
        await UserModel.update(
          { is_verified: true },
          { where: { id: emailExistCheck?.id } }
        );
      }
      return;
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
      const findData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "users",
          IndexName: "email", // replace with your GSI name
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
        })
      );
      // console.log(findData?.Items[0], "dinffdddaa", findData);
      if (findData?.Count > 0 && findData?.Items?.length) {
        const find = await dynamoDBClient.send(
          new ScanCommand({
            TableName: "userOtp",
            FilterExpression: "email = :email",
            ExpressionAttributeValues: {
              ":email": { S: email },
            },
          })
        );
        // console.log(find, "Asdad", find?.Items[0])
        if (find && find?.Count > 0) {
          let otpDb = find?.Items[0]?.otp?.S;
          let creationTime = parseInt(find?.Items[0]?.creationTime?.S, 10);
          let nowTime = Date.now();
          const timeDifference = nowTime - creationTime; // Difference in milliseconds
          const tenMinutes = 600000; //10 minutes in milliseconds
          if (timeDifference > tenMinutes) {
            return res
              .status(400)
              .json({
                message: "Otp is expired",
                statusCode: 400,
                success: false,
              });
          } else if (otpDb != otp) {
            return res
              .status(400)
              .json({
                message: "In-valid otp",
                statusCode: 400,
                success: false,
              });
          }
        } else {
          return res
            .status(400)
            .json({
              message: "No data found",
              statusCode: 400,
              success: false,
            });
        }
        let obj = {
          name: findData?.Items[0]?.name?.S,
          email: findData?.Items[0]?.email?.S,
          user_type: findData?.Items[0]?.user_type?.S,
          id: findData?.Items[0]?.id?.S,
        };
        let token = generateAccessToken(obj);
        let expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1); // Expires in 1 days
        // expiryDate.setTime(expiryDate.getTime() + (60 * 1000)); // Current time + 1 minute
        res
          .cookie("_token", token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: true, // Requires HTTPS connection
            sameSite: "strict", // Restricts the cookie to be sent only in same-site requests
            expires: expiryDate, // Set the expiry date
          })
          .status(200)
          .json({
            success: true,
            message: "Logged in successful",
            statusCode: 200,
          });
      } else {
        return res
          .status(400)
          .json({ message: "No data found", statusCode: 400, success: false });
      }
      return;
      if (emailExistCheck?.is_verified == 0) {
        await UserModel.update(
          { is_verified: true },
          { where: { id: emailExistCheck?.id } }
        );
      }
      return;
    } catch (err) {
      console.log(err, "Error in login api user");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async addSubUser(req, res) {
    try {
      let { email, phone, name, country, doc_id, role } = req.body
      role = 'eeeeeeeeee123123123123'
      // let findRoleExist = await dynamoDBClient.send(
      //   new QueryCommand({
      //     TableName: "role",
      //     KeyConditionExpression: "id= :id",
      //     ExpressionAttributeValues: {
      //       ":id": { S: id},
      //     },
      //   })
      // );
      // if (findRoleExist && findRoleExist?.Count == 0) {
      //   return res.status(404).json({ message: "Role not found", statuscode: 404, success: false })
      // }

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
          return res.status(404).json({ message: "Data not found", statuscode: 404, success: false })
        }
        // console.log(findEmailExist ?.Items[0]?.,"aa")
        const params = {
          TableName: "users",
          Key: { id: { S: doc_id } },
          UpdateExpression:
            "SET #name = :name, #phone = :phone, #role =:role, #country= :country , #updated_at=:updated_at",
          ExpressionAttributeNames: {
            "#name": "name",
            "#phone": "phone",
            "#role": "role",
            "#country": "country",
            "#updated_at": "updated_at"
          },
          ExpressionAttributeValues: {
            ":name": { S: name || findEmailExist?.Items[0]?.name?.S },
            ":phone": { S: phone || findEmailExist?.Items[0]?.phone?.S || "" },
            ":role": { S: role || findEmailExist?.Items[0]?.role?.S || "" },
            ":country": { S: country || findEmailExist?.Items[0]?.country?.S || "" },
            ":updated_at": { S: new Date().toISOString()}
          },
        };
        console.log(params, "apramnsnssnsm");
        await dynamoDBClient.send(new UpdateItemCommand(params));
        return res.status(200).json({ message: "User's details update successfully", statusCode: 200, success: true })
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
      // console.log(req.userData, "aaaaaassssdffgklsdj", "findUserExist", "fnd", "findUserExist?.Items", "asdsd")
      let user_type = 'vendor_user'
      if (req.userData?.user_type == 'logistic') {
        user_type = 'logistic_user'
      } else if (req.userData?.user_type == 'seller') {
        user_type = 'seller_user'
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
          role: { S: role || "" },
          created_at: { S: new Date().toISOString() },
          updated_at: { S: new Date().toISOString() }
        },
      };

      // console.log("user_type", "docccleint", params);
      let userData = await dynamoDBClient.send(new PutItemCommand(params));
      let obj = {
        email,
        randomPassword,
        name,
      };
      sendPasswordViaEmailOf(obj)
      res.status(201).json({ message: "User added successfully", statusCode: 200, success: true })
    } catch (err) {
      console.error(err, "error ")
      return res.status(500).json({ message: err?.message, statusCode: 500, success: false })
    }
  }

  async get_all_user(req, res) {
    try {
      let { page, limit, lastEvaluatedKey,created_at } = req.query
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      const offset = (page - 1) * limit;
  
      const queryParams = {
        TableName: "users",
        IndexName: "created_by-index",
        KeyConditionExpression: "created_by = :created_by",
        ExpressionAttributeValues: {
          ":created_by": { S: req.userData?.id },
        },
        Limit: limit,
        ScanIndexForward: false,
        Select: "ALL_ATTRIBUTES", // Retrieve all attributes
        Count: true,
      };
      if (offset > 0) {
        // If offset is greater than 0, set ExclusiveStartKey to start from the correct position
        if(lastEvaluatedKey ){
          queryParams.ExclusiveStartKey = {
            "id": {
              "S": lastEvaluatedKey
            },
            "created_by": {
              "S": req.userData.id //"adab625867164c819584ee15e94c887c"
            },
            "created_at": {
              "S": created_at
            }
          }
        }   
      }
      // console.log(queryParams, "asdasdadadsasd")
      const data = await dynamoDBClient.send(new QueryCommand(queryParams));
      let nextToken = null;
      if (data?.LastEvaluatedKey) {
      let dataFetch= await  simplifyDynamoDBResponse(data.LastEvaluatedKey)
        nextToken = dataFetch;
      }

      let arr = []
      for (let el of data?.Items) {
        let rawData = await simplifyDynamoDBResponse(el);
        delete rawData.password
        arr.push(rawData)
      }

      //fetch total count here 
      const queryParams2 = {
        TableName: "users",
        IndexName: "created_by-index",
        KeyConditionExpression: "created_by = :created_by",
        ExpressionAttributeValues: {
          ":created_by": { S: req.userData?.id },
        },
        Select: "COUNT", // Select COUNT to retrieve the count of matching items
      };

      const countResponse = await dynamoDBClient.send(new QueryCommand(queryParams2));
      const totalCount = countResponse?.Count || 0; // Get the count of matching items

      res.status(200).json({
        message: "Fetch User data", statusCode: 200, success: true, data: arr, nextPageToken: nextToken,
        pagination: { totalCount, page, limit }
      })
      return
    } catch (err) {
      console.error(err, "error ")
      return res.status(500).json({ message: err?.message, statusCode: 500, success: false })
    }
  }


  async delete_user(req, res) {
    try {
      let { id } = req.query
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
        return res.status(400).json({ message: "User not found or deleted already", statusCode: 400, success: false })

      }
      if (data?.Items[0]?.created_by?.S != req.userData?.id) {
        return res.status(400).json({ message: "Not authorise to perform this action", statusCode: 400, success: false })
      }
      const params = {
        TableName: 'users',
        Key: {
          id: { S: id }// Replace with your primary key attributes
        }
      }
      const command = new DeleteItemCommand(params);
      // console.log(command, "command command ")
      const response = await dynamoDBClient.send(command);
      // console.log(response, "response response")
      return res.status(200).json({ message: "User deleted successfully", statusCode: 200, success: true })
    } catch (err) {
      return res.status(500).json({ message: err?.message, statusCode: 500, success: false })
    }
  }





























  async sendForgotPasswordEmail(req, res) {
    try {
      let email = req.body.email?.trim();
      let findEmailExist = await UserModel.findOne({
        where: { email },
        attributes: ["email", "id", "name"],
      });

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
        await forgotPasswordEmail(req, res, obj);
      }
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
      email = req.body.email?.trim();
      let emailExist = await UserModel.findOne({ where: { email }, raw: true });
      if (!emailExist) {
        res
          .status(400)
          .json({ message: "User not found", success: false, statusCode: 400 });
        return;
      }
      let fetchDoc = await userOtpModel.findOne({
        where: { user_id: emailExist?.id },
      });

      if (!fetchDoc) {
        return res.status(400).json({
          message: "Internal server error",
          success: false,
          statusCode: 400,
        });
      }
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
      if (fetchDoc?.otp_code != otp_code) {
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
      // console.log(err, "Error ");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }


  async resetUserPassword(req, res) {
    try {
      let password = req.body.password;
      let emailData = "";

      if (req.body.email) {
        let email = req.body?.email?.trim();
        emailData = email;
        let emailExist = await UserModel.findOne({
          where: { email: emailData },
          attributes: ["email", "id", "password"],
        });
        if (!emailExist) {
          return res.status(400).json({
            message: "User not found",
            success: false,
            statusCode: 400,
          });
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
        emailData = proof?.email;
      }
      // console.log(emailData,"emailDataemailDataemailDataemailData")

      let hashPassword = await bcrypt.hash(password, salt);
      await UserModel.update(
        { password: hashPassword },
        { where: { email: emailData } }
      );
      return res.status(200).json({
        message: "Password change successfully",
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      // console.log(err, "Error");
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

  // async getUserAccountInfo(req, res) {
  //   try {
  //     const carts = await CartModel.count({
  //       where: { user_id: req.userData.id },
  //     });
  //     const wishlists = await WishlistModel.count({
  //       where: { user_id: req.userData.id },
  //     });
  //     const coupons = await CouponModel.count();
  //     return res.status(200).json({
  //       success: true,
  //       message: "Data fetched successfully",
  //       data: { carts, wishlists, coupons },
  //     });
  //   } catch (err) {
  //     return res.status(500).json({ success: false, message: err?.message });
  //   }
  // }

  // email send success fully code start



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
