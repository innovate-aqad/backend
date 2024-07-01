

import dynamoose from "dynamoose";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

// Configure AWS SDK v3
const dynamoDBClient = new DynamoDB({ 
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey
  }
});

// Set the AWS SDK v3 instance for dynamoose
dynamoose.aws.sdk = dynamoDBClient;

const documentSchema = new dynamoose.Schema(
  {
    id: {
      type: Number,
      required: false,
    },
    choose_documents: {
      type: String,
    },
    typeOfUser: {
      type: String,
    //   required: false,
    },
    typeOfDocument: {
      type: String,
    //   required: true,
    },
    nameOfDocument: {
      type: String,
    //   required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UploadsDocumentModel = dynamoose.model("documents", documentSchema, {
  create: true,
  throughput: "ON_DEMAND",
});

export default UploadsDocumentModel;
