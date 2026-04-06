const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DictType = sequelize.define('DictType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '字典类型编码'
  },
  type_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '字典类型名称'
  },
  description: {
    type: DataTypes.STRING(255),
    comment: '描述'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'dict_type',
  timestamps: false
});

module.exports = DictType;