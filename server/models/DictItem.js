const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const DictType = require('./DictType');

const DictItem = sequelize.define('DictItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '字典类型编码'
  },
  item_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '字典项编码'
  },
  item_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '字典项名称'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序顺序'
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
  tableName: 'dict_item',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['type_code', 'item_code']
    },
    {
      fields: ['type_code']
    }
  ]
});

// 建立关联关系
DictItem.belongsTo(DictType, {
  foreignKey: 'type_code',
  targetKey: 'type_code',
  onDelete: 'CASCADE'
});

module.exports = DictItem;