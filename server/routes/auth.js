const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(200).json({ status: 1, message: '用户名或密码错误' });
    }
    
    // 验证密码
    if (user.password !== password) {
      return res.status(200).json({ status: 1, message: '用户名或密码错误' });
    }
    
    // 更新最后登录时间，使用当前时间（本地时区）
    await user.update({ lastLoginTime: new Date() });
    
    // 生成 token，包含用户名和过期时间（12小时后）
    const expireTime = Date.now() + 12 * 60 * 60 * 1000; // 12小时过期
    const token = `${username}-${expireTime}-token`;
    
    return res.status(200).json({ status: 0, token });
  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

// 获取用户信息接口
router.post('/userInfo', async (req, res) => {
  try {
    console.log('获取用户信息请求:', req.body);
    
    // 从请求体中获取token
    const { token } = req.body;
    
    // 从token中提取用户名和过期时间
    const tokenParts = token ? token.split('-') : [];
    if (tokenParts.length < 3) {
      return res.status(200).json({ status: 1, message: '无效的token格式' });
    }
    
    const username = tokenParts[0];
    const expireTime = parseInt(tokenParts[1]);
    
    if (!username || isNaN(expireTime)) {
      return res.status(200).json({ status: 1, message: '无效的token' });
    }
    
    // 检查token是否过期
    if (Date.now() > expireTime) {
      return res.status(200).json({ status: 1, message: 'token已过期' });
    }
    
    // 从数据库中查询用户信息
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(200).json({ status: 1, message: '用户不存在' });
    }
    
    // 构建用户信息对象
    const userInfo = {
      id: user.id,
      role: 'admin', // 保持默认角色为admin
      name: user.name || user.username, // 使用数据库中的name字段，如果不存在则使用username
      username: user.username, // 返回username字段
      password: user.password, // 返回密码字段
      avatar: '/assets/images/icon-logo.png',
      description: user.description || '拥有系统内所有菜单和路由权限',
      lastLoginTime: user.lastLoginTime ? new Date(user.lastLoginTime).toISOString() : null // 返回最后登录时间（ISO格式）
    };
    
    console.log('返回的用户信息:', userInfo);
    return res.status(200).json({ status: 0, userInfo });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

// 登出接口
router.post('/logout', async (req, res) => {
  try {
    return res.status(200).json({ status: 0, data: 'success' });
  } catch (error) {
    console.error('登出错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

// 修改个人信息接口
router.post('/updateProfile', async (req, res) => {
  try {
    console.log('修改个人信息请求:', req.body);
    
    const { username, name, password, description, token } = req.body;
    
    if (!username) {
      return res.status(200).json({ status: 1, message: '账号不能为空' });
    }
    
    // 验证token
    if (!token) {
      return res.status(200).json({ status: 1, message: '缺少token' });
    }
    
    // 从token中提取用户名和过期时间
    const tokenParts = token.split('-');
    if (tokenParts.length < 3) {
      return res.status(200).json({ status: 1, message: '无效的token格式' });
    }
    
    const tokenUsername = tokenParts[0];
    const expireTime = parseInt(tokenParts[1]);
    
    if (!tokenUsername || isNaN(expireTime)) {
      return res.status(200).json({ status: 1, message: '无效的token' });
    }
    
    // 检查token是否过期
    if (Date.now() > expireTime) {
      return res.status(200).json({ status: 1, message: 'token已过期' });
    }
    
    // 检查token中的用户名是否与请求中的用户名一致
    if (tokenUsername !== username) {
      return res.status(200).json({ status: 1, message: 'token与账号不匹配' });
    }
    
    // 查找用户
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(200).json({ status: 1, message: '用户不存在' });
    }
    
    // 更新用户信息
    await user.update({
      name,
      password,
      description
    });
    
    console.log('个人信息修改成功');
    return res.status(200).json({ status: 0, message: '个人信息修改成功' });
  } catch (error) {
    console.error('修改个人信息错误:', error);
    return res.status(500).json({ status: 1, message: '服务器内部错误' });
  }
});

module.exports = router;