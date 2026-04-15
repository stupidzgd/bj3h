const DepartmentCategory = require('../models/DepartmentCategory');

// 获取所有科室分类
exports.getAllDepartmentCategories = async (req, res) => {
  try {
    const departmentCategories = await DepartmentCategory.findAll({
      order: [['sort', 'ASC']]
    });
    res.status(200).json({
      status: 0,
      data: departmentCategories,
      message: '获取科室分类列表成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取科室分类列表失败',
      error: error.message
    });
  }
};

// 获取指定科室分类
exports.getDepartmentCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentCategory = await DepartmentCategory.findByPk(id);
    if (!departmentCategory) {
      return res.status(404).json({
        status: 1,
        message: '科室分类不存在'
      });
    }
    res.status(200).json({
      status: 0,
      data: departmentCategory,
      message: '获取科室分类成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取科室分类失败',
      error: error.message
    });
  }
};

// 创建新科室分类
exports.createDepartmentCategory = async (req, res) => {
  try {
    const { code, name, description, status, sort } = req.body;
    
    // 检查代码是否已存在
    const existingCategory = await DepartmentCategory.findOne({ where: { code } });
    if (existingCategory) {
      return res.status(400).json({
        status: 1,
        message: '科室分类代码已存在'
      });
    }
    
    const departmentCategory = await DepartmentCategory.create({
      code,
      name,
      description,
      status,
      sort
    });
    
    res.status(201).json({
      status: 0,
      data: departmentCategory,
      message: '创建科室分类成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '创建科室分类失败',
      error: error.message
    });
  }
};

// 更新科室分类
exports.updateDepartmentCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, status, sort } = req.body;
    
    const departmentCategory = await DepartmentCategory.findByPk(id);
    if (!departmentCategory) {
      return res.status(404).json({
        status: 1,
        message: '科室分类不存在'
      });
    }
    
    // 检查代码是否已被其他科室分类使用
    if (code && code !== departmentCategory.code) {
      const existingCategory = await DepartmentCategory.findOne({ where: { code } });
      if (existingCategory) {
        return res.status(400).json({
          status: 1,
          message: '科室分类代码已存在'
        });
      }
    }
    
    await departmentCategory.update({
      code: code || departmentCategory.code,
      name: name || departmentCategory.name,
      description: description !== undefined ? description : departmentCategory.description,
      status: status !== undefined ? status : departmentCategory.status,
      sort: sort !== undefined ? sort : departmentCategory.sort
    });
    
    res.status(200).json({
      status: 0,
      data: departmentCategory,
      message: '更新科室分类成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '更新科室分类失败',
      error: error.message
    });
  }
};

// 删除科室分类
exports.deleteDepartmentCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentCategory = await DepartmentCategory.findByPk(id);
    if (!departmentCategory) {
      return res.status(404).json({
        status: 1,
        message: '科室分类不存在'
      });
    }
    
    await departmentCategory.destroy();
    
    res.status(200).json({
      status: 0,
      message: '删除科室分类成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '删除科室分类失败',
      error: error.message
    });
  }
};