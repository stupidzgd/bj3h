const Platform = require('../models/Platform');

// 获取所有平台
exports.getAllPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.findAll({
      order: [['sort', 'ASC']]
    });
    res.status(200).json({
      status: 0,
      data: platforms,
      message: '获取平台列表成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取平台列表失败',
      error: error.message
    });
  }
};

// 获取指定平台
exports.getPlatformById = async (req, res) => {
  try {
    const { id } = req.params;
    const platform = await Platform.findByPk(id);
    if (!platform) {
      return res.status(404).json({
        status: 1,
        message: '平台不存在'
      });
    }
    res.status(200).json({
      status: 0,
      data: platform,
      message: '获取平台成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取平台失败',
      error: error.message
    });
  }
};

// 按类型获取平台
exports.getPlatformsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const platforms = await Platform.findAll({
      where: { type },
      order: [['sort', 'ASC']]
    });
    res.status(200).json({
      status: 0,
      data: platforms,
      message: '获取平台列表成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取平台列表失败',
      error: error.message
    });
  }
};

// 创建新平台
exports.createPlatform = async (req, res) => {
  try {
    const { code, name, type, description, status, sort } = req.body;
    
    // 检查代码是否已存在
    const existingPlatform = await Platform.findOne({ where: { code } });
    if (existingPlatform) {
      return res.status(400).json({
        status: 1,
        message: '平台代码已存在'
      });
    }
    
    const platform = await Platform.create({
      code,
      name,
      type,
      description,
      status,
      sort
    });
    
    res.status(201).json({
      status: 0,
      data: platform,
      message: '创建平台成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '创建平台失败',
      error: error.message
    });
  }
};

// 更新平台
exports.updatePlatform = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, type, description, status, sort } = req.body;
    
    const platform = await Platform.findByPk(id);
    if (!platform) {
      return res.status(404).json({
        status: 1,
        message: '平台不存在'
      });
    }
    
    // 检查代码是否已被其他平台使用
    if (code && code !== platform.code) {
      const existingPlatform = await Platform.findOne({ where: { code } });
      if (existingPlatform) {
        return res.status(400).json({
          status: 1,
          message: '平台代码已存在'
        });
      }
    }
    
    await platform.update({
      code: code || platform.code,
      name: name || platform.name,
      type: type !== undefined ? type : platform.type,
      description: description !== undefined ? description : platform.description,
      status: status !== undefined ? status : platform.status,
      sort: sort !== undefined ? sort : platform.sort
    });
    
    res.status(200).json({
      status: 0,
      data: platform,
      message: '更新平台成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '更新平台失败',
      error: error.message
    });
  }
};

// 删除平台
exports.deletePlatform = async (req, res) => {
  try {
    const { id } = req.params;
    const platform = await Platform.findByPk(id);
    if (!platform) {
      return res.status(404).json({
        status: 1,
        message: '平台不存在'
      });
    }
    
    await platform.destroy();
    
    res.status(200).json({
      status: 0,
      message: '删除平台成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '删除平台失败',
      error: error.message
    });
  }
};