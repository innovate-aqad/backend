import dynamoose from "dynamoose";
import AWS from "aws-sdk";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { DataMapper } from "@aws/dynamodb-data-mapper";
import { v4 as uuidv4 } from "uuid";

// Update AWS configuration
const dynamoDBClient = new DynamoDB({ region: process.env.Aws_region });
dynamoose.aws.sdk = dynamoDBClient;

const schema = new dynamoose.Schema(
  {
    id: {
      type: String,
      required: false,
    },
    category_id: { type: String, required: true },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: false,
      default: true
    },
  },
  {
    timestamps: true,
  }
);

const SubCategoryModel = dynamoose.model("sub_category", schema
);
export default SubCategoryModel;