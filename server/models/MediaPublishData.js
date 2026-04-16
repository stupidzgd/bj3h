const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ProvinceRatio = require('./ProvinceRatio');

const MediaPublishData = sequelize.define('MediaPublishData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false
  },
  article_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_first_release: {
    type: DataTypes.STRING,
    allowNull: true
  },
  publish_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reading_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  share_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  complete_rate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avg_play_time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  like_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  collect_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  content_category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  genre_category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department_category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true
  },
  special_planning: {
    type: DataTypes.STRING,
    allowNull: true
  },
  video_duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hot_search_platform: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hot_search_position: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  hot_search_duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hot_search_reading_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reporter: {
    type: DataTypes.STRING,
    allowNull: true
  },
  media_column: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_region_distribution: {
    type: DataTypes.STRING,
    allowNull: true
  },
  beijing_ratio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  non_beijing_ratio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  import_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'media_publish_data',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['article_id', 'platform', 'title']
    }
  ]
});

// 建立关联关系
MediaPublishData.hasMany(ProvinceRatio, {
  foreignKey: 'media_publish_id',
  as: 'provinceRatios'
});

ProvinceRatio.belongsTo(MediaPublishData, {
  foreignKey: 'media_publish_id'
});

module.exports = MediaPublishData;