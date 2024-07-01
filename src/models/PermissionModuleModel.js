import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js'; // Assuming you have a sequelize instance in this file

const PermissionModule = sequelize.define('PermissionModule', {
  // id: {
  //   type: DataTypes.BIGINT,
  //   primaryKey: true,
  //   autoIncrement: true, // Assuming IDs are auto-incremented
  //   allowNull: false
  // },
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey:true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  backend_routes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  frontend_routes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'permission_modules',
  timestamps: false, // Disable automatic timestamp fields (createdAt, updatedAt)
  underscored: true, // Use snake_case for column names
  paranoid: true, // Enable soft deletes (deletedAt)
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});

export default PermissionModule;
