
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  GetItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
// import AWS from "aws-sdk";
import { simplifyDynamoDBResponse } from "../../helpers/datafetch.js";

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
      let { title, type, status, id, } = req.body;
      title = title?.trim();
      const timestamp = new Date().toISOString();
      if (id) {
        let findData = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "api_endpoint",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: id },
            },
          })
        );
        console.log(findData, "findata !@#!32")
        if (findData && findData?.Count == 0) {
          return res.status(400).json({ message: "Document not found", statusCode: 400, success: false })
        }
        // console.log("findDatafindData22", findData?.Items[0])
        const params = {
          TableName: "api_endpoint",
          Key: { id: { S: id } },
          UpdateExpression: "SET #title = :title, #status = :status, #type =:type, #updated_at= :updated_at",
          ExpressionAttributeNames: {
            "#title": "title",
            "#status": "status",
            "#type": "type",
            "#updated_at": "updated_at",
          },
          ExpressionAttributeValues: {
            ":title": { S: title || findData?.Items[0]?.title?.S || "" },
            ":status": { S: status || findData?.Items[0]?.status?.S || 'active' },
            ":type": { S: type || findData?.Items[0]?.type?.S || '' },
            ":updated_at": { S: timestamp }
          },
        };
        console.log(params, "paramsssss")
        await dynamoDBClient.send(new UpdateItemCommand(params));
        return res.status(200).json({ message: "Data updated successfully", statusCode: 200, success: true });

      } else {
        const dataExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "api_endpoint",
            IndexName: "title", // replace with your GSI name
            KeyConditionExpression: "title = :title",
            ExpressionAttributeValues: {
              ":title": { S: title },
            },
          })
        );
        if (dataExist?.Count) {
          return res.status(400).json({
            message: "Api_endoint's title must be unique",
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
            title: { S: title },
            type: { S: type },
            status: { S: status || "active" },
            created_by: { S: req.userData?.id },
            created_at: { S: timestamp },
            updated_at: { S: timestamp },
          },
        };
        console.log("docClient", "docccleint", params);
        let userData = await dynamoDBClient.send(new PutItemCommand(params));
        return res.status(201).json({
          data: id,
          message: "Api endpoint add successfully",
          statusCode: 201,
          success: true,
        });
      }
    } catch (err) {
      console.error(err, "errororo");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async getActiveData(req, res) {
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

  //get all data 
  async getAllData(req, res) {
    try {
      const params = {
        TableName: "api_endpoint",
      };
      if (!(req.userData.user_type === 'super_admin' && req.query.status === 'all')) {
        params.FilterExpression = "#status = :status";
        params.ExpressionAttributeNames = {
          "#status": "status",
        };
        params.ExpressionAttributeValues = {
          ":status": { S: "active" },
        };
      }
      // let getAll = await dynamoDBClient.scan(params);
      let getAll = await dynamoDBClient.send(new ScanCommand(params));
      let get = []
      for (let el of getAll.Items) {
        let get1 = simplifyDynamoDBResponse(el)
        get.push(get1)
      }
      // getAll = getAll?.sort((a, b) => b?.created_at - a?.created_at);
      return res.status(200).json({
        message: "Fetch data",
        data: get,
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      console.error(err, "eror get ");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async changeStatus(req, res) {
    try {
      const { id, status } = req.body;
      const getItemParams = {
        TableName: 'api_endpoint',
        Key: {
          id: { S: id }
        }
      };

      const getItemCommand = new GetItemCommand(getItemParams);
      const getItemResponse = await dynamoDBClient.send(getItemCommand);

      if (!getItemResponse.Item) {
        return res.status(400).json({
          message: 'Data not found',
          statusCode: 400,
          success: false
        });
      }
      // Update the item status
      const updateItemParams = {
        TableName: 'api_endpoint',
        Key: {
          id: { S: id }
        },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': { S: status }
        }
      };
      const updateItemCommand = new UpdateItemCommand(updateItemParams);
      await dynamoDBClient.send(updateItemCommand);
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

      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "api_endpoint",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (data?.Count == 0) {
        return res.status(400).json({ message: "Data not found or deleted already", statusCode: 400, success: false })
      }

      // Delete the item
      const deleteItemParams = {
        TableName: 'api_endpoint',
        Key: {
          id: { S: id }
        }
      };
      const deleteItemCommand = new DeleteItemCommand(deleteItemParams);
      await dynamoDBClient.send(deleteItemCommand);
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
  

  async editstatus(req, res) {//editdata
    try {
      const { id } = req.query;

      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "api_endpoint",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (data?.Count == 0) {
        return res.status(400).json({ message: "Data not found or deleted already", statusCode: 400, success: false })
      }

      // Delete the item
      const deleteItemParams = {
        TableName: 'api_endpoint',
        Key: {
          id: { S: id }
        }
      };
      const deleteItemCommand = new DeleteItemCommand(deleteItemParams);
      await dynamoDBClient.send(deleteItemCommand);
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
