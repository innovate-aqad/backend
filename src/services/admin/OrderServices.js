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
  BatchGetItemCommand,
  BatchWriteItemCommand,
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
      let {
        address,
        po_box,
        order_detail,
        sub_total,
        delivery_charges,
        payment_method,
        country_code,
      } = req.body;
      let tempProductId = new Set();

      for (let le of order_detail) {
        tempProductId.add(le?.product_id);
      }
      const keys = Array.from(tempProductId).map((product_id) => ({
        id: { S: product_id }, // Assuming the primary key attribute name is 'id' and type is string
      }));

      // console.log(keys,"keysysy")
      const getProductDetails = await dynamoDBClient.send(
        new BatchGetItemCommand({
          RequestItems: {
            products: {
              Keys: keys,
              ProjectionExpression:
                "variation_arr,id ,category_id,sub_category_id,title,created_by",
            },
          },
        })
      );
      // console.log(getProductDetails?.Responses?.products, "!!@@  ffffffffffff");
      //validation of product's quantity
      let simplrProductArr = [];
      for (let el of getProductDetails?.Responses?.products) {
        let getSimpleData = simplifyDynamoDBResponse(el);
        simplrProductArr.push(getSimpleData);
      }
      // console.log(simplrProductArr, "simpl    rrrrrrrr");
      let vendorArr = [];
      for (let el of order_detail) {
        const timestamp = new Date().toISOString();
        let findProductOBj = simplrProductArr?.find(
          (elem) => elem?.id == el?.product_id
        );
        // console.log(findProductOBj,"find product objbjb");
        if (findProductOBj) {
          let findVariationObj = findProductOBj?.variation_arr?.find(
            (e) => e?.id == el?.variant_id
          );
          if (!findVariationObj) {
            return res.status(400).json({ message: `This variation ${el?.variant_id} is not found`, statusCode: 400, success: false })
          }
          // console.log(findVariationObj, "find Variant t !!@#$%^&**()}{() ");
        } else {
          return res
            .status(400)
            .json({
              message: `This product ${el?.product_id} is not found`,
              statusCode: 400,
              success: false,
            });
        }
        //storing the product in array
        let findVendorObj = vendorArr?.find(
          (s) => s?.vendor_id == findProductOBj?.created_by
        );
        if (!findVendorObj) {
          vendorArr.push({
            vendor_id: findProductOBj?.created_by,
            product_arr: [{
              product_id: findProductOBj?.id,
              variant_id: el?.variant_id,
              quantity: el?.quantity
            }]
          });
        } else {
          let findProductExist = findVendorObj?.product_arr?.find(
            (z) => z?.product_id == el?.product_id && z?.variant_id == el?.variant_id
          );
          if (!findProductExist) {
            findVendorObj.product_arr.push({
              product_id: findProductOBj?.id,
              variant_id: el?.variant_id,
              quantity: el?.quantity
            });
          } else {
            findProductExist.quantity += el?.quantity;
          }
        }
      }
      let id = uuidv4();
      id = id?.replace(/-/g, "");
      const params = {
        TableName: "order",
        Item: {
          id: { S: id },
          address: { S: address || "" },
          po_box: { S: po_box || "" },
          sub_total: { N: sub_total || "" },
          delivery_charges: { N: delivery_charges },
          payment_method: { S: payment_method || "" },
          country_code: { S: country_code ||""},
          created_by: { S: req.userData?.id||"" },
          email: { S: req.userData?.email||"" },
          order_detail: {
            L:
              order_detail?.map((el) => ({
                M: {
                  variant_id: { S: el?.variant_id||"" },
                  quantity: { S: el.quantity?.toString()||"" },
                  variant_name: { S: el.variant_name||"" },
                  thumbnail_url: { S: el.thumbnail_url||"" },
                  product_id: { S: el.product_id ||""},
                  product_price: { S: el.product_price?.toString() ||"" },
                },
              }))
          },
          created_at: { S: new Date().toISOString() },
          updated_at: { S: new Date().toISOString() },
        },
      };
      console.log(params,"apapapamfr")
      await dynamoDBClient.send(new PutItemCommand(params));
      try {
        let user_id = req.userData.id;
        let findCartItem = await dynamoDBClient.send(
          new ScanCommand({
            TableName: "cart",
            FilterExpression: "user_id = :user_id",
            ExpressionAttributeValues: {
              ":user_id": { S: user_id },
            },
          })
        );
        // console.log(findCartItem, "findCa rtI temf indCart Item `_+ ++_)");
        if (findCartItem && findCartItem?.Items?.length > 0) {
          const keysToDelete = findCartItem.Items.map((item) => ({
            id: { S: item.id.S },
          }));
          // console.log(keysToDelete, "keys -to----delete");
          await dynamoDBClient.send(
            new BatchWriteItemCommand({
              RequestItems: {
                cart: keysToDelete.map((key) => ({
                  DeleteRequest: { Key: key },
                })),
              },
            })
          );
        }
      } catch (err) {
        console.log(err)
      }
      return res.status(201).json({
        message: "Order generated successfully",
        // vendorArr,
        // order_detail,
        statusCode: 201,
        success: true,
      });

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
      let createdBy=req.userData.id
      const params = {
        TableName: "order",
        IndexName: "created_by", // Ensure this index exists if created_by is a secondary index
        KeyConditionExpression: "created_by = :createdBy",
        ExpressionAttributeValues: {
            ":createdBy": { S: createdBy },
        },
    };
    const data = await dynamoDBClient.send(new QueryCommand(params));
      const simplifiedData = data?.Items?.map((el) =>
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
  async delete_ept(req, res) {
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
