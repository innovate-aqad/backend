export const simplifyDynamoDBResponse = (data) => {
    const simpleData = {};

    const simplifyAttribute = (value) => {
      if (value.S !== undefined) {
        return value.S;
      } else if (value.N !== undefined) {
        return Number(value.N);
      } else if (value.BOOL !== undefined) {
        return value.BOOL;
      } else if (value.NULL !== undefined) {
        return null;
      } else if (value.L !== undefined) {
        return value.L.map(simplifyAttribute); // Recursively simplify each item in the list
      } else if (value.M !== undefined) {
        return simplifyDynamoDBResponse(value.M); // Recursively simplify map
      }
      // throw new Error("Unrecognized or unsupported DynamoDB data type");
    }; 

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        simpleData[key] = simplifyAttribute(data[key]);
      }
    }
    return simpleData;
  };

// export  const simplifyDynamoDBResponseForArrayOfObject = (data) => {
//     const simpleData = data.map(item => {
//       const simplifiedItem = {};
//       for (const key in item.M) {
//         simplifiedItem[key] = item.M[key].S || item.M[key].N || item.M[key].BOOL || null;
//         if (item.M[key].L) {
//           simplifiedItem[key] = item.M[key].L.map(simplifyDynamoDBResponseForArrayOfObject ); // Handle lists recursively
//         } else if (item.M[key].M) {
//           simplifiedItem[key] = simplifyDynamoDBResponseForArrayOfObject ([item.M[key]]); // Handle maps recursively
//         }
//       }
//       return simplifiedItem;
//     });
//     return simpleData;
//   };


export const simplifyDynamoDBResponse2 = (data) => {
  return data.map(item => {
    const simplifiedItem = {};
    for (const key in item.M) {
      const value = item.M[key];
      if (value.S !== undefined) {
        simplifiedItem[key] = value.S;
      } else if (value.N !== undefined) {
        simplifiedItem[key] = Number(value.N);
      } else if (value.BOOL !== undefined) {
        simplifiedItem[key] = value.BOOL;
      } else if (value.L !== undefined) {
        simplifiedItem[key] = value.L.map(simplifyDynamoDBResponse2); // Handle lists recursively
      } else if (value.M !== undefined) {
        simplifiedItem[key] = simplifyDynamoDBResponse2([value]); // Handle maps recursively
      } else if (value.B !== undefined) {
        simplifiedItem[key] = value.B; // Handle binary data
      } else if (value.NULL !== undefined) {
        simplifiedItem[key] = null; // Handle null values
      } else if (value.SS !== undefined) {
        simplifiedItem[key] = value.SS; // Handle string sets
      } else if (value.NS !== undefined) {
        simplifiedItem[key] = value.NS.map(Number); // Handle number sets
      } else if (value.BS !== undefined) {
        simplifiedItem[key] = value.BS; // Handle binary sets
      }
    }
    return simplifiedItem;
  });
};




  /**
   














  import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import Joi from 'joi';
import { addProductVariantSchema } from './your-schema-file'; // replace with the actual path

const dynamoDBClient = new DynamoDBClient({ region: 'your-region' }); // replace 'your-region' with actual AWS region

const simplifyDynamoDBResponse = (data) => {
  const simpleData = {};

  const simplifyAttribute = (value) => {
    if (value.S !== undefined) {
      return value.S;
    } else if (value.N !== undefined) {
      return Number(value.N);
    } else if (value.BOOL !== undefined) {
      return value.BOOL;
    } else if (value.NULL !== undefined) {
      return null;
    } else if (value.L !== undefined) {
      return value.L.map(simplifyAttribute); // Recursively simplify each item in the list
    } else if (value.M !== undefined) {
      return simplifyDynamoDBResponse(value.M); // Recursively simplify map
    }
    throw new Error("Unrecognized or unsupported DynamoDB data type");
  };

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      simpleData[key] = simplifyAttribute(data[key]);
    }
  }
  return simpleData;
};

export const addProductVariant = async (req, res) => {
  // Validate input
  const { error, value } = addProductVariantSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message, statuscode: 400, success: false });
  }

  const { product_id, title, price, compare_price_at, quantity, sku, variation, warehouse_arr, minimum_order_quantity, status } = value;

  // Fetch the existing item to get the current variation_arr
  const getProductParams = {
    TableName: 'product',
    Key: {
      id: { S: product_id },
    },
  };

  const productData = await dynamoDBClient.send(new GetItemCommand(getProductParams));
  let dbVariant = productData.Item?.variation_arr?.L || [];
  dbVariant = dbVariant.map(item => simplifyDynamoDBResponse(item.M));

  // Check for uniqueness of title or SKU within the variants
  const checkUnique = dbVariant.some(variant => variant.title === title || variant.sku === sku);
  if (checkUnique) {
    return res.status(400).json({ message: "Product variant's title or sku must be unique", statuscode: 400, success: false });
  }

  // Generate new ID for the variant
  let id = uuidv4().replace(/-/g, '');

  // Create the new variant object
  const newVariant = {
    id: { S: id },
    title: { S: title || "" },
    price: { S: price.toString() },
    compare_price_at: { S: compare_price_at.toString() },
    quantity: { S: quantity.toString() },
    sku: { S: sku },
    variation: { S: variation || "" },
    warehouse_arr: {
      L: warehouse_arr.map(el => ({
        M: {
          address: { S: el.address || "" },
          po_box: { S: el.po_box || "" },
        },
      })),
    },
    created_by: { S: req.userData.id || "" },
    minimum_order_quantity: { S: minimum_order_quantity?.toString() || "" },
    status: { S: status || "active" },
    created_at: { S: new Date().toISOString() },
    updated_at: { S: new Date().toISOString() },
  };

  // Add the new variant to the existing array
  dbVariant.push(newVariant);

  // Update the product with the new variant array
  const updateParams = {
    TableName: 'product',
    Key: {
      id: { S: product_id },
    },
    UpdateExpression: 'SET variation_arr = :variation_arr',
    ExpressionAttributeValues: {
      ':variation_arr': { L: dbVariant.map(variant => ({ M: variant })) },
    },
    ReturnValues: 'UPDATED_NEW',
  };

  const updateResult = await dynamoDBClient.send(new UpdateItemCommand(updateParams));

  return res.status(200).json({
    success: true,
    message: 'Variant added successfully',
    data: updateResult.Attributes,
  });
};

   */