import { DataTypes } from "sequelize";
import dbConnection from "../config/dbConfig.js";


const CategoryModel = dbConnection.define(
  "category",
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
    category_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue:"active",
      // allowNull: true,
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
  { timestamps: false, tableName: "category" }
);
export default CategoryModel ;
