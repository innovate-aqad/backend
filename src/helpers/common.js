import nodemailer from "nodemailer";
import crypto from "crypto";
import { environmentVars } from "../config/environmentVar.js";

// let transporter = nodemailer.createTransport({
//   host: "mail.smtp2go.com",
//   port: 2525,
//   secure: false,
//   auth: {
//     user: process.env.SMTP2GO_USER,
//     pass: process.env.SMTP2GO_PASSWORD,
//   },
// });


// Gmail send
let transporter = nodemailer.createTransport({
  host: "mail.aqad.ae",
  port: 465,
  secure: false,
  auth: {
    user: "innovate@aqad.ae",
    pass: "innovate@aqad.ae",
  },
});

let transporter2 = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

let transporter5 = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "akmaurya31@gmail.com",
    pass: 'bigo msvn ymdz vali',
  },
});
// export async function sendPasswordViaEmail(res, data) {
//   try {
//     // console.log(data, "AAAAAAAAAAAAAAAAAAAAAAAAAA");
//     const mailOptions = {
//       from: process.env.AUTH_EMAIL,
//       to: data.email,
//       subject: "Welcome to Vuezen.com",
//       html: `
//           <head>
//           <style>
//               .container {
//                   width: 100%;
//                   max-width: 600px;
//                   margin: 0 auto;
//               }
//               .content {
//                 padding: 20px;
//             }
//               .header {
//                   background-color: #4CAF50;
//                   color: #ffffff;
//                   text-align: center;
//                   padding: 20px 0;
//               }
//           </style>
//       </head>
//       <body>
//           <div class="container">
//               <div class="header">
//                   <h1>Welcome to veuzen.com!</h1>
//                   </div>

//                   <div class="content">
//                   <p>Dear ${data?.name},</p>
//                   <p>We are thrilled to welcome you to the vuezen.com community!.</p>
//                   <p>Here is your Account Login password : ${data?.userPassword} </p>

//              </div>
//           <div class="footer">
//               <p>Regards, <br>The vuezen.com Team</p>
//           </div>

