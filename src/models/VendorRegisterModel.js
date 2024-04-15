import dynamoose from "dynamoose";
import AWS from "aws-sdk";
import phone from "phone";

AWS.config.update({
  region: process.env.Aws_region,
});

dynamoose.aws.sdk = AWS;

const vendorRegisterSchema = new dynamoose.Schema(
  {
    id: {
      type: Number,
      required: false,
    },
    role: {
      type: String,
      default: "AQAD VENDOR",
      required: true,
    },
    name: {
      type: String,
      required: true,
      validate: function(value) {
        if (!value) {
          throw new Error('name is required');
        }
      }
    },
    email: {
      type: String,
      required: true,
      validate: function(value) {
        if (!value) {
          throw new Error('email is required');
        }
      }
    },
    email_otp: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      validate: function(value) {
        if (!value) {
          throw new Error('phone is required');
        }
      }
    },
    phone_otp: {
      type: Number,
      required: true,
    },
    company_name: {
      type: String,
      required: true,
      validate: function(value) {
        if (!value) {
          throw new Error('company is required');
        }
      }
    },
    register_company_name: {
      type: String,
      required: true,
      validate: function(value) {
        if (!value) {
          throw new Error('register company name is required');
        }
      }
    },
    company_phone_no: {
      type: String,
      required: true,
      validate: function(value) {
        if (!value) {
          throw new Error('company phone number is required');
        }
      }
    },
    check_email: {
      type: Boolean,
      default: false,
    },
    check_phone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const vendorRegisterModel = dynamoose.model(
  "vendorRegister",
  vendorRegisterSchema,
  {
    create: true,
    throughput: "ON_DEMAND",
  }
);

export default vendorRegisterModel;
