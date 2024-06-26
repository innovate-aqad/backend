import AWS from 'aws-sdk';
import fs from 'fs/promises';
import multer from 'multer';
//
// Configure AWS SDK
AWS.config.update({
  region: process.env.Aws_region, // Replace with your region
  accessKeyId: process.env.Aws_accessKeyId, // Replace with your AWS Access Key ID
  secretAccessKey: process.env.Aws_secretAccessKey, // Replace with your AWS Secret Access Key
});

// Create S3 instance
const s3 = new AWS.S3();

// Create DynamoDB instance
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const upload = multer({ dest: 'uploads/' });

// Function to upload image to S3
export const uploadImageToS3 = async (fileName, filePath) => {
  try {
    const fileContent = await fs.readFile(filePath);
    // Bucket name: aqad-documents
    // Location: me-central-1
    const params = {
      Bucket: 'aqad-documents',
      Key: fileName,
      Body: fileContent,
    //   ACL: 'public-read' // Set the access control list for the object
    };

    const data = await s3.upload(params).promise();
    console.log('File uploaded successfully:', data.Location);
    return data.Location;
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
};

// Function to store metadata in DynamoDB//
export const storeImageMetadata = async (fileName, imageUrl) => {
  const params = {
    TableName: 'documents',
    Item: {
      filename: fileName,
      imageUrl: imageUrl,
      uploadedAt: Date.now() // You can add more metadata here
    }
  };

  try {
    await dynamodb.put(params).promise();
    console.log('Metadata stored successfully');
  } catch (err) {
    console.error('Error storing metadata:', err);
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







