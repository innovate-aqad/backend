import { DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";
// models/ApiEndpoint.js
const ApiEndpoint = sequelize.define('ApiEndpoint', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  uuid: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    unique: true, // Ensure title is unique
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
  created_by: {
    type: DataTypes.STRING,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ApiEndpoint',
  timestamps: false,
});

export default ApiEndpoint;
