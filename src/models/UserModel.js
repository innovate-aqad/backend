import dynamoose from 'dynamoose';
import AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.Aws_region,
});

dynamoose.aws.sdk = AWS;

const schema = new dynamoose.Schema(
  { 
    
    id: {
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

const UserModel = dynamoose.model("users", schema, {
  create: true,
  throughput: "ON_DEMAND",
});

export default UserModel;
