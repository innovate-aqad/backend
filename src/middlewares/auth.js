import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import AdminUserModel from "../models/AdminUserModel.js";
import { environmentVars } from "../config/environmentVar.js";
import RolesModel from "../models/RolesModel.js";
import PermissionModuleModel from "../models/PermissionModuleModel.js";
import docClient from "../config/dbConfig.js";

export const authorize = async (req, res, next) => {
  let _secrate = req?.cookies?._token;

    // console.log(_secrate,"_secrate_secrate_secrate_secrate")
  try {
    const proof = jwt.verify(_secrate, environmentVars.jwtSecret, {
      algorithm: "HS512",
    });
    // console.log(proof,"proof qwerty")
    // return
    const userData = await UserModel.findOne({
      where: { id: proof.id },
      raw: true,
    });
    if (!userData) {
      return res
        .status(400)
        .json({ message: "User not found", success: false, statusCode: 400 });
    }
    req.userData = userData;
    req.id = userData.id;
    return next();
  } catch (err) {
    // console.log(err,"EEEEErrroror")
    return res.status(401).json({
      success: false,
      message: "Please login to continue...",
      statusCode: 401,
    });
  }
};

async function checkPermissionAccess(req, res, userData) {
  try {
  let roleData = {};
  if (userData?.role_id) {
    roleData = await RolesModel.findOne({
      where: { id: userData?.role_id },
      raw: true,
    });
  }
  // console.log(roleData, "rolelelleeelele");
  let fetchPermissionData = await PermissionModuleModel.findAll({
    where: {
      id: roleData?.permissions,
      status: "active",
      deleted_at: null,
    },
    raw: true,
  });
  if (fetchPermissionData?.length == 0) {
    res.status(400).json({
      message: "No permission available",
      statusCode: 400,
      success: false,
    });
    return;
  }
  // console.log(fetchPermissionData, "fetchdataaPErmisisosn @!!@#!@#");
  const backendRouteIds = fetchPermissionData.flatMap(
    (permission) => permission.backend_routes
  );
  // console.log(backendRouteIds, "backendroutes idssssssss");
  const backendRoutesData = await docClient.query(
    `SELECT * FROM api_endpoint WHERE id IN (${backendRouteIds.join(",")})`,
    { type: docClient.QueryTypes.SELECT }
  );
  // console.log(
  //   backendRoutesData,
  //   "backendRoutesDatabackendRoutesDatabackendRoutesData"
  // );
  let findPermissionExist;
  let manageUrl;
  if (Object.keys(req.params).length > 0) {
    const fullUrl = req.originalUrl;

    let keys = Object.keys(req.params); // Get all keys
    // console.log(keys, "keysssssssssss", req.params);
    keys = keys?.toString();
    let values = Object.values(req.params); // Get all values
    values = values?.toString();
    // keys
    // console.log(keys, "Eess", values);
    // return;

    const dynamicPart = values.toString(); // Assuming req.params.id contains the dynamic ID
    const baseUrl = fullUrl.replace(`/${dynamicPart}`, "");
    // console.log(baseUrl, "baseUrlbaseUrlbaseUrl");
    manageUrl = baseUrl;
  } else {
    manageUrl = req.originalUrl?.split("?");
    // console.log(manageUrl, "aaaaaaaaaaaasssssssssssssssssss");
    manageUrl = manageUrl[0];
  }
  findPermissionExist = backendRoutesData.some((el) => el?.name == manageUrl);
  // console.log(
  //   findPermissionExist,
  //   " findPermissionExist  Backend routes data",
  //   manageUrl,
  //   "QWEQE"
  // );
  // if (!findPermissionExist) {
  //   return res
  //     .status(400)
  //     .json({
  //       message: "Permission required for this action",
  //       statusCode: 400,
  //       success: false,
  //     });
  // }else{
  return findPermissionExist;
  // }

  // return false;
  } catch (err) {
    return res
      .status(500)
      .json({ message: err?.message, statusCode: 500, success: false });
  }
}

export const authorizeAdmin = async (req, res, next) => {
  let _secrate = req?.cookies?._tokenAdmin || req?.cookies?._tokenSubAdmin;
  // console.log(_secrate, "_secrate_secrate_secrate_secrate");
  try {
    const proof = jwt.verify(_secrate, environmentVars.jwtSecretAdmin, {
      algorithm: "HS512",
    });
    // console.log(proof, "proof qwerty");
    // return
    const userData = await AdminUserModel.findOne({
      where: { id: proof.id },
      raw: true,
    });
    if (!userData) {
      return res
        .status(400)
        .json({ message: "Admin not found", success: false, statusCode: 400 });
    }

    if (userData && userData?.role != "super_admin") {
      let get = await checkPermissionAccess(req, res, userData);
      // console.log(get, "Geteeeeee");
      if (!get) {
        return res.status(400).json({
          message: "Permission required for this action",
          statusCode: 400,
          success: false,
        });
      }
      // return;
    }
    req.userData = userData;
    req.id = userData.id;
    return next();
  } catch (err) {
    // console.log(err,"EEEEErrroror")
    return res.status(401).json({
      success: false,
      message: "Please login to continue...",
      statusCode: 401,
    });
  }
};

export const authorizeSuperAdmin = async (req, res, next) => {
  let _secrate = req?.cookies?._tokenAdmin;
  //   console.log(_secrate,"_secrate_secrate_secrate_secrate")
  try {
    const proof = jwt.verify(_secrate, environmentVars.jwtSecretAdmin, {
      algorithm: "HS512",
    });
    // console.log(proof,"proof qwerty")
    const userData = await AdminUserModel.findOne({
      where: { id: proof.id },
      raw: true,
    });
    if (!userData) {
      return res.status(400).json({
        message: "Super admin not found",
        success: false,
        statusCode: 400,
      });
    }
    req.userData = userData;
    req.id = userData.id;
    return next();
  } catch (err) {
    // console.log(err,"EEEEErrroror")
    return res
      .status(401)
      .json({ success: false, message: err?.message, statusCode: 401 });
  }
};
