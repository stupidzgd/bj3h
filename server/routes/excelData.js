const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const MediaPublishData = require('../models/MediaPublishData');
const ProvinceRatio = require('../models/ProvinceRatio');
const { info, error, warn, debug } = require('../config/logger');

// 辅助函数：检查数据库中的department_category是否包含精确匹配的筛选条件
// 按"、"分隔后，检查数组中是否存在精确等于filterCategory的项
function exactMatchDepartmentCategory(recordDeptCategory, filterCategory) {
  if (!recordDeptCategory || !filterCategory) {
    return false;
  }
  const categories = recordDeptCategory.split('、');
  return categories.includes(filterCategory);
}

// 统一查询接口（支持GET和POST方法）
router.get('/query', async (req, res) => {
  try {
    const { platform, department, departmentCategory, contentCategory, startDate, endDate, importStartDate, importEndDate, keyword } = req.query;
    
    info(`查询数据请求 (GET)，参数: platform=${platform}, department=${department}, departmentCategory=${departmentCategory}, contentCategory=${contentCategory}, startDate=${startDate}, endDate=${endDate}, importStartDate=${importStartDate}, importEndDate=${importEndDate}, keyword=${keyword}`);
    
    const where = {};
    
    // 保存departmentCategory的筛选条件，稍后用代码逻辑精确匹配
    const departmentCategoryFilter = departmentCategory;
    
    if (platform) {
      if (Array.isArray(platform) && platform.length > 0) {
        where.platform = {
          [Op.in]: platform
        };
      } else if (typeof platform === 'string') {
        where.platform = platform;
      }
    }
    if (department) {
      if (Array.isArray(department) && department.length > 0) {
        where.department_name = {
          [Op.in]: department
        };
      } else if (typeof department === 'string') {
        where.department_name = department;
      }
    }
    
    // departmentCategory的模糊查询条件，用于初步筛选
    let departmentCategoryWhere = null;
    if (departmentCategory) {
      if (Array.isArray(departmentCategory) && departmentCategory.length > 0) {
        departmentCategoryWhere = {
          [Op.or]: departmentCategory.map(cat => ({
            department_category: { [Op.like]: `%${cat}%` }
          }))
        };
      } else if (typeof departmentCategory === 'string') {
        departmentCategoryWhere = {
          department_category: { [Op.like]: `%${departmentCategory}%` }
        };
      }
    }
    
    if (contentCategory) {
      if (Array.isArray(contentCategory) && contentCategory.length > 0) {
        where.content_category = {
          [Op.in]: contentCategory
        };
      } else if (typeof contentCategory === 'string') {
        where.content_category = contentCategory;
      }
    }
    if (startDate && endDate) {
      where.publish_time = {
        [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')]
      };
    } else if (startDate) {
      where.publish_time = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.publish_time = {
        [Op.lte]: new Date(endDate + ' 23:59:59')
      };
    }
    if (importStartDate && importEndDate) {
      where.import_time = {
        [Op.between]: [new Date(importStartDate), new Date(importEndDate + ' 23:59:59')]
      };
    } else if (importStartDate) {
      where.import_time = {
        [Op.gte]: new Date(importStartDate)
      };
    } else if (importEndDate) {
      where.import_time = {
        [Op.lte]: new Date(importEndDate + ' 23:59:59')
      };
    }
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { author: { [Op.like]: `%${keyword}%` } },
        { reporter: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    // 构建最终的查询条件，如果有departmentCategoryWhere则合并
    let finalWhere = where;
    if (departmentCategoryWhere) {
      finalWhere = {
        ...where,
        ...departmentCategoryWhere
      };
    }
    
    let data = await MediaPublishData.findAll({ 
      where: finalWhere,
      include: [{
        model: ProvinceRatio,
        as: 'provinceRatios',
        required: false
      }]
    });
    
    // 如果有departmentCategory筛选条件，在代码中精确匹配
    if (departmentCategoryFilter) {
      if (Array.isArray(departmentCategoryFilter) && departmentCategoryFilter.length > 0) {
        data = data.filter(item => 
          departmentCategoryFilter.some(filterCat => 
            exactMatchDepartmentCategory(item.department_category, filterCat)
          )
        );
      } else if (typeof departmentCategoryFilter === 'string') {
        data = data.filter(item => 
          exactMatchDepartmentCategory(item.department_category, departmentCategoryFilter)
        );
      }
    }
    
    // 获取最大的 import_time
    let lastUpdateTime = null;
    if (data.length > 0) {
      const maxImportTime = await MediaPublishData.max('import_time', { where: finalWhere });
      if (maxImportTime) {
        lastUpdateTime = maxImportTime.toISOString().slice(0, 19).replace('T', ' ');
      }
    }
    
    info(`查询完成，返回数据总量: ${data.length}`);
    res.status(200).json({
      data: data,
      lastUpdateTime: lastUpdateTime
    });
  } catch (err) {
    error('查询数据失败:', err);
    res.status(500).json({ error: '查询数据失败' });
  }
});

// 按条件查询数据 (POST 方法)
router.post('/query', async (req, res) => {
  try {
    const { platform, department, departmentCategory, contentCategory, startDate, endDate, importStartDate, importEndDate, keyword } = req.body;
    
    info(`按条件查询数据请求 (POST)，参数: platform=${platform}, department=${department}, departmentCategory=${departmentCategory}, contentCategory=${JSON.stringify(contentCategory)}, startDate=${startDate}, endDate=${endDate}, importStartDate=${importStartDate}, importEndDate=${importEndDate}, keyword=${keyword}`);
    debug(`contentCategory类型: ${typeof contentCategory}, 是否为数组: ${Array.isArray(contentCategory)}`);
    
    const where = {};
    
    // 保存departmentCategory的筛选条件，稍后用代码逻辑精确匹配
    const departmentCategoryFilter = departmentCategory;
    
    if (platform) {
      if (Array.isArray(platform) && platform.length > 0) {
        where.platform = {
          [Op.in]: platform
        };
      } else if (typeof platform === 'string') {
        where.platform = platform;
      }
    }
    if (department) {
      if (Array.isArray(department) && department.length > 0) {
        where[Op.or] = department.map(dept => ({
          department_name: { [Op.like]: `%${dept}%` }
        }));
      } else if (typeof department === 'string') {
        where.department_name = {
          [Op.like]: `%${department}%`
        };
      }
    }
    // departmentCategory的模糊查询条件，用于初步筛选
    let departmentCategoryWhere = null;
    if (departmentCategory) {
      if (Array.isArray(departmentCategory) && departmentCategory.length > 0) {
        departmentCategoryWhere = {
          [Op.or]: departmentCategory.map(cat => ({
            department_category: { [Op.like]: `%${cat}%` }
          }))
        };
      } else if (typeof departmentCategory === 'string') {
        departmentCategoryWhere = {
          department_category: { [Op.like]: `%${departmentCategory}%` }
        };
      }
    }
    if (contentCategory) {
      if (Array.isArray(contentCategory) && contentCategory.length > 0) {
        where[Op.or] = contentCategory.map(cat => ({
          content_category: { [Op.like]: `%${cat}%` }
        }));
      } else if (typeof contentCategory === 'string') {
        where.content_category = {
          [Op.like]: `%${contentCategory}%`
        };
      }
    }
    if (startDate && endDate) {
      where.publish_time = {
        [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')]
      };
    } else if (startDate) {
      where.publish_time = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.publish_time = {
        [Op.lte]: new Date(endDate + ' 23:59:59')
      };
    }
    if (importStartDate && importEndDate) {
      where.import_time = {
        [Op.between]: [new Date(importStartDate), new Date(importEndDate + ' 23:59:59')]
      };
    } else if (importStartDate) {
      where.import_time = {
        [Op.gte]: new Date(importStartDate)
      };
    } else if (importEndDate) {
      where.import_time = {
        [Op.lte]: new Date(importEndDate + ' 23:59:59')
      };
    }
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { author: { [Op.like]: `%${keyword}%` } },
        { reporter: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    // 构建最终的查询条件，如果有departmentCategoryWhere则合并
    let finalWhere = where;
    if (departmentCategoryWhere) {
      finalWhere = {
        ...where,
        ...departmentCategoryWhere
      };
    }
    
    let data = await MediaPublishData.findAll({ 
      where: finalWhere,
      include: [{
        model: ProvinceRatio,
        as: 'provinceRatios',
        required: false
      }]
    });
    
    // 如果有departmentCategory筛选条件，在代码中精确匹配
    if (departmentCategoryFilter) {
      if (Array.isArray(departmentCategoryFilter) && departmentCategoryFilter.length > 0) {
        data = data.filter(item => 
          departmentCategoryFilter.some(filterCat => 
            exactMatchDepartmentCategory(item.department_category, filterCat)
          )
        );
      } else if (typeof departmentCategoryFilter === 'string') {
        data = data.filter(item => 
          exactMatchDepartmentCategory(item.department_category, departmentCategoryFilter)
        );
      }
    }
    
    // 获取最大的 import_time
    let lastUpdateTime = null;
    if (data.length > 0) {
      const maxImportTime = await MediaPublishData.max('import_time', { where });
      if (maxImportTime) {
        lastUpdateTime = maxImportTime.toISOString().slice(0, 19).replace('T', ' ');
      }
    }
    
    info(`查询完成，返回数据总量: ${data.length}`);
    res.status(200).json({
      data: data,
      lastUpdateTime: lastUpdateTime
    });
  } catch (err) {
    error('查询数据失败:', err);
    res.status(500).json({ error: '查询数据失败' });
  }
});

// 导入数据
router.post('/import', async (req, res) => {
  try {
    info('收到导入请求');
    const { data } = req.body;
    
    if (!Array.isArray(data)) {
      warn('数据格式错误');
      return res.status(400).json({ error: '数据格式错误' });
    }
    
    info(`准备导入数据，共 ${data.length} 条`);
    
    // 开始事务
    const transaction = await sequelize.transaction();
    
    try {
      const createdData = [];
      const updatedData = [];
      
      for (const item of data) {
        debug(`处理数据项: ${item.article_id}`);
        // 提取省份数据
        const provinceData = [];
        const provinceKeys = Object.keys(item).filter(key => {
          // 识别省份字段（简单判断：两个字或三个字，包含省、市、自治区等关键词）
          return (key.length === 2 || key.length === 3) && 
                 (key.includes('省') || key.includes('市') || key.includes('自治区') || 
                  key.includes('特别行政区') || ['北京', '天津', '上海', '重庆'].includes(key));
        });
        
        // 保存省份数据
        for (const provinceKey of provinceKeys) {
          if (item[provinceKey]) {
            provinceData.push({
              province_name: provinceKey,
              ratio: item[provinceKey]
            });
            // 从主数据中删除省份字段
            delete item[provinceKey];
          }
        }
        
        // 确保发布时间格式正确，避免时区问题
        if (item.publish_time) {
          // 解析日期字符串，确保时区正确
          // 处理时区偏移，确保使用东八区时间
          const date = new Date(item.publish_time);
          // 调整时区，避免时区偏移
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          item.publish_time = date;
          debug(`转换后发布时间: ${item.publish_time}`);
        }
        
        // 先查找是否存在相同的记录
        const existingRecord = await MediaPublishData.findOne({
          where: {
            article_id: item.article_id,
            platform: item.platform,
            title: item.title
          },
          transaction
        });
        
        // 执行 upsert 操作
        const [mediaPublish, created] = await MediaPublishData.upsert(item, {
          transaction
        });
        
        // 记录操作类型
        if (created) {
          debug(`创建新记录: ${item.article_id} ${item.platform}`);
          createdData.push({
            article_id: item.article_id,
            platform: item.platform,
            title: item.title
          });
        } else {
          debug(`更新现有记录: ${item.article_id} ${item.platform}`);
          updatedData.push({
            article_id: item.article_id,
            platform: item.platform,
            title: item.title
          });
        }
        
        // 如果是更新操作，先删除旧的省份占比数据
        if (!created && existingRecord) {
          debug('更新操作，删除旧省份数据');
          await ProvinceRatio.destroy({
            where: {
              media_publish_id: existingRecord.id
            },
            transaction
          });
        }
        
        // 创建省份数据
        if (provinceData.length > 0) {
          debug(`创建省份数据，共 ${provinceData.length} 条`);
          // 获取正确的media_publish_id
          const publishId = created ? mediaPublish.id : existingRecord.id;
          for (const province of provinceData) {
            province.media_publish_id = publishId;
            await ProvinceRatio.create(province, { transaction });
          }
        }
      }
      
      // 提交事务
      debug('提交事务');
      await transaction.commit();
      
      info(`导入完成，共处理 ${data.length} 条数据，其中创建 ${createdData.length} 条，更新 ${updatedData.length} 条`);
      
      // 返回详细的统计信息
      res.status(200).json({
        success: true,
        total: data.length,
        created: createdData.length,
        updated: updatedData.length,
        createdRecords: createdData,
        updatedRecords: updatedData
      });
    } catch (err) {
      // 回滚事务
      error('事务回滚:', err);
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    error('导入数据失败:', err);
    res.status(500).json({ error: '导入数据失败', message: err.message });
  }
});

// 更新数据
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    info(`更新数据请求，ID: ${id}`);
    
    // 提取省份数据
    const provinceData = updateData.provinceRatios || [];
    delete updateData.provinceRatios;
    
    // 开始事务
    const transaction = await sequelize.transaction();
    
    try {
      // 更新主数据
      const [updated] = await MediaPublishData.update(updateData, {
        where: { id },
        transaction
      });
      
      if (updated) {
        // 删除旧的省份数据
        await ProvinceRatio.destroy({
          where: { media_publish_id: id },
          transaction
        });
        
        // 创建新的省份数据
        for (const province of provinceData) {
          province.media_publish_id = id;
          await ProvinceRatio.create(province, { transaction });
        }
        
        // 提交事务
        await transaction.commit();
        info(`更新数据成功，ID: ${id}`);
        res.status(200).json({ success: true });
      } else {
        await transaction.rollback();
        warn(`更新数据失败，ID: ${id} 不存在`);
        res.status(404).json({ error: '数据不存在' });
      }
    } catch (err) {
      await transaction.rollback();
      error('更新数据事务失败:', err);
      throw err;
    }
  } catch (err) {
    error('更新数据失败:', err);
    res.status(500).json({ error: '更新数据失败' });
  }
});

// 删除数据
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    info(`删除数据请求，ID: ${id}`);
    
    // 开始事务
    const transaction = await sequelize.transaction();
    
    try {
      // 删除省份数据
      await ProvinceRatio.destroy({
        where: { media_publish_id: id },
        transaction
      });
      
      // 删除主数据
      const deleted = await MediaPublishData.destroy({
        where: { id },
        transaction
      });
      
      await transaction.commit();
      
      if (deleted) {
        info(`删除数据成功，ID: ${id}`);
        res.status(200).json({ success: true });
      } else {
        warn(`删除数据失败，ID: ${id} 不存在`);
        res.status(404).json({ error: '数据不存在' });
      }
    } catch (err) {
      await transaction.rollback();
      error('删除数据事务失败:', err);
      throw err;
    }
  } catch (err) {
    error('删除数据失败:', err);
    res.status(500).json({ error: '删除数据失败' });
  }
});

