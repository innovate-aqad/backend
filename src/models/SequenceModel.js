import dynamoose from 'dynamoose';

import { DynamoDB } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDB({ region: process.env.Aws_region });
dynamoose.aws.sdk = dynamoDBClient;


const sequenceSchema = new dynamoose.Schema({
  sequenceName: {
    type: String,
    hashKey: true,
  },
  value: {
    type: Number,
    default: 0,
  },
});

const Sequence = dynamoose.model('Sequence', sequenceSchema);

export default Sequence;
