import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js'; // Adjust the path as needed

const Roles = sequelize.define('Roles', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
      allowNull: false,
  },
  // uuid: {
  //   type: DataTypes.CHAR(36),
  //   defaultValue: DataTypes.UUIDV4,
  //   allowNull: false,
  //   unique: true,
  // },
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