//           </div>
//           </body>
//           `,
//     };
//     res.status(201).json({
//       success: true,
//       statusCode:201,
//       message: "User create successfully , check mail for password",
//     });
//     await transporter2.sendMail(mailOptions);
//     return;
//   } catch (err) {
//     console.log(err, "Err");
//   }
// }
export async function sendPasswordViaEmail(res, data) {
  try {
    // console.log(data, "AAAAAAAAAAAAAAAAAA");
    let base_url = "https://vuezen-be.bastionex.net/uploads/images";
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: data.email,
      subject: "Welcome to Vuezen! Let's Frame Your Style Together!",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vuezen</title>
          <link href='http://fonts.googleapis.com/css?family=Lato:300,400,700&subset=latin-ext' rel='stylesheet' type='text/css'>
      </head>
      
      <body style="margin: 0; font-family: lato;">
          <table style="width: 600px; background-color: rgb(255, 255, 255);margin: 0 auto; border-spacing: 0; border-collapse: collapse; box-shadow: 0px 0px 15px 7px #ebebeb70;">
              <tr style="text-align: center; background-color: #fff;">
                <td style="text-align: center;">
                <img src="${base_url}/logo.png"/>
                </td>
              </tr>
              <tr>
                  <td style="padding: 0px 40px; height: 260px; background-image:url('${base_url}/banner-back.png'); background-position: center top; background-size: cover; background-repeat: no-repeat;" >
                      <h1 style="text-align: left;color: #00C6FF;font-size: 32px;font-family: 'Lato'; font-style: italic; font-weight: 700; padding: 0;margin: 0;">Hello ${data?.name},</h1>
                      <img src="${base_url}/under-lines.png" alt="underline">
                      <p style="text-align: left;color: #E6E6E6;font-family: 'Lato';font-weight: 700;font-size: 20px;padding-top: 5px;margin: 0;">Welcome to the Vuezen family!</p>
                  </td>
              </tr>
              <tr>
                  <td style="text-align:center; padding-top: 20px;">
                    <div style="display: inline-flex;">
                      <div style="margin-right:30px; text-align: center;"><img src="${base_url}/women-circle.png" alt=""> <p style="margin-top: 5px; font-size: 16px; font-weight: 700;">
                      
                      <a href="${environmentVars?.live_url}" >Women</a> 
                      </p></div>
                      <div style="text-align: center;"><img src="${base_url}/men-circle.png" alt=""> <p style="margin-top: 5px; font-size: 16px; font-weight: 700;">
                      <a href="${environmentVars?.live_url}" >Men</a> 
                      </p></div>
                    </div>
                  </td>
              </tr>
              <tr >
                <td style="padding-top: 0px;">
                <h2 style="color: #6B6263;
                text-align: center;
                font-size: 20px;
                font-style: normal;
                font-weight: 400;
                margin-bottom: 0px;">Here’s what you can find on <span style="font-size: 22px; color: #6B6263; font-weight: 700;">Vuezen</span></h2>
                </td>
              </tr>
              <tr>
                <td>
                <h3 style="color: #000;
                text-align: center;
                font-size: 20px;
                font-style: normal;
                font-weight: 400;
                margin-bottom: 25px;">Thanks for signing up.</h3>
                </td>
              </tr>
              <tr>
                <td>
                <h4 style="color: #000;
                text-align: center;
                font-size: 18px;
                font-style: italic;
                font-weight: 600;
                margin: 0;">Your default password is <span style="color: #1170FF; font-weight: 700;">${data?.userPassword}</span></h4>
                </td>
              </tr>
              <tr>
                <td>
                <h5 style="color: #000;
                text-align: center;
                font-size: 20px;
                font-style: normal;
                font-weight: 600;
                margin-bottom: 0;">You can click here to login.</h5>
                </td>
              </tr>
              <tr>
                <td style="text-align:center">
                <div style="display:inline-block;border-radius:5px;background:#032140;color:#fff;margin: 20px 0 20px;text-transform:uppercase;padding: 15px 35px;">
                <a href="${environmentVars?.live_url}login" style="color:#fff; text-decoration:none;">Login here</a> 
                  
                </div>
                </td>
              </tr>
              <tr>
                <td style="text-align:center">
                <h5 style="color: #000;
                text-align: center;
                font-size: 32px;
                font-style: normal;
                font-weight: 600;
                margin: 25px 0 0;">Find Your <span style="color:#00C6FF">Match</span></h5>
                </td>
              </tr>
      
              <tr>
                <td style="text-align:center">
                  <img style="padding-left:100px; width:30px" src="${base_url}/arrow.png">
                </td>
              </tr>

              <tr>
                <td style="text-align:center">
                  <img src="${base_url}/find-img.jpg">
                </td>
              </tr>

              <tr>
                <td style="text-align:center; background-color: #F1E0CD;padding-bottom: 20px;">
                  <div style="display: inline-block;
                  border-radius: 5px;
                  background: #032140;
                  color: #fff;
                  margin: 20px 0 20px;
                  text-transform: uppercase;
                  padding: 15px 35px;
                    ">
                    <a href="${environmentVars?.live_url}" style="color:#fff; text-decoration:none;"> Shop Now</a>                   
                  </div>
                </td>
              </tr>

              
      
              <tr style="margin-top: 20px; width: 100%;">
                  <td style="display: flex;margin-top: 15px;">
                      <img style="width:50%;" src="${base_url}/men-child-left.png">
                      <div style="width: 50%; background-color: #9BB4B6; text-align:center">
                          <h2 style="
                          color: #032140;
                          text-align: center;
                          font-size: 28px;
                          font-style: normal;
                          font-weight: 700;
                          white-space: pre-line;
                          margin: 0;
                          padding: 20px 0 0;
                          line-height: 30px;
                              ">Eyewear
                              Collections</h2>
                          <h2 style="color: #FFF;
                              text-align: center;
                              font-size: 32px;
                              font-style: normal;
                              font-weight: 400;
                              margin-top: 10px;
                              margin-bottom: 10px;">$30.95</h2>
                          <div style="
                          display: inline-block;
                          background: #032140;
                          color: #fff;
                          text-transform: uppercase;
                          text-align: center;
                          padding: 15px 35px;
                          border-radius: 5px;
                              ">
                              <a href="${environmentVars?.live_url}" style="color:#fff; text-decoration:none;"> Shop Now</a>   
                              
                          </div>
                      </div>
                  </td>
              </tr>
      
              <tr>
                <td>
                  <h2 style="color: #000;
                  text-align: center;
                  font-size: 20px;
                  font-style: normal;
                  font-weight: 400;
                  padding: 20px 60px;">If you have any questions or need any help,don't hesitate to contact our support team!</h2>
                </td>
              </tr>

              <tr>
                  <td style="text-align:center">
                    <div style="display: inline-flex; margin-bottom: 20px;">
                      <img src="${base_url}/support-icon.png" alt="" style="text-align: center; width:40px; height:40px">
                      <div style="padding-left:10px;text-align: left;">
                          <h5 style="margin: 0; font-size: 18px; color: #000; font-weight: 400;">Customer Service Department</h5>
                          <h5 style="margin: 0; font-size: 18px;color: #009CFF; font-weight: 400;">Support@vuezen.com</h5>
                      </div>
                    </div>
                  </td>
              </tr>
              <tr>
                  <td style="text-align:center">
                    <div style="display: inline-flex; margin-bottom: 20px;">
                      <img src="${base_url}/support-icon.png" alt="" style="text-align: center; width:40px; height:40px">
                      <div style="padding-left:10px;text-align: left;">
                          <h5 style="margin: 0; font-size: 18px; color: #000; font-weight: 400;">Complaints & Suggestions</h5>
                          <h5 style="margin: 0; font-size: 18px;color: #009CFF; font-weight: 400;">Complaints@vuezen.com</h5>
                      </div>
                    </div>
                  </td>
              </tr>
              <tr>
                  <td style="text-align:center">
                    <div style="display: inline-flex; margin-bottom: 20px;">
                      <img src="${base_url}/support-icon.png" alt="" style="text-align: center; width:40px; height:40px">
                      <div style="padding-left:10px;text-align: left;">
                          <h5 style="margin: 0; font-size: 18px; color: #000; font-weight: 400;">Call: +1 (121) 253-542</h5>
                          <h5 style="margin: 0; font-size: 18px;color: #009CFF; font-weight: 400;">24*7</h5>
                      </div>
                    </div>
                  </td>
              </tr>
      
              <tr>
                  <td style="background-color: #032140;padding-top: 40px; text-align: center;">
                      <img src="${base_url}/white-logo.png">
                      <h2 style="color: #FFF;
                          text-align: center;
                          font-size: 20px;
                          font-style: normal;
                          font-weight: 400;
                          margin: 10px 0 5px;">Please Note: To stop receiving emails, click</h2>
                      <h2 style="color: #009CFF;
                      font-size: 16px;
                      font-style: normal;
                      font-weight: 700;
                      text-decoration: underline;
                      margin: 0;">UNSUBSCRIBE</h2>
                      <p style="font-size: 14px; padding: 20px 50px; text-align: center; color: #B0B0B0;">Do not directly reply to this email, as it was generated automatically and thus your unsubscription request will not be processed.</p>
                  </td>
              </tr>
          </table>
      </body>
      </html>`,
    };
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "User create successfully , check mail for password",
    });
    await transporter2.sendMail(mailOptions);
    return;
  } catch (err) {
    console.log(err, "Err");
  }
}

export async function forgotPasswordEmail(req, res, obj) {
  try {
    const htmlLink2 = `${process.env.APP_URL}/change-password?id=${obj?.user_id}`;

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: obj.email,
      subject: "Reset Your Password - vuezen",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background: url('https://example.com/your-background-image.jpg') center/cover no-repeat;
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  max-width: 600px;
                  background-color: rgba(255, 255, 255, 0.9);
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              h2 {
                  color: #007BFF;
              }
              p {
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 15px;
              }
              a {
                  display: inline-block;
                  padding: 12px 24px;
                  margin-top: 20px;
                  text-decoration: none;
                  color: #ffffff;
                  background-color: #007BFF;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
              }
              a:hover {
                  background-color: #0056b3;
              }
              .nn{
                color: #FFFFFF;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Password Reset</h2>
              <p>Dear ${obj?.name},</p>
              <p>It seems that you've forgotten your password, but don't worry, we've got you covered!</p>
              <p>To reset your password, otp is ${obj?.otp_code}</p>
              <p>Please choose a strong and memorable password. That's it!</p>
              <p>Thank you for choosing vuezen. We appreciate your trust in our platform and are here to ensure you have a seamless experience.</p>
              <p>Sincerely,</p>
              <p>Vuezen</p>
          </div>
      </body>
      </html>
      `,
    };
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Otp sent to registered email",
    });
    try {
      await transporter2.sendMail(mailOptions);
    } catch (err) {
      console.log(err, "error occur");
    }
    return;
  } catch (error) {
    console.log(error);
    return res.json({
      status: "Failed",
      message: error.message,
    });
  }
}
export async function sendOtpForlogin(req, res, obj) {
  try {
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: obj.email,
      subject: "Login Otp - vuezen",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Otp for login account</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background: url('https://example.com/your-background-image.jpg') center/cover no-repeat;
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  max-width: 600px;
                  background-color: rgba(255, 255, 255, 0.9);
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              h2 {
                  color: #007BFF;
              }
              p {
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 15px;
              }
              a {
                  display: inline-block;
                  padding: 12px 24px;
                  margin-top: 20px;
                  text-decoration: none;
                  color: #ffffff;
                  background-color: #007BFF;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
              }
              a:hover {
                  background-color: #0056b3;
              }
              .nn{
                color: #FFFFFF;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <p>Dear ${obj?.name},</p>
              <p>Otp is ${obj?.otp_code}</p>
              <p>Thank you for choosing vuezen. We appreciate your trust in our platform and are here to ensure you have a seamless experience.</p>
              <p>Sincerely,</p>
              <p>Vuezen</p>
          </div>
      </body>
      </html>
      `,
    };
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Otp sent to registered email",
    });
    try {
      await transporter2.sendMail(mailOptions);
    } catch (err) {
      console.log(err, "error occur");
    }
    return;
  } catch (error) {
    console.log(error);
    return res.json({
      status: "Failed",
      message: error.message,
    });
  }
}

export function encryptStringWithKey(text) {
  const password = btoa(text);
  // console.log(password);
  return password;
}

export async function sendQueryMailToUser(res, data) {
  try {
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: data.email,
      subject: "Thank You for Getting In Touch",
      html: `
          <head>
          <style>
              .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 0 auto;
              }
      
              .header {
                  background-color: #4CAF50;
                  color: #ffffff;
                  text-align: center;
                  padding: 20px 0;
              }
          </style>
      </head>
      <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Dear ${data.name},</p>
                <p>Thank you for getting in touch with us. We appreciate your interest!</p>
                <p>Your message has been received, and we will get back to you as soon as possible.</p>
                <hr>
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this email.</p>
            </div>
        </body>
          `,
    };
    await transporter2.sendMail(mailOptions);
    return res.status(201).json({
      success: true,
      message: "Thank you , We will connect you soon",
    });
  } catch (err) {
    console.log(err, "Err");
    return res
      .status(500)
      .json({ message: err?.message, success: false, statusCode: 500 });
  }
}

export async function orderPlaceViaEmail(data, userData) {
  try {
    // console.log(data, "AAAAAAAAAAAAAAAAAAAAAAAAAA", userData);
    // userData.email = "prabhat@bastionex.net";
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: userData.email,
      subject: "Welcome to Vuezen.com",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Placed Successfully</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
            }
            .header {
              background-color: #4CAF50;
              color: #ffffff;
              text-align: center;
              padding: 20px 0;
            }
            .content {
              padding: 20px;
            }
            .product {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #fff;
              border: 1px solid #ddd;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .footer {
              padding: 20px;
              background-color: #4CAF50;
              color: #ffffff;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Placed Successfully</h1>
            </div>
            
            <div class="content">
              <p>Dear ${userData?.name},</p>
              <h2>Your Order Details:</h2>
              <p>Order ID: ${data?.order_id}</p>
              ${data?.variant_quantity
                .map(
                  (product) => `
                <div class="product">
                  <p>Product Name: ${product?.variant_name}</p>
                  <p>Quantity: ${product?.quantity}</p>
                  <!-- Add more product details as needed -->
                </div>
              `
                )
                .join("")}
              <p>Subtotal: ${data?.sub_total}</p>
              <p>Delivery Date: ${new Date(
                data?.delivery_date
              )?.toDateString()}</p>
            </div>
            
            <div class="footer">
              <p>Regards, <br>The Vuezen.com Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter2.sendMail(mailOptions);
    return;
  } catch (err) {
    console.log(err, "Err");
  }
}

export async function updateOrderPaymentViaEmail(data, userData) {
  try {
    // console.log(data, "AAAAAAAAAAA23333333$$$$$$AA", userData);
    // return
    // userData.email="prabhat@bastionex.net"
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: userData.email,
      subject: "Welcome to Vuezen.com",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Payment Status</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
            }
            .header {
              background-color: #4CAF50;
              color: #ffffff;
              text-align: center;
              padding: 20px 0;
            }
            .content {
              padding: 20px;
            }
            .product {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #fff;
              border: 1px solid #ddd;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .footer {
              padding: 20px;
              background-color: #4CAF50;
              color: #ffffff;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Payment Status</h1>
            </div>
            
            <div class="content">
              <p>Dear ${userData?.name},</p>
              <h2>Your Order Payment status : ${data?.payment_status} </h2>
            </div>
            <div class="footer">
              <p>Regards, <br>The Vuezen.com Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter2.sendMail(mailOptions);
    return;
  } catch (err) {
    console.log(err, "Err");
  }
}

//itself user can  cancel his order
export async function cancelOrder(userdata, orderData) {
  try {
    // console.log(userdata, "userdata", orderData, "orderdata");
    // userdata.email="prabhat@bastionex.net"
    // return
    const mailOptions = {
      // from: process.env.AUTH_EMAIL,

      from: environmentVars.authEmail,

      to: userdata?.email,
      subject: "Order Cancelled Successfully",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Cancelled</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  max-width: 600px;
                  background-color: rgba(255, 255, 255, 0.9);
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              h2 {
                  color: #007BFF;
              }
              p {
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 15px;
              }
              a {
                  display: inline-block;
                  padding: 12px 24px;
                  margin-top: 20px;
                  text-decoration: none;
                  color: #ffffff;
                  background-color: #007BFF;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
              }
              a:hover {
                  background-color: #0056b3;
              }
              .nn{
                color: #FFFFFF;
              }
          </style>
      </head>
      <body>
          <div class="container">
          <h2>Order Cancellation </h2>
              <p>Dear ${userdata?.name},</p>
              <p class="cancel-message">On your request, your order has been cancelled successfully.</p>
              <ul>
              <li>Order ID: ${orderData?.order_id}</li>
              <li>Cancelled Items:</li>
              <ul>
                ${orderData?.variant_quantity
                  .map(
                    (item) => `
                  <li>${item?.variant_name}</li>
                `
                  )
                  .join("")}
              </ul>
          </ul>
              <p>We apologize for any inconvenience this may have caused. If you have any questions or concerns, please contact our support team.</p>
              <p>Thank you for choosing vuezen. We appreciate your understanding.</p>
              <p>Sincerely,</p>
              <p>Vuezen</p>
          </div>
      </body>
      </html>
      `,
    };
    try {
      await transporter2.sendMail(mailOptions);
    } catch (err) {
      console.log(err, "error occur");
    }
    return;
  } catch (error) {
    console.log(error);
    // return res.json({
    //   status: "Failed",
    //   message: error.message,
    // });
  }
}

