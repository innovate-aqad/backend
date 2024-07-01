import { DataTypes } from "sequelize";
import dbConnection from "../config/dbConfig.js";

const ProductsModels = dbConnection.define(
  "products",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    brand_id: {
      type: DataTypes.BIGINT
    },
    category_id: {
      type: DataTypes.BIGINT
    },
    subcategory_id: {
      type: DataTypes.BIGINT
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    universal_standard_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active"
    },
    created_by: {
      type: DataTypes.BIGINT
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  { timestamps: false, tableName: "products" }
);

export default ProductsModels;