// 清空所有数据
router.delete('/clear', async (req, res) => {
  try {
    info('清空所有数据请求');
    
    // 开始事务
    const transaction = await sequelize.transaction();
    
    try {
      // 清空省份数据
      await ProvinceRatio.destroy({ where: {}, transaction });
      
      // 清空主数据
      await MediaPublishData.destroy({ where: {}, transaction });
      
      await transaction.commit();
      info('清空所有数据成功');
      res.status(200).json({ success: true });
    } catch (err) {
      await transaction.rollback();
      error('清空数据事务失败:', err);
      throw err;
    }
  } catch (err) {
    error('清空数据失败:', err);
    res.status(500).json({ error: '清空数据失败' });
  }
});

// 批量删除数据
router.post('/delete', async (req, res) => {
  try {
    const { articleIds } = req.body;
    
    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      warn('批量删除数据失败：请提供要删除的文章ID列表');
      return res.status(400).json({ error: '请提供要删除的文章ID列表' });
    }
    
    info(`批量删除数据请求，共 ${articleIds.length} 个文章ID`);
    
    // 开始事务
    const transaction = await sequelize.transaction();
    
    try {
      // 先查询所有要删除的媒体发布数据，获取它们的ID
      const mediaPublishData = await MediaPublishData.findAll({
        where: {
          article_id: {
            [Op.in]: articleIds
          }
        },
        transaction
      });
      
      const mediaPublishIds = mediaPublishData.map(item => item.id);
      
      // 先删除关联的省份占比数据
      if (mediaPublishIds.length > 0) {
        await ProvinceRatio.destroy({
          where: {
            media_publish_id: {
              [Op.in]: mediaPublishIds
            }
          },
          transaction
        });
      }
      
      // 再删除媒体发布数据
      await MediaPublishData.destroy({
        where: {
          article_id: {
            [Op.in]: articleIds
          }
        },
        transaction
      });
      
      // 提交事务
      await transaction.commit();
      
      info(`批量删除数据成功，共删除 ${articleIds.length} 条数据`);
      res.status(200).json({ message: `成功删除 ${articleIds.length} 条数据` });
    } catch (err) {
      // 回滚事务
      await transaction.rollback();
      error('批量删除数据事务失败:', err);
      throw err;
    }
  } catch (err) {
    error('批量删除数据失败:', err);
    res.status(500).json({ error: '批量删除数据失败' });
  }
});

module.exports = router;