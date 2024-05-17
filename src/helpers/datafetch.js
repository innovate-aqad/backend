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
      throw new Error("Unrecognized or unsupported DynamoDB data type");
    }; 

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        simpleData[key] = simplifyAttribute(data[key]);
      }
    }
    return simpleData;
  };
