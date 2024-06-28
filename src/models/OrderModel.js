import { DataTypes } from "sequelize";
import dbConnection from "../config/dbConfig.js";
// import UserModel from "./UserModel.js";
// import UserAddressModel from "./UserAddressModel.js";
// import UserEducationInfoModel from "./UserEducationInfo.js";
const OrderModel = dbConnection.define(
  "orders",
  {
    // order_id: {
    //   type: DataTypes.BIGINT,
    //   allowNull: false,
    // },
    payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    po_box: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // variant_quantity: {
    //   type: DataTypes.JSON,
    //   allowNull: true,
    // },
    // coupon_id: {
    //   type: DataTypes.BIGINT,
    //   allowNull: true,
    // },
    // is_student_info_id: {
    //   type: DataTypes.BIGINT,
    //   defaultValue: 0,
    // },
    // sub_total: {
    //   type: DataTypes.BIGINT,
    //   allowNull: false,
    // },
    // delivery_charges: {
    //   type: DataTypes.BIGINT,
    //   allowNull: false,
    // },
    // payment_method: {
    //   type: DataTypes.ENUM(
    //     "Cash on Delivery",
    //     "Paypal",
    //     "Debit Card/Credit Card",
    //     "Razorpay"
    //   ),
    //   allowNull: false,
    //   defaultValue: "cod",
    // },
    // payment_status: {
    //   type: DataTypes.ENUM("complete", "failed", "pending"),
    //   allowNull: false,
    //   defaultValue: "pending",
    // },
    // payment_mode: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // status: {
    //   type: DataTypes.ENUM(
    //     "new",
    //     "processing",
    //     "delivered",
    //     "cancelled",
    //     "return-request",
    //     "return-failed",
    //     "return-success"
    //   ),
    //   allowNull: false,
    //   defaultValue: "new",
    // },
    // card_details: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // country_code: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    //   defaultValue: "IN",
    // },
    // card_data: {
    //   type: DataTypes.JSON,
    //   allowNull: true,
    // },
    // txn_id: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // order_date: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    // delivery_date: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    // },
    // ref_id: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // shipping_date: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    // },
    // out_for_delivery_date: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    // },
    // delivery_instructions: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: false, tableName: "orders" }
);
// OrderModel.belongsTo(UserModel, { foreignKey: "user_id" });
// OrderModel.belongsTo(UserAddressModel, { foreignKey: "address_id" });
// OrderModel.belongsTo(UserEducationInfoModel, {
//   foreignKey: "is_student_info_id",
// });
export default OrderModel;
