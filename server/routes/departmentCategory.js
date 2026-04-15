const express = require('express');
const router = express.Router();
const departmentCategoryController = require('../controllers/departmentCategoryController');

// 科室分类相关路由
router.get('/api/department-categories', departmentCategoryController.getAllDepartmentCategories);
router.get('/api/department-categories/:id', departmentCategoryController.getDepartmentCategoryById);
router.post('/api/department-categories', departmentCategoryController.createDepartmentCategory);
router.put('/api/department-categories/:id', departmentCategoryController.updateDepartmentCategory);
router.delete('/api/department-categories/:id', departmentCategoryController.deleteDepartmentCategory);

module.exports = router;