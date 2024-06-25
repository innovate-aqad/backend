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
import formidable from "formidable";
import { simplifyDynamoDBResponse } from "../../helpers/datafetch.js";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

class SubCategoryServices {
  async add(req, res) {
    try {
      let { title, status, category_id, id } = req.body;
      let categoryExist = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "category",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: category_id },
          },
        })
      );
      // console.log(categoryExist,"categoryExistcategoryExist",categoryExist?.Items[0]?.status?.S)
      if (categoryExist?.Count == 0) {
        return res.status(400).json({
          message: "Category not found",
          statusCode: 400,
          success: false,
        });
      } else if (categoryExist?.Items[0]?.status?.S != "active") {
        return res.status(400).json({
          message: "Category is not active",
          statusCode: 400,
          success: false,
        });
      }
      const timestamp = new Date().toISOString(); // Format timestamp as ISO string

      if (id) {
        let findData = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "sub_category",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: id },
            },
          })
        );
        if (findData && findData?.Count == 0) {
          return res.status(400).json({
            message: "Sub-category document not found",
            statusCode: 400,
            success: false,
          });
        }
        // console.log("findDatafindData22", findData?.Items[0])
        const params = {
          TableName: "sub_category",
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
            TableName: "sub_category",
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
        const findEmailExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "sub_category",
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
            message: "Sub-Category name already exist!",
            statusCode: 400,
          });
        }

        let id = uuidv4();
        id = id?.replace(/-/g, "");
        const params = {
          TableName: "sub_category",
          Item: {
            id: { S: id },
            title: { S: title },
            status: { S: status ? "active" : "inactive" },
            category_id: { S: category_id },
            created_at: { S: timestamp },
            updated_at: { S: timestamp },
          },
        };
        // console.log("docClient", "docccleint", params);
        let Data = await dynamoDBClient.send(new PutItemCommand(params));
        return res.status(201).json({
          message: "Sub-Category add successfully",
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
          TableName: "sub_category",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (findData && findData?.Count == 0) {
        return res.status(400).json({
          message: "Sub-category document not found",
          statusCode: 400,
          success: false,
        });
      }
      const params = {
        TableName: "sub_category",
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
        message: "Sub-category status updated successfully",
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

  async get_cat_data(req, res) {
    try {
      const categoryParams = {
        TableName: "category",
      };
      const commandCat = new ScanCommand(categoryParams);
      const categoryData = await dynamoDBClient.send(commandCat);

      const subcategoryParams = {
        TableName: "sub_category",
      };
      const commandSub = new ScanCommand(subcategoryParams);
      const subcategoryData = await dynamoDBClient.send(commandSub);

      // Map category and subcategory data
      const simplifiedCategoryData = categoryData.Items.map((el) =>
        simplifyDynamoDBResponse(el)
      );
      const simplifiedSubcategoryData = subcategoryData.Items.map((el) =>
        simplifyDynamoDBResponse(el)
      );

      // Create a map of subcategories by category_id for efficient lookup
      const subcategoriesByCategoryId = {};
      simplifiedSubcategoryData.forEach((subcategory) => {
        const categoryId = subcategory.category_id;
        if (!subcategoriesByCategoryId[categoryId]) {
          subcategoriesByCategoryId[categoryId] = [];
        }
        subcategoriesByCategoryId[categoryId].push(subcategory);
      });

      // Combine category data with corresponding subcategories
      const combinedData = simplifiedCategoryData.map((category) => ({
        ...category,
        subcategoryArr: subcategoriesByCategoryId[category.id] || [],
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

  async get_subcat_by_main_cat_id(req, res) {
    try {
      const params = {
        TableName: "sub_category",
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
          TableName: "sub_category",
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

      const params = {
        TableName: "sub_category",
        Key: {
          id: { S: id }, // Replace 'PrimaryKey' and 'Value' with your item's actual primary key and value
        },
      };
      let result = await dynamoDBClient.send(new DeleteItemCommand(params));
      // console.log(result, "checkkkk")
      return res
        .status(200)
        .json({
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

const SubCategoryServicesObj = new SubCategoryServices();
export default SubCategoryServicesObj;
