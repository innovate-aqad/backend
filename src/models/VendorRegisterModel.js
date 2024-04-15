import dynamoose from "dynamoose";
import AWS from "aws-sdk";
import phone from "phone";

AWS.config.update({
  region: process.env.Aws_region,
});

dynamoose.aws.sdk = AWS;

// role : "AQAD VENDOR"
// Name: "",
// Email
// email_otp
// phone_no.
// phone_OTP
// company_name
// register_company_name
// company_phone_no

const vendorRegisterSchema = new dynamoose.Schema(
  {
    id: {
      type: Number,
      required: false,
    },
    role: {
      type: String,
      default: "AQAD VENDOR",
      required:true
    },
    name: {
      type: String,
      required:true
    },
    email: {
      type: String,
      required:true
    },
    email_otp: {
      type: Number,
      required:true
    },
    phone: {
      type: String,
      required:true
    },
    phone_otp: {
      type: Number,
      required:true
    },
    company_name: {
      type: String,
      required: true,
    },
    register_company_name: {
      type: String,
      required: true,
    },
    company_phone_no: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const vendorRegisterModel = dynamoose.model("vendorRegister", vendorRegisterSchema, {
  create: true,
  throughput: "ON_DEMAND",
});

export default vendorRegisterModel;
