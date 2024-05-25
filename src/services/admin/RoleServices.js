
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  GetItemCommand,
  DeleteItemCommand,
  BatchGetItemCommand
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { simplifyDynamoDBResponse } from "../../helpers/datafetch.js";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

class RoleServices {
  async addData(req, res) {
    try {
      let { title, permission,  status, id, } = req.body;
      title = title?.trim();
      const timestamp = new Date().toISOString();

      const allRouteIds = Array.from(new Set([...permission]));
      // console.log(allRouteIds, "all routesss indsss")

      const keys = allRouteIds.map(routeId => ({
        id: { S: routeId }
      }));
      // console.log(keys, "keyskeyskeys")
      const batchGetParams = {
        RequestItems: {
          "permission": {
            Keys: keys
          }
        }
      };
      const batchGetCommand = new BatchGetItemCommand(batchGetParams);
      const data = await dynamoDBClient.send(batchGetCommand);
// console.log(data,"data............")
      // Extract fetched items
      const fetchedItems = data.Responses["permission"];
      const fetchedIds = new Set(fetchedItems.map(item => item.id.S));
      const missingIds = allRouteIds.filter(routeId => !fetchedIds.has(routeId));
      // console.log(missingIds, "missingggggggg")
      if (missingIds.length > 0) {
        // Some IDs are missing, handle this case
        res.status(400).json({
          message: "Some Permission IDs are invalid.",
          missingIds,
          statusCode: 400,
          success: false,
        });
        return 
      }
      if (id) {
        let findData = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "roles",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: id },
            },
          })
        );
        // console.log(findData, "findata !@#!32")
        if (findData && findData?.Count == 0) {
          return res.status(400).json({ message: "Document not found", statusCode: 400, success: false })
        }
        const params = {
          TableName: "roles",
          Key: { id: { S: id } },
          UpdateExpression: "SET #title = :title, #status = :status, #permission =:permission, #updated_at= :updated_at",
          ExpressionAttributeNames: {
            "#title": "title",
            "#status": "status",
            "#permission": "permission",
            "#updated_at": "updated_at",
          },
          ExpressionAttributeValues: {
            ":title": { S: title || findData?.Items[0]?.title?.S || "" },
            ":status": { S: status || findData?.Items[0]?.status?.S || 'active' },
            ":permission": { L: permission.map(route => ({ S: route })) || findData?.Items[0]?.permission?.S || [] },
            ":updated_at": { S: timestamp }
          },
        };
        // console.log(params, "paramsssss")
        await dynamoDBClient.send(new UpdateItemCommand(params));
        return res.status(200).json({ message: "Data updated successfully", statusCode: 200, success: true });
      } else {
        const dataExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "roles",
            IndexName: "title", // replace with your GSI name
            KeyConditionExpression: "title = :title",
            ExpressionAttributeValues: {
              ":title": { S: title },
            },
          })
        );
        if (dataExist?.Count) {
          return res.status(400).json({
            message: "Title must be unique",
            statusCode: 400,
            success: false,
          });
        }

        let id = uuidv4();
        id = id?.replace(/-/g, "");
        const params = {
          TableName: "roles",
          Item: {
            id: { S: id },
            title: { S: title },
            permission: { L: permission.map(route => ({ S: route })) },
            status: { S: status || "active" },
            created_by: { S: req.userData?.id },
            created_at: { S: timestamp },
            updated_at: { S: timestamp },
          },
        };
        // console.log("docClient", "docccleint", params);
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

  // async getActiveData(req, res) {
  //   try {
  //     const params = {
  //       TableName: "api_endpoint",
  //       FilterExpression: "#status = :status",
  //       ExpressionAttributeNames: {
  //         "#status": "status",
  //       },
  //       ExpressionAttributeValues: {
  //         ":status": "active",
  //       },
  //     };

  //     let getAll = await dynamoDBClient.scan(params);
  //     getAll = getAll?.sort((a, b) => b?.created_at - a?.created_at);
  //     return res.status(200).json({
  //       message: "Fetch data",
  //       data: getAll,
  //       success: true,
  //       statusCode: 200,
  //     });
  //   } catch (err) {
  //     return res
  //       .status(500)
  //       .json({ message: err?.message, success: false, statusCode: 500 });
  //   }
  // }

  //get all data 
  async getAllData(req, res) {
    try {
      const params = {
        TableName: "roles",
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
      let getAll = await dynamoDBClient.send(new ScanCommand(params));
      // let get = []
      const simplifiedData = getAll.Items.map(item => simplifyDynamoDBResponse(item));
      // for (let el of getAll.Items) {
      //   let get1 = simplifyDynamoDBResponse(el)
      //   get.push(get1)
      // }
      return res.status(200).json({
        message: "Fetch data",
        data: simplifiedData ,
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
        TableName: 'roles',
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
      const updateItemParams = {
        TableName: 'roles',
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

  async deleteById(req, res) {
    try {
      const { id } = req.query;

      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "roles",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (data?.Count == 0) {
        return res.status(400).json({ message: "Data not found or deleted already", statusCode: 400, success: false })
      }
      const deleteItemParams = {
        TableName: 'roles',
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

const RoleServicesObj = new RoleServices ();
export default RoleServicesObj ;
