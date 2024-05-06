import { DataTypes } from "sequelize";
import docClient from "../config/dbConfig.js";
const PermissionModuleModel = {
  TableName: "permission_modules",
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" },  // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "N" },  // N for number
    { AttributeName: "name", AttributeType: "S" },
    { AttributeName: "status", AttributeType: "S" },
    { AttributeName: "backend_routes", AttributeType: "M" },  // M for map (JSON)
    { AttributeName: "frontend_routes", AttributeType: "M" },  // M for map (JSON)
    { AttributeName: "created_at", AttributeType: "S" },
    { AttributeName: "updated_at", AttributeType: "S" },
    { AttributeName: "deleted_at", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

export default PermissionModuleModel;
