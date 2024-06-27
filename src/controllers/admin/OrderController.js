import { BrandSchema, BrandStatusSchema, SubBrandFetchByMainCategoryIdSchema, deleteBrandSchema } from "../../helpers/validateBrand.js";
import { OrderSchema } from "../../helpers/validateOrder.js";
import { SubCatFetchByMainCategoryIdSchema, SubCategorySchema, SubCategoryStatusSchema, deleteSubCategorySchema } from "../../helpers/validateSubCategory.js";
import BrandServicesObj from "../../services/admin/BrandServices.js";
import OrderServicesObj from "../../services/admin/OrderServices.js";
import SubCategoryServicesObj from "../../services/admin/SubCategoryServices.js";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

class OrderController {
  async create_order(req, res) {// only for seller/retailor
    try {
      // console.log(req.body, "req.bod!@#!@#",req.userData,"er00")
      // if(req.userData?.user_type!='seller'){
      //   return res.status(400).json({message:"Only Seller can place order",statusCode:400,success:false})
      // }
      // return 
      // let { error } = OrderSchema.validate(req.body, options);
      // if (error) {
      //   return res.status(400).json({
      //     message: error.details[0]?.message,
      //     success: false,
      //     statusCode: 400,
      //   });
      // }
      await OrderServicesObj.add(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async edit_status_(req, res) {
    try {
      let { error } = BrandStatusSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
      await BrandServicesObj.change_status(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
  
  async get_(req, res) {
    try {
      await OrderServicesObj.get_data(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
  
  // async get_by_main_cat_id(req, res) {
  //   try {
  //     let { error } = SubBrandFetchByMainCategoryIdSchema .validate(req.query, options);
  //     if (error) {
  //       return res.status(400).json({
  //         message: error.details[0]?.message,
  //         success: false,
  //         statusCode: 400,
  //       });
  //     }
  //     await BrandServicesObj.get_Brand_by_main_cat_id(req, res);
  //   } catch (err) {
  //     return res
  //       .status(500)
  //       .json({ message: err?.message, success: false, statusCode: 500 });
  //   }
  // }

  async deleteData(req, res) {
    try {
      let { error } = deleteBrandSchema.validate(req.query, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
      await BrandServicesObj.delete(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }
}
const OrderControllerObj = new OrderController();
export default OrderControllerObj;
