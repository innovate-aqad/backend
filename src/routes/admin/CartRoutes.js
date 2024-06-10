import express from "express";
import { authorize } from "../../middlewares/auth.js";
import CartControllerObj from "../../controllers/admin/CartController.js";

const CartRoutes = express.Router();
CartRoutes.post("/add", authorize, CartControllerObj.add_product_cart);
CartRoutes.delete("/delete_from_cart", authorize, CartControllerObj.deleteProduct);
CartRoutes.delete("/empty_cart", authorize, CartControllerObj.emptyCart);
CartRoutes.get("/fetch_data", authorize, CartControllerObj.fetch_data);

export default CartRoutes;
