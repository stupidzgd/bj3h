const Platform = require('../models/Platform');
const ContentCategory = require('../models/ContentCategory');
const DepartmentCategory = require('../models/DepartmentCategory');
const Department = require('../models/Department');

// 获取前端需要的所有字典
exports.getFrontendDictionaries = async (req, res) => {
  try {
    // 获取所有平台
    const platforms = await Platform.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC']]
    });
    
    // 获取所有内容分类
    const contentCategories = await ContentCategory.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC']]
    });
    
    // 获取所有科室分类
    const departmentCategories = await DepartmentCategory.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC']]
    });
    
    // 获取所有科室
    const departments = await Department.findAll({
      where: { status: 1 },
      include: [{
        model: DepartmentCategory,
        as: 'departmentCategory'
      }],
      order: [['sort', 'ASC']]
    });
    
    res.status(200).json({
      status: 0,
      data: {
        platforms,
        contentCategories,
        departmentCategories,
        departments
      },
      message: '获取字典数据成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取字典数据失败',
      error: error.message
    });
  }
};

// 获取平台字典
exports.getPlatformDictionary = async (req, res) => {
  try {
    const platforms = await Platform.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC']]
    });
    res.status(200).json({
      status: 0,
      data: platforms,
      message: '获取平台字典成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取平台字典失败',
      error: error.message
    });
  }
};

// 获取内容分类字典
exports.getContentCategoryDictionary = async (req, res) => {
  try {
    const contentCategories = await ContentCategory.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC']]
    });
    res.status(200).json({
      status: 0,
      data: contentCategories,
      message: '获取内容分类字典成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取内容分类字典失败',
      error: error.message
    });
  }
};

// 获取科室分类字典
exports.getDepartmentCategoryDictionary = async (req, res) => {
  try {
    const departmentCategories = await DepartmentCategory.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC']]
    });
    res.status(200).json({
      status: 0,
      data: departmentCategories,
      message: '获取科室分类字典成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取科室分类字典失败',
      error: error.message
    });
  }
};

// 获取科室字典
exports.getDepartmentDictionary = async (req, res) => {
  try {
    const departments = await Department.findAll({
      where: { status: 1 },
      include: [{
        model: DepartmentCategory,
        as: 'departmentCategory'
      }],
      order: [['sort', 'ASC']]
    });
    res.status(200).json({
      status: 0,
      data: departments,
      message: '获取科室字典成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取科室字典失败',
      error: error.message
    });
  }
};