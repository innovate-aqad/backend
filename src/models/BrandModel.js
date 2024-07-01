import { DataTypes } from "sequelize";
import dbConnection from "../config/dbConfig.js";

const BrandModel = dbConnection.define(
  "brands",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      // autoIncrement: true,
      primaryKey: true
    },
    category_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active"
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false
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
  { timestamps: false, tableName: "brands" }
);

export default BrandModel;
