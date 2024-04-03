import { DataTypes } from "sequelize";
import docClient from "../config/dbConfig.js";

const RolesModel = {
  TableName: "roles",
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" },  // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "N" },  // N for number
    { AttributeName: "name", AttributeType: "S" },
    { AttributeName: "permissions", AttributeType: "M" },  // M for map (JSON)
    { AttributeName: "status", AttributeType: "S" },
    { AttributeName: "created_at", AttributeType: "S" },
    { AttributeName: "updated_at", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

export default RolesModel;
