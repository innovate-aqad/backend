import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  AdminGetUserCommand,
  AdminSetUserMFAPreferenceCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
} from "amazon-cognito-identity-js";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { parsePhoneNumberFromString } from "libphonenumber-js";
dotenv.config(); // Load environment variables

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

const sns = new AWS.SNS({
  region: process.env.Aws_region,
  accessKeyId: process.env.Aws_accessKeyId,
  secretAccessKey: process.env.Aws_secretAccessKey,
});

const poolData = {
  ClientId: process.env.Client_Id,
  UserPoolId: process.env.UserPool_Id,
  ClientIdEmail: process.env.Client_Id_Email,
  UserPoolIdEmail: process.env.UserPool_Id_Email,
};

export const signup = async (
  { email, name, dob, phone, password },
  callback
) => {
  // Parse and validate the phone number
  const phoneNumber = parsePhoneNumberFromString(phone);

  // Check if the phone number is valid
  if (!phoneNumber || !phoneNumber.isValid()) {
    console.log("Invalid phone number after parsing:", phone);
    callback({
      success: false,
      message:
        "Invalid phone number format. It should be in the format +918187804208",
      statusCode: 400,
    });
    return;
  }

  // Get the country code and country name
  const countryCode = phoneNumber.country;
  const countryCallingCode = phoneNumber.countryCallingCode;

  console.log("Country Code:", countryCode);
  console.log("Country Calling Code:", `+${countryCallingCode}`);

  const formattedPhoneNumber = phoneNumber.number; // Get the E.164 formatted phone number
  console.log("Formatted phone number:", formattedPhoneNumber);
  // phone
  const params = {
    ClientId: poolData.ClientId,
    Username: email, // Use email as the username
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
      { Name: "birthdate", Value: dob },
      { Name: "phone_number", Value: formattedPhoneNumber },
    ],
  };

  console.log("Signup params:", params);
  try {
    const data = await cognitoClient.send(new SignUpCommand(params));
    console.log("Signup successful:", data);
    // Set MFA preference to ensure OTP is sent to the mobile number
    const setMFAPreferenceParams = {
      UserPoolId: poolData.UserPoolId,
      Username: email,
      SMSMfaSettings: {
        Enabled: true,
        PreferredMfa: true,
      },
    };
    const snsParams = {
      Message: `Your verification code is ${data.CodeDeliveryDetails.Destination}`, // Customize this message
      PhoneNumber: formattedPhoneNumber,
    };

    await sns.publish(snsParams).promise();
    console.log("OTP sent successfully to:", formattedPhoneNumber);

    await cognitoClient.send(
      new AdminSetUserMFAPreferenceCommand(setMFAPreferenceParams)
    );
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
export const getUser = async (username, callback) => {
  const params = {
    UserPoolId: process.env.UserPool_Id,
    Username: username,
  };

  try {
    const data = await cognitoClient.send(new AdminGetUserCommand(params));
    callback(null, data);
  } catch (error) {
    callback(error);
  }
};

export const signin = (body, callback) => {
  const userPool = new CognitoUserPool(poolData);

  const { username, password } = body;

  const authenticationData = {
    Username: username,
    Password: password,
  };

  const authenticationDetails = new AuthenticationDetails(authenticationData);

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  console.log("Starting authentication for user:", username);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      console.log("Authentication successful for user:", username);
      callback(null, {
        success: true,
        result,
      });
    },
    onFailure: (err) => {
      console.log("Authentication failed for user:", username, "Error:", err);
      callback(err);
    },
    mfaRequired: (codeDeliveryDetails) => {
      console.log(
        "MFA required for user:",
        username,
        "Code delivery details:",
        codeDeliveryDetails
      );
      callback(null, {
        success: true,
        mfaRequired: true,
        codeDeliveryDetails,
        cognitoUser, // Include cognitoUser to use in the MFA verification
      });
    },
    newPasswordRequired: (userAttributes, requiredAttributes) => {
      console.log("New password required for user:", username);
      callback(null, {
        success: false,
        newPasswordRequired: true,
        userAttributes,
        requiredAttributes,
      });
    },
  });
};

// email field varification
export const signupEmail = async ({ email, password }, callback) => {
  const params = {
    ClientId: poolData.ClientIdEmail,
    Username: email, // Use email as the username
    Password: password, // You can generate a temporary password
    UserAttributes: [{ Name: "email", Value: email }],
  };

  console.log("Signup params:", params);

  try {
    const data = await cognitoClient.send(new SignUpCommand(params));
    console.log("Signup successful:", data);
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
