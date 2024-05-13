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
    otp: {
      type: Number,
      required: true,
    },
    creationTime:{type:String,required:true},
    status: {
      type: string,
      required: false,
      default: 'active'
    },
  },
  {
    timestamps: true,
  }
);

const mapper = new DataMapper({
  client: dynamoDBClient, // Use the AWS SDK v3 client
});

const UserOtpModel = dynamoose.model("userOtp", schema
);

export default UserOtpModel;