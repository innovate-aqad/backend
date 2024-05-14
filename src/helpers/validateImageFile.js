import fs from "fs";

function checkFileSignature(buffer) {
  const fileSignatures = {
    "89504E470D0A1A0A": "PNG",
    FFD8FFE0: "JPEG",
    FFD8FF: "JPG",
    "52494646": "WEBP",
    // Add more file signatures as needed
  };
  const hexSignature = buffer
    .slice(0, 8)
    .toString("hex")
    .toUpperCase();

  for (const signature in fileSignatures) {
    if (hexSignature.startsWith(signature)) {
      return fileSignatures[signature];
    }
  }
  return null;
}
const maxSize = 500 * 1024;
export async function ImageFileCheck(name, data, size) {
  let filePath = `./uploads/${name}`;
  if (data == "employee") {
    filePath = `./uploads/employee/${name}`;
  } else if (data == "logistic") {
    filePath = `./uploads/logistic/${name}`;
  } else if (data == "seller") {
    filePath = `./uploads/seller/${name}`;
  } else if (data == "vendor") {
    filePath = `./uploads/vendor/${name}`;
  }
  let check = fs.readFileSync(filePath);
  const filetype = checkFileSignature(check);
  
  if (filetype == "PNG" || filetype == "JPEG" || filetype == "WEBP") {
    if (size > maxSize) {
      // console.log(size,maxSize,"sssssssssss")
      await fs.unlinkSync(filePath);
      return "invalid file";
    } else {
      return "valid file";
    }
  } else if (filetype == null) {
    await fs.unlinkSync(filePath);
    return "invalid file";
  }
}

export async function ImageFileCheckForUI(name, res, size) {
  const filePath = `./uploads/ui/${name}`;
  // console.log(filePath,"filepasthhhhhhh")
  let check = fs.readFileSync(filePath);
  const filetype = checkFileSignature(check);
  if (filetype == "PNG" || filetype == "JPEG" || filetype == "WEBP") {
    if (size > maxSize) {
      // console.log(size,maxSize,"sssssssssss")
      await fs.unlinkSync(filePath);
      return "invalid file";
    } else {
      return "valid file";
    }
  } else if (filetype == null) {
    // res.status(400).json({
    //   message: "Invalid file uploaded",
    //   success: false,
    //   statusCode: 400,
    // });
    await fs.unlinkSync(filePath);
    return "invalid file";
  }
}

export async function removefIle(name, data) {
  let filePath = `./uploads/${name}`;
  if (data == "employee") {
    filePath = `./uploads/employee/${name}`;
  } else if (data == "logistic") {
    filePath = `./uploads/logistic/${name}`;
  } else if (data == "seller") {
    filePath = `./uploads/seller/${name}`;
  } else if (data == "vendor") {
    filePath = `./uploads/vendor/${name}`;
  }
  await fs.unlinkSync(filePath);
}
