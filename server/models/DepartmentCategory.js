const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DepartmentCategory = sequelize.define('DepartmentCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1, // 1: 启用, 0: 禁用
    allowNull: false
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'dict_department_categories',
  timestamps: true
});

module.exports = DepartmentCategory;