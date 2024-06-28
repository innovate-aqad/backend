import { Sequelize, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.HOST,
  dialect: 'mysql',
  logging: false,
});

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    defaultValue: uuidv4,
    primaryKey: true,
  },
  user_type: {
    type: DataTypes.ENUM,
    values: ['vendor', 'logistic', 'seller', 'employee', 'admin'],
    
  },
  profile_photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
   
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    
  },
  dob: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emirates_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  residence_visa: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passport: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  trade_license: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cheque_scan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vat_certificate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    
  },
  country_code: {
    type: DataTypes.STRING,
    
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_social_login: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'users'
});

export default User;
