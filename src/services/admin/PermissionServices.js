import { v4 as uuidv4 } from "uuid";
import ApiEndpoint from "../../models/ApiEndPointModel.js";
import Permission from "../../models/PermissionModuleModel.js";

class PermissionServices {
  async addData(req, res) {
    try {
      let { title, backend_routes, frontend_routes, status, id } = req.body;
      title = title?.trim();
      console.log(req.body,"data--->")
      const timestamp = new Date().toISOString();
  
      const allRouteIds = [...new Set([...backend_routes, ...frontend_routes])];
   console.log("flow1------>")
      // Check if all route IDs exist in ApiEndpoint (similar to your DynamoDB BatchGetItemCommand logic)
      const fetchedItems = await ApiEndpoint.findAll({
        where: {
          uuid: allRouteIds // Assuming id is the primary key in ApiEndpoint
        }
      });
      console.log("flow2------>")

      const fetchedIds = new Set(fetchedItems.map(item => item.uuid));
  
      const missingIds = allRouteIds.filter(routeId => !fetchedIds.has(routeId));
      if (missingIds.length > 0) {
        return res.status(400).json({
          message: "Some route IDs are invalid.",
          missingIds,
          statusCode: 400,
          success: false,
        });
      }
  
      if (id) {
        // Update existing permission record
        const findData = await Permission.findOne({
          where: {
            uuid:id
          }
        });
        if (!findData) {
          return res.status(400).json({ message: "Document not found", statusCode: 400, success: false });
        }
        await Permission.update({
          title: title || findData.title,
          status: status || 'active',
          backend_routes: backend_routes.map(route => ({ route })),
          frontend_routes: frontend_routes.map(route => ({ route })),
          updatedAt: timestamp
        }, {
          where: {
            uuid:id
          }
        });
        return res.status(200).json({ message: "Data updated successfully", statusCode: 200, success: true });
      } else {
        console.log("yesss----->")
        // Create new permission record
        const dataExist = await Permission.findOne({
          where: {
            title:title
          }
        });
        if (dataExist) {
          return res.status(400).json({
            message: "Title must be unique",
            statusCode: 400,
            success: false,
          });
        }
       console.log("yupp data still here--->")
        const newPermission = await Permission.create({
          uuid: uuidv4().replace(/-/g, ""),
          title,
          backend_routes: backend_routes.map(route => ({ route })),
          frontend_routes: frontend_routes.map(route => ({ route })),
          status: status || 'active',
          created_by: req.userData?.id,
          createdAt: timestamp,
          updatedAt: timestamp
        });
        return res.status(201).json({
          data: newPermission.id,
          message: "Permission added successfully",
          statusCode: 201,
          success: true,
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message, success: false, statusCode: 500 });
    }
  }
  
  // async getActiveData(req, res) {
  //   try {
  //     const params = {
  //       TableName: "api_endpoint",
  //       FilterExpression: "#status = :status",
  //       ExpressionAttributeNames: {
  //         "#status": "status",
  //       },
  //       ExpressionAttributeValues: {
  //         ":status": "active",
  //       },
  //     };

  //     let getAll = await dynamoDBClient.scan(params);
  //     getAll = getAll?.sort((a, b) => b?.created_at - a?.created_at);
  //     return res.status(200).json({
  //       message: "Fetch data",
  //       data: getAll,
  //       success: true,
  //       statusCode: 200,
  //     });
  //   } catch (err) {
  //     return res
  //       .status(500)
  //       .json({ message: err?.message, success: false, statusCode: 500 });
  //   }
  // }

  //get all data 

  async getAllData(req, res) {
    try {
      //console.log(req.userData?.user_type, "req.userData?.user_type  @#@");
  
      let findAllParams = {};
  
      // Apply filters based on user type and query status
      if (!(req.userData.user_type === 'super_admin' && req.query.status === 'all')) {
        findAllParams.where = {
          status: 'active'
        };
      }
  
      // Fetch all permissions
      let get = await Permission.findAll(findAllParams);
  
      //let get = getAll.map(el => simplifySequelizeResponse(el));
  
      // Additional filtering logic based on user type (vendor or seller)
      if (req.userData?.user_type == 'vendor' || req.userData?.user_type == 'seller') {
        get = get.filter(el =>
          el?.title?.toLowerCase()?.includes('product') ||
          el?.title?.toLowerCase()?.includes('order') ||
          el?.title?.toLowerCase()?.includes('inventory')
        );
      }
  
      return res.status(200).json({
        message: "Fetch data",
        data: get,
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      console.error(err, "error getting data");
      return res.status(500).json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async changestatus(req, res) {
    try {
      console.log("hii--->")
      const { id, status } = req.body;
    console.log(id,status,"hdshshikuhi")
      // Check if the permission exists
      const existingPermission = await Permission.findOne({
        where: {
          uuid:id
        }
      });
      console.log(existingPermission)
      if (existingPermission==null) {
        return res.status(400).json({
          message: 'Data not found------>',
          statusCode: 400,
          success: false
        });
      }
  
      // Update status
      await Permission.update({
        status
      }, {
        where: {
          uuid:id
        }
      });
  
      return res.status(200).json({
        message: "Status updated successfully",
        success: true,
        statusCode: 200,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
  
  async deleteEndpointById(req, res) {
  try {
    const { id } = req.query;
    console.log("here the flow----->")

    // Check if the permission exists
    const existingPermission = await Permission.findOne({
      where: {
        uuid:id
      }
    });

    if (!existingPermission) {
      return res.status(400).json({
        message: 'Data not found or deleted already--->',
        statusCode: 400,
        success: false
      });
    }

    // Delete the permission
    await Permission.destroy({
      where: {
        uuid:id
      }
    });

    return res.status(200).json({
      message: "Data deleted successfully",
      statusCode: 200,
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err?.message, success: false, statusCode: 500 });
  }
}

}

const PermissionServicesObj = new PermissionServices();
export default PermissionServicesObj;
