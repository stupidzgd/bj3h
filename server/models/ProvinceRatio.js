const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProvinceRatio = sequelize.define('ProvinceRatio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  media_publish_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'media_publish_data',
      key: 'id'
    }
  },
  province_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ratio: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'province_ratio',
  timestamps: false
});

module.exports = ProvinceRatio;