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
        sku,
        hmn,
        description,
        brand,
        category_id,
        sub_category_id,
        id,
        variant_arr,
        warehouse_arr,
        summary,
        shape_id,
        material_id,
        gender,
        weight_group_id,
        size_id, price, compare_price_at, quantity, minimum_order_quantity
      } = req.body;
      if (category_id) {
        let findData = await dynamoDBClient.send(
          new ScanCommand({
          // new QueryCommand({
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
          // new QueryCommand({
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

        // const params = {
        //   TableName: "products",
        //   Key: { id: { S: id } },
        //   UpdateExpression:
        //     "SET #title = :title, #category_id = :category_id, #sub_category_id = :sub_category_id, #price= :price, #compare_price_at= :compare_price_at, #description= :description, #quantity =:quantity, ",

        //   Item: {
        //     title: { S: title || findProductData?.title },
        //     category_id: { S: category_id || findProductData?.category_id||"" },
        //     sub_category: {
        //       S: sub_category_id || findProductData?.sub_category_id||"",
        //     },
        //     price: { S: price || findProductData?.price||"" },
        //     compare_price_at: {
        //       S: compare_price_at || findProductData?.compare_price_at||"",
        //     },
        //     description: { S: description || findProductData?.description },
        //     quantity: { S: quantity || findProductData?.quantity },
        //     // sku: { S: sku || findProductData?.sku },
        //     warehouse_arr: {
        //       L: warehouse_arr?.map((el) => ({
        //         M: {
        //           address: { S: el?.address || "" },
        //           po_box: { S: el?.po_box || "" }
        //         }
        //       })) || findProductData?.warehouseArr
        //     },
        //     variant_arr: {
        //       L: variant_arr?.map((el) => ({
        //         M: {
        //           price: { S: el?.price || "" },
        //           country: { S: el?.country || "" },
        //         },
        //       })) || findProductData?.variation 
        //     },
        //     // variation: { L: variation || findProductData?.variation },
        //     size_id: { S: size_id || findProductData?.size_id||"" },
        //     brand: { S: brand || findProductData?.brand||"" },
        //     minimum_order_quantity: {
        //       S:
        //         minimum_order_quantity ||
        //         findProductData?.minimum_order_quantity,
        //     },
        //     status: { S: status || findProductData?.status||"active" },
        //   },
        // };
        
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
              #status = :status
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
          "#status": "status"
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
            })) : findProductData.Items[0].variant_arr?.L||[]
          },
          ":size_id": { S: size_id || findProductData.Items[0].size_id?.S || "" },
          ":brand": { S: brand || findProductData.Items[0].brand?.S || "" },
          ":minimum_order_quantity": { S: minimum_order_quantity || findProductData.Items[0].minimum_order_quantity?.S },
          ":status": { S: status || findProductData.Items[0].status?.S || "active" }
        }
      };

console.log(params,"parmansssssssssss update ====")

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
        console.log(findExist, "findexistttt findexistttt findexistttt ")
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
        data:id,
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

const ProductServicesObj = new ProductServices();
export default ProductServicesObj;
