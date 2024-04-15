import AWS from "aws-sdk";

const SES_COMMING={
  region: "ap-south-1",
  accessKeyId: process.env.Aws_accessKeyId,
  secretAccessKey: process.env.Aws_secretAccessKey,
}

// export const pinpoint = new AWS.Pinpoint();
const AWS_SES = new AWS.SES(SES_COMMING)

// export const pinePointServices = async () => {
//   const params = {
//     ApplicationId: "a65d1696b75d47beb424e1e968b38ff7",
//     MessageRequest: {
//       Addresses: {
//         "aqadinnovate@gmail.com": {
//           ChannelType: "EMAIL",
//         },
//       },
//       MessageConfiguration: {
//         EmailMessage: {
//           FromAddress: "vabhi7029@gmail.com",
//           SimpleEmail: {
//             Subject: {
//               Data: "Send Email by AWS PinePoint Service",
//               Charset: "UTF-8",
//             },
//             HtmlPart: {
//               Data: "<html><body>Your HTML content</body></html>",
//               Charset: "UTF-8",
//             },
//             TextPart: {
//               Data: "Your plain text content",
//               Charset: "UTF-8",
//             },
//           },
//         },
//       },
//     },
//   };

//   pinpoint.sendMessages(params, (err, data) => {
//     try {
//       pinpoint.sendMessages(params).promise()
//       .then(data => {
//         console.log("Email sent successfully:", data);
//       })
//       .catch(error => {
//         console.error("Error sending email:", error);
//       });
//       // console.log("Email sent successfully:", result);
//     } catch (error) {
//       console.error("Error sending email:", error);
//     }
//   });
// };

export const pinePointServices = async () => {
  const params = {
    Destination: {
      ToAddresses: ['vabhi7029@gmail.com'] // Replace with recipient email address/es
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: 'This is the message body in text format.' // Replace with your message body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Test email' // Replace with your email subject
      }
    },
    Source: 'aqadinnovate@gmail.com' // Replace with your sender email address
  };
  
  // Send email
  AWS_SES.sendEmail(params, function(err, data) {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Email sent successfully:", data);
    }
  });
};
