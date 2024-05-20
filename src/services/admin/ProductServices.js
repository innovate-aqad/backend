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

import { v4 as uuidv4 } from "uuid";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

class ProductServices {
  async add(req, res) {
    try {
      let {
        name,
        status,
        sku,
        hmn,
        description,
        brand,
        category_id,
        sub_category_id,
        id,
      } = req.body;
      if (id) {
        let findProductData = await dynamoDBClient.send(
          new ScanCommand({
            TableName: "product",
            FilterExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: id },
            },
          })
        );
        // console.log("findDatafindData22", findData?.Items[0]);
        if (findProductData?.Count == 0) {
          return res.status(400).json({
            message: "Product not found",
            statusCode: 400,
            success: false,
          });
        }
        if (category_id) {
          let findData = await dynamoDBClient.send(
            new ScanCommand({
              TableName: "category",
              FilterExpression: "id = :id",
              ExpressionAttributeValues: {
                ":id": { S: category_id },
              },
            })
          );
          // console.log("findDatafindData22", findData?.Items[0]);
          if (findData?.Count == 0) {
            return res.status(400).json({
              message: "Category not found",
              statusCode: 400,
              success: false,
            });
          }
        }
        if (sub_category_id) {
          let findData = await dynamoDBClient.send(
            new ScanCommand({
              TableName: "sub_category",
              FilterExpression: "id = :id",
              ExpressionAttributeValues: {
                ":id": { S: sub_category_id },
              },
            })
          );
          // console.log("findDatafindData22", findData?.Items[0]);
          if (findData?.Count == 0) {
            return res.status(400).json({
              message: "Sub_Category not found",
              statusCode: 400,
              success: false,
            });
          }
        }
        // const params = {
        //   TableName: "category",
        //   Key: { id: { S: id } },
        //   UpdateExpression:
        //     "SET #title = :title, #status = :status, #updated_at = :updated_at",
        //   ExpressionAttributeNames: {
        //     "#title": "title",
        //     "#status": "status",
        //     "#updated_at": "updated_at",
        //   },
        //   ExpressionAttributeValues: {
        //     ":title": { S: title || findData?.Items[0]?.title?.S || "" },
        //     ":status": {
        //       S: status || findData?.Items[0]?.status?.S || "active",
        //     },
        //     ":updated_at": { S: new Date().toISOString() },
        //   },
        // };
        const params = {
          TableName: "product",
          Key: { id: { S: id } },
          UpdateExpression:
            "SET #name = :name, #category_id = :category_id, #sub_category_id = :sub_category_id, #price= :price, #compare_price_at= :compare_price_at, #description= :description, #quantity =:quantity, #sku ",

          Item: {
            name: { S: name || findProductData?.name },
            category_id: { S: category_id || findProductData?.category_id },
            sub_category: {
              S: sub_category_id || findProductData?.sub_category_id,
            },
            price: { S: price || findProductData?.price },
            compare_price_at: {
              S: compare_price_at || findProductData?.compare_price_at,
            },
            description: { S: description || findProductData?.description },
            quantity: { S: quantity || findProductData?.quantity },
            sku: { S: sku || findProductData?.sku },
            warehouseArr: { L: warehouseArr || findProductData?.warehouseArr },
            variation: { L: variation || findProductData?.variation },
            size: { S: size || findProductData?.size },
            brand: { S: brand || findProductData?.brand },
            minimum_order_quantity: {
              S:
                minimum_order_quantity ||
                findProductData?.minimum_order_quantity,
            },
            status: { S: status || findProductData?.status },
          },
        };
        await dynamoDBClient.send(new UpdateItemCommand(params));
        return res.status(200).json({
          message: "Product details update successfully",
          statusCode: 200,
          sucess: true,
        });
      } else {
        const findExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "category",
            IndexName: "name", // Use the correct GSI name
            KeyConditionExpression: "name = :name",
            FilterExpression: "id <> :id",
            ExpressionAttributeValues: {
              ":title": { S: name },
              ":id": { S: id },
            },
          })
        );

        if (findExist.Count > 0) {
          return res.status(400).json({
            success: false,
            message: "Product name already exist!",
            statusCode: 400,
          });
        }
        id = uuidv4();
        id = id?.replace(/-/g, "");
        const params = {
          TableName: "product",
          Item: {
            id: { S: id },
            name: { S: name },
            category_id: { S: category_id },
            sub_category: { S: sub_category_id },
            price: { S: price },
            compare_price_at: { S: compare_price_at },
            description: { S: description },
            quantity: { S: quantity },
            sku: { S: sku },
            warehouseArr: { L: warehouseArr },
            variation: { L: variation },
            size: { S: size },
            brand: { S: brand },
            minimum_order_quantity: { S: minimum_order_quantity },
            status: { S: status },
            created_at: { S: new Date().toISOString() },
            updated_at: { S: new Date().toISOString() },
          },
        };
        await dynamoDBClient.send(new PutItemCommand(params));
        return res.status(201).json({
          message: "Product add successfully",
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

  async get_cat_data(req, res) {
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      const pageSize = req.query?.pageSize || 10;
      const params = {
        TableName: "product",
        Limit: pageSize, //
      };
      if (req.query.LastEvaluatedKey) {
        params.ExclusiveStartKey = JSON.parse(req.query.LastEvaluatedKey);
      }

      let get = await dynamoDB.scan(params).promise();
      let LastEvaluatedKey;
      if (get.LastEvaluatedKey) {
        LastEvaluatedKey = JSON.stringify(get.LastEvaluatedKey);
      }
      res.status(200).json({
        message: "Fetch Data",
        data: get,
        LastEvaluatedKey,
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

  //change status
  async changeStatus(req, res) {
    try {
      let { status, id } = req.body;
      // if (req.userData?.user_type != "super_admin") {
      //   return res
      //     .status(400)
      //     .json({ message: "Not Authorise", statusCode: 400, success: false });
      // }2,72,106.94
      let findData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "product",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (findData && findData?.Count > 0) {
        const params = {
          TableName: "product",
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
          message: "Product Data Status updated successfully",
          statusCode: 200,
          success: true,
        });
      } else {
        return res.status(400).json({
          message: "Product Not Found",
          statusCode: 400,
          success: false,
        });
      }
    } catch (err) {
      console.error(err, "product creation ");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async delete(req, res) {
    try {
      let id = req.query.id;

      const params = {
        TableName: "category",
        Key: {
          id: id, // Replace 'PrimaryKey' and 'Value' with your item's actual primary key and value
        },
      };
      let result = await dynamoDBClient.send(new DeleteItemCommand(params));
      console.log(result, "checkkkk");
      return res.status(200).json({
        message: "Delete successfully",
        statusCode: 200,
        success: true,
        data: result,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async deleteProductImage(req, res) {
    try {
      let { id, image } = req.query;
      let findData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "product",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (findData?.Count == 0) {
        return res.status(400).json({
          message: "Product not found",
          statusCode: 400,
          success: false,
        });
      }
      let filterData = findData?.Items[0]?.imagesArr?.filter(
        (el) => el != image
      );
      const params = {
        TableName: "product",
        Key: { id: { S: id } },
        UpdateExpression:
          "SET #imagesArr = :imagesArr, #updated_at = :updated_at",
        ExpressionAttributeNames: {
          "#imagesArr": "imagesArr",
          "#updated_at": "updated_at",
        },
        ExpressionAttributeValues: {
          ":imagesArr": {
            S: filterData,
          },
          ":updated_at": { S: new Date().toISOString() },
        },
      };
      await dynamoDBClient.send(new UpdateItemCommand(params));
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  //single upload image
  async uploadProductImage(req, res) {
    try {
      let { id } = req.query;
      let findData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "product",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (findData?.Count == 0) {
        return res.status(400).json({
          message: "Product not found",
          statusCode: 400,
          success: false,
        });
      }
      let filterData = findData?.Items[0]?.imagesArr?.push(
        req.files?.productImagesArr[0]?.filename
      );
      const params = {
        TableName: "product",
        Key: { id: { S: id } },
        UpdateExpression:
          "SET #imagesArr = :imagesArr, #updated_at = :updated_at",
        ExpressionAttributeNames: {
          "#imagesArr": "imagesArr",
          "#updated_at": "updated_at",
        },
        ExpressionAttributeValues: {
          ":imagesArr": {
            S: filterData,
          },
          ":updated_at": { S: new Date().toISOString() },
        },
      };
      await dynamoDBClient.send(new UpdateItemCommand(params));
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }
}

const ProductServices = new ProductServices();
export default ProductServicesServicesObj;
