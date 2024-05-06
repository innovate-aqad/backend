import { DataTypes } from "sequelize";
import docClient from "../config/dbConfig.js";
const AdminUserModel = {
  TableName: "admin_users",
  KeySchema: [
    { AttributeName: "email", KeyType: "HASH" },  // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: "email", AttributeType: "S" },  // S for string
    { AttributeName: "name", AttributeType: "S" },
    { AttributeName: "role_id", AttributeType: "N" },  // N for number
    { AttributeName: "email_verified_at", AttributeType: "S" },
    { AttributeName: "password", AttributeType: "S" },
    { AttributeName: "photo", AttributeType: "S" },
    { AttributeName: "country", AttributeType: "S" },
    { AttributeName: "status", AttributeType: "S" },
    { AttributeName: "role", AttributeType: "S" },
    { AttributeName: "remember_token", AttributeType: "S" },
    { AttributeName: "created_at", AttributeType: "S" },
    { AttributeName: "updated_at", AttributeType: "S" },
    { AttributeName: "deleted_at", AttributeType: "S" },
    { AttributeName: "is_verified", AttributeType: "BOOL" },  // BOOL for boolean
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: "RoleIdIndex",
      KeySchema: [
        { AttributeName: "role_id", KeyType: "HASH" },  // Partition key
      ],
      Projection: {
        ProjectionType: "ALL",
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
    // Add other indexes as needed
  ],
};


export default AdminUserModel;
