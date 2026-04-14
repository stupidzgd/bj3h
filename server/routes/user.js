const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Op } = require('sequelize');

// 获取用户列表接口
router.get('/users', async (req, res) => {
  try {
    const { username, name } = req.query;
    
    // 构建查询条件
    const where = {};
    if (username) {
      where.username = { [Op.like]: `%${username}%` };
    }
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    
    const users = await User.findAll({ where });
    return res.status(200).json({ status: 0, users });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

// 添加用户接口
router.post('/user', async (req, res) => {
  try {
    const { id, name, description } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { username: id } });
    if (existingUser) {
      return res.status(200).json({ status: 1, message: '用户已存在' });
    }
    
    // 加密默认密码
    const hashedPassword = await User.hashPassword('123456');
    
    // 创建新用户
    const newUser = await User.create({
      username: id,
      password: hashedPassword,
      role: 'admin', // 默认角色为admin
      name,
      description
    });
    
    return res.status(200).json({ status: 0, message: '添加成功' });
  } catch (error) {
    console.error('添加用户错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

// 编辑用户接口
router.put('/user', async (req, res) => {
  try {
    const { id, name, description } = req.body;
    
    // 查找用户
    const user = await User.findOne({ where: { username: id } });
    if (!user) {
      return res.status(200).json({ status: 1, message: '用户不存在' });
    }
    
    // 更新用户信息
    await user.update({
      name,
      description
    });
    
    return res.status(200).json({ status: 0, message: '编辑成功' });
  } catch (error) {
    console.error('编辑用户错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

// 删除用户接口
router.delete('/user', async (req, res) => {
  try {
    const { id } = req.body;
    
    // 查找用户
    const user = await User.findOne({ where: { username: id } });
    if (!user) {
      return res.status(200).json({ status: 1, message: '用户不存在' });
    }
    
    // 不允许删除管理员用户
    if (id === 'admin') {
      return res.status(200).json({ status: 1, message: '不能删除管理员用户' });
    }
    
    // 删除用户
    await user.destroy();
    
    return res.status(200).json({ status: 0, message: '删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

// 禁用/启用用户接口
router.put('/user/status', async (req, res) => {
  try {
    const { id, status } = req.body;
    
    // 查找用户
    const user = await User.findOne({ where: { username: id } });
    if (!user) {
      return res.status(200).json({ status: 1, message: '用户不存在' });
    }
    
    // 不允许禁用管理员用户
    if (id === 'admin') {
      return res.status(200).json({ status: 1, message: '不能禁用管理员用户' });
    }
    
    // 更新用户状态
    await user.update({ status });
    
    return res.status(200).json({ status: 0, message: status === 1 ? '启用成功' : '禁用成功' });
  } catch (error) {
    console.error('修改用户状态错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

// 重置密码接口
router.put('/user/reset-password', async (req, res) => {
  try {
    const { id } = req.body;
    
    // 查找用户
    const user = await User.findOne({ where: { username: id } });
    if (!user) {
      return res.status(200).json({ status: 1, message: '用户不存在' });
    }
    
    // 加密默认密码
    const hashedPassword = await User.hashPassword('123456');
    
    // 更新密码
    await user.update({ password: hashedPassword });
    
    return res.status(200).json({ status: 0, message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

// 验证用户ID接口
router.post('/user/validatUserID', async (req, res) => {
  try {
    const { id } = req.body;
    
    // 查找用户
    const existingUser = await User.findOne({ where: { username: id } });
    if (existingUser) {
      return res.status(200).json({ status: 1, message: '该用户ID已存在' });
    }
    
    return res.status(200).json({ status: 0, message: '该用户ID可用' });
  } catch (error) {
    console.error('验证用户ID错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

module.exports = router;