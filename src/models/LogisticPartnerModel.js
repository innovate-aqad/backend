import dynamoose from "dynamoose";
import AWS from "aws-sdk";

AWS.config.update({
  region: process.env.Aws_region,
});

dynamoose.aws.sdk = AWS;

const logisticPartnerRegisterSchema = new dynamoose.Schema(
  {
    id: {
      type: Number,
      required: false,
    },
    email: {
      type: String,
      required:true
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const logisticPartnerRegisterModel = dynamoose.model("logisticPartnerRegister", logisticPartnerRegisterSchema, {
  create: true,
  throughput: "ON_DEMAND",
});

export default logisticPartnerRegisterModel;
