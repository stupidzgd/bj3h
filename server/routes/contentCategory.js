const express = require('express');
const router = express.Router();
const contentCategoryController = require('../controllers/contentCategoryController');

// 内容分类相关路由
router.get('/api/content-categories', contentCategoryController.getAllContentCategories);
router.get('/api/content-categories/:id', contentCategoryController.getContentCategoryById);
router.post('/api/content-categories', contentCategoryController.createContentCategory);
router.put('/api/content-categories/:id', contentCategoryController.updateContentCategory);
router.delete('/api/content-categories/:id', contentCategoryController.deleteContentCategory);

module.exports = router;