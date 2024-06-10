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

class cartServices {
  async AddToCart(req, res) {
    try {
      const { product_id, variant_id, quantity } = req?.body;
      let user_id = req.userData.id;
      // console.log(
      //   req.userData.id,
      //   "req.user_data_asdf_!@@#",
      //   product_id,
      //   variant_id
      // );
      let findCartItem = await dynamoDBClient.send(
        new ScanCommand({
          TableName: "cart",
          FilterExpression:
            "user_id = :user_id AND product_id = :product_id AND variant_id= :variant_id",
          ExpressionAttributeValues: {
            ":user_id": { S: user_id },
            ":product_id": { S: product_id },
            ":variant_id": { S: variant_id },
          },
        })
      );
      console.log(findCartItem, "findCa rtI temf indCart Item `_+ ++_)");
      if (findCartItem && findCartItem?.Items?.length > 0) {
        const cartItemsId = findCartItem?.Items[0]?.id?.S;
        await dynamoDBClient.send(
          new UpdateItemCommand({
            TableName: "cart",
            Key: {
              id: { S: cartItemsId },
            },
            UpdateExpression: "SET quantity = :quantity",
            ExpressionAttributeValues: {
              ":quantity": { S: quantity?.toString() },
            },
          })
        );
        return res.status(200).json({
          message: "Quantity updated successfully",
          statuscode: 200,
          success: true,
        });
      } else {
        let findProductData = await dynamoDBClient.send(
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
            message: "Product not found",
            statusCode: 400,
            success: false,
          });
        }
        let datasimplify = simplifyDynamoDBResponse(findProductData.Items[0]);
        // console.log(datasimplify, "datasimplifydatasimplify");
        let findVariantData = datasimplify?.variation_arr?.find(
          (el) => el?.id == variant_id
        );
        // console.log(findVariantData, "findVaratafindV");
        if (!findVariantData) {
          return res.status(400).json({
            message: "Product's variant not found",
            statusCode: 400,
            success: false,
          });
        }
        let id = uuidv4();
        id = id?.replace(/-/g, "");
        const params = {
          TableName: "cart",
          Item: {
            id: { S: id },
            product_id: { S: product_id },
            variant_id: { S: variant_id },
            quantity: { S: quantity?.toString() || "1" },
            user_id: { S: req.userData?.id || "" },
            created_at: { S: new Date().toISOString() },
            updated_at: { S: new Date().toISOString() },
          },
        };
        // console.log(params,"pa  n  nn");
        await dynamoDBClient.send(new PutItemCommand(params));
        return res.status(200).json({
          message: "Product added to Cart",
          statusCode: 200,
          success: true,
        });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async deleteFromCart(req, res) {
    try {
      const { product_id, variant_id } = req?.body;
      let user_id = req.userData.id;
      // console.log(
      //   req.userData.id,
      //   "req.user_data_asdf_!@@#",
      //   product_id,
      //   variant_id
      // );
      let findCartItem = await dynamoDBClient.send(
        new ScanCommand({
          TableName: "cart",
          FilterExpression:
            "user_id = :user_id AND product_id = :product_id AND variant_id= :variant_id",
          ExpressionAttributeValues: {
            ":user_id": { S: user_id },
            ":product_id": { S: product_id },
            ":variant_id": { S: variant_id },
          },
        })
      );
      console.log(findCartItem, "findCa rtI temf indCart Item `_+ ++_)");
      if (findCartItem && findCartItem?.Items?.length > 0) {
        const cartItemsId = findCartItem?.Items[0]?.id?.S;

        await dynamoDBClient.send(
          new DeleteItemCommand({
            TableName: "cart",
            Key: {
              id: { S: cartItemsId },
            },
          })
        );
        return res.status(200).json({
          message: "Product deleted from cart",
          statuscode: 200,
          success: true,
        });
      } else {
        return res.status(400).json({
          message: "Product already deleted from cart",
          statusCode: 400,
          success: false,
        });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async emptyCartData(req, res) {
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
        console.log(keysToDelete, "keys -to----delete");
        await dynamoDBClient.send(
          new BatchWriteItemCommand({
            RequestItems: {
              cart: keysToDelete.map((key) => ({
                DeleteRequest: { Key: key },
              })),
            },
          })
        );
        return res.status(200).json({
          message: "Cart empty successfully",
          statuscode: 200,
          success: true,
        });
      } else {
        return res.status(400).json({
          message: "No items found in cart",
          statusCode: 400,
          success: false,
        });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async fetch_data_(req, res) {
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
      let mainCartArr = [];
      if (findCartItem && findCartItem?.Items?.length > 0) {
        let productArr = [];
        findCartItem.Items.map((item) => productArr.push(item.product_id.S));
        productArr = new Set(productArr);
        productArr = [...productArr];
        for (let el of findCartItem?.Items) {
          mainCartArr.push(simplifyDynamoDBResponse(el));
        }
        //  console.log("keysToDelete", "keys -to----delete",productArr,"aaaaaaa");
        console.log(productArr, "prudtcarrrrrrr");
        const keys = productArr.map((productId) => ({
          id: { S: productId }, // Assuming the primary key attribute name is 'id' and type is string
        }));
        const getProductDetails = await dynamoDBClient.send(
          new BatchGetItemCommand({
            RequestItems: {
              products: {
                Keys: keys,
              },
            },
          })
        );
        let data = [];
        for (let el of getProductDetails?.Responses?.products) {
          data.push(simplifyDynamoDBResponse(el));
        }
        for(let el of mainCartArr){
          let findProductObj=data?.find((elem)=>elem?.id==product_id)
          let findVariationObj=findProductObj?.variation_arr?.find((elem)=>elem?.id==el?.variation_id)
          if(findProductObj){
            delete findProductObj?.variation_arr
            el.productObj=findProductObj
          }

        }

        return res.status(200).json({
          message: "Cart empty successfully",
          statuscode: 200,
          success: true,mainCartArr,
          data,
        });
      } else {
        return res.status(400).json({
          message: "No items found in cart",
          statusCode: 400,
          success: false,
        });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
}

const CartServicesObj = new cartServices();
export default CartServicesObj;
