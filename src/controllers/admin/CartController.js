import {
  BrandSchema,
  BrandStatusSchema,
  SubBrandFetchByMainCategoryIdSchema,
  deleteBrandSchema,
} from "../../helpers/validateBrand.js";
import {
  CartSchema,
  deleteProductFromCartSchema,
} from "../../helpers/validateCart.js";
import { OrderSchema } from "../../helpers/validateOrder.js";
import {
  SubCatFetchByMainCategoryIdSchema,
  SubCategorySchema,
  SubCategoryStatusSchema,
  deleteSubCategorySchema,
} from "../../helpers/validateSubCategory.js";
import BrandServicesObj from "../../services/admin/BrandServices.js";
import CartServicesObj from "../../services/admin/CartServices.js";
import OrderServicesObj from "../../services/admin/OrderServices.js";
import SubCategoryServicesObj from "../../services/admin/SubCategoryServices.js";

const options = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};

class CartController {
  async add_product_cart(req, res) {
    // only for seller/retailor
    try {
      // console.log(req.body, "req.bod!@#!@#",req.userData,"er00")
      if (req.userData?.user_type != "seller") {
        return res
          .status(400)
          .json({
            message: "Only Seller add product to cart",
            statusCode: 400,
            success: false,
          });
      }
      // return
      let { error } = CartSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }

      await CartServicesObj.AddToCart(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  async deleteProduct(req, res) {
    try {
      let { error } = deleteProductFromCartSchema.validate(req.body, options);
      if (error) {
        return res.status(400).json({
          message: error.details[0]?.message,
          success: false,
          statusCode: 400,
        });
      }
      await CartServicesObj.deleteFromCart(req,res)
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }
  async emptyCart(req, res) {
    try {
      await CartServicesObj.emptyCartData(req,res)
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, statusCode: 500, success: false });
    }
  }

  async fetch_data(req, res) {
    try {
      await CartServicesObj.fetch_data_(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }


  async fetch_data_tmp(req, res) {
    try {
      await CartServicesObj.editCa(req, res);
    } catch (err) {
      return res
        .status(500)
        .json({ message: err?.message, success: false, statusCode: 500 });
    }
  }

  
}
const CartControllerObj = new CartController();
export default CartControllerObj;
