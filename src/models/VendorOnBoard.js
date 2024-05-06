import dynamoose from "dynamoose";
import AWS from "aws-sdk";

AWS.config.update({
  region: process.env.Aws_region,
});

dynamoose.aws.sdk = AWS;

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
