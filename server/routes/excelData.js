const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const MediaPublishData = require('../models/MediaPublishData');
const ProvinceRatio = require('../models/ProvinceRatio');

// 获取所有数据
router.get('/all', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    
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
    
    const data = await MediaPublishData.findAll({
      where,
      include: [{
        model: ProvinceRatio,
        as: 'provinceRatios',
        required: false // 使用左连接，确保即使没有关联数据也能返回
      }]
    });
    console.log('数据库返回数据总量:', data.length);
    res.status(200).json(data);
  } catch (error) {
    console.error('获取数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 按条件查询数据
router.post('/query', async (req, res) => {
  try {
    const { platform, department, contentCategory, startDate, endDate, importStartDate, importEndDate, keyword } = req.body;
    
    const where = {};
    
    if (platform) {
      where.platform = platform;
    }
    if (department) {
      where.department_name = department;
    }
    if (contentCategory) {
      where.content_category = contentCategory;
    }
    if (startDate && endDate) {
      where.publish_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.publish_time = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.publish_time = {
        [Op.lte]: new Date(endDate)
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
    
    const data = await MediaPublishData.findAll({ 
      where,
      include: [{
        model: ProvinceRatio,
        as: 'provinceRatios'
      }]
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: '查询数据失败' });
  }
});

// 导入数据
router.post('/import', async (req, res) => {
  try {
    console.log('收到导入请求:', req.body);
    const { data } = req.body;
    
    if (!Array.isArray(data)) {
      console.log('数据格式错误:', data);
      return res.status(400).json({ error: '数据格式错误' });
    }
    
    console.log('准备导入数据，共', data.length, '条');
    
    // 开始事务
    const transaction = await sequelize.transaction();
    
    try {
      const createdData = [];
      const updatedData = [];
      
      for (const item of data) {
        console.log('处理数据项:', item.article_id);
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
        
        // 使用 upsert 操作，避免唯一索引冲突
        console.log('执行 upsert 操作');
        console.log('发布时间:', item.publish_time);
        
        // 确保发布时间格式正确，避免时区问题
        if (item.publish_time) {
          // 解析日期字符串，确保时区正确
          // 处理时区偏移，确保使用东八区时间
          const date = new Date(item.publish_time);
          // 调整时区，避免时区偏移
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          item.publish_time = date;
          console.log('转换后发布时间:', item.publish_time);
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
          console.log('创建新记录:', item.article_id, item.platform);
          createdData.push({
            article_id: item.article_id,
            platform: item.platform,
            title: item.title
          });
        } else {
          console.log('更新现有记录:', item.article_id, item.platform);
          updatedData.push({
            article_id: item.article_id,
            platform: item.platform,
            title: item.title
          });
        }
        
        // 如果是更新操作，先删除旧的省份占比数据
        if (!created && existingRecord) {
          console.log('更新操作，删除旧省份数据');
          await ProvinceRatio.destroy({
            where: {
              media_publish_id: existingRecord.id
            },
            transaction
          });
        }
        
        // 创建省份数据
        if (provinceData.length > 0) {
          console.log('创建省份数据，共', provinceData.length, '条');
          // 获取正确的media_publish_id
          const publishId = created ? mediaPublish.id : existingRecord.id;
          for (const province of provinceData) {
            province.media_publish_id = publishId;
            await ProvinceRatio.create(province, { transaction });
          }
        }
      }
      
      // 提交事务
      console.log('提交事务');
      await transaction.commit();
      
      // 返回详细的统计信息
      res.status(200).json({
        success: true,
        total: data.length,
        created: createdData.length,
        updated: updatedData.length,
        createdRecords: createdData,
        updatedRecords: updatedData
      });
    } catch (error) {
      // 回滚事务
      console.log('事务回滚:', error);
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.log('导入数据失败:', error);
    res.status(500).json({ error: '导入数据失败', message: error.message });
  }
});

// 更新数据
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
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
        res.status(200).json({ success: true });
      } else {
        await transaction.rollback();
        res.status(404).json({ error: '数据不存在' });
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: '更新数据失败' });
  }
});

// 删除数据
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: '数据不存在' });
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: '删除数据失败' });
  }
});

// 清空所有数据
router.delete('/clear', async (req, res) => {
  try {
    // 开始事务
    const transaction = await sequelize.transaction();
    
    try {
      // 清空省份数据
      await ProvinceRatio.destroy({ where: {}, transaction });
      
      // 清空主数据
      await MediaPublishData.destroy({ where: {}, transaction });
      
      await transaction.commit();
      res.status(200).json({ success: true });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: '清空数据失败' });
  }
});

// 批量删除数据
router.post('/delete', async (req, res) => {
  try {
    const { articleIds } = req.body;
    
    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({ error: '请提供要删除的文章ID列表' });
    }
    
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
      
      res.status(200).json({ message: `成功删除 ${articleIds.length} 条数据` });
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('批量删除数据失败:', error);
    res.status(500).json({ error: '批量删除数据失败' });
  }
});

module.exports = router;