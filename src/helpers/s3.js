// // import AWS from "aws-sdk";
import fs from "fs/promises";
import multer from "multer";
// // //
// // // Configure AWS SDK
// // AWS.config.update({
// //   region: process.env.Aws_region, // Replace with your region
// //   accessKeyId: process.env.Aws_accessKeyId, // Replace with your AWS Access Key ID
// //   secretAccessKey: process.env.Aws_secretAccessKey, // Replace with your AWS Secret Access Key
// // });

// // // Create S3 instance
// // // const s3 = new AWS.S3();

// // Create DynamoDB instance
// // const dynamodb = new AWS.DynamoDB.DocumentClient();

// new version
import { S3Client, PutObjectCommand ,DeleteObjectCommand} from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { fromIni } from "@aws-sdk/credential-provider-ini";

// Create S3 client
const s3 = new S3Client({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

// Create DynamoDB DocumentClient
const dynamodb = new DynamoDBClient({
  region: process.env.Aws_region,
  credentials: {
    accessKeyId: process.env.Aws_accessKeyId,
    secretAccessKey: process.env.Aws_secretAccessKey,
  },
});

// export { s3Client, dynamoDBClient };
// export const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(req.body,"req.bodyyyyyyyyy")

    const { user_type } = req.body;
    console.log(req.files, "imnulterrrrrrrrrrrrr");
    console.log(req.body, "req bodddddddddy");
    let destination = "./uploads/";
    if (user_type == "vendor") {
      destination += "vendor/";
    } else if (user_type == "seller") {
      destination += "seller/";
    } else if (user_type == "logistic") {
      destination += "logistic/";
    } else if (user_type == "employee") {
      destination += "employee/";
    } else {
      destination += "other/";
    }
    cb(null, destination);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({
  storage: storage,
});

//category-images add or edit
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destination = "./uploads/category";
    cb(null, destination);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadCategory = multer({
  storage: categoryStorage,
});

//product add to upload folder
const storageProductAdd = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(req.files, "111111@@@!@#!@#!@#!@#req.filesssss");
    let destination = "./uploads/vendor/product";
    cb(null, destination);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadProduct = multer({
  storage: storageProductAdd,
});

// Function to upload image to S3
export const uploadImageToS3 = async (fileName, filePath, type) => {
  try {
    const fileContent = await fs.readFile(filePath);
    let fileNameTemp = fileName;
    if (type == "product") {
      fileNameTemp = `vendor/product/${fileName}`;
    }
    // Bucket name: aqad-documents
    // Location: me-central-1
    const params = {
      Bucket: "aqad-documents",
      Key: fileNameTemp,
      Body: fileContent,
      //   ACL: 'public-read' // Set the access control list for the object
    };
    console.log(params, "paramsnsns");
    // const data = await s3.upload(params).promise();
    // Execute the PutObjectCommand
    const command = new PutObjectCommand(params);
    const response = await s3.send(command);
    console.log("File uploaded successfully:", response.ETag);
    return response;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

// Function to delete a file from S3
export const deleteImageFromS3 = async (
  fileName,
  type,
  bucketName = "aqad-documents"
) => {
  let fileNameTemp = fileName;
  if (type == "product") {
    fileNameTemp = `vendor/product/${fileName}`;
  }
  try {
    const params = {
      Bucket: bucketName,
      Key: fileNameTemp,
    };
    const command = new DeleteObjectCommand(params);
    const data = await s3.send(command);
    // const data = await s3.deleteObject(params).promise();
    console.log("File deleted successfully");
    return data; // Returns data about the deletion
  } catch (err) {
    console.error("Error deleting file:", err);
    throw err;
  }
};

// Function to store metadata in DynamoDB//
export const storeImageMetadata = async (fileName, imageUrl) => {
  const params = {
    TableName: "documents",
    Item: {
      filename: fileName,
      imageUrl: imageUrl,
      uploadedAt: Date.now(), // You can add more metadata here
    },
  };

  try {
    await dynamodb.put(params).promise();
    console.log("Metadata stored successfully");
  } catch (err) {
    console.error("Error storing metadata:", err);
    throw err;
  }
};

// Usage
// const imageName = 'example.jpg';
// const imagePath = '/path/to/example.jpg';

// uploadImageToS3(imageName, imagePath)
//   .then(imageUrl => storeImageMetadata(imageName, imageUrl))
//   .catch(err => {
//     console.error('Error:', err);
//   });

export const deleteImageFRomLocal = async (filePath) => {
  try {
    try {
      console.log("imageName","iiaiaiaia", filePath,"filepathhtht",  "location","location")
      //  fs.unlinkSync(filePath).then((el)=>console.log(el,"errroror")).catch((el)=>console.log(el,"elelel"));
       await fs.unlink(filePath);
      } catch (er) {
      console.log(er,"asdads");
    }
  } catch (err) {
    console.log(err);
  }
};
