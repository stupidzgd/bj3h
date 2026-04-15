const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// 科室相关路由
router.get('/api/departments', departmentController.getAllDepartments);
router.get('/api/departments/:id', departmentController.getDepartmentById);
router.get('/api/departments/category/:categoryId', departmentController.getDepartmentsByCategory);
router.post('/api/departments', departmentController.createDepartment);
router.put('/api/departments/:id', departmentController.updateDepartment);
router.delete('/api/departments/:id', departmentController.deleteDepartment);

module.exports = router;