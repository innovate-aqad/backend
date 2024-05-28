// import AWS from "aws-sdk";

// //phone => me-central-1

// const SES_COMMING = {
//   region: "me-south-1",
//   accessKeyId: process.env.Aws_accessKeyId,
//   secretAccessKey: process.env.Aws_secretAccessKey,
// };
// const AWS_SES = new AWS.SES(SES_COMMING);
// const sns = new AWS.SNS(SES_COMMING);
//---------------------------------------
// new updated code
import { SESClient,SendEmailCommand } from "@aws-sdk/client-ses";
import { SNSClient } from "@aws-sdk/client-sns";
// import { fromIni } from "@aws-sdk/credential-provider-ini";

// Create SES client
const AWS_SES = new SESClient({
  region: "me-south-1",
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey
  }
});

// Create SNS client
const sns = new SNSClient({
  region: "me-south-1",
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey
  }
});

// export { sesClient, snsClient };


export const pinePointServices = async (email, otp) => {
  try {

    const params = {
      Destination: {
        ToAddresses: [email], // Replace with recipient email address/es
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: `Email verification otp is ${otp}.`, // Replace with your message body
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Email Verification", // Replace with your email subject
        },
      },
      Source: "aqadinnovate@gmail.com", // Replace with your sender email address
    };
    // Send email
    const command = new SendEmailCommand(params);
    const data = await AWS_SES.send(command);
console.log(data,"dataa")
    // let get = await AWS_SES.sendEmail(params, (err, data) => {
    //   if (data) {
    //     console.log("success data", data)
    //   } else {
    //     console.log("error ", err)

    //   }
    // })
    return true
  } catch (error) {
    console.log(error,"errrrrer")
    return false
  }
};

export const sendPasswordViaEmailOf = async (obj) => {
  try {

    const params = {
      Destination: {
        ToAddresses: [obj?.email], // Replace with recipient email address/es
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: `Login password is ${obj?.randomPassword}.`, // Replace with your message body
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Login Password", // Replace with your email subject
        },
      },
      Source: "aqadinnovate@gmail.com", // Replace with your sender email address
    };
    // Send email
    // let get = await AWS_SES.sendEmail(params, (err, data) => {
    //   if (data) {
    //     console.log("success data", data)
    //   } else {
    //     console.log("error ", err)
    //   }
    // })
    const command = new SendEmailCommand(params);
    const data = await AWS_SES.send(command);
// console.log(data,"dataa")
    return true
  } catch (error) {
    return false
  }
};

export const sendOtpForLogin = async (email, otp) => {
  try {
    const params = {
      Destination: {
        ToAddresses: [email], // Replace with recipient email address/es
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: `otp is ${otp}.`, // Replace with your message body
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Login Otp", // Replace with your email subject
        },
      },
      Source: "aqadinnovate@gmail.com", // Replace with your sender email address
    };
    // Send email
    // let get = await AWS_SES.sendEmail(params, (err, data) => {
    //   if (data) {
    //     console.log("success data", data)
    //   } else {
    //     console.log("error ", err)

    //   }
    // })
    
    const command = new SendEmailCommand(params);
    const data = await AWS_SES.send(command);
// console.log(data,"dataa")
    return true
  } catch (error) {
    console.log(error,"errorrorr in login ")
    return false
  }
};


export const sendEmailOtp = async (email, otp) => {
  try {
    const params = {
      Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: `Verify OTP ${otp}`, // Replace with your message body
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Send Email OTP", // Replace with your email subject
      },
    },
    Source: "aqadinnovate@gmail.com", // Replace with your sender email address
  };

  // Send email
  // AWS_SES.sendEmail(params, function (err, data) {
  //   if (err) {
  //     console.error("Error sending email:", err);
  //   } else {
  //     console.log("Email sent successfully:", data);
  //   }
  // });
     
  const command = new SendEmailCommand(params);
  const data = await AWS_SES.send(command);
  return true
} catch (error) {
  console.log(error,"Erororro ")
}
};

export const sendPhoneOTP = async (phone, otp) => {
  const message = `Your OTP is: ${otp}`;

  const params = {
    Message: message,
    PhoneNumber: phone,
  };

  try {
    const data = await sns.publish(params).promise();
    console.log("OTP sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};
