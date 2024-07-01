import { DataTypes } from "sequelize";
import dbConnection from "../config/dbConfig.js";


const BrandModel = dbConnection.define(
  "brand",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey:true
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: false, tableName: "brand" }
);
export default BrandModel;
