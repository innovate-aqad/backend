// import dynamoose from "dynamoose";
// // import AWS from "aws-sdk";
// import { DynamoDB } from "@aws-sdk/client-dynamodb";
// import { marshall } from "@aws-sdk/util-dynamodb";
// import { DataMapper } from "@aws/dynamodb-data-mapper";
// import { v4 as uuidv4 } from "uuid";

// // Update AWS configuration
// const dynamoDBClient = new DynamoDB({ region: process.env.Aws_region });
// dynamoose.aws.sdk = dynamoDBClient;

// const schema = new dynamoose.Schema(
//   {
//     id: {
//       type: String,
//       required: false,
//     },
//     title: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: string,
//       required: false,
//       default: 'active'
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const mapper = new DataMapper({
//   client: dynamoDBClient, // Use the AWS SDK v3 client
// });

// const CategoryModel = dynamoose.model("category", schema
// );

// export default CategoryModel ;

import { DataTypes } from "sequelize";
import dbConnection from "../config/dbConfig.js";

const CategoryModel = dbConnection.define(
  "category",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      // autoIncrement: false,
      primaryKey: true
    },
    image: {
      type: DataTypes.STRING
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active"
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  { timestamps: false, tableName: "category" }
);

export default CategoryModel;
