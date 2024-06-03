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
  GetItemCommand, BatchGetItemCommand
} from "@aws-sdk/client-dynamodb";

import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import fs from "fs";
import {
  simplifyDynamoDBResponse,
} from "../../helpers/datafetch.js";
import { deleteImageFRomLocal, deleteImageFromS3, uploadImageToS3 } from "../../helpers/s3.js";

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
        universal_standard_code,
        title,
        description,
        summary,
        category_id,
        brand_id,
        sub_category_id,
        model_number,
        status,
        id,
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
        console.time("first");
        let findProductData = await dynamoDBClient.send(
          new QueryCommand({
            TableName: "products",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
              ":id": { S: id },
            },
          })
        );
        console.timeEnd("first");
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
            ":brand_id": {
              S: brand_id || findProductData.Items[0].brand_id?.S || "",
            },
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
        // console.log(findExist, "findexistttt findexistttt ")
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
        // console.log(find_universal_standard_codeExist)
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
      let obj = { id };
      return res.status(201).json({
        message: "Product add successfully",
        statusCode: 201,
        data: obj,
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
      const pageSize = parseInt(req.query?.pageSize) || 10;
      const userType = req.userData.user_type;
      const userId = req.userData.id;

      const params = {
        TableName: "products",
        Limit: pageSize,
      };
      if (req.query.LastEvaluatedKey) {
        params.ExclusiveStartKey = {
          id: {
            S: req.query.LastEvaluatedKey,
          },
        };
      }
      if (userType === "vendor") {
        params.FilterExpression = "created_by = :userId";
        params.ExpressionAttributeValues = {
          ":userId": { S: userId },
        };
      }

      // console.log(params, "dynmosssssssssssssss");

      const command = new ScanCommand(params);
      const data = await dynamoDBClient.send(command);
      const simplifiedData = data.Items.map((el) =>
        simplifyDynamoDBResponse(el)
      );
      let LastEvaluatedKey;
      if (data.LastEvaluatedKey) {
        LastEvaluatedKey = data.LastEvaluatedKey?.id?.S;
      }

      res.status(200).json({
        message: "Fetch Data",
        data: simplifiedData,
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
  
  async get_dataOf_specifc(req, res) {
    try {
      const pageSize = parseInt(req.query?.pageSize) || 10;
      const userType = req.userData.user_type;
      const userId = req.userData.id;

      const params = {
        TableName: "products",
        Limit: pageSize,
        ProjectionExpression: "category_id, sub_category_id, title, universal_standard_code, variation_arr, id"
      };
      if (req.query.LastEvaluatedKey) {
        params.ExclusiveStartKey = {
          id: {
            S: req.query.LastEvaluatedKey,
          },
        };
      }
      if (userType === "vendor") {
        params.FilterExpression = "created_by = :userId";
        params.ExpressionAttributeValues = {
          ":userId": { S: userId },
        };
      }
      const command = new ScanCommand(params);
      const data = await dynamoDBClient.send(command);
      const simplifiedData = data.Items.map((el) =>
        simplifyDynamoDBResponse(el)
      );
      const uniqueCategories = [];
      simplifiedData.forEach(item => {
        if (!uniqueCategories?.includes(item.category_id)) {
          uniqueCategories.push(item.category_id)
        }
      });
      const paramsOf = {
        RequestItems: {
          category: {
            Keys: uniqueCategories.map((id) => ({
              id: { S: id },
            })),
          },
        },
      };
      const commandOf = new BatchGetItemCommand(paramsOf);
      const result = await dynamoDBClient.send(commandOf);
      let dataOf = result?.Responses?.category
      let LastEvaluatedKey;
      if (data.LastEvaluatedKey) {
        LastEvaluatedKey = data.LastEvaluatedKey?.id?.S;
      }
      res.status(200).json({
        message: "Fetch Data", dataOf,
        data: simplifiedData,
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

  async get_data_by_id_(req, res) {
    try {
      const product_id = req.query?.product_id;
      let findProductData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "products",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: product_id },
          },
        })
      )
      console.log(findProductData, "findproduct dataa")
      const simplifiedData = findProductData.Items.map((el) =>
        simplifyDynamoDBResponse(el)
      );

      res.status(200).json({
        message: "Fetch Data",
        data: simplifiedData[0],
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
      if (
        req.userData?.user_type != "super_admin" &&
        req.userData?.user_type != "vendor" &&
        req.userData?.user_type != "employee"
      ) {
        return res.status(400).json({
          message: "Not Authorise to edit product",
          statusCode: 400,
          success: false,
        });
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
      let id = req?.query?.id;
      let user_type = req?.userData?.user_type;
      let userId = req?.userData?.id;
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
      if (user_type == "vendor" && data?.Items[0]?.created_by?.S != userId) {
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
      let checkProductImage = data?.Items[0]?.variation_arr?.L;
      let productImagesArray = checkProductImage.map(
        (item) => item.M.product_images_arr?.L
      );
      productImagesArray = productImagesArray?.flatMap((el) => el);
      for (let el of productImagesArray) {
        // console.log(el?.M?.image?.S, "aaaaa");
        let filePath = `./uploads/vendor/product/${el?.M?.image?.S}`
        try {
          deleteImageFRomLocal(filePath);
        } catch (err) {
        }
        try {

          deleteImageFromS3(el?.M?.image?.S, "product");
        } catch (err) { }
      }
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
  //  VARIANT API'S BELOW
  async add_variant_data(req, res) {
    try {
      let {
        title,
        status,
        sku,
        id,
        variation, input_field,
        warehouse_arr,
        product_id,
        price,
        compare_price_at,
        quantity,
        minimum_order_quantity,
      } = req.body;
      console.log(req.body, "req.per");
      if (id) {
        if (!product_id) {
          if (req.files.product_images_arr) {
            for (let el of req.files?.product_images_arr) {
              deleteImageFRomLocal(el?.path)
            }
          }
          return res.status(400).json({
            message: "Product_id is mandatory",
            statusCode: 400,
            success: false,
          });
        }
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
          if (req.files.product_images_arr) {
            for (let el of req.files?.product_images_arr) {
              deleteImageFRomLocal(el?.path)
            }
          }
          return res.status(400).json({
            message: "Product's not found",
            statusCode: 400,
            success: false,
          });
        }
        let findProductData2 = simplifyDynamoDBResponse(
          findProductData?.Items[0]?.variation_arr?.L
        );
        let findProductDataArray = Object.values(findProductData2);
        // console.log(findProductDataArray ,"findProductDataArray ##########3")
        let dbVariantObj = {};
        for (let el in findProductData2) {
          let findObj = findProductData2[el];
          if (findObj?.id == id) {
            dbVariantObj = findObj;
            dbVariantObj.title = dbVariantObj.title;
            dbVariantObj.sku = dbVariantObj.sku;
            dbVariantObj.price = price || dbVariantObj.price;
            dbVariantObj.compare_price_at =
              compare_price_at || dbVariantObj.compare_price_at;
            dbVariantObj.quantity = quantity || dbVariantObj.quantity;
            //sku remain same
            dbVariantObj.variation = variation || dbVariantObj.variation;
            dbVariantObj.input_field = input_field || dbVariantObj.input_field;
            dbVariantObj.warehouse_arr =
              warehouse_arr || dbVariantObj.warehouse_arr;
            dbVariantObj.minimum_order_quantity =
              minimum_order_quantity || dbVariantObj.minimum_order_quantity;
            dbVariantObj.status = status || dbVariantObj.status;
            dbVariantObj.updated_at = new Date().toISOString();
            // Update other fields as necessary
            let existingImages = dbVariantObj.product_images_arr || [];
            if (req.files && req.files.product_images_arr) {
              let newImages = req.files.product_images_arr.map((el) => ({
                image: el?.filename || "",
              }));
              dbVariantObj.product_images_arr =
                existingImages.concat(newImages);
            }
            break;
          }
        }
        // console.log(dbVariantObj, "findObjfindObj");
        if (!dbVariantObj?.id) {
          if (req.files.product_images_arr) {
            for (let el of req.files?.product_images_arr) {
              deleteImageFRomLocal(el?.path)
            }
          }
          return res.status(400).json({
            message: "Product's variant not found",
            statusCode: 400,
            success: false,
          });
        }
        // console.log(findProductData2, "findaaaproduct 2222222");
        let updatedVariants = findProductDataArray?.map((variant) =>
          variant.id === id ? dbVariantObj : variant
        );
        const updatedDbVariant = updatedVariants?.map((variant) => ({
          M: {
            id: { S: variant.id },
            title: { S: variant.title },
            price: { S: variant.price },
            compare_price_at: { S: variant.compare_price_at },
            quantity: { S: variant.quantity },
            sku: { S: variant.sku },
            variation: { S: variant.variation },
            input_field: { S: variant.input_field },
            warehouse_arr: {
              L: variant.warehouse_arr.map((el) => ({
                M: {
                  // address: { S: el.address ||""},
                  po_box: { S: el.po_box || "" },
                  quantity: { S: el?.quantity || "" }
                },
              })),
            },
            created_by: { S: variant.created_by },
            minimum_order_quantity: { S: variant.minimum_order_quantity },
            status: { S: variant.status },
            created_at: { S: variant.created_at },
            updated_at: { S: variant.updated_at },
            product_images_arr: {
              L: variant.product_images_arr.map((img) => ({
                M: {
                  image: { S: img.image },
                },
              })),
            },
          },
        }));
        const updateParams = {
          TableName: "products",
          Key: {
            id: { S: product_id }, // Replace with actual product ID
          },
          UpdateExpression: "SET variation_arr = :variation_arr",
          ExpressionAttributeValues: {
            ":variation_arr": { L: updatedDbVariant },
          },
          ReturnValues: "UPDATED_NEW",
        };
        await dynamoDBClient.send(new UpdateItemCommand(updateParams));
        if (req.files.product_images_arr) {
          for (let el of req.files?.product_images_arr) {
            console.log(el, "elel")
            uploadImageToS3(el?.filename, el?.path, "product");
          }
        }
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
          if (req.files.product_images_arr) {
            for (let el of req.files?.product_images_arr) {
              deleteImageFRomLocal(el?.path)
            }
          }
          return res.status(400).json({
            success: false,
            message: "Product not found",
            statusCode: 400,
          });
        }
        let dbVariant = findExist.Items[0]?.variation_arr?.L || [];
        // console.log(dbVariant,"dbariantntntntntnt")
        if (dbVariant && dbVariant?.length) {
          let dbVariant2 = simplifyDynamoDBResponse(dbVariant);
          //   console.log(dbVariant, "@@@@@@@@@2tdbVariant")
          for (let ele in dbVariant2) {
            let tempObj = dbVariant2[ele];
            for (let el in tempObj) {
              if (
                (el == "title" && tempObj[el] == title) ||
                (el == "sku" && tempObj[el] == sku)
              ) {
                if (req.files.product_images_arr) {
                  for (let el of req.files?.product_images_arr) {
                    deleteImageFRomLocal(el?.path)
                  }
                }
                return res.status(400).json({
                  message: "Product variant 's title or sku must be unqiue",
                  statuscode: 400,
                  success: false,
                });
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
          input_field: { S: input_field || "" },
          warehouse_arr: {
            L:
              warehouse_arr?.map((el) => ({
                M: {
                  // address: { S: el?.address || "" },
                  po_box: { S: el?.po_box || "" },
                  quantity: { S: el?.quantity || "" },
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
        // console.log(params, "paramsnsnsnn add product variant");

        const updateParams = {
          TableName: "products",
          Key: {
            id: { S: product_id }, // Replace with actual product ID
          },
          UpdateExpression: "SET variation_arr = :variation_arr",
          ExpressionAttributeValues: {
            ":variation_arr": { L: dbVariant },
          },
          ReturnValues: "UPDATED_NEW",
        };
        await dynamoDBClient.send(new UpdateItemCommand(updateParams));
        if (req.files.product_images_arr) {
          for (let el of req.files?.product_images_arr) {
            console.log(el, "elel")
            uploadImageToS3(el?.filename, el?.path, "product");
          }
        }
        let obj = { id };
        return res.status(200).json({
          success: true,
          message: "Variant added successfully",
          data: obj,
        });
      }
    } catch (err) {
      if (req.files.product_images_arr) {
        for (let el of req.files?.product_images_arr) {
          deleteImageFRomLocal(el?.path)
        }
      }
      console.log(err, "errorororro");
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async delete_product_variant_by_id(req, res) {
    try {
      let id = req?.query?.id;
      let variant_id = req?.query?.variant_id;
      let user_type = req?.userData?.user_type;
      let userId = req?.userData?.id;

      const data = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "products",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        })
      );
      // console.log(data,"sdasdwe");
      if (data?.Count == 0) {
        return res.status(400).json({
          message: "Product not found or deleted already",
          statusCode: 400,
          success: false,
        });
      }
      if (user_type == "vendor" && data?.Items[0]?.created_by?.S != userId) {
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
      let checkProductImage = data?.Items[0]?.variation_arr?.L;
      let productImagesArray = checkProductImage.map((item) => item.M);
      productImagesArray = productImagesArray?.flatMap((el) => el);
      // console.log(productImagesArray, "productImagesArrayproductImagesArray");
      let updatedVariants = productImagesArray?.filter(
        (el) => el?.id?.S != variant_id
      );
      let findVariant = productImagesArray?.find(
        (el) => el?.id?.S == variant_id
      );
      if (!findVariant) {
        return res.status(400).json({
          message: "Variant not found or deleted already",
          statusCode: 400,
          success: false,
        });
      }
      // console.log("findVariant"," @@@@   findvariantiaiaiai ",findVariant?.product_images_arr?.L);
      if (
        findVariant?.product_images_arr &&
        findVariant?.product_images_arr?.L
      ) {
        for (let el of findVariant?.product_images_arr?.L) {
          console.log(el?.M?.image?.S, "el?.M?.image");
          try {
            deleteImageFRomLocal(el?.M?.image?.S, "product");
          } catch (er) { }
          try {
            // deleteImageFromS3(el?.M?.image?.S, "product");
          } catch (Er) { }
        }
      }
      const updatedDbVariant = updatedVariants?.map((variant) => ({
        M: {
          id: { S: variant.id },
          title: { S: variant.title },
          price: { S: variant.price },
          compare_price_at: { S: variant.compare_price_at },
          quantity: { S: variant.quantity },
          sku: { S: variant.sku },
          variation: { S: variant.variation },
          warehouse_arr: {
            L: variant.warehouse_arr.map((el) => ({
              M: {
                // address: { S: el.S.address },
                quantity: { S: el.S.quantity },
                po_box: { S: el.S.po_box },
              },
            })),
          },
          created_by: { S: variant.created_by },
          minimum_order_quantity: { S: variant.minimum_order_quantity },
          status: { S: variant.status },
          created_at: { S: variant.created_at },
          updated_at: { S: variant.updated_at },
          product_images_arr: {
            L: variant.product_images_arr.map((img) => ({
              M: {
                image: { S: img.S.image },
              },
            })),
          },
        },
      }));
      // console.log(updatedDbVariant, "updatedDbVariantupdatedDbVariant");
      const updateParams = {
        TableName: "products",
        Key: {
          id: { S: product_id }, // Replace with actual product ID
        },
        UpdateExpression: "SET variation_arr = :variation_arr",
        ExpressionAttributeValues: {
          ":variation_arr": { L: updatedDbVariant },
        },
        ReturnValues: "UPDATED_NEW",
      };
      await dynamoDBClient.send(new UpdateItemCommand(updateParams));

      // await dynamoDBClient.send(new DeleteItemCommand(params));

      return res.status(200).json({
        message: "Product's variant deleted successfully",
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

  async delete_variant_image_data(req, res) {
    try {
      let { product_id, variant_id, image } = req.query
      let findProductData = await dynamoDBClient.send(
        new QueryCommand({
          TableName: "products",
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: {
            ":id": { S: product_id },
          },
        })
      )
      if (findProductData && findProductData?.Count == 0) {
        return res.status(400).json({ message: "Product not found", statusCode: 400, success: false })
      }
      let checkProductImage = findProductData?.Items[0]?.variation_arr?.L;
      let productImagesArray = checkProductImage.map((item) => item.M);
      // console.log(productImagesArray[0]?.product_images_arr?.L,"productImagesArray productImagesArray ")
      productImagesArray.forEach(variant => {
        if (variant?.id?.S === variant_id) {
          variant.product_images_arr.L = variant.product_images_arr.L.filter(
            elem => elem.M.image.S !== image
          );
        }
      });
      const updatedVariationArr = productImagesArray.map(item => ({
        M: item,
      }));

      console.log(productImagesArray, "oductayproductImagesArray");

      const params = {
        TableName: 'products',
        Key: {
          id: { S: product_id },
        },
        UpdateExpression: 'set variation_arr = :varArr',
        ExpressionAttributeValues: {
          ':varArr': { L: updatedVariationArr },
        },
      };
      const updateCommand = new UpdateItemCommand(params);
      await dynamoDBClient.send(updateCommand);
      let filePath = `./uploads/vendor/product/${image}`
      try {
        deleteImageFRomLocal(filePath);
      } catch (er) { }
      try {
        deleteImageFromS3(image, "product");
      } catch (er) {
      }
      return res.status(400).json({ message: "Image deleted successfully", statusCode: 400, success: false })
    } catch (err) {
      return res.status(500).json({ message: err?.message, statusCode: 500, success: false })
    }
  }
}

const ProductServicesObj = new ProductServices();
export default ProductServicesObj;
