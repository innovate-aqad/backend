// import {
//   DynamoDBClient,
//   PutItemCommand,
//   ScanCommand,
//   UpdateItemCommand,
//   DeleteItemCommand,
//   QueryCommand, BatchWriteItemCommand
// } from "@aws-sdk/client-dynamodb";

// import { v4 as uuidv4 } from "uuid";

// import formidable from "formidable";

// const dynamoDBClient = new DynamoDBClient({
//   region: process.env.Aws_region,
//   credentials: {
//     accessKeyId: process.env.Aws_accessKeyId,
//     secretAccessKey: process.env.Aws_secretAccessKey,
//   },
// });

import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  GetItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { simplifyDynamoDBResponse } from "../../helpers/datafetch.js";
import CategoryModel from "../../models/CategoryModel.js.js";
// import AWS from "aws-sdk";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey
  }
});

class CategoryServices {
  //add and edit
  async add(req, res) {
    try {
      let { title, status, id } = req.body;
      // if (req.userData?.user_type != "super_admin") {
      //   return res
      //     .status(400)
      //     .json({ message: "Not Authorise", statusCode: 400, success: false });
      // }
      let findData;
      // let image;
      console.log("toooo", req?.files?.category_image?.[0]?.filename);
      const image = req?.files?.category_image?.[0]?.filename;
      if (id) {
        // DynamoDb
        // findData = await dynamoDBClient.send(
        //   new QueryCommand({
        //     TableName: "category",
        //     KeyConditionExpression: "id = :id",
        //     ExpressionAttributeValues: {
        //       ":id": { S: id }
        //     }
        //   })
        // );
        // if (findData && findData?.Count == 0) {
        //   return res.status(400).json({
        //     message: "Document Not Found",
        //     statusCode: 400,
        //     success: false
        //   });
        // }
        // // console.log("findDatafindData22", findData?.Items[0]);
        // image = req.files?.category_image?.length
        //   ? req.files?.category_image[0]?.filename
        //   : findData?.Items[0]?.category_image?.S || "";
        // const params = {
        //   TableName: "category",
        //   Key: { id: { S: id } },
        //   UpdateExpression:
        //     "SET #title = :title, #status = :status, #updated_at = :updated_at, #category_image=:category_image",
        //   ExpressionAttributeNames: {
        //     "#title": "title",
        //     "#status": "status",
        //     "#updated_at": "updated_at",
        //     "#category_image": "category_image"
        //   },
        //   ExpressionAttributeValues: {
        //     ":title": { S: title || findData?.Items[0]?.title?.S || "" },
        //     ":status": {
        //       S: status || findData?.Items[0]?.status?.S || "active"
        //     },
        //     ":category_image": {
        //       S: image
        //     },
        //     ":updated_at": { S: new Date().toISOString() }
        //   }
        // };

        // const findExist = await dynamoDBClient.send(
        //   new QueryCommand({
        //     TableName: "category",
        //     IndexName: "title", // Use the correct GSI name
        //     KeyConditionExpression: "title = :title",
        //     FilterExpression: "id <> :id",
        //     ExpressionAttributeValues: {
        //       ":title": { S: title },
        //       ":id": { S: id }
        //     }
        //   })
        // );

        // if (findExist?.Count > 0) {
        //   return res.status(400).json({
        //     message: "Title already exist",
        //     statusCode: 400,
        //     success: false
        //   });
        // } else {
        //   await dynamoDBClient.send(new UpdateItemCommand(params));
        //   return res.status(200).json({
        //     message: "Data updated successfully",
        //     statusCode: 200,
        //     success: true
        //   });
        // }

        //My SQl

        console.log("id...", id);

        CategoryModel.update(
          {
            title: title,
            status: status,
            image: image
          },
          {
            where: { id: id }
          }
        )
          .then((response) => {
            if (response[0] === 0) {
              console.log("rrrr", response);
              // No rows updated
              return res.status(404).json({
                message: "Category not found",
                statusCode: 404,
                success: false
              });
            }
            return res.status(200).json({
              message: "Category updated successfully",
              statusCode: 200,
              success: true
            });
          })
          .catch((error) => {
            return res.status(500).json({
              success: false,
              message: error.message,
              statusCode: 500
            });
          });
      } else {
        // dynamo

        // const findEmailExist = await dynamoDBClient.send(
        //   new QueryCommand({
        //     TableName: "category",
        //     IndexName: "title", // replace with your GSI name
        //     KeyConditionExpression: "title = :title",
        //     ExpressionAttributeValues: {
        //       ":title": { S: title }
        //     }
        //   })
        // );
        // if (findEmailExist.Count > 0) {
        //   return res.status(400).json({
        //     success: false,
        //     message: "Category name already exist!",
        //     statusCode: 400
        //   });
        // }
        // id = uuidv4();
        // id = id?.replace(/-/g, "");
        // const params = {
        //   TableName: "category",
        //   Item: {
        //     id: { S: id },
        //     title: { S: title },
        //     status: { S: status },
        //     category_image: { S: image },
        //     created_at: { S: new Date().toISOString() },
        //     updated_at: { S: new Date().toISOString() }
        //   }
        // };
        // console.log("docClient", "docccleint", params);
        // let Data = await dynamoDBClient.send(new PutItemCommand(params));
        // return res.status(201).json({
        //   message: "Category add successfully",
        //   statusCode: 201,
        //   success: true
        // });

        //Mysql

        const data = await CategoryModel.findOne({
          where: {
            title: title
          },
          raw: true
        });
        console.log(data);

        if (data) {
          return res.status(400).json({
            success: false,
            message: "Data already exist",
            statusCode: 400
          });
        } else {
          CategoryModel.create({
            title: title,
            status: status,
            image: image
          })
            .then(async (response) => {
              return res.status(201).json({
                message: "Category add successfully",
                statusCode: 201,
                success: true
              });
            })
            .catch((error1) => {
              return res.status(500).json({
                success: false,
                message: error1?.message,
                statusCode: 500
              });
            });
        }
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
      // DynamoDb

      // let findData = await dynamoDBClient.send(
      //   new QueryCommand({
      //     TableName: "category",
      //     KeyConditionExpression: "id = :id",
      //     ExpressionAttributeValues: {
      //       ":id": { S: id }
      //     }
      //   })
      // );
      // if (findData && findData?.Count > 0) {
      //   const params = {
      //     TableName: "category",
      //     Key: { id: { S: id } },
      //     UpdateExpression: "SET #status = :status, #updated_at = :updated_at",
      //     ExpressionAttributeNames: {
      //       "#status": "status",
      //       "#updated_at": "updated_at"
      //     },
      //     ExpressionAttributeValues: {
      //       ":status": {
      //         S: status || findData?.Items[0]?.status?.S || "active"
      //       },
      //       ":updated_at": { S: new Date().toISOString() }
      //     }
      //   };
      //   await dynamoDBClient.send(new UpdateItemCommand(params));
      //   return res.status(200).json({
      //     message: "Category Data Status updated successfully",
      //     statusCode: 200,
      //     success: true
      //   });
      // } else {
      //   return res.status(400).json({
      //     message: "Document Not Found",
      //     statusCode: 400,
      //     success: false
      //   });
      // }

      //Mysql

      const [updated] = await CategoryModel.update(
        { status: status },
        { where: { id: id } }
      );
      if (updated) {
        return res.status(200).json({
          success: true,
          message: "Status updated successfully",
          statusCode: 200
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Category not found",
          statusCode: 404
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
      // Dynamodb
      // const params = {
      //   TableName: "category",
      //   FilterExpression: "#status = :status",
      //   ExpressionAttributeNames: {
      //     "#status": "status"
      //   },
      //   ExpressionAttributeValues: {
      //     ":status": { S: "active" } // Use DynamoDB AttributeValue data type
      //   }
      // };

      // const command = new ScanCommand(params);
      // const data = await dynamoDBClient.send(command);
      // const simplifiedData = data.Items.map((el) =>
      //   simplifyDynamoDBResponse(el)
      // );
      // // console.log("Scan successful:", data.Items);

      // Mysql
      const simplifiedData = await CategoryModel.findAll({
        where: {
          status: "active"
        }
      });
      res.status(200).json({
        message: "Fetch Data",
        data: simplifiedData,
        statusCode: 200,
        success: true
      });
      return;
    } catch (err) {
      console.error(err, "erroror");
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async delete(req, res) {
    try {
      let { id } = req.query;
      // const data = await dynamoDBClient.send(
      //   new QueryCommand({
      //     TableName: "category",
      //     // IndexName: "created_by-index", // Replace with your GSI name for phone like phone-index
      //     KeyConditionExpression: "id = :id",
      //     // ProjectionExpression: "email, phone, id",
      //     ExpressionAttributeValues: {
      //       ":id": { S: id }
      //     }
      //   })
      // );
      // if (data?.Count == 0) {
      //   return res.status(400).json({
      //     message: "Category not found or deleted already",
      //     statusCode: 400,
      //     success: false
      //   });
      // }
      // const params = {
      //   TableName: "category",
      //   Key: {
      //     id: { S: id } // Replace with your primary key attributes
      //   }
      // };
      // const command = new DeleteItemCommand(params);
      // await dynamoDBClient.send(command);
      // // Query all subcategories with the same category_id
      // const subCategoriesData = await dynamoDBClient.send(
      //   new QueryCommand({
      //     TableName: "sub_category",
      //     IndexName: "category_id-index", // Make sure to create a GSI on category_id
      //     KeyConditionExpression: "category_id = :category_id",
      //     ExpressionAttributeValues: {
      //       ":category_id": { S: id }
      //     }
      //   })
      // );
      // let batchDeleteParams;
      // let deleteRequests;
      // if (subCategoriesData.Items.length > 0) {
      //   console.log(
      //     subCategoriesData?.Items[0]?.id,
      //     "subCategoriesDatasubCategoriesData"
      //   );
      //   deleteRequests = subCategoriesData.Items.map((item) => ({
      //     DeleteRequest: {
      //       Key: {
      //         id: item?.id // Assuming `id` is the primary key of the sub_category table
      //       }
      //     }
      //   }));
      //   console.log(deleteRequests, "deleterequerst", JSON.stringify);
      //   batchDeleteParams = {
      //     RequestItems: {
      //       sub_category: deleteRequests
      //     }
      //   };

      //   await dynamoDBClient.send(new BatchWriteItemCommand(batchDeleteParams));
      // }
      if (id) {
        const deleted = await CategoryModel.destroy({
          where: {
            id: id
          }
        });

        if (deleted) {
          return res.status(200).json({
            message: "Category deleted successfully",
            statusCode: 200,
            success: true
          });
        } else {
          return res.status(404).json({
            success: false,
            message: "Category not found",
            statusCode: 404
          });
        }
      } else {
        return res.status(404).json({
          success: false,
          message: "Category not found",
          statusCode: 404
        });
      }
    } catch (err) {
      console.log(err, "Errorro");
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async delete_et(req, res) {
    try {
      let { id } = req.query;
      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "category",
          // IndexName: "created_by-index", // Replace with your GSI name for phone like phone-index
          KeyConditionExpression: "id = :id",
          // ProjectionExpression: "email, phone, id",
          ExpressionAttributeValues: {
            ":id": { S: id }
          }
        })
      );
      if (data?.Count == 0) {
        return res.status(400).json({
          message: "Category not found or deleted already",
          statusCode: 400,
          success: false
        });
      }
      const params = {
        TableName: "category",
        Key: {
          id: { S: id }
        }
      };
      const command = new DeleteItemCommand(params);
      await dynamoDBClient.send(command);
      const subCategoriesData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "sub_category",
          IndexName: "category_id-index", // Make sure to create a GSI on category_id
          KeyConditionExpression: "category_id = :category_id",
          ExpressionAttributeValues: {
            ":category_id": { S: id }
          }
        })
      );
      let batchDeleteParams;
      let deleteRequests;
      if (subCategoriesData.Items.length > 0) {
        console.log(
          subCategoriesData?.Items[0]?.id,
          "subCategoriesDatasubCategoriesData"
        );
        deleteRequests = subCategoriesData.Items.map((item) => ({
          DeleteRequest: {
            Key: {
              id: item?.id // Assuming `id` is the primary key of the sub_category table
            }
          }
        }));
        console.log(deleteRequests, "deleterequerst", JSON.stringify);
        batchDeleteParams = {
          RequestItems: {
            sub_category: deleteRequests
          }
        };

        await dynamoDBClient.send(new BatchWriteItemCommand(batchDeleteParams));
      }
      return res.status(200).json({
        message: "Category deleted successfully",
        statusCode: 200,
        success: true
      });
    } catch (err) {
      console.log(err, "Errorro");
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }
}

const CategoryServicesObj = new CategoryServices();
export default CategoryServicesObj;
