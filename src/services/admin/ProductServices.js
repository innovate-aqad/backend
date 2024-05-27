import docClient from "../../config/dbConfig.js";
import Sequence from "../../models/SequenceModel.js";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand, TransactGetItemsCommand,
} from "@aws-sdk/client-dynamodb";

import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk"

const dynamoDB = new AWS.DynamoDB.DocumentClient();

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
        title,
        status,
        description,
        Universal_standard_code,
        brand,
        category_id,
        sub_category_id,
        id,
        // variant_arr,
        // warehouse_arr,
        summary,
        shape_id,
        material_id,
        gender,
        weight_group_id,
        size_id,
        //  price, compare_price_at, quantity, minimum_order_quantity
      } = req.body;
      if (category_id) {
        // let findData = await dynamoDBClient.send(
        //   new ScanCommand({
        //     // new QueryCommand({
        //     TableName: "category",
        //     FilterExpression: "id = :id",
        //     ExpressionAttributeValues: {
        //       ":id": { S: category_id },
        //     },
        //   })
        // );
        let findData = await dynamoDBClient.send(
          new QueryCommand({
              TableName: "category",
              KeyConditionExpression: "id = :id",
              ExpressionAttributeValues: {
                  ":id": { S: category_id }, // Assuming category_id is a string
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
        // let findData = await dynamoDBClient.send(
        //   new ScanCommand({
        //     // new QueryCommand({
        //     TableName: "sub_category",
        //     FilterExpression: "id = :id",
        //     ExpressionAttributeValues: {
        //       ":id": { S: sub_category_id },
        //     },
        //   })
        // );
        let findData = await dynamoDBClient.send(
          new QueryCommand({
              TableName: "sub_category",
              KeyConditionExpression: "id = :id",
              ExpressionAttributeValues: {
                  ":id": { S: sub_category_id }, // Assuming sub_category_id is a string
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

      if (id) {
        // let findProductData = await dynamoDBClient.send(
        //   new ScanCommand({
        //     // new QueryCommand({
        //     TableName: "products",
        //     FilterExpression: "id = :id",
        //     ExpressionAttributeValues: {
        //       ":id": { S: id },
        //     },
        //   })
        // );
        let findProductData= await dynamoDBClient.send(
          new QueryCommand({
              TableName: "products",
              KeyConditionExpression: "id = :id",
              ExpressionAttributeValues: {
                  ":id": { S: id }, // Assuming sub_category_id is a string
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
        // ":warehouse_arr": {
        //   L: warehouse_arr ? warehouse_arr.map((el) => ({
        //     M: {
        //       address: { S: el.address || "" },
        //       po_box: { S: el.po_box || "" }
        //     }
        //   })) : findProductData.Items[0].warehouse_arr.L
        // },
        // ":variant_arr": {
        //   L: variant_arr ? variant_arr.map((el) => ({
        //     M: {
        //       price: { S: el.price || "" },
        //       country: { S: el.country || "" },
        //     },
        //   })) : findProductData.Items[0].variant_arr?.L || []
        // },

        const params = {
          TableName: "products",
          Key: { id: { S: id } },
          UpdateExpression: `
          SET #title = :title,
              #category_id = :category_id,
              #sub_category_id = :sub_category_id,
              #description = :description,
              #size_id = :size_id,
              #brand = :brand,
              #status = :status,
               #summary =  :summary
        `,
          ExpressionAttributeNames: {
            "#title": "title",
            "#category_id": "category_id",
            "#sub_category_id": "sub_category_id",
            "#description": "description",
            "#size_id": "size_id",
            "#brand": "brand",
            "#status": "status",
            "#summary": "summary",
          },
          ExpressionAttributeValues: {
            ":title": { S: title || findProductData.Items[0].title.S },
            ":category_id": { S: category_id || findProductData.Items[0].category_id.S || "" },
            ":sub_category_id": { S: sub_category_id || findProductData.Items[0].sub_category_id.S || "" },
            ":description": { S: description || findProductData.Items[0].description.S },
            ":size_id": { S: size_id || findProductData.Items[0].size_id?.S || "" },
            ":brand": { S: brand || findProductData.Items[0].brand?.S || "" },
            ":status": { S: status || findProductData.Items[0].status?.S || "active" },
            ":summary": { S: summary|| findProductData.Items[0].summary?.S || "" }
          }
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
            TableName: "products",
            IndexName: "title", // replace with your GSI title.a
            KeyConditionExpression: "title = :title",
            ExpressionAttributeValues: {
              ":title": { S: title },
            },
          })
        );
        // console.log(findExist, "findexistttt findexistttt findexistttt ")
        if (findExist.Count > 0) {
          return res.status(400).json({
            success: false,
            message: "Product title must be unique",
            statusCode: 400,
          });
        }
        const findSkuExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "products",
            IndexName: "Universal_standard_code", // replace with your GSI title.a
            KeyConditionExpression: "Universal_standard_code = :Universal_standard_code",
            ExpressionAttributeValues: {
              ":Universal_standard_code": { S: Universal_standard_code },
            },
          })
        );
        if (findSkuExist.Count > 0) {
          return res.status(400).json({
            success: false,
            message: "Product's Universal_standard_code must be unique",
            statusCode: 400,
          });
        }
        id = uuidv4();
        id = id?.replace(/-/g, "");
        const params = {
          TableName: "products",
          Item: {
            id: { S: id },
            title: { S: title },
            category_id: { S: category_id },
            sub_category_id: { S: sub_category_id },
            description: { S: description },
            Universal_standard_code: { S: Universal_standard_code||"" },
            // warehouse_arr: {
            //   L: warehouse_arr?.map((el) => ({
            //     M: {
            //       address: { S: el?.address || "" },
            //       po_box: { S: el?.po_box || "" }
            //     }
            //   })) || []
            // },
            // },
            // size: { S: size },
            brand: { S: brand || "" },
            created_by: { S: req.userData?.id || "" },
            // minimum_order_quantity: { S: minimum_order_quantity },
            status: { S: status || "active" },
            // variant_arr: {
            //   L: variant_arr?.map((el) => ({
            //     M: {
            //       price: { S: el?.price || "" },
            //       country: { S: el?.country || "" },
            //     },
            //   })) || []
            // },
            summary: { S: summary },
            // shape_id: { S: shape_id || "" },
            // material_id: { S: material_id || "" },
            // gender: { S: gender || "" },
            // weight_group_id: { S: weight_group_id || "" },
            size_id: { S: size_id || "" },
            // product_image: { S: req.files?.product_image[0]?.filename || "" },
            created_at: { S: new Date().toISOString() },
            updated_at: { S: new Date().toISOString() },
          }
        }
        params.Item.product_images_arr = {
          L: req.files.product_images_arr?.map((el) => ({
            M: {
              image: { S: el?.filename || "" },
            },
          })) || []
        }
        // req.files.product_images_arr?.map((el) => el?.filename)
        console.log(params, "paramsnsnsnn add product ")
        await dynamoDBClient.send(new PutItemCommand(params));
      };
      return res.status(201).json({
        message: "Product add successfully",
        statusCode: 201,
        data: id,
        success: true,
      });
    } catch (err) {
      console.log(err, "errorororro");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async add_variant_data(req, res) {
    try {
      let {
        title,
        status,
        sku,
        description,
        id,
        variant_arr,
        warehouse_arr,
        shape_id,
        material_id,
        gender,
        weight_group_id,
        // size_id, price, compare_price_at, quantity, minimum_order_quantity
      } = req.body;
        // const findData = await dynamoDBClient.send(
        //   new QueryCommand({
        //     TableName: "products",
        //     IndexName: "title", // replace with your GSI title.a
        //     KeyConditionExpression: "title = :title",
        //     ExpressionAttributeValues: {
        //       ":title": { S: title },
        //     },
        //   })
        // );
        // console.log("findDatafindData22", findData?.Items[0]);
        
      if (id) {
        let findProductData = await dynamoDBClient.send(
          new ScanCommand({
            // new QueryCommand({
            TableName: "products",
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

        const params = {
          TableName: "products",
          Key: { id: { S: id } },
          UpdateExpression: `
          SET #title = :title,
              #category_id = :category_id,
              #sub_category_id = :sub_category_id,
              #price = :price,
              #compare_price_at = :compare_price_at,
              #description = :description,
              #quantity = :quantity,
              #warehouse_arr = :warehouse_arr,
              #variant_arr = :variant_arr,
              #size_id = :size_id,
              #brand = :brand,
              #minimum_order_quantity = :minimum_order_quantity,
              #status = :status,
               #summary =  :summary
        `,
          ExpressionAttributeNames: {
            "#title": "title",
            "#category_id": "category_id",
            "#sub_category_id": "sub_category_id",
            "#price": "price",
            "#compare_price_at": "compare_price_at",
            "#description": "description",
            "#quantity": "quantity",
            "#warehouse_arr": "warehouse_arr",
            "#variant_arr": "variant_arr",
            "#size_id": "size_id",
            "#brand": "brand",
            "#minimum_order_quantity": "minimum_order_quantity",
            "#status": "status",
            "#summary": "summary",
          },
          ExpressionAttributeValues: {
            ":title": { S: title || findProductData.Items[0].title.S },
            ":category_id": { S: category_id || findProductData.Items[0].category_id.S || "" },
            ":sub_category_id": { S: sub_category_id || findProductData.Items[0].sub_category_id.S || "" },
            ":price": { S: price || findProductData.Items[0].price.S || "" },
            ":compare_price_at": { S: compare_price_at || findProductData.Items[0].compare_price_at.S || "" },
            ":description": { S: description || findProductData.Items[0].description.S },
            ":quantity": { S: quantity || findProductData.Items[0].quantity.S },
            ":warehouse_arr": {
              L: warehouse_arr ? warehouse_arr.map((el) => ({
                M: {
                  address: { S: el.address || "" },
                  po_box: { S: el.po_box || "" }
                }
              })) : findProductData.Items[0].warehouse_arr.L
            },
            ":variant_arr": {
              L: variant_arr ? variant_arr.map((el) => ({
                M: {
                  price: { S: el.price || "" },
                  country: { S: el.country || "" },
                },
              })) : findProductData.Items[0].variant_arr?.L || []
            },
            ":size_id": { S: size_id || findProductData.Items[0].size_id?.S || "" },
            ":brand": { S: brand || findProductData.Items[0].brand?.S || "" },
            ":minimum_order_quantity": { S: minimum_order_quantity || findProductData.Items[0].minimum_order_quantity?.S },
            ":status": { S: status || findProductData.Items[0].status?.S || "active" },
            ":summary": { S: summary|| findProductData.Items[0].summary?.S || "" }
          }
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
            TableName: "products",
            IndexName: "title", // replace with your GSI title.a
            KeyConditionExpression: "title = :title",
            ExpressionAttributeValues: {
              ":title": { S: title },
            },
          })
        );
        // console.log(findExist, "findexistttt findexistttt findexistttt ")
        if (findExist.Count > 0) {
          return res.status(400).json({
            success: false,
            message: "Product title must be unique",
            statusCode: 400,
          });
        }
        const findSkuExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "products",
            IndexName: "sku", // replace with your GSI title.a
            KeyConditionExpression: "sku = :sku",
            ExpressionAttributeValues: {
              ":sku": { S: sku },
            },
          })
        );
        if (findSkuExist.Count > 0) {
          return res.status(400).json({
            success: false,
            message: "Product sku must be unique",
            statusCode: 400,
          });
        }

        id = uuidv4();
        id = id?.replace(/-/g, "");
        const params = {
          TableName: "products",
          Item: {
            id: { S: id },
            title: { S: title },
            category_id: { S: category_id },
            sub_category_id: { S: sub_category_id },
            price: { S: price || "" },
            compare_price_at: { S: compare_price_at || "" },
            description: { S: description },
            quantity: { S: quantity || "" },
            sku: { S: sku },
            warehouse_arr: {
              L: warehouse_arr?.map((el) => ({
                M: {
                  address: { S: el?.address || "" },
                  po_box: { S: el?.po_box || "" }
                }
              })) || []
            },
            // },
            // size: { S: size },
            brand: { S: brand || "" },
            created_by: { S: req.userData?.id || "" },
            minimum_order_quantity: { S: minimum_order_quantity },
            status: { S: status || "active" },
            variant_arr: {
              L: variant_arr?.map((el) => ({
                M: {
                  price: { S: el?.price || "" },
                  country: { S: el?.country || "" },
                },
              })) || []
            },
            summary: { S: summary },
            shape_id: { S: shape_id || "" },
            material_id: { S: material_id || "" },
            gender: { S: gender || "" },
            weight_group_id: { S: weight_group_id || "" },
            size_id: { S: size_id || "" },
            product_image: { S: req.files?.product_image[0]?.filename || "" },
            created_at: { S: new Date().toISOString() },
            updated_at: { S: new Date().toISOString() },
          }
        }
        params.Item.product_images_arr = {
          L: req.files.product_images_arr?.map((el) => ({
            M: {
              image: { S: el?.filename || "" },
            },
          })) || []
        }
        // req.files.product_images_arr?.map((el) => el?.filename)
        console.log(params, "paramsnsnsnn add product ")
        await dynamoDBClient.send(new PutItemCommand(params));
      };
      return res.status(201).json({
        message: "Product add successfully",
        statusCode: 201,
        data: id,
        success: true,
      });
    } catch (err) {
      console.log(err, "errorororro");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async get_dataOf(req, res) {
    try {

      const pageSize = req.query?.pageSize || 10;
      const userType = req.userData.user_type;
      const userId = req.userData.id;

      const params = {
        TableName: "products",
        Limit: pageSize,
      };
      if (userType === 'vendor') {
        params.FilterExpression = "created_by = :created_by";
        params.ExpressionAttributeValues = {
          ":created_by": userId,
        };
      }
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
      let user_type = req.userData?.user_type
      let userId = req.id

      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "products",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      if (data?.Count == 0) {
        return res.status(400).json({ message: "Product not found or deleted already", statusCode: 400, success: false })
      }
      console.log(data?.Items[0]?.created_by, "dataaaaaaa",userId,"data?.Items[0]?.",data?.Items[0])
      if (user_type == 'vendor' && data?.Items[0]?.created_by != userId ) {
        return res.status(400).json({ message: "Not authorise to delete another vendor's product", statusCode: 400, success: false })
      }
      const params = {
        TableName: "products",
        Key: {
          id: { S: id },
        },
      };
      await dynamoDBClient.send(new DeleteItemCommand(params));
      return res.status(200).json({
        message: "Product Delete successfully",
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

const ProductServicesObj = new ProductServices();
export default ProductServicesObj;
