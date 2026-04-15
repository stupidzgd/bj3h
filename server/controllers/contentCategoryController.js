const ContentCategory = require('../models/ContentCategory');

// 获取所有内容分类
exports.getAllContentCategories = async (req, res) => {
  try {
    const contentCategories = await ContentCategory.findAll({
      order: [['sort', 'ASC']]
    });
    res.status(200).json({
      status: 0,
      data: contentCategories,
      message: '获取内容分类列表成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取内容分类列表失败',
      error: error.message
    });
  }
};

// 获取指定内容分类
exports.getContentCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const contentCategory = await ContentCategory.findByPk(id);
    if (!contentCategory) {
      return res.status(404).json({
        status: 1,
        message: '内容分类不存在'
      });
    }
    res.status(200).json({
      status: 0,
      data: contentCategory,
      message: '获取内容分类成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取内容分类失败',
      error: error.message
    });
  }
};

// 创建新内容分类
exports.createContentCategory = async (req, res) => {
  try {
    const { code, name, description, status, sort } = req.body;
    
    // 检查代码是否已存在
    const existingCategory = await ContentCategory.findOne({ where: { code } });
    if (existingCategory) {
      return res.status(400).json({
        status: 1,
        message: '内容分类代码已存在'
      });
    }
    
    const contentCategory = await ContentCategory.create({
      code,
      name,
      description,
      status,
      sort
    });
    
    res.status(201).json({
      status: 0,
      data: contentCategory,
      message: '创建内容分类成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '创建内容分类失败',
      error: error.message
    });
  }
};

// 更新内容分类
exports.updateContentCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, status, sort } = req.body;
    
    const contentCategory = await ContentCategory.findByPk(id);
    if (!contentCategory) {
      return res.status(404).json({
        status: 1,
        message: '内容分类不存在'
      });
    }
    
    // 检查代码是否已被其他内容分类使用
    if (code && code !== contentCategory.code) {
      const existingCategory = await ContentCategory.findOne({ where: { code } });
      if (existingCategory) {
        return res.status(400).json({
          status: 1,
          message: '内容分类代码已存在'
        });
      }
    }
    
    await contentCategory.update({
      code: code || contentCategory.code,
      name: name || contentCategory.name,
      description: description !== undefined ? description : contentCategory.description,
      status: status !== undefined ? status : contentCategory.status,
      sort: sort !== undefined ? sort : contentCategory.sort
    });
    
    res.status(200).json({
      status: 0,
      data: contentCategory,
      message: '更新内容分类成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '更新内容分类失败',
      error: error.message
    });
  }
};

// 删除内容分类
exports.deleteContentCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const contentCategory = await ContentCategory.findByPk(id);
    if (!contentCategory) {
      return res.status(404).json({
        status: 1,
        message: '内容分类不存在'
      });
    }
    
    await contentCategory.destroy();
    
    res.status(200).json({
      status: 0,
      message: '删除内容分类成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '删除内容分类失败',
      error: error.message
    });
  }
};