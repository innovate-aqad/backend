import {
  sendPasswordViaEmail,
  forgotPasswordEmail,
  encryptStringWithKey,
  sendEmailUser,
} from "../../helpers/common.js";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
// import formidable from "formidable";
import {
  pinePointServices,
  sendEmailOtp,
  sendOtpForLogin,
  sendPasswordViaEmailOf,
} from "../../helpers/aswSesServices.js";
import { generateOTP } from "../../helpers/generateOtp.js";
import { deleteImageFromS3 } from "../../helpers/s3.js";
import { removefIle } from "../../helpers/validateImageFile.js";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

class ApiEndpointServices {
  async addData(req, res) {
    try {
      let { name, type, status, id } = req.body;
      name = name?.trim();
      console.log("oooo", id);
      if (id) {
        const dataExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "api_endpoint",
            IndexName: "id", // replace with your GSI name
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: id },
            },
          })
        );
        if (!dataExist) {
          return res.status(400).json({
            message: "Api_endoint Data not found",
            statusCode: 400,
            success: false,
          });
        } else {
          const params = {
            TableName: "api_endpoint",
            Key: { id: { S: id } },
            UpdateExpression:
              "SET #name = :name, #type = :type, #status = :status",
            ExpressionAttributeNames: {
              "#name": "name",
              "#type": "type",
              "#status": "status",
            },
            ExpressionAttributeValues: {
              ":name": {
                S: name || findData?.Items[0]?.name?.S || "",
              },
              ":type": {
                S: type || findData?.Items[0]?.type?.S || "",
              },
              ":status": {
                S: status || findData?.Items[0]?.status?.S || "",
              },
            },
          };
          // console.log(params, "paramsmsmsmsssmm", warehouse_addresses,"outlet_addresses",outlet_addresses)
          await dynamoDBClient.send(new UpdateItemCommand(params));
          return res.status(200).json({
            message: "Data update successfully",
            statusCode: 200,
            success: true,
          });
        }
      } else {
        const dataExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "api_endpoint",
            IndexName: "name", // replace with your GSI name
            KeyConditionExpression: "name = :name",
            ExpressionAttributeValues: {
              ":name": { S: name },
            },
          })
        );
        if (dataExist?.Count) {
          return res.status(400).json({
            message: "Api_endoint's name must be unique",
            statusCode: 400,
            success: false,
          });
        }
        let id = uuidv4();
        id = id?.replace(/-/g, "");

        const params = {
          TableName: "api_endpoint",
          Item: {
            id: { S: id },
            name: { S: name },
            type: { S: type },
            status: { S: status || "" },
          },
        };

        console.log("docClient", "docccleint", params);
        let userData = await dynamoDBClient.send(new PutItemCommand(params));
        return res.status(201).json({
          message: "Api endpoint add successfully",
          statusCode: 201,
          success: true,
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async getData(req, res) {
    try {
      const params = {
        TableName: "api_endpoint",
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "active",
        },
      };

      let getAll = await dynamoDBClient.scan(params);

      getAll = getAll?.sort((a, b) => b?.created_at - a?.created_at);
      return res.status(200).json({
        message: "Fetch data",
        data: getAll,
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async getAllData(req, res) {
    try {
        const params = {
            TableName: "api_endpoint",
               };
    
          let getAll = await dynamoDBClient.scan(params);

          
    
      getAll = getAll?.sort((a, b) => b?.created_at - a?.created_at);
      return res.status(200).json({
        message: "Fetch data",
        data: getAll,
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
  async getByQuery(req, res) {
    try {
      const getAll = await ApiEndpoint.findAll({
        where: { type: req.query.type, status: "active" },
        raw: true,
      });
      return res.status(200).json({
        message: "Fetch data",
        data: getAll,
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async changeStatus(req, res) {
    try {
      const { id, status } = req.body;
      const get = await ApiEndpoint.findOne({
        where: { id },
        raw: true,
      });
      if (!get) {
        return res
          .status(400)
          .json({ message: "Data not found", statusCode: 400, success: false });
      }
      await ApiEndpoint.update({ status: status }, { where: { id: id } });
      return res.status(200).json({
        message: "Status update successfully",
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
  async deleteEndpointById(req, res) {
    try {
      const { id } = req.query;
      console.log("dddddddd", id);

      const getData = await ApiEndpoint.findOne({
        where: { id },
        raw: true,
      });
      if (!getData) {
        return res
          .status(400)
          .json({ message: "Data not found", statusCode: 400, success: false });
      }
      // await ApiEndpoint.update({ status: status }, { where: { id: id } });
      // return res.status(200).json({
      //   message: "Status update successfully",
      //   success: true,
      //   statusCode: 200,
      // });

      await ApiEndpoint.destroy({ where: { id: id } });
      return res.status(200).json({
        message: "Data delete successfully",
        statusCode: 200,
        success: true,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
}

const ApiEndpointServicesObj = new ApiEndpointServices();
export default ApiEndpointServicesObj;
