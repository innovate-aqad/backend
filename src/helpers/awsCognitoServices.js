import AmazonCognitoIdentity from "amazon-cognito-identity-js";
import AWS from "aws-sdk";

// Configure AWS SDK
AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.Aws_accessKeyId,
  secretAccessKey: process.env.Aws_secretAccessKey,
});

// // Create a new CognitoIdentityServiceProvider object
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

export function registerUserConginito(username, password) {
  var poolData = {
    UserPoolId: "me-central-1_fAyC1sK9I",
    ClientId: "1hvv0kepvqqapp62ac06t46ffu",
  };

  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  console.log(userPool, "userrrrrrrr");
  var attributeList = [];

  var dataEmail = {
    Name: "email",
    Value: "avinash2@gmail.com",
  };
  var dataPhone = {
    Name: "phone_number",
    Value: "+917355049718",
  };
  // var dataGender = {
  //   Name: "gender",
  //   Value: 'm',
  // };

  var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
    dataEmail
  );

  //   console.log(attributeEmail,"aaaaaaaaaaaaaaaaaaa");
  attributeList.push(attributeEmail);
  attributeList.push(dataPhone);
  // attributeList.push(dataGender);
  userPool.signUp(
    "avinash2",
    "Avinash@1234",
    attributeList,
    null,
    function (err, result) {
      if (err) {
        console.error(err, "error");
        return;
      }
      console.log("User registered successfully:", result.user);
    }
  );
}

// Function to authenticate a user
// function authenticateUser(username, password) {
//   const params = {
//     AuthFlow: "USER_PASSWORD_AUTH",
//     ClientId: "your-client-id", // Your client id from AWS Cognito
//     AuthParameters: {
//       USERNAME: username,
//       PASSWORD: password,
//     },
//   };

//   cognitoIdentityServiceProvider.initiateAuth(params, function (err, data) {
//     if (err) {
//       console.error("Error authenticating user:", err);
//     } else {
//       console.log("User authenticated successfully:", data);
//     }
//   });
// }
// authenticateUser("example@example.com", "password123");

export const vendorSendEmail = async (email) => {
  //   var poolData = {
  //     UserPoolId: "me-central-1_fAyC1sK9I",
  //     ClientId: "1hvv0kepvqqapp62ac06t46ffu",
  //   };

  //   var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  //   var attributeList = [];

  //   var dataEmail = {
  //     Name: "email",
  //     Value: 'avinash2@gmail.com',
  //   };
  //   var dataPhone = {
  //     Name: "phone_number",
  //     Value: "+917355049718",
  //   };

  //   var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
  //     dataEmail
  //   );

  // //   console.log(attributeEmail,"aaaaaaaaaaaaaaaaaaa");
  //   attributeList.push(attributeEmail);
  //   attributeList.push(dataPhone);
  //   // attributeList.push(dataGender);
  //   userPool.signUp(
  //     "avinash2",
  //     "Avinash@1234",
  //     attributeList,
  //     null,
  //     function (err, result) {
  //       if (err) {
  //         console.error(err,"error");
  //         return;
  //       }
  //       console.log("User registered successfully:", result.user);
  //     }
  //   );

  const params = {
    ClientId: "me-central-1_fAyC1sK9I",
    Username: email,
  };
  try {
    const response = await cognitoIdentityServiceProvider
      .forgotPassword(params)
      .promise();
    console.log("OTP email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};
