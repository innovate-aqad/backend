import dynamoose from "dynamoose";
import AWS from "aws-sdk";

AWS.config.update({
  region: process.env.Aws_region,
});

dynamoose.aws.sdk = AWS;

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
