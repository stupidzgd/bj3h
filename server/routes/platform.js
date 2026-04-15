const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platformController');

// 平台相关路由
router.get('/api/platforms', platformController.getAllPlatforms);
router.get('/api/platforms/:id', platformController.getPlatformById);
router.get('/api/platforms/type/:type', platformController.getPlatformsByType);
router.post('/api/platforms', platformController.createPlatform);
router.put('/api/platforms/:id', platformController.updatePlatform);
router.delete('/api/platforms/:id', platformController.deletePlatform);

module.exports = router;