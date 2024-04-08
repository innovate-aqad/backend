import AWS from "aws-sdk";

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.Aws_accessKeyId,
  secretAccessKey: process.env.Aws_secretAccessKey,
});

export const pinpoint = new AWS.Pinpoint();

export const pinePointServices = async () => {
  const params = {
    ApplicationId: "a65d1696b75d47beb424e1e968b38ff7",
    MessageRequest: {
      Addresses: {
        "innovate@aqad.ae": {
          ChannelType: "EMAIL",
        },
      },
      MessageConfiguration: {
        EmailMessage: {
          FromAddress: "vabhi7029@gmail.com",
          SimpleEmail: {
            Subject: {
              Data: "Send Email by AWS PinePoint Service",
              Charset: "UTF-8",
            },
            HtmlPart: {
              Data: "<html><body>Your HTML content</body></html>",
              Charset: "UTF-8",
            },
            TextPart: {
              Data: "Your plain text content",
              Charset: "UTF-8",
            },
          },
        },
      },
    },
  };

  pinpoint.sendMessages(params, (err, data) => {
    try {
      const result = pinpoint.sendMessages(params).promise();
      console.log("Email sent successfully:", result);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  });
};

// export async function pinePointServices() {
//     const params = {
//       ApplicationId: 'a65d1696b75d47beb424e1e968b38ff7',
//       MessageRequest: {
//         Addresses: {
//           "innovate@aqad.ae": {
//             ChannelType: 'EMAIL'
//           }
//         },
//         MessageConfiguration: {
//           EmailMessage: {
//             FromAddress: 'akmaurya31@gmail.com',
//             SimpleEmail: {
//               Subject: 'Congratulations!',
//               HtmlPart: '<p>Congratulations! Your account has been created.</p>'
//             }
//           }
//         }
//       }
//     };

//     try {
//       const result = await pinpoint.sendMessages(params).promise();
//       console.log('Email sent successfully:', result);
//     } catch (error) {
//       console.error('Error sending email:', error);
//     }
//   }
