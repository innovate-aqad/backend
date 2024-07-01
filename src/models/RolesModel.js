import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js'; // Adjust the path as needed

const Roles = sequelize.define('Roles', {
  // id: {
  //   type: DataTypes.BIGINT,
  //   primaryKey: true,
  //   autoIncrement: true,
  //   allowNull: false,
  // },
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey:true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'active',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'roles',
  timestamps: true,
});

export default Roles;