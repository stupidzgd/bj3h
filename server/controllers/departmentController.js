const Department = require('../models/Department');
const DepartmentCategory = require('../models/DepartmentCategory');

// 获取所有科室
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [{
        model: DepartmentCategory,
        as: 'departmentCategory'
      }],
      order: [['sort', 'ASC']]
    });
    res.status(200).json({
      status: 0,
      data: departments,
      message: '获取科室列表成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取科室列表失败',
      error: error.message
    });
  }
};

// 获取指定科室
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id, {
      include: [{
        model: DepartmentCategory,
        as: 'departmentCategory'
      }]
    });
    if (!department) {
      return res.status(404).json({
        status: 1,
        message: '科室不存在'
      });
    }
    res.status(200).json({
      status: 0,
      data: department,
      message: '获取科室成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取科室失败',
      error: error.message
    });
  }
};

// 按科室分类获取科室
exports.getDepartmentsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const departments = await Department.findAll({
      where: { departmentCategoryId: categoryId },
      include: [{
        model: DepartmentCategory,
        as: 'departmentCategory'
      }],
      order: [['sort', 'ASC']]
    });
    res.status(200).json({
      status: 0,
      data: departments,
      message: '获取科室列表成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '获取科室列表失败',
      error: error.message
    });
  }
};

// 创建新科室
exports.createDepartment = async (req, res) => {
  try {
    const { code, name, departmentCategoryId, description, status, sort } = req.body;
    
    // 检查科室分类是否存在
    const departmentCategory = await DepartmentCategory.findByPk(departmentCategoryId);
    if (!departmentCategory) {
      return res.status(404).json({
        status: 1,
        message: '科室分类不存在'
      });
    }
    
    // 检查代码是否已存在
    const existingDepartment = await Department.findOne({ where: { code } });
    if (existingDepartment) {
      return res.status(400).json({
        status: 1,
        message: '科室代码已存在'
      });
    }
    
    const department = await Department.create({
      code,
      name,
      departmentCategoryId,
      description,
      status,
      sort
    });
    
    // 重新获取科室信息，包含科室分类
    const newDepartment = await Department.findByPk(department.id, {
      include: [{
        model: DepartmentCategory,
        as: 'departmentCategory'
      }]
    });
    
    res.status(201).json({
      status: 0,
      data: newDepartment,
      message: '创建科室成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '创建科室失败',
      error: error.message
    });
  }
};

// 更新科室
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, departmentCategoryId, description, status, sort } = req.body;
    
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({
        status: 1,
        message: '科室不存在'
      });
    }
    
    // 检查科室分类是否存在
    if (departmentCategoryId) {
      const departmentCategory = await DepartmentCategory.findByPk(departmentCategoryId);
      if (!departmentCategory) {
        return res.status(404).json({
          status: 1,
          message: '科室分类不存在'
        });
      }
    }
    
    // 检查代码是否已被其他科室使用
    if (code && code !== department.code) {
      const existingDepartment = await Department.findOne({ where: { code } });
      if (existingDepartment) {
        return res.status(400).json({
          status: 1,
          message: '科室代码已存在'
        });
      }
    }
    
    await department.update({
      code: code || department.code,
      name: name || department.name,
      departmentCategoryId: departmentCategoryId || department.departmentCategoryId,
      description: description !== undefined ? description : department.description,
      status: status !== undefined ? status : department.status,
      sort: sort !== undefined ? sort : department.sort
    });
    
    // 重新获取科室信息，包含科室分类
    const updatedDepartment = await Department.findByPk(department.id, {
      include: [{
        model: DepartmentCategory,
        as: 'departmentCategory'
      }]
    });
    
    res.status(200).json({
      status: 0,
      data: updatedDepartment,
      message: '更新科室成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '更新科室失败',
      error: error.message
    });
  }
};

// 删除科室
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({
        status: 1,
        message: '科室不存在'
      });
    }
    
    await department.destroy();
    
    res.status(200).json({
      status: 0,
      message: '删除科室成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 1,
      message: '删除科室失败',
      error: error.message
    });
  }
};