import dotenv from "dotenv";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminConfirmSignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";
//import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { parsePhoneNumberFromString } from "libphonenumber-js";

dotenv.config(); // Load environment variables
console.log(process.env.Aws_region,process.env.Aws_accessKeyId, process.env.Aws_secretAccessKey,process.env.COGNITO_CLIENT_ID,process.env.COGNITO_USER_POOL_ID,"aws data----->")
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

// const sns = new AWS.SNS({
//   region: process.env.Aws_region,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

const poolData = {
  ClientId: process.env.COGNITO_CLIENT_ID, 
  UserPoolId: process.env.COGNITO_USER_POOL_ID,
};
const cognito = new AWS.CognitoIdentityServiceProvider();

export const signup = async (
   email ,password,
  callback
) => {
  const params = {
    ClientId: poolData.ClientId,
    Username: email, // Use email as the username
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
    ],
  };

  console.log("Signup params:", params);

  try {
    const data = await cognitoClient.send(new SignUpCommand(params));
    const response = {
      user_id: data.UserSub,
      email: params.Username,
      user_confirmed: data.UserConfirmed,
    };
    callback(null, response);
  } catch (error) {
    callback(error);
  }
};

// export const signup = async (email , callback) => {
//   const params = {
//     UserPoolId: poolData.UserPoolId,
//     Username: "shivaniadimulamwork@gmail.com", // Use email as the username
//     UserAttributes: [
//       { Name: "email", Value: email },
//     ],
//   };

//   console.log("Signup params:", params);

//   try {
//     const data = await cognitoClient.send(new AdminCreateUserCommand(params));
//     const response = {
//       user_id: data.User.Username,
//       email: data.User.Attributes.find(attr => attr.Name === 'email').Value,
//       user_confirmed: data.User.UserStatus === 'CONFIRMED',
//     };
//     callback(null, response);
//   } catch (error) {
//     callback(error);
//   }
// };
//   export const getUser = async (username, callback) => {
//     const params = {
//       UserPoolId:process.env.COGNITO_USER_POOL_ID,
//       Username: username,
//     };

//     try {
//       const data = await cognitoClient.send(new AdminGetUserCommand(params));
//       callback(null, data);
//     } catch (error) {
//       callback(error);
//     }
//   };

export const signin = (body, callback) => {
  const userPool = new CognitoUserPool(poolData);

  const { email, password } = body;

  const authenticationData = {
    Username: email,
    Password: password,
  };

  const authenticationDetails = new AuthenticationDetails(authenticationData);

  const userData = {
    Username: email,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      console.log("section1--->")
      callback(null, {
        success: true,
        result,
      });
    },
    onFailure: (err) => {
      console.log("section2--->",err)
      callback(err);
      return err
    },
    mfaRequired: (codeDeliveryDetails) => {
      callback(null, {
        success: true,
        mfaRequired: true,
        codeDeliveryDetails,
        cognitoUser, // Include cognitoUser to use in the MFA verification
      });
    },
    newPasswordRequired: (userAttributes, requiredAttributes) => {
      callback(null, {
        success: false,
        newPasswordRequired: true,
        userAttributes,
        requiredAttributes,
      });
    },
  });
};

export const confirmUser= async(username,code)=> {

  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID, // Your Cognito App Client ID
    Username: username,
    ConfirmationCode: code,
  };

  try {
   let data= await cognito.confirmSignUp(params).promise();
   return {
     success: true,
     data: data, // Return the actual response data
   };
  } catch (error) {
    return error
  }
}

// export const resendOTP = async (username,data,req,res) => {
//   const params = {
//     UserPoolId: process.env.COGNITO_USER_POOL_ID,
//     Username: username
//   };

//   try {
//     const response = await cognito.adminResendInvitation(params).promise();
//     return res.status(200).json({
//       message: "Otp send to email for verify",
//       data:data,
//       statusCode: 200,
//       success: true,
//     });
//     console.log('OTP resent successfully:', response);
//   } catch (error) {
//     console.error('Error resending OTP:', error);
//   }
// };


export const resendOTP = async (username, data, req, res) => {
  const params = {
    ClientId: poolData.ClientId,
    Username: username,
  };

  try {
    const response = await cognitoClient.send(new ResendConfirmationCodeCommand(params));
    return 1
    // return res.status(200).json({
    //   message: "OTP resent successfully",
    //   data: data,
    //   statusCode: 200,
    //   success: true,
    // });
  } catch (error) {
    console.error('Error resending OTP:', error);
    return 0
  }
};

export const getUserStatus = async (username) => {
  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: username
  };

  try {
    console.log("flow---------->2",process.env.COGNITO_USER_POOL_ID)
    console.log(process.env.Aws_region,process.env.Aws_accessKeyId, process.env.Aws_secretAccessKey,process.env.COGNITO_CLIENT_ID,process.env.COGNITO_USER_POOL_ID,"aws data----->")
    //const response = await cognito.adminGetUser(params).promise();
    const command = new AdminGetUserCommand(params);
    console.log(command,"command--->")
    const response = await cognitoClient.send(command);
    console.log('User status:', response);
    return response;
  } catch (error) {
    if (error.name === 'UserNotFoundException') {
      console.error(`User ${username} not found in Cognito.`);
        return 0;
    } else {
      console.error('Error getting user status:', error);
    }
    return null;
  }
};

export const updatePassword= async(username,password)=>{
const params = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID,
  Username: username,
  Password: password,
  Permanent: true
};

const command = new AdminSetUserPasswordCommand(params);

cognitoClient.send(command)
  .then(response => {
    console.log(response,"success--->");
    return 1;
  })
  .catch(error => {
    console.error(error);
    return 0;
  });
}

export const confirmUserByEmail = async (email) => {
  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID, // replace with your user pool ID
    Username: email,
  };

  const command = new AdminConfirmSignUpCommand(params);

  try {
    const response = await cognitoClient.send(command);
    console.log('User confirmed successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Error confirming user:', error);
    return { success: false, error };
  }
};