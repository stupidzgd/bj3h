const express = require('express');
const router = express.Router();
const dictionaryController = require('../controllers/dictionaryController');

// 字典综合路由
router.get('/api/dictionaries/frontend', dictionaryController.getFrontendDictionaries);
router.get('/api/dictionaries/frontend/platforms', dictionaryController.getPlatformDictionary);
router.get('/api/dictionaries/frontend/content-categories', dictionaryController.getContentCategoryDictionary);
router.get('/api/dictionaries/frontend/department-categories', dictionaryController.getDepartmentCategoryDictionary);
router.get('/api/dictionaries/frontend/departments', dictionaryController.getDepartmentDictionary);

module.exports = router;