// changeDeliveryDate by admin
export async function changeDeliveryDate(data) {
  try {
    // console.log(data, "userdata", "orderdata");
    // data.emailData.email = "rathorejee074@gmail.com";
    // console.log(data, "userdata", "orderdata");
    // return
    const mailOptions = {
      // from: process.env.AUTH_EMAIL,
      from: environmentVars.authEmail,
      to: data?.emailData?.email,
      subject: "Order delivery date changed",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order delivery date changed</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  max-width: 600px;
                  background-color: rgba(255, 255, 255, 0.9);
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              h2 {
                  color: #007BFF;
              }
              p {
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 15px;
              }
              a {
                  display: inline-block;
                  padding: 12px 24px;
                  margin-top: 20px;
                  text-decoration: none;
                  color: #ffffff;
                  background-color: #007BFF;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
              }
              a:hover {
                  background-color: #0056b3;
              }
              .nn{
                color: #FFFFFF;
              }
          </style>
      </head>
      <body>
          <div class="container">
          <h2>Delivery date changed </h2>
              <p>Dear ${data?.emailData?.name},</p>
              <p class="cancel-message">Your order delivery date has been changed.</p>
              <ul>
              <li>Delivery date: ${new Date(
                data?.delivery_date
              )?.toDateString()}</li>
              <li>Shipping date: ${new Date(
                data?.shipping_date
              )?.toDateString()}</li>
              <li>Out for delivery date: ${new Date(
                data?.out_for_delivery_date
              )?.toDateString()}</li>
          </ul>
              <p>We apologize for any inconvenience this may have caused. If you have any questions or concerns, please contact our support team.</p>
              <p>Thank you for choosing vuezen. We appreciate your understanding.</p>
              <p>Sincerely,</p>
              <p>Vuezen</p>
          </div>
      </body>
      </html>
      `,
    };
    try {
      await transporter2.sendMail(mailOptions);
    } catch (err) {
      console.log(err, "error occur");
    }
    return;
  } catch (error) {
    console.log(error);
    // return res.json({
    //   status: "Failed",
    //   message: error.message,
    // });
  }
}
//change order status
export async function changeOrderStatus(data) {
  try {
    // console.log(data, "userdata", "orderdata");
    // data.emailData.email = "prabhat@bastionex.net";
    // console.log(data, "userdata", "orderdata");
    // return
    const mailOptions = {
      // from: process.env.AUTH_EMAIL,
      from: environmentVars.authEmail,
      to: data?.emailData?.email,
      subject: "Order status changed",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order status changed</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  max-width: 600px;
                  background-color: rgba(255, 255, 255, 0.9);
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              h2 {
                  color: #007BFF;
              }
              p {
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 15px;
              }
              a {
                  display: inline-block;
                  padding: 12px 24px;
                  margin-top: 20px;
                  text-decoration: none;
                  color: #ffffff;
                  background-color: #007BFF;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
              }
              a:hover {
                  background-color: #0056b3;
              }
              .nn{
                color: #FFFFFF;
              }
          </style>
      </head>
      <body>
          <div class="container">
          <h2>Order status changed </h2>
              <p>Dear ${data?.emailData?.name},</p>
              <p class="cancel-message">Your order status has been changed.</p>
              <ul>
              <li>Order status : ${data?.status}</li>
              
          </ul>
              <p>If you have any questions or concerns, please contact our support team.</p>
              <p>Thank you for choosing vuezen. We appreciate your understanding.</p>
              <p>Sincerely,</p>
              <p>Vuezen</p>
          </div>
      </body>
      </html>
      `,
    };
    try {
      await transporter2.sendMail(mailOptions);
    } catch (err) {
      console.log(err, "error occur");
    }
    // return;
  } catch (error) {
    console.log(error);
    // return res.json({
    //   status: "Failed",
    //   message: error.message,
    // });
  }
}
export async function sendCouponViaEmail(data) {
  try {
    // console.log(data, "userdatorderdata");
    // data.emailData.email = "prabhat@bastionex.net";
    // console.log(data, "userdata", "orderdata");
    const mailOptions = {
      from: environmentVars.authEmail,
      to: data?.emailData?.email,
      subject: "Coupon Received",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Coupon Received </title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  max-width: 600px;
                  background-color: rgba(255, 255, 255, 0.9);
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              h2 {
                  color: #007BFF;
              }
              p {
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 15px;
              }
              a {
                  display: inline-block;
                  padding: 12px 24px;
                  margin-top: 20px;
                  text-decoration: none;
                  color: #ffffff;
                  background-color: #007BFF;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
              }
              a:hover {
                  background-color: #0056b3;
              }
              .nn{
                color: #FFFFFF;
              }
          </style>
      </head>
      <body>
          <div class="container">
          <h2>Congratulations! You've Received a Coupon</h2>
              <p>Dear ${data?.emailData?.name},</p>
              <p>Congratulations! You've received a coupon. Use the code below to enjoy your discount:</p>
              <div>
                <p><strong>Coupon Code:</strong> ${data?.discountObj?.code}</p>
                <p><strong>Discount:</strong> ${data?.discountObj?.value}</p>
                <p><strong>Discount type:</strong> ${data?.discountObj?.type}</p>
                <p><strong>Expire Date:</strong> ${data?.discountObj?.expired_date}</p>
              </div>
             
              <p>If you have any questions or concerns, please contact our support team.</p>
              <p>Thank you for choosing vuezen. We appreciate your understanding.</p>
              <p>Sincerely,</p>
              <p>Vuezen</p>
          </div>
      </body>
      </html>
      `,
    };
    try {
      await transporter2.sendMail(mailOptions);
    } catch (err) {
      console.log(err, "error occur");
    }
    return;
  } catch (error) {
    console.log(error);
    // return res.json({
    //   status: "Failed",
    //   message: error.message,
    // });
  }
}

//nesletter subscribe
export async function subscribeMailForNewsletter(EmailData) {
  try {
    // console.log(EmailData, "userdata", "orderdata");
    // data.emailData.email = "prabhat@bastionex.net";
    // console.log(data, "userdata", "orderdata");
    // return
    const mailOptions = {
      from: environmentVars.authEmail,
      to: EmailData,
      subject: "NewsLetter Subscribed",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NewsLetter Subscribed</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  max-width: 600px;
                  background-color: rgba(255, 255, 255, 0.9);
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              h2 {
                  color: #007BFF;
              }
              p {
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 15px;
              }
              a {
                color: #007BFF;
                text-decoration: underline;
            }
          
          </style>
      </head>
      <body>
          <div class="container">
          <h2>News letter subscribed </h2>
              <p>If you have any questions or concerns, please contact our support team.</p>
              <p>Thank you for choosing vuezen. We appreciate your understanding.</p>
              <P> unsubscribed <a href="${environmentVars?.live_url}subscribe?email=${EmailData}" >here</a> </P>
              <p>Sincerely,</p>
              <p>Vuezen</p>
          </div>
      </body>
      </html>
      `,
    };
    try {
      await transporter2.sendMail(mailOptions);
    } catch (err) {
      console.log(err, "error occur");
    }
    return;
  } catch (error) {
    console.log(error);
    // return res.json({
    //   status: "Failed",
    //   message: error.message,
    // });
  }
}






