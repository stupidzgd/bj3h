const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 获取用户列表接口
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json({ status: 0, users });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

// 添加用户接口
router.post('/user', async (req, res) => {
  try {
    const { id, name, role, description } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { username: id } });
    if (existingUser) {
      return res.status(200).json({ status: 1, message: '用户已存在' });
    }
    
    // 创建新用户
    const newUser = await User.create({
      username: id,
      password: '123456', // 默认密码
      role,
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
    const { id, name, role, description } = req.body;
    
    // 查找用户
    const user = await User.findOne({ where: { username: id } });
    if (!user) {
      return res.status(200).json({ status: 1, message: '用户不存在' });
    }
    
    // 更新用户信息
    await user.update({
      name,
      role,
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

module.exports = router;