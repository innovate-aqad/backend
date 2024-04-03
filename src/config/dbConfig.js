import AWS from 'aws-sdk';
AWS.config.update({
  region: process.env.Aws_region, // Replace with your region
  accessKeyId: process.env.Aws_region, // Replace with your AWS Access Key ID
  secretAccessKey: process.env.Aws_region, // Replace with your AWS Secret Access Key
});
const dynamodb = new AWS.DynamoDB();  //instance
const docClient = new AWS.DynamoDB.DocumentClient();

// console.log(dynamodb,"AWSAWSAWS")



// let MongoDB=""
// module.exports = docClient;
export default docClient
// module.exports = {docClient,MongoDB};