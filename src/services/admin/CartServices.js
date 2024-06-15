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
      let dbWareHousequantity = findVariantData?.warehouse_arr?.reduce(
        (axx, el) => axx + parseInt(el?.quantity),
        0
      );
      // console.log(dbWareHousequantity,"dbWareHousequantity");
      if (dbWareHousequantity < quantity) {
        return res.status(400).json({
          message: `Stock available ${dbWareHousequantity} only`,
          statusCode: 400,
          success: false,
        });
      }
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
      // console.log(findCartItem, "findCa rtI tem rt Item `_+ ++_)");
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
      // console.log(findCartItem, "findCart)");
      let mainCartArr = [];
      if (findCartItem && findCartItem?.Items?.length > 0) {
        let productArr = [];
        findCartItem.Items.forEach((item) => productArr.push(item.product_id.S));
        productArr = new Set(productArr);
        productArr = [...productArr];
        for (let el of findCartItem?.Items) {
          mainCartArr.push(simplifyDynamoDBResponse(el));
        }
        // console.log(
        //   "keys lete",
        //   "keys -delete",
        //   productArr,
        //   "aaaaaaa",
        //   mainCartArr
        // );
        // console.log(productArr, "products ");
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
        let mainCat = [];
        let subCat = [];
        for (let el of getProductDetails?.Responses?.products) {
          mainCat.push({ id: { S: el?.category_id?.S } });
          subCat.push({ id: { S: el?.sub_category_id?.S } });
          data.push(simplifyDynamoDBResponse(el));
        }
        // console.log(mainCat, "m ttttttttt", keys, "asdf", subCat);
        const requestItems = {};
        if (mainCat.length > 0) {
          requestItems['category'] = {
            Keys: mainCat,
          };
        }
        if (subCat.length > 0) {
          requestItems['sub_category'] = {
            Keys: subCat,
          };
        }
        const fetchMainCatData = await dynamoDBClient.send(
          new BatchGetItemCommand({
            RequestItems: requestItems,
          })
        );
        // console.log(fetchMainCatData?.Responses?.sub_category, "fetchMainCatData", fetchMainCatData?.Responses?.category);
        let mainCategoryArr = []
        let subCategoryArr = []
        for (let le of fetchMainCatData?.Responses?.sub_category) {
          let get = simplifyDynamoDBResponse(le)
          subCategoryArr.push(get)
        }
        for (let le of fetchMainCatData?.Responses?.category) {
          let get = simplifyDynamoDBResponse(le)
          mainCategoryArr.push(get)
        }

        for (let el of mainCartArr) {
          let findProductObj = data?.find((elem) => elem?.id == el?.product_id);
          let findVariationObj = {};
          if (findProductObj) {
            findVariationObj = findProductObj?.variation_arr?.find(
              (elem) => elem?.id == el?.variant_id
            );
          }
          if (findProductObj) {
            el.productObj = findProductObj;
          }
          if (findVariationObj) {
            el.variantObj = findVariationObj;
          }
        }
        for (let el of mainCartArr) {
          let categoryObj = mainCategoryArr?.find((elem) => elem?.id == el?.productObj?.category_id)
          if (categoryObj) {
            el.productObj.categoryObj = categoryObj
          }
          let subCategoryObj = subCategoryArr?.find((elem) => elem?.id == el?.productObj?.sub_category_id)
          if (subCategoryObj) {
            el.productObj.subCategoryObj = subCategoryObj
          }
          if (el?.productObj?.variation_arr?.length) {
            delete el.productObj.variation_arr
          }
        }
        return res.status(200).json({
          message: "Fetch data",
          statuscode: 200,
          success: true,
          data: mainCartArr,
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
