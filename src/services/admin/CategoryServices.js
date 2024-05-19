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
  DeleteItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";

import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

import formidable from "formidable";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

class CategoryServices {
  async add(req, res) {
    try {
      let { title, status, id } = req.body;
      // if (req.userData?.user_type != "super_admin") {
      //   return res
      //     .status(400)
      //     .json({ message: "Not Authorise", statusCode: 400, success: false });
      // }
      let findData;
      if (id) {
        findData = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "category",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: id },
            },
          })
        );
        // console.log("findDatafindData22", findData?.Items[0]);
        if (findData && findData?.Count > 0) {
          const params = {
            TableName: "category",
            Key: { id: { S: id } },
            UpdateExpression:
              "SET #title = :title, #status = :status, #updated_at = :updated_at",
            ExpressionAttributeNames: {
              "#title": "title",
              "#status": "status",
              "#updated_at": "updated_at",
            },
            ExpressionAttributeValues: {
              ":title": { S: title || findData?.Items[0]?.title?.S || "" },
              ":status": {
                S: status || findData?.Items[0]?.status?.S || "active",
              },
              ":updated_at": { S: new Date().toISOString() },
            },
          };
          const findExist = await dynamoDBClient.send(
            new QueryCommand({
              TableName: "category",
              IndexName: "title", // Use the correct GSI name
              KeyConditionExpression: "title = :title",
              FilterExpression: "id <> :id",
              ExpressionAttributeValues: {
                ":title": { S: title },
                ":id": { S: id },
              },
            })
          );

          if (findExist?.Count > 0) {
            return res.status(400).json({
              message: "Title already exist",
              statusCode: 400,
              success: false,
            });
          } else {
            await dynamoDBClient.send(new UpdateItemCommand(params));
            return res.status(200).json({
              message: "Data updated successfully",
              statusCode: 200,
              success: true,
            });
          }
        } else {
          return res.status(400).json({
            message: "Document Not Found",
            statusCode: 400,
            success: false,
          });
        }
      } else {
        const findEmailExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "category",
            IndexName: "title", // replace with your GSI name
            KeyConditionExpression: "title = :title",
            ExpressionAttributeValues: {
              ":title": { S: title },
            },
          })
        );
        if (findEmailExist.Count > 0) {
          return res.status(400).json({
            success: false,
            message: "Category name already exist!",
            statusCode: 400,
          });
        }
        id = uuidv4();
        id = id?.replace(/-/g, "");
        const params = {
          TableName: "category",
          Item: {
            id: { S: id },
            title: { S: title },
            status: { S: status },
            created_at: { S: new Date().toISOString() },
            updated_at: { S: new Date().toISOString() },
          },
        };
        // console.log("docClient", "docccleint", params);
        let Data = await dynamoDBClient.send(new PutItemCommand(params));
        return res.status(201).json({
          message: "Category add successfully",
          statusCode: 201,
          success: true,
        });
      }
    } catch (err) {
      console.log(err, "errorororro");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  //change status
  async changeStatus(req, res) {
    try {
      let { status, id } = req.body;
      // if (req.userData?.user_type != "super_admin") {
      //   return res
      //     .status(400)
      //     .json({ message: "Not Authorise", statusCode: 400, success: false });
      // }
      let findData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "category",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (findData && findData?.Count > 0) {
        const params = {
          TableName: "category",
          Key: { id: { S: id } },
          UpdateExpression: "SET #status = :status, #updated_at = :updated_at",
          ExpressionAttributeNames: {
            "#status": "status",
            "#updated_at": "updated_at",
          },
          ExpressionAttributeValues: {
            ":status": {
              S: status || findData?.Items[0]?.status?.S || "active",
            },
            ":updated_at": { S: new Date().toISOString() },
          },
        };
        await dynamoDBClient.send(new UpdateItemCommand(params));
        return res.status(200).json({
          message: "Category Data Status updated successfully",
          statusCode: 200,
          success: true,
        });
      } else {
        return res.status(400).json({
          message: "Document Not Found",
          statusCode: 400,
          success: false,
        });
      }
    } catch (err) {
      console.log(err, "errorororro");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async get_cat_data(req, res) {
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      const params = {
        TableName: "category",
      };

      // let get=await dynamoDBClient.scan(params)
      let get = await dynamoDB.scan(params).promise();
      // , async (err, data) => {
      //   if (err) {
      //     console.error("Error:", err);
      //   } else {
      //     if (data?.Items) {
      //       get = [...data?.Items];
      //     }
      //     // Handle data or return response
      //     console.log("Scan succeeded:", data?.Items);
      //   }
      // });
      // console.log(get, "getgegetgetgetge");
      res.status(200).json({
        message: "Fetch Data",
        data: get,
        statusCode: 200,
        success: true,
      });
      return;
    } catch (err) {
      console.error(err, "erroror");
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  // not in use
  // async delete(req, res) {
  //   try {
  //     let id = req.query.id;
  //     const params = {
  //       TableName: "category",
  //       Key: {
  //         id: id, // Replace 'PrimaryKey' and 'Value' with your item's actual primary key and value
  //       },
  //     };
  //     let result = await dynamoDBClient.send(new DeleteItemCommand(params));
  //     console.log(result, "checkkkk");
  //     return res.status(200).json({
  //       message: "Delete successfully",
  //       statusCode: 200,
  //       success: true,
  //       data: result,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     return res
  //       .status(500)
  //       .json({ message: err?.message, statusCode: 500, success: false });
  //   }
  // }

  async delete(req, res) {
    try {
      let { id } = req.query
      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "category",
          // IndexName: "created_by-index", // Replace with your GSI name for phone like phone-index
          KeyConditionExpression: "id = :id",
          // ProjectionExpression: "email, phone, id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (data?.Count == 0) {
        return res.status(400).json({ message: "Category not found or deleted already", statusCode: 400, success: false })
      }
      const params = {
        TableName: 'category',
        Key: {
          id: { S: id }// Replace with your primary key attributes
        }
      }
      const command = new DeleteItemCommand(params);
      await dynamoDBClient.send(command);
      return res.status(200).json({ message: "Category deleted successfully", statusCode: 200, success: true })
    } catch (err) {
      return res.status(500).json({ message: err?.message, statusCode: 500, success: false })
    }
  }


}

const CategoryServicesObj = new CategoryServices();
export default CategoryServicesObj;
