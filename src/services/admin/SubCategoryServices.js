import { v4 as uuidv4 } from "uuid";

import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  GetItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
import formidable from "formidable";
import { simplifyDynamoDBResponse } from "../../helpers/datafetch.js";
import SubCategoryModel from "../../models/SubCategoryModel..js";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey
  }
});

class SubCategoryServices {
  async add(req, res) {
    try {
      // Dynamo DB
      // let { title, status, category_id, id } = req.body;
      // let categoryExist = await dynamoDBClient.send(new QueryCommand({
      //   TableName: "category",
      //   KeyConditionExpression: "id = :id",
      //   ExpressionAttributeValues: {
      //     ":id": { S: category_id }
      //   }
      // }))
      // // console.log(categoryExist,"categoryExistcategoryExist",categoryExist?.Items[0]?.status?.S)
      // if (categoryExist?.Count == 0) {
      //   return res.status(400).json({ message: "Category not found", statusCode: 400, success: false })
      // } else if (categoryExist?.Items[0]?.status?.S != 'active') {
      //   return res.status(400).json({ message: "Category is not active", statusCode: 400, success: false })
      // }
      // const timestamp = new Date().toISOString(); // Format timestamp as ISO string

      // if (id) {
      //   let findData = await dynamoDBClient.send(
      //     new QueryCommand({
      //       TableName: "sub_category",
      //       KeyConditionExpression: "id = :id",
      //       ExpressionAttributeValues: {
      //         ":id": { S: id },
      //       },
      //     })
      //   );
      //   if (findData && findData?.Count == 0) {
      //     return res.status(400).json({ message: "Sub-category document not found", statusCode: 400, success: false })
      //   }
      //   // console.log("findDatafindData22", findData?.Items[0])
      //   const params = {
      //     TableName: "sub_category",
      //     Key: { id: { S: id } },
      //     UpdateExpression: "SET #title = :title, #status = :status, #category_id =:category_id, #updated_at= :updated_at ",
      //     ExpressionAttributeNames: {
      //       "#title": "title",
      //       "#status": "status",
      //       "#category_id": "category_id",
      //       "#updated_at": "updated_at"
      //     },
      //     ExpressionAttributeValues: {
      //       ":title": { S: title || findData?.Items[0]?.title?.S || "" },
      //       ":status": { S: status || findData?.Items[0]?.status?.S || 'active' },
      //       ":category_id": { S: category_id || findData?.Items[0]?.category_id?.S || '' },
      //       ":updated_at": { S: timestamp },
      //     },
      //   };
      //   const findExist = await dynamoDBClient.send(
      //     new QueryCommand({
      //       TableName: "sub_category",
      //       IndexName: "title", // Use the correct GSI name
      //       KeyConditionExpression: "title = :title",
      //       FilterExpression: "id <> :id",
      //       ExpressionAttributeValues: {
      //         ":title": { S: title },
      //         ":id": { S: id },
      //       },
      //     })
      //   );

      //   if (findExist?.Count > 0) {
      //     return res.status(400).json({ message: "Title already exist", statusCode: 400, success: false });
      //   } else {
      //     await dynamoDBClient.send(new UpdateItemCommand(params));
      //     return res.status(200).json({ message: "Data updated successfully", statusCode: 200, success: true });
      //   }
      // } else {
      //   const findEmailExist = await dynamoDBClient.send(
      //     new QueryCommand({
      //       TableName: "sub_category",
      //       IndexName: "title", // replace with your GSI name
      //       KeyConditionExpression: "title = :title",
      //       ExpressionAttributeValues: {
      //         ":title": { S: title },
      //       },
      //     })
      //   );
      //   if (findEmailExist.Count > 0) {
      //     return res.status(400).json({
      //       success: false,
      //       message: "Sub-Category name already exist!",
      //       statusCode: 400,
      //     });
      //   }

      //   let id = uuidv4();
      //   id = id?.replace(/-/g, "");
      //   const params = {
      //     TableName: "sub_category",
      //     Item: {
      //       id: { S: id },
      //       title: { S: title },
      //       status: { S: status ? "active" : "inactive" },
      //       category_id: { S: category_id },
      //       created_at: { S: timestamp },
      //       updated_at: { S: timestamp },
      //     },
      //   };
      //   // console.log("docClient", "docccleint", params);
      //   let Data = await dynamoDBClient.send(new PutItemCommand(params));
      //   return res
      //     .status(201)
      //     .json({ message: "Sub-Category add successfully", statusCode: 201, success: true });
      // }

      // Mysql
      let { title, status, category_id, id } = req.body;
      if (id) {
        console.log("id_subcategory.", category_id);

        SubCategoryModel.update(
          {
            title: title,
            status: status,
            category_id: category_id
          },
          {
            where: { id: id }
          }
        )
          .then((response) => {
            if (response[0] === 0) {
              console.log("rrrr", response?.[0]);
              // No rows updated
              return res.status(404).json({
                message: "Sub Category not found",
                statusCode: 404,
                success: false
              });
            }
            return res.status(200).json({
              message: "Sub Category updated successfully",
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
        const data = await SubCategoryModel.findOne({
          where: {
            title: title
          },
          raw: true
        });
        if (data) {
          return res.status(400).json({
            success: false,
            message: "Data already exist",
            statusCode: 400
          });
        } else {
          console.log(data, "p");
          SubCategoryModel.create({
            title: title,
            status: status ? "active" : "inactive",
            category_id: category_id
          })
            .then(async (response) => {
              return res.status(201).json({
                message: "Sub Category add successfully",
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

  async change_status(req, res) {
    try {
      let { status, id } = req.body;
      if (id) {
        let findExist = await SubCategoryModel.findOne({
          where: { id },
          raw: true,
          attributes: ["id", "title", "status"]
        });
        if (findExist) {
          // await ProductDescriptionModel.destroy({ where: { product_id: id } });
          await SubCategoryModel.update({ status }, { where: { id } });

          return res.status(200).json({
            message: "Status update successfully",
            statusCode: 200,
            success: true
          });
        } else {
          return res.status(404).json({
            message: "SubCategory not found",
            statusCode: 404,
            success: false
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "SubCategory is required",
          statusCode: 400
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
      const simplifiedData = await SubCategoryModel.findAll({
        where: {
          status: "active"
        }
      });
      if (simplifiedData?.length > 0) {
        return res.status(200).json({
          message: "Fetch Data",
          data: simplifiedData,
          statusCode: 200,
          success: true
        });
      } else {
        return res.status(404).json({
          message: "SubCategory not found",
          statusCode: 404,
          success: true
        });
      }
    } catch (err) {
      console.error(err, "erroror");
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async get_subcat_by_main_cat_id(req, res) {
    try {
      const simplifiedData = await SubCategoryModel.findAll({
        where: {
          status: "active",
          category_id: req?.query?.category_id
        }
      });

      if (simplifiedData?.length > 0) {
        return res.status(200).json({
          message: "Fetch Data",
          data: simplifiedData,
          statusCode: 200,
          success: true
        });
      } else {
        return res.status(404).json({
          message: "SubCategory not found",
          statusCode: 404,
          success: true
        });
      }
    } catch (err) {
      console.error(err, "error");
      return res.status(500).json({
        message: err?.message,
        statusCode: 500,
        success: false
      });
    }
  }

  async delete(req, res) {
    try {
      let id = req.query.id;
      if (id) {
        const deleted = await SubCategoryModel.destroy({
          where: {
            id: id
          }
        });

        if (deleted) {
          return res.status(200).json({
            message: "Sub Category deleted successfully",
            statusCode: 200,
            success: true
          });
        } else {
          return res.status(404).json({
            success: false,
            message: "Sub Category not found",
            statusCode: 404
          });
        }
      } else {
        return res.status(404).json({
          success: false,
          message: "Sub Category not found",
          statusCode: 404
        });
      }
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
