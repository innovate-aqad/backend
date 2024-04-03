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
  let filePath = `./src/uploads/${name}`;
  if (data == "category") {
    filePath = `./src/uploads/filterProduct/category/${name}`;
  } else if (data == "bestSeller") {
    filePath = `./src/uploads/bestSeller/${name}`;
  } else if (data == "gender") {
    filePath = `./src/uploads/filterProduct/gender/${name}`;
  } else if (data == "educationInfo") {
    filePath = `./src/uploads/educationCertificate/${name}`;
  }
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

export async function ImageFileCheckForUI(name, res, size) {
  const filePath = `./src/uploads/ui/${name}`;
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
  let filePath = `./src/uploads/${name}`;
  if (data == "category") {
    filePath = `./src/uploads/filterProduct/category/${name}`;
  } else if (data == "bestSeller") {
    filePath = `./src/uploads/bestSeller/${name}`;
  } else if (data == "gender") {
    filePath = `./src/uploads/filterProduct/gender/${name}`;
  } else if (data == "educationInfo") {
    filePath = `./src/uploads/educationCertificate/${name}`;
  }
  await fs.unlinkSync(filePath);
}
