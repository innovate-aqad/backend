import AWS from "aws-sdk";

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.Aws_accessKeyId,
  secretAccessKey: process.env.Aws_secretAccessKey,
});

const lambda = new AWS.Lambda();


export const LamdaFunction=async(req,res)=>{
    const params = {
        FunctionName: 'YOUR_FUNCTION_NAME', // Function name Lamda 
        InvocationType: 'RequestResponse', // Sync invocation
        LogType: 'Tail', // Include execution log
        Payload: JSON.stringify({/* Your input data here */})
      };
      lambda.invoke(params, (err, data) => {
        if (err) {
          console.error(err);
        } else {
          console.log(data.Payload);
        }
      });
}