// send email code line start
export async function sendEmailUser(req, res, obj) {
  try {
    const htmlLink2 = `${process.env.APP_URL}/change-password?id=${obj?.user_id}`;

    const mailOptions = {
      from: "akms16@gmail.com",
      to: "ramsakalpatel253@gmail.com",
      subject: "user email send successfully",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Send</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background: url('https://example.com/your-background-image.jpg') center/cover no-repeat;
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  max-width: 600px;
                  background-color: rgba(255, 255, 255, 0.9);
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              h2 {
                  color: #007BFF;
              }
              p {
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 15px;
              }
              a {
                  display: inline-block;
                  padding: 12px 24px;
                  margin-top: 20px;
                  text-decoration: none;
                  color: #ffffff;
                  background-color: #007BFF;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
              }
              a:hover {
                  background-color: #0056b3;
              }
              .nn{
                color: #FFFFFF;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Email Send</h2>
              <p>Dear ${obj?.name},</p>
              <p>It seems that you've forgotten your password, but don't worry, we've got you covered!</p>
              <p>To reset your password, otp is ${obj?.otp_code}</p>
              <p>Please choose a strong and memorable password. That's it!</p>
              <p>Thank you for choosing vuezen. We appreciate your trust in our platform and are here to ensure you have a seamless experience.</p>
              <p>Sincerely,</p>
              <p>Vuezen</p>
          </div>
      </body>
      </html>
      `,
    };
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "user Send email",
    });
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.log(err, "error occur");
    }
    return;
  } catch (error) {
    console.log(error);
    return res.json({
      status: "Failed",
      message: error.message,
    });
  }
}






export async function sendEmailOTP(req, res, email,otp) {
  try {
  
    const mailOptions = {
      from: "akmaurya31@gmail.com",
      to: email,
      subject: "Email OTP send successfully",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email OTP</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background: url('https://example.com/your-background-image.jpg') center/cover no-repeat;
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  max-width: 600px;
                  background-color: rgba(255, 255, 255, 0.9);
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              h2 {
                  color: #007BFF;
              }
              p {
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 15px;
              }
              a {
                  display: inline-block;
                  padding: 12px 24px;
                  margin-top: 20px;
                  text-decoration: none;
                  color: #ffffff;
                  background-color: #007BFF;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
              }
              a:hover {
                  background-color: #0056b3;
              }
              .nn{
                color: #FFFFFF;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Email OTP</h2>
              <p>Dear ${email} User,</p>
               <p>It seems that you've send email and verify email, but don't worry, we've got you covered!</p>
               <p>Email OTP, otp is ${otp}</p>

          </div>
      </body>
      </html>
      `,
    };
    // res.status(200).json({
    //   success: true,
    //   statusCode: 200,
    //   message: "OTP Send Sucecessfully",
    // });
    try {
      await transporter5.sendMail(mailOptions);
    } catch (err) {
      console.log(err, "error occur");
    }
    return;
  } catch (error) {
    console.log(error);
    return res.json({
      status: "Failed",
      message: error.message,
    });
  }
}

/**
 * for admin side email for cancel order by admin 
 * 
 * <div class="container">
    <h2>Order Cancellation Confirmation</h2>
    <p>Dear ${obj?.name},</p>

    <!-- Check if the order is cancelled -->
    ${obj?.orderCancelled ? `
        <p class="cancel-message">We regret to inform you that your order has been cancelled successfully.</p>
        <p>This decision was made due to unforeseen circumstances, and we sincerely apologize for any inconvenience it may have caused.</p>
        <p>Here are some details about your cancelled order:</p>
        <ul>
            <li>Order ID: ${obj?.orderId}</li>
            <li>Cancelled Items: ${obj?.cancelledItems.join(', ')}</li>
            <li>Total Amount Refunded: ${obj?.refundAmount}</li>
        </ul>
        <p>If you have any questions or concerns regarding the cancellation, please don't hesitate to contact our support team at ${process.env.SUPPORT_EMAIL}.</p>
        <p>Thank you for your understanding and continued support. We appreciate your business and hope to serve you better in the future.</p>
    ` : `
        <p>It seems that you've forgotten your password, but don't worry, we've got you covered!</p>
        <p>To reset your password, otp is ${obj?.otp_code}</p>
        <p>Please choose a strong and memorable password. That's it!</p>
        <p>Thank you for choosing vuezen. We appreciate your trust in our platform and are here to ensure you have a seamless experience.</p>
    `}

    <p>Sincerely,</p>
    <p>Vuezen</p>
</div>

 */
