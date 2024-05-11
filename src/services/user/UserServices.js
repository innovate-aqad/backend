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
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import AWS from 'aws-sdk'
import formidable from "formidable";
import { pinePointServices, sendEmailOtp } from "../../helpers/aswSesServices.js";

// const dynamoDBClient = new DynamoDBClient({ region: process.env.Aws_region });
const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});


AWS.config.update({
  region: 'us-east-1' //process.env.Aws_region //'us-east-1'  // Change to your region
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

// const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
async function insertItem(table) {
  const params = {
    TableName: table,
    Item: {
      id: { S: "123" },
      name: { S: " updateJohn Doe" },
      email: { S: "je@example.com" },
      phone: { S: "123-456-7890" },
      role: { S: "add product" },
      user_type: { S: "vendor" },
      // Additional attributes...
    },
  };

  try {
    const result = await dynamoDBClient.send(new PutItemCommand(params));
    console.log("Item inserted successfully:", result);
  } catch (err) {
    console.error("Error inserting item:", err);
  }
}
// insertItem('users');
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
        iban,
        vehicle_details_array,
        driver_name_array,
      } = req.body;
      email = email?.trim();
      let findData;
      if (slide == 2 || slide == 3 || doc_id) {
        findData = await dynamoDBClient.send(
          new ScanCommand({
            TableName: "users",
            FilterExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: doc_id },
            },
          })
        );
      }
      console.log(
        findData?.Items[0]?.profile_photo?.S,
        "findDatafindData22",
        findData?.Items[0]
      );
      // return
      if (findData?.Count > 0 && slide == 1) {
        let profile_photo = findData?.Items[0]?.profile_photo?.S;
        if (req.files && req.files?.profile_photo?.length) {
          profile_photo = req.files?.profile_photo[0]?.filename;
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
          },
          ExpressionAttributeValues: {
            ":profile_photo": { S: profile_photo },
            ":name": { S: name || findData?.Items[0]?.name?.S },
            ":dob": { S: dob || findData?.Items[0]?.dob?.S },
          },
        };
        await dynamoDBClient.send(new UpdateItemCommand(params));
        return res.status(200).json({
          message: "User data updated successfully",
          statusCode: 200,
          success: true,
        });
      }

      if (findData?.Count > 0 && slide == 2) {
        if (
          ["vendor", "seller", "logistic"].includes(user_type?.toLowerCase()) &&
          slide == 2
        ) {
          const params = {
            TableName: "users",
            Key: { id: { S: doc_id } },
            UpdateExpression:
              "SET #company_name = :company_name, #company_address = :company_address,#company_address_line_2 = :company_address_line_2, #designation = :designation, #trade_license_number = :trade_license_number, #country = :country, #po_box= :po_box, #warehouse_addresses = :warehouse_addresses",
            ExpressionAttributeNames: {
              "#company_name": "company_name",
              "#company_address": "company_address",
              "#company_address_line_2": "company_address_line_2",
              "#designation": "designation",
              "#trade_license_number": "trade_license_number",
              "#country": "country",
              "#po_box": "po_box",
              "#warehouse_addresses": "warehouse_addresses",
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
                  warehouse_addresses ||
                  findData?.Items[0]?.warehouse_addresses?.L ||
                  [],
              },
            },
          };
          await dynamoDBClient.send(new UpdateItemCommand(params));
          return res.status(200).json({
            message: "User data updated successfully",
            statusCode: 200,
            success: true,
          });
        } else if (user_type == "employee" && slide == 2) {
          console.log(req.files, "req.filesssss employee");
          let passport = req.files.passport[0]?.filename;
          let residence_visa = req.files.residence_visa[0]?.filename;
          const params = {
            TableName: "users",
            Key: { id: { S: doc_id } },
            UpdateExpression:
              "SET #emirates_id = :emirates_id, #passport = :passport, #residence_visa = :residence_visa",
            ExpressionAttributeNames: {
              "#emirates_id": "emirates_id",
              "#passport": "passport",
              "#residence_visa": "residence_visa",
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
            },
          };
          console.log(params, "paramsnasdas");
          await dynamoDBClient.send(new UpdateItemCommand(params));
          return res.status(200).json({
            message: "User data updated successfully",
            statusCode: 200,
            success: true,
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
        console.log(req.files, "req.filesssssssssssssss");
        let trade_license = req?.files?.trade_license?.length
          ? req?.files?.trade_license[0]?.filename
          : findData?.Items[0]?.trade_license?.S || "";
        let cheque_scan = req.files?.cheque_scan?.length
          ? req.files?.cheque_scan[0]?.filename
          : findData?.Items[0]?.cheque_scan?.S || "";
        let vat_certificate = req.files?.vat_certificate?.length
          ? req.files?.vat_certificate[0]?.filename
          : findData?.Items[0]?.vat_certificate?.S || "";
        let residence_visa = req.files?.residence_visa?.length
          ? req.files?.residence_visa[0]?.filename
          : findData?.Items[0]?.residence_visa?.S || "";
        if (
          ["vendor", "seller", "logistic"].includes(user_type?.toLowerCase()) &&
          slide == 3
        ) {
          const params = {
            TableName: "users",
            Key: { id: { S: doc_id } },
            UpdateExpression:
              "SET #trade_license = :trade_license, #cheque_scan = :cheque_scan, #vat_certificate = :vat_certificate, #residence_visa = :residence_visa , #emirates_id = :emirates_id, #iban = :iban",
            ExpressionAttributeNames: {
              "#trade_license": "trade_license",
              "#cheque_scan": "cheque_scan",
              "#vat_certificate": "vat_certificate",
              "#residence_visa": "residence_visa",
              "#emirates_id": "emirates_id",
              "#iban": ":iban",
            },
            ExpressionAttributeValues: {
              ":trade_license": { S: trade_license },
              ":cheque_scan": { S: cheque_scan },
              ":vat_certificate": { S: vat_certificate },
              ":residence_visa": { S: residence_visa },
              ":emirates_id": { S: emirates_id },
              ":iban": { S: iban || "" },
            },
          };
          await dynamoDBClient.send(new UpdateItemCommand(params));
          return res.status(200).json({
            message: "User data updated successfully",
            statusCode: 200,
            success: true,
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Email already exist!..",
            statusCode: 400,
          });
        }
      }
      if (findData?.Count > 0 && slide == 4) {
        let driver_details_array = [];
        let driver_images_arr = req.files.drive_image;
        let driving_license_arr = req.files.driving_license;
        for (let i = 0; i < driver_name_array?.length; i++) {
          let obj = {
            name: driver_name_array[i],
            drive_image: driver_images_arr[i],
            driving_license: driving_license_arr[i],
          };
          driver_details_array.push(obj);
        }
        // console.log(req.files, "req.filesssssssssssssss")

        const params = {
          TableName: "users",
          Key: { id: { S: doc_id } },
          UpdateExpression:
            "SET #vehicle_details_array = :vehicle_details_array, #driver_details_array = :driver_details_array",
          ExpressionAttributeNames: {
            "#vehicle_details_array": "vehicle_details_array",
            "#driver_details_array": "driver_details_array",
          },
          ExpressionAttributeValues: {
            ":vehicle_details_array": {
              L:
                vehicle_details_array ||
                findData?.Items[0]?.vehicle_details_array?.L ||
                [],
            },
            ":driver_details_array": {
              L:
                driver_details_array ||
                findData?.Items[0]?.driver_details_array?.L ||
                [],
            },
          },
        };
        await dynamoDBClient.send(new UpdateItemCommand(params));
        return res.status(200).json({
          message: "User data updated successfully",
          statusCode: 200,
          success: true,
        });
      }
      const findEmailExist = await dynamoDBClient.send(
        new ScanCommand({
          TableName: "users",
          FilterExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: email },
          },
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
        },
      };
      console.log("docClient", "docccleint", params);
      let userData;
      userData = await dynamoDBClient.send(new PutItemCommand(params));
      // docClient.put(params, (err, data) => {
      //   if (err) {
      //     console.error("Error inserting item:", err);
      //   } else {
      //     console.log("Successfully inserted item:", data);
      //   }
      // });
      // const userData = await UserModel.create(params, { raw: true });
      console.log("userData:12", userData);
      // if (userData) {
      // await sendPasswordViaEmail(res, data);
      // }
      return res
        .status(201)
        .json({ message: "user register", statusCode: 201, data: userData, success: true });
    } catch (err) {
      console.log(err, "errorororro");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }



  async getUserByEmail(req, res) {
    try {

      const find = await dynamoDBClient.send(
        new ScanCommand({
          TableName: "users",
          FilterExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": { S: req.query.email },
          },
        })
      );

      const simplifyDynamoDBResponse = (data) => {
        const simpleData = {};
        for (const key in data) {
          if (data[key].S !== undefined) {
            simpleData[key] = data[key].S;
          } else if (data[key].N !== undefined) {
            simpleData[key] = Number(data[key].N);
          } else if (data[key].BOOL !== undefined) {
            simpleData[key] = data[key].BOOL;
          } else if (data[key].NULL !== undefined) {
            simpleData[key] = null;
          }
          // Add more types as needed
        }
        return simpleData;
      };

      let rawData = simplifyDynamoDBResponse(find?.Items[0])
      delete rawData?.password
      return res.status(200).json({ message: "Get data", data: rawData, statusCode: 200, success: true })

    } catch (err) {
      return res.status(500).json({ message: err?.message, statusCode: 500, success: false })
    }
  }

  async sendVerifyEmail(req, res) {
    try {
      let get = await pinePointServices(req)
      console.log(get, "GEt")

      return res.status(200).json({ message: "get", data: get })
    } catch (err) {
      return res.status(500).json({ message: err?.message, statusCode: 500, success: false })
    }
  }





  




  async loginUser(req, res) {
    try {
      let { email, password } = req.body;
      let emailExistCheck = await UserModel.findOne({
        where: { email },
        raw: true,
      });
      if (!emailExistCheck) {
        return res.status(400).json({
          message: "Email not found",
          success: false,
          statusCode: 400,
        });
      }
      let checkpassword = await bcrypt.compare(
        password,
        emailExistCheck?.password
      );

      if (!checkpassword) {
        return res.status(400).json({
          message: "Password invalid",
          success: false,
          statusCode: 400,
        });
      }
      delete emailExistCheck?.password;
      // console.log(emailExistCheck, "emailExistCheck22222emailExistCheck");
      let token = generateAccessToken(emailExistCheck);
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
      // console.log(emailExistCheck?.is_verified,"emailExistCheck?.is_verifiedemailExistCheck?.is_verified")
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
