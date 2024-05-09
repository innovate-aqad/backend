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
  ScanCommand, UpdateItemCommand,DeleteItemCommand
} from "@aws-sdk/client-dynamodb";

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
      let findData;
      if (id) {
        findData = await dynamoDBClient.send(
          new ScanCommand({
            TableName: "category",
            FilterExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: id },
            },
          })
        );
      }
      console.log("findDatafindData22", findData?.Items[0])
      if (findData) {
        const params = {
          TableName: "category",
          Key: { id: { S: id } },
          UpdateExpression: "SET #title = :title, #status = :status",
          ExpressionAttributeNames: {
            "#title": "title",
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":title": { S: title || findData?.Items[0]?.title?.S || "" },
            ":status": { S: status ? "active" : "inactive" || findData?.Items[0]?.status?.S || 'active' },
          },
        };
        const findExist = await dynamoDBClient.send(
          new ScanCommand({
            TableName: "category",
            FilterExpression: "title = :title AND id <> :id", // Exclude the current item by its ID
            ExpressionAttributeValues: {
              ":title": { S: title },
              ":id": { S: id } // Assuming 'id' is the ID of the item being updated
            },
          })
        );
        if (findExist?.Count > 0) {
          return res.status(400).json({ message: "Title already exist", statusCode: 400, success: false });
        } else {
          await dynamoDBClient.send(new UpdateItemCommand(params));
          return res.status(200).json({ message: "Data updated successfully", statusCode: 200, success: true });
        }
      } else {
        const findEmailExist = await dynamoDBClient.send(
          new ScanCommand({
            TableName: "category",
            FilterExpression: "title = :title",
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
            status: { S: status ? "active" : "inactive" },
          },
        };
        // console.log("docClient", "docccleint", params);
        let Data = await dynamoDBClient.send(new PutItemCommand(params));
        return res
          .status(201)
          .json({ message: "Category add successfully", statusCode: 201, success: true });
      }
    }
    catch (err) {
      console.log(err, "errorororro");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async delete(req, res) {
    try {
      let id = req.query.id

      const params = {
        TableName: 'category',
        Key: {
          'id': id // Replace 'PrimaryKey' and 'Value' with your item's actual primary key and value
        }
      };
      let result = await dynamoDBClient.send(new DeleteItemCommand(params));
      console.log(result , "checkkkk")
      return res.status(200).json({ message: "Delete successfully", statusCode: 200, success: true, data: result  })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: err?.message, statusCode: 500, success: false })
    }
  }
}

const CategoryServicesObj = new CategoryServices();
export default CategoryServicesObj;
