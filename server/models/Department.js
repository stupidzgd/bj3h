const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const DepartmentCategory = require('./DepartmentCategory');

const Department = sequelize.define('Department', {
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
  departmentCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DepartmentCategory,
      key: 'id'
    }
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
  tableName: 'dict_departments',
  timestamps: true
});

// 建立关联关系
Department.belongsTo(DepartmentCategory, {
  foreignKey: 'departmentCategoryId',
  as: 'departmentCategory'
});

DepartmentCategory.hasMany(Department, {
  foreignKey: 'departmentCategoryId',
  as: 'departments'
});

module.exports = Department;