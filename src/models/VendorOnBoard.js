// import dynamoose from "dynamoose";
// import AWS from "aws-sdk";

// AWS.config.update({
//   region: process.env.Aws_region,
// });

// dynamoose.aws.sdk = AWS;





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

// companyName
// contactPerson
// roleOfPerson:sole owner,admin
// emailAddress:
// contactNumber:
// BusinessAddress:
const vendorSchema = new dynamoose.Schema(
  {
    id: {
      type: Number,
      required: false,
    },
    companyName: {
      type: String,
      required:false,
    },
    contactPerson: {
      type: String,
      required: false,
    },
    roleOfPerson: {
      type: String,
      required: false,
    },
    emailAddress: {
      type: String,
      required: false,
    },
    BusinessAddress:{
        type:String,
        required:false
    }
  },
  {
    timestamps: true,
  }
);

const vendorOnBoardModel = dynamoose.model("vendorOnBoard", vendorSchema, {
  create: true,
  throughput: "ON_DEMAND",
});

export default vendorOnBoardModel;
