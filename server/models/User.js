const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

// 密码加密函数
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// 密码验证函数
const verifyPassword = async (password, hashedPassword, user) => {
  try {
    // 检查hashedPassword是否是加密后的密码（bcrypt加密后的密码长度通常为60个字符左右）
    if (hashedPassword.length < 60) {
      // 如果不是加密后的密码，直接比较明文
      if (password === hashedPassword) {
        // 自动加密密码并更新数据库
        if (user) {
          const newHashedPassword = await hashPassword(password);
          await user.update({ password: newHashedPassword });
        }
        return true;
      }
      return false;
    }
    // 如果是加密后的密码，使用bcrypt验证
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('密码验证错误:', error);
    // 如果验证失败，尝试直接比较明文
    if (password === hashedPassword && user) {
      // 自动加密密码并更新数据库
      const newHashedPassword = await hashPassword(password);
      await user.update({ password: newHashedPassword });
      return true;
    }
    return false;
  }
};

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // 1: 启用, 0: 禁用
    allowNull: true
  },
  lastLoginTime: {
    type: DataTypes.DATE,
    defaultValue: null
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
  tableName: 'users',
  timestamps: true
});

// 添加静态方法
User.hashPassword = hashPassword;
User.verifyPassword = verifyPassword;

module.exports = User;