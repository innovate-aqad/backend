import AWS from "aws-sdk";

const SES_COMMING = {
  region: "ap-south-1",
  accessKeyId: process.env.Aws_accessKeyId,
  secretAccessKey: process.env.Aws_secretAccessKey,
};
const AWS_SES = new AWS.SES(SES_COMMING);
const sns = new AWS.SNS(SES_COMMING);
export const pinePointServices = async () => {
  const params = {
    Destination: {
      ToAddresses: ["vabhi7029@gmail.com"], // Replace with recipient email address/es
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: "This is the message body in text format.", // Replace with your message body
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Test email", // Replace with your email subject
      },
    },
    Source: "aqadinnovate@gmail.com", // Replace with your sender email address
  };

  // Send email
  AWS_SES.sendEmail(params, function (err, data) {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Email sent successfully:", data);
    }
  });
};

export const sendEmailOtp = async (email, otp) => {
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
  AWS_SES.sendEmail(params, function (err, data) {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Email sent successfully:", data);
    }
  });
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
