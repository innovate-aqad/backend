
// // const Sequelize = require("sequelize");
// const { Sequelize } = require("sequelize");
// const dotenv = require("dotenv");
// dotenv.config();
import { Sequelize } from "sequelize";
import { environmentVars } from "./environmentVar.js";
// console.log(environmentVars)
const dbConnection = new Sequelize(
  environmentVars.dbName,
  environmentVars.dbUser,
  environmentVars.dbPass,
  {
    host: environmentVars.host,
    port: environmentVars.dbPort,
    dialect: "mysql",
    dialectOptions: {
      socketPath: environmentVars.socketPath,
    },
    pool: {
      max: 15,
      min: 0,
      maxIdleTime: 1000,
      acquire: 30000000,
      idle: 100000000,
    },
    logging: false,
  }
);

export default dbConnection;














// // AWS.config.update({
// //   region: process.env.Aws_region, // Replace with your region
// //   accessKeyId: process.env.Aws_accessKeyId, // Replace with your AWS Access Key ID
// //   secretAccessKey: process.env.Aws_secretAccessKey, // Replace with your AWS Secret Access Key
// // });
// // export const dynamodb = new AWS.DynamoDB();  //instance
// // const docClient = new AWS.DynamoDB.DocumentClient();

// // // console.log(dynamodb,"AWSAWSAWS")



// // // let MongoDB=""
// // // module.exports = docClient;
// // export default docClient
// // // module.exports = {docClient,MongoDB};

// import { DynamoDB } from '@aws-sdk/client-dynamodb';
// import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// const dynamoDBClient = new DynamoDB({ 
//   region: process.env.Aws_region,
//   credentials: {
//     accessKeyId: process.env.Aws_accessKeyId,
//     secretAccessKey: process.env.Aws_secretAccessKey
//   }
// });

// const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

// export default docClient;
