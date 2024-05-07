import dynamoose from "dynamoose";
import AWS from "aws-sdk";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { DataMapper } from "@aws/dynamodb-data-mapper";
import { v4 as uuidv4 } from "uuid";

// Update AWS configuration
const dynamoDBClient = new DynamoDB({ region: process.env.Aws_region });
dynamoose.aws.sdk = dynamoDBClient;


// AWS.config.update({
//   region: process.env.Aws_region,
// });

// dynamoose.aws.sdk = AWS;

const schema = new dynamoose.Schema(
  {
    id: {
      type: String,
      required: false,
    },

    user_type: {
      type: String,
      required: true,
      enum: ["vendor", "logistic", "seller", "employee", "admin"],
    },
    profile_photo: {
      type: String,
      required: false,
    },
    // _id: {
    //   type: String,
    //   hashKey: true,
    // },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: true,
    },
    dob: { type: String, required: false },

    //slide 2
    company_name: { type: String },
    company_address: { type: String },
    designation: { type: String },
    emirates_id: { type: String },
    residence_visa: { type: String },
    passport: { type: String },
    
    //slide 3
    trade_license: { type: String },
    cheque_scan: { type: String },
    vat_certificate: { type: String },
    country: {
      type: String,
      required: true,
    },
    country_code: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },

    role: {
      type: String,
      required: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    is_social_login: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const mapper = new DataMapper({
  client: dynamoDBClient, // Use the AWS SDK v3 client
});


const UserModel = dynamoose.model("users", schema
  // , {
  //   create: true,
  //   throughput: "ON_DEMAND",
  // }
);

export default UserModel;
