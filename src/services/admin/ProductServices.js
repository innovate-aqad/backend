import docClient from "../../config/dbConfig.js";
import Sequence from "../../models/SequenceModel.js";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  TransactGetItemsCommand,
} from "@aws-sdk/client-dynamodb";

import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import { simplifyDynamoDBResponse, simplifyDynamoDBResponse2 } from "../../helpers/datafetch.js";

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
        universal_standard_code,
        brand_id,
        category_id,
        sub_category_id,
        id,
        summary,
      } = req.body;
      if (category_id) {
        let findData = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "category",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: category_id }, // Assuming category_id is a string
            },
          })
        );
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
          new QueryCommand({
            TableName: "sub_category",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: sub_category_id }, // Assuming sub_category_id is a string
            },
          })
        );
        if (findData?.Count == 0) {
          return res.status(400).json({
            message: "Sub_Category not found",
            statusCode: 400,
            success: false,
          });
        }
      }
      if (brand_id) {
        let findData = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "brand",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: brand_id }, // Assuming  is a string
            },
          })
        );
        if (findData?.Count == 0) {
          return res.status(400).json({
            message: "Brand not found",
            statusCode: 400,
            success: false,
          });
        }
      }
      if (id) {
        let findProductData = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "products",
            KeyConditionExpression: "id = :id",
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
        //need to discuss  universal_standard_code will be editable or not.
        // if(universal_standard_code){
        //   const findSkuExist = await dynamoDBClient.send(
        //     new QueryCommand({
        //       TableName: "products",
        //       IndexName: "universal_standard_code", // replace with your GSI title.a
        //       KeyConditionExpression:
        //       "universal_standard_code = :universal_standard_code",
        //       FilterExpression: "id <> :id",
        //       ExpressionAttributeValues: {
        //         ":universal_standard_code": { S: universal_standard_code },
        //         ":id": { S: id },
        //       },
        //     })
        //   );
        //   if (findSkuExist.Count > 0) {
        //     return res.status(400).json({
        //       success: false,
        //       message: "Product's universal_standard_code must be unique",
        //       statusCode: 400,
        //     });
        //   }
        // }
        // ":warehouse_arr": {
        //   L: warehouse_arr ? warehouse_arr.map((el) => ({
        //     M: {
        //       address: { S: el.address || "" },
        //       po_box: { S: el.po_box || "" }
        //     }
        //   })) : findProductData.Items[0].warehouse_arr.L
        // },
        const params = {
          TableName: "products",
          Key: { id: { S: id } },
          UpdateExpression: `
          SET #title = :title,
              #category_id = :category_id,
              #sub_category_id = :sub_category_id,
              #description = :description,
              #brand_id = :brand_id,
              #status = :status,
               #summary =  :summary
        `,
          ExpressionAttributeNames: {
            "#title": "title",
            "#category_id": "category_id",
            "#sub_category_id": "sub_category_id",
            "#description": "description",
            "#brand_id": "brand_id",
            "#status": "status",
            "#summary": "summary",
          },
          ExpressionAttributeValues: {
            ":title": { S: title || findProductData.Items[0].title.S },
            ":category_id": {
              S: category_id || findProductData.Items[0].category_id.S || "",
            },
            ":sub_category_id": {
              S:
                sub_category_id ||
                findProductData.Items[0].sub_category_id.S ||
                "",
            },
            ":description": {
              S: description || findProductData.Items[0].description.S,
            },
            ":brand_id": { S: brand_id || findProductData.Items[0].brand_id?.S || "" },
            ":status": {
              S: status || findProductData.Items[0].status?.S || "active",
            },
            ":summary": {
              S: summary || findProductData.Items[0].summary?.S || "",
            },
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
            TableName: "products",
            IndexName: "title", // replace with your GSI title
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
        const find_universal_standard_codeExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "products",
            IndexName: "universal_standard_code", // replace with your GSI title.a
            KeyConditionExpression:
              "universal_standard_code = :universal_standard_code",
            ExpressionAttributeValues: {
              ":universal_standard_code": { S: universal_standard_code },
            },
          })
        );
        console.log(find_universal_standard_codeExist)
        if (find_universal_standard_codeExist.Count > 0) {
          return res.status(400).json({
            success: false,
            message: "Product's universal_standard_code must be unique",
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
            description: { S: description || "" },
            summary: { S: summary || "" },
            universal_standard_code: { S: universal_standard_code || "" },
            brand_id: { S: brand_id || "" },
            // warehouse_arr: {
            //   L: warehouse_arr?.map((el) => ({
            //     M: {
            //       address: { S: el?.address || "" },
            //       po_box: { S: el?.po_box || "" }
            //     }
            //   })) || []
            // },
            // },
            variantion_arr: { L: [] },
            brand_id: { S: brand_id || "" },
            created_by: { S: req.userData?.id || "" },
            status: { S: status || "active" },
            created_at: { S: new Date().toISOString() },
            updated_at: { S: new Date().toISOString() },
          },
        };
        // console.log(params, "paramsnsnsnn add product ");
        await dynamoDBClient.send(new PutItemCommand(params));
      }
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
      if (userType === "vendor") {
        params.FilterExpression = "created_by = :created_by";
        params.ExpressionAttributeValues = {
          ":created_by": userId,
        };
      }
      if (req.query.LastEvaluatedKey) {
        params.ExclusiveStartKey = JSON.parse(req.query.LastEvaluatedKey);
      }

      let productsResult = await dynamoDB.scan(params).promise();
      let LastEvaluatedKey;
      if (productsResult.LastEvaluatedKey) {
        LastEvaluatedKey = JSON.stringify(productsResult.LastEvaluatedKey);
      }
      const productIds = productsResult.Items.map(product => product.id);
      // Fetch product variants for all products using a single query
      // const variantParams = {
      //   TableName: "product_variant",
      //   FilterExpression: "product_id IN (" + productIds.map(() => ":product_id").join(",") + ")",
      //   ExpressionAttributeValues: productIds.reduce((acc, productId, index) => {
      //     acc[`:product_id${index}`] = productId;
      //     return acc;
      //   }, {}),
      // };
      // const variantsResult = await dynamoDB.scan(variantParams).promise();

      // Group variants by product ID
      const variantsByProductId = {};
      // variantsResult.Items.forEach(variant => {
      //   if (!variantsByProductId[variant.product_id]) {
      //     variantsByProductId[variant.product_id] = [];
      //   }
      //   variantsByProductId[variant.product_id].push(variant);
      // });

      // Combine product variants with products
      // const productsWithVariants = productsResult.Items.map(product => ({
      //   ...product,
      //   variants: variantsByProductId[product.product_id] || [],
      // }));

      res.status(200).json({
        message: "Fetch Data",
        data: productsResult,
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
  //change status of main product
  async changeStatus(req, res) {
    try {
      let { status, id } = req.body;
      if (req.userData?.user_type != "super_admin" && req.userData?.user_type != "vendor" && req.userData?.user_type != "employee") {
        return res
          .status(400)
          .json({ message: "Not Authorise to edit product", statusCode: 400, success: false });
      }
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
      let user_type = req.userData?.user_type;
      let userId = req.id;

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
        return res.status(400).json({
          message: "Product not found or deleted already",
          statusCode: 400,
          success: false,
        });
      }
      console.log(
        data?.Items[0]?.created_by,
        "dataaaaaaa",
        userId,
        "data?.Items[0]?.",
        data?.Items[0]
      );
      if (user_type == "vendor" && data?.Items[0]?.created_by != userId) {
        return res.status(400).json({
          message: "Not authorise to delete another vendor's product",
          statusCode: 400,
          success: false,
        });
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

  async add_variant_data(req, res) {
    try {
      let {
        title,
        status,
        sku,
        id,
        variation,
        warehouse_arr,
        product_id,
        price,
        compare_price_at,
        quantity, minimum_order_quantity
      } = req.body;
      console.log(req.body, "req.per")
      if (id) {
        const findProductData = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "products",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: product_id },
            },
          })
        );
        if (findProductData?.Count == 0) {
          return res.status(400).json({
            message: "Product's not found",
            statusCode: 400,
            success: false,
          });
        }
        let findProductData2 = simplifyDynamoDBResponse(findProductData?.Items[0]?.variation_arr?.L)
        let dbVariantObj={}
        for (let el in findProductData2) {
          let findObj = findProductData2[el]
          if(findObj?.id==id){
            dbVariantObj=findObj
          }
        }
        console.log(dbVariantObj,"findObjfindObj")
        if (!dbVariantObj) { return res.status(400).json({ message: "Product's variant not found", statusCode: 400, success: false }) }
        return
        let obj = { title, price, compare_price_at, quantity, warehouse_arr, variation, minimum_order_quantity }
        const params = {
          TableName: "product",
          Key: { id: { S: id } },
          UpdateExpression: `
          SET #variantion_arr
              #price = :price,
              #compare_price_at = :compare_price_at,
              #quantity = :quantity,
              #warehouse_arr = :warehouse_arr,
              #variation = :variation,
              #minimum_order_quantity = :minimum_order_quantity,
              #status = :status,
        `,
          ExpressionAttributeNames: {
            "#title": "title",
            "#price": "price",
            "#compare_price_at": "compare_price_at",
            "#quantity": "quantity",
            "#warehouse_arr": "warehouse_arr",
            "#variation": "variation",
            "#brand_id": "brand_id",
            "#minimum_order_quantity": "minimum_order_quantity",
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":title": { S: title || findProductData.Items[0].title.S },
            ":price": { S: price || findProductData.Items[0].price.S || "" },
            ":compare_price_at": {
              S:
                compare_price_at ||
                findProductData.Items[0].compare_price_at.S ||
                "",
            },
            ":quantity": { S: quantity || findProductData.Items[0].quantity.S },
            ":warehouse_arr": {
              L: warehouse_arr
                ? warehouse_arr.map((el) => ({
                  M: {
                    address: { S: el.address || "" },
                    po_box: { S: el.po_box || "" },
                  },
                }))
                : findProductData.Items[0].warehouse_arr.L,
            },
            ":minimum_order_quantity": {
              S:
                minimum_order_quantity ||
                findProductData.Items[0].minimum_order_quantity?.S,
            },
            ":status": {
              S: status || findProductData.Items[0].status?.S || "active",
            },
          },
        };
        await dynamoDBClient.send(new UpdateItemCommand(params));
        return res.status(200).json({
          message: "Product's variant details update successfully",
          statusCode: 200,
          sucess: true,
        });
      } else {
        const findExist = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "products",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: product_id },
            },
          })
        );
        // console.log(findExist, "findexistttt findexistttt findexistttt ")
        if (findExist.Count == 0) {
          return res.status(400).json({
            success: false,
            message: "Product not found",
            statusCode: 400,
          });
        }
        let dbVariant = findExist.Items[0]?.variation_arr?.L || []
        // console.log(dbVariant,"dbariantntntntntnt")
        if (dbVariant && dbVariant?.length) {
          let dbVariant2 = simplifyDynamoDBResponse(dbVariant)
          //   console.log(dbVariant, "@@@@@@@@@2tdbVariant")
          for (let ele in dbVariant2) {
            let tempObj = dbVariant2[ele]
            for (let el in tempObj) {
              if (el == 'title' && tempObj[el] == title || el == 'sku' && tempObj[el] == sku) {
                return res.status(400).json({ message: "Product variant 's title or sku must be unqiue", statuscode: 400, success: false })
              }
            }
          }
        }
        id = uuidv4();
        id = id?.replace(/-/g, "");
        const params = {
          id: { S: id },
          title: { S: title || "" },
          price: { S: price || "" },
          compare_price_at: { S: compare_price_at || "" },
          quantity: { S: quantity || "" },
          sku: { S: sku },
          variation: { S: variation || "" },
          warehouse_arr: {
            L:
              warehouse_arr?.map((el) => ({
                M: {
                  address: { S: el?.address || "" },
                  po_box: { S: el?.po_box || "" },
                },
              })) || [],
          },
          created_by: { S: req.userData?.id || "" },
          minimum_order_quantity: { S: minimum_order_quantity || "" },
          status: { S: status || "active" },
          created_at: { S: new Date().toISOString() },
          updated_at: { S: new Date().toISOString() },
        };
        params.product_images_arr = {
          L:
            req.files.product_images_arr?.map((el) => ({
              M: {
                image: { S: el?.filename || "" },
              },
            })) || [],
        };
        dbVariant.push({ M: params });
        console.log(params, "paramsnsnsnn add product variant");

        const updateParams = {
          TableName: "products",
          Key: {
            id: { S: product_id } // Replace with actual product ID
          },
          UpdateExpression: "SET variation_arr = :variation_arr",
          ExpressionAttributeValues: {
            ":variation_arr": { L: dbVariant }
          },
          ReturnValues: "UPDATED_NEW"
        };
        const updateResult = await dynamoDBClient.send(new UpdateItemCommand(updateParams));
        return res.status(200).json({
          success: true,
          message: "Variant added successfully",
          data: { obj: { id: id } },
        });
      }
    } catch (err) {
      console.log(err, "errorororro");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }


}

const ProductServicesObj = new ProductServices();
export default ProductServicesObj;
