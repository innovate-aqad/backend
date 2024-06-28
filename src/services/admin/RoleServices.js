// import {
//   DynamoDBClient,
//   PutItemCommand,
//   ScanCommand,
//   UpdateItemCommand,
//   QueryCommand,
//   GetItemCommand,
//   DeleteItemCommand,
//   BatchGetItemCommand,
// } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { simplifyDynamoDBResponse } from "../../helpers/datafetch.js";
import Role from "../../models/RolesModel.js";
import Permission from "../../models/PermissionModuleModel.js";
// const dynamoDBClient = new DynamoDBClient({
//   region: process.env.Aws_region,
//   credentials: {
//     accessKeyId: process.env.Aws_accessKeyId,
//     secretAccessKey: process.env.Aws_secretAccessKey,
//   },
// });

class RoleServices {
  async addData(req, res) {
    const transaction = await sequelize.transaction();
  
    try {
      let { title, permission, status, id } = req.body;
      title = title?.trim();
      const timestamp = new Date();
  
      // Find all permissions to ensure they exist
      const allRouteIds = Array.from(new Set(permission));
      const existingPermissions = await Permission.findAll({
        where: {
          id: {
            [Op.in]: allRouteIds,
          },
        },
      });
  
      const existingIds = existingPermissions.map((perm) => perm.id);
      const missingIds = allRouteIds.filter((routeId) => !existingIds.includes(routeId));
  
      if (missingIds.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'Some Permission IDs are invalid.',
          missingIds,
          statusCode: 400,
          success: false,
        });
      }
  
      if (id) {
        // Check if the role exists
        const findData = await Role.findByPk(id);
  
        if (!findData) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Document not found',
            statusCode: 400,
            success: false,
          });
        }
  
        // Update the role
        await Role.update({
          title: title || findData.title,
          status: status || findData.status || 'active',
          permission: permission || findData.permission,
          updated_at: timestamp,
        }, {
          where: { id },
          transaction,
        });
  
        await transaction.commit();
        return res.status(200).json({
          message: 'Data updated successfully',
          statusCode: 200,
          success: true,
        });
      } else {
        // Check if the title is unique
        const dataExist = await Role.findOne({
          where: { title },
        });
  
        if (dataExist) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Title must be unique',
            statusCode: 400,
            success: false,
          });
        }
  
        // Create a new role
        const newId = uuidv4().replace(/-/g, '');
        await Role.create({
          id: newId,
          title,
          permission,
          status: status || 'active',
          created_by: req.userData?.id,
          created_at: timestamp,
          updated_at: timestamp,
        }, { transaction });
  
        await transaction.commit();
        return res.status(201).json({
          data: newId,
          message: 'Api endpoint add successfully',
          statusCode: 201,
          success: true,
        });
      }
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      return res.status(500).json({
        message: err.message,
        success: false,
        statusCode: 500,
      });
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
      if (
        !(
          req.userData.user_type === "super_admin" && req.query.status === "all"
        )
      ) {
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
      const simplifiedData = getAll.Items.map((item) =>
        simplifyDynamoDBResponse(item)
      );
      // for (let el of getAll.Items) {
      //   let get1 = simplifyDynamoDBResponse(el)
      //   get.push(get1)
      // }
      return res.status(200).json({
        message: "Fetch data",
        data: simplifiedData,
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
        TableName: "roles",
        Key: {
          id: { S: id },
        },
      };
      const getItemCommand = new GetItemCommand(getItemParams);
      const getItemResponse = await dynamoDBClient.send(getItemCommand);

      if (!getItemResponse.Item) {
        return res.status(400).json({
          message: "Data not found",
          statusCode: 400,
          success: false,
        });
      }
      const updateItemParams = {
        TableName: "roles",
        Key: {
          id: { S: id },
        },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": { S: status },
        },
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
        return res
          .status(400)
          .json({
            message: "Data not found or deleted already",
            statusCode: 400,
            success: false,
          });
      }
      const deleteItemParams = {
        TableName: "roles",
        Key: {
          id: { S: id },
        },
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

const RoleServicesObj = new RoleServices();
export default RoleServicesObj;
