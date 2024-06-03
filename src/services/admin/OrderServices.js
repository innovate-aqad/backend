// import AWS from "aws-sdk"
import { v4 as uuidv4 } from "uuid";

import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  GetItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { simplifyDynamoDBResponse } from "../../helpers/datafetch.js";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

class orderServices {
  async add(req, res) {
    try {
      let { order_details, id } = req.body;
      // let categoryExist = await dynamoDBClient.send(new QueryCommand({
      //   TableName: "order",
      //   KeyConditionExpression: "id = :id",
      //   ExpressionAttributeValues: {
      //     ":id": { S: category_id }
      //   }
      // }))
      // if (categoryExist?.Count == 0) {
      //   return res.status(400).json({ message: "Category not found", statusCode: 400, success: false })
      // } else if (categoryExist?.Items[0]?.status?.S != 'active') {
      //   return res.status(400).json({ message: "Category is not active", statusCode: 400, success: false })
      // }

      const timestamp = new Date().toISOString(); // Format timestamp as ISO string

      if (id) {
        let findData = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "brand",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: id },
            },
          })
        );
        if (findData && findData?.Count == 0) {
          return res.status(400).json({
            message: "Document not found",
            statusCode: 400,
            success: false,
          });
        }
        const params = {
          TableName: "brand",
          Key: { id: { S: id } },
          UpdateExpression:
            "SET #title = :title, #status = :status, #category_id =:category_id, #updated_at= :updated_at ",
          ExpressionAttributeNames: {
            "#title": "title",
            "#status": "status",
            "#category_id": "category_id",
            "#updated_at": "updated_at",
          },
          ExpressionAttributeValues: {
            ":title": { S: title || findData?.Items[0]?.title?.S || "" },
            ":status": {
              S: status || findData?.Items[0]?.status?.S || "active",
            },
            ":category_id": {
              S: category_id || findData?.Items[0]?.category_id?.S || "",
            },
            ":updated_at": { S: timestamp },
          },
        };
        const findExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "brand",
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
        let randomNumber = Date.now() + Math.round(Math.random() * 1000000000);
        let vendor_id_arr = [];
        for (let le of order_details) {
          vendor_id_arr.push(le?.vendor_id);
        }

        // const findEmailExist = await dynamoDBClient.send(
        //   new QueryCommand({
        //     TableName: "users",
        //     // IndexName: "title", // replace with your GSI name
        //     KeyConditionExpression: "id = :id",
        //     ExpressionAttributeValues: {
        //       ":id": { S: id },
        //     },
        //   })
        // )
        console.log(vendor_id_arr, "vendor_id_arr");
        const paramsOf = {
          RequestItems: {
            users: {
              Keys: vendor_id_arr.map((vendor_id) => ({
                id: { S: vendor_id },
              })),
            },
          },
        };

        const result = await dynamoDBClient.batchGetItem(paramsOf).promise();
        console.log(result, "result,@@@@@@@");
        // The result object will contain the items fetched for each vendor_id
        const items = result.Responses["users"];
        console.log(items, "@@@@@@@@@@@@");
        return;
        if (findEmailExist.Count > 0) {
          return res.status(400).json({
            success: false,
            message: "Brand name already exist!",
            statusCode: 400,
          });
        }

        let id = uuidv4();
        id = id?.replace(/-/g, "");
        const params = {
          TableName: "brand",
          Item: {
            id: { S: id },
            title: { S: title },
            status: { S: status ? "active" : "inactive" },
            category_id: { S: category_id },
            created_by: { S: req.userData.id },
            created_at: { S: timestamp },
            updated_at: { S: timestamp },
          },
        };
        // console.log("docClient", "docccleint", params);
        let Data = await dynamoDBClient.send(new PutItemCommand(params));
        return res.status(201).json({
          message: "Brand add successfully",
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

  async change_status(req, res) {
    try {
      let { status, id } = req.body;
      const timestamp = new Date().toISOString(); // Format timestamp as ISO string

      let findData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "brand",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (findData && findData?.Count == 0) {
        return res.status(400).json({
          message: "Brand document not found",
          statusCode: 400,
          success: false,
        });
      }
      const params = {
        TableName: "brand",
        Key: { id: { S: id } },
        UpdateExpression: "SET  #status = :status,  #updated_at= :updated_at ",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updated_at": "updated_at",
        },
        ExpressionAttributeValues: {
          ":status": { S: status || findData?.Items[0]?.status?.S || "active" },
          ":updated_at": {
            S: timestamp || findData?.Items[0]?.updated_at?.S || "",
          },
        },
      };

      await dynamoDBClient.send(new UpdateItemCommand(params));
      return res.status(200).json({
        message: "Brand status updated successfully",
        statusCode: 200,
        success: true,
      });
    } catch (err) {
      console.log(err, "errorororro");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async get_data(req, res) {
    try {
      const categoryParams = {
        TableName: "category",
      };
      const commandCat = new ScanCommand(categoryParams);
      const categoryData = await dynamoDBClient.send(commandCat);

      const brandParams = {
        TableName: "brand",
      };
      const commandBrand = new ScanCommand(brandParams);
      const brandData = await dynamoDBClient.send(commandBrand);

      const simplifiedCategoryData = categoryData?.Items?.map((el) =>
        simplifyDynamoDBResponse(el)
      );
      const simplifiedBrandData = brandData?.Items?.map((el) =>
        simplifyDynamoDBResponse(el)
      );

      const subBrandByCategoryId = {};
      simplifiedBrandData.forEach((el) => {
        const categoryId = el?.category_id;
        if (!subBrandByCategoryId[categoryId]) {
          subBrandByCategoryId[categoryId] = [];
        }
        subBrandByCategoryId[categoryId].push(el);
      });

      const combinedData = simplifiedCategoryData.map((category) => ({
        ...category,
        BrandArr: subBrandByCategoryId[category.id] || [],
      }));

      res.status(200).json({
        message: "Fetch Data",
        data: combinedData,
        statusCode: 200,
        success: true,
      });
    } catch (err) {
      console.error(err, "error");
      return res.status(500).json({
        message: err?.message,
        statusCode: 500,
        success: false,
      });
    }
  }

  async get_Brand_by_main_cat_id(req, res) {
    try {
      const params = {
        TableName: "brand",
        FilterExpression: "#category_id = :category_id",
        ExpressionAttributeNames: {
          "#category_id": "category_id",
        },
        ExpressionAttributeValues: {
          ":category_id": { S: req.query.category_id },
        },
      };

      const command = new ScanCommand(params);
      const data = await dynamoDBClient.send(command);
      const simplifiedData = data.Items.map((el) =>
        simplifyDynamoDBResponse(el)
      );
      res.status(200).json({
        message: "Fetch Data",
        data: simplifiedData,
        statusCode: 200,
        success: true,
      });
      return;
    } catch (err) {
      console.error(err, "error");
      return res.status(500).json({
        message: err?.message,
        statusCode: 500,
        success: false,
      });
    }
  }

  async delete(req, res) {
    try {
      let id = req.query.id;
      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "brand",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (data?.Count == 0) {
        return res.status(400).json({
          message: "Data not found or deleted already",
          statusCode: 400,
          success: false,
        });
      }
      const params = {
        TableName: "brand",
        Key: {
          id: { S: id },
        },
      };
      let result = await dynamoDBClient.send(new DeleteItemCommand(params));
      return res.status(200).json({
        message: "Delete successfully",
        statusCode: 200,
        success: true,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }
}

const OrderServicesObj = new orderServices();
export default OrderServicesObj;