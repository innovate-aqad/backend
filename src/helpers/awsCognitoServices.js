// const AWS = require("aws-sdk");
import AWS from "aws-sdk";

// Configure AWS SDK
AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.Aws_accessKeyId,
  secretAccessKey: process.env.Aws_secretAccessKey,
});

// // Create a new CognitoIdentityServiceProvider object
// const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

// // Function to register a new user
// export function registerUserConginito(username, password){
//   const params = {
//     ClientId: "44r5rj6be272c8m2dtgp2vovrm", // Your client id from AWS Cognito
//     Username: username,
//     Password: password,
//     UserAttributes: [
//       {
//         Name: "email",
//         Value: username,
//       },
//     ],
//   };

//   cognitoIdentityServiceProvider.signUp(params, function (err, data) {
//     if (err) {
//       console.error("Error registering user:", err);
//     } else {
//       console.log("User registered successfully:", data);
//     }
//   });
// }

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

// Example usage
// registerUser("example@example.com", "password123");
// authenticateUser("example@example.com", "password123");

// module.exports={registerUserConginito}

// var authenticationData = {
//     Username : 'username',
//     Password : 'password',
// };
// var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
// var poolData = { UserPoolId : 'me-central-1_U50BTVeUS',
//     ClientId : '1example23456789'
// };
// var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
// var userData = {
//     Username : 'username',
//     Pool : userPool
// };
// var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
// cognitoUser.authenticateUser(authenticationDetails, {
//     onSuccess: function (result) {
//         var accessToken = result.getAccessToken().getJwtToken();

//         /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
//         var idToken = result.idToken.jwtToken;
//     },

//     onFailure: function(err) {
//         alert(err);
//     },

// });

import AmazonCognitoIdentity from "amazon-cognito-identity-js";

// var poolData = {
//   UserPoolId: "me-central-1_U50BTVeUS",
//   ClientId: "44r5rj6be272c8m2dtgp2vovrm",
// };

// export function registerUserConginito(username, password) {
//   var authenticationData = {
//     Username: username,
//     Password: password,
//   };

//   var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
//     authenticationData
//   );

//   var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
//   var userData = {
//     Username: username,
//     Pool: userPool,
//   };
//   var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
//   cognitoUser.authenticateUser(authenticationDetails, {
//     onSuccess: function (result) {
//       var accessToken = result.getAccessToken().getJwtToken();

//       /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
//       var idToken = result.idToken.jwtToken;

//       console.log(accessToken, "access Tken");
//     },

//     onFailure: function (err) {
//       console.log(err, "kkkkkk");
//     },
//   });
// }

export function registerUserConginito(username, password) {
  // Define pool data

  console.log(username,password,"kkkkkkkkkkkk");
  var poolData = {
    UserPoolId: "me-central-1_fAyC1sK9I",
    ClientId: "1hvv0kepvqqapp62ac06t46ffu",
  };

  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  console.log(userPool,"userrrrrrrr");
  // Define user attributes
  var attributeList = [];

  var dataEmail = {
    Name: "email",
    Value: 'avinash2@gmail.com',
  };
  var dataPhone = {
    Name: "phone_number",
    Value: "+917355049718",
  };
  var dataGender = {
    Name: "gender",
    Value: 'm',
  };

  var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
    dataEmail
  );

//   console.log(attributeEmail,"aaaaaaaaaaaaaaaaaaa");
  attributeList.push(attributeEmail);
  attributeList.push(dataPhone);
  attributeList.push(dataGender);


  console.log(attributeList,"List");
// return
//   console.log(attributeEmail,"aaaaaaaaaaaaaaaaaaa");
  // Register the user
  userPool.signUp(
    "avinash2",
    "Avinash@1234",
    attributeList,
    null,
    function (err, result) {
      if (err) {
        console.error(err,"error");
        return;
      }
      console.log("User registered successfully:", result.user);
    }
  );
}
