-- 使用bj3h数据库
USE `bj3h`;

-- 创建平台表
CREATE TABLE IF NOT EXISTS `dict_platforms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(10) NOT NULL COMMENT '平台代码',
  `name` VARCHAR(100) NOT NULL COMMENT '平台名称',
  `type` TINYINT NOT NULL DEFAULT 1 COMMENT '平台类型（1-自媒体，0-媒体）',
  `description` VARCHAR(255) DEFAULT '' COMMENT '平台描述',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（1-启用，0-禁用）',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序字段',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_platform_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建内容分类表
CREATE TABLE IF NOT EXISTS `dict_content_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(10) NOT NULL COMMENT '分类代码',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `description` VARCHAR(255) DEFAULT '' COMMENT '分类描述',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（1-启用，0-禁用）',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序字段',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_content_category_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建科室分类表
CREATE TABLE IF NOT EXISTS `dict_department_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL COMMENT '分类代码',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `description` VARCHAR(255) DEFAULT '' COMMENT '分类描述',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（1-启用，0-禁用）',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序字段',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_department_category_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建科室表
CREATE TABLE IF NOT EXISTS `dict_departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL COMMENT '科室代码',
  `name` VARCHAR(100) NOT NULL COMMENT '科室名称',
  `department_category_id` INT DEFAULT NULL COMMENT '关联的科室分类ID',
  `description` VARCHAR(255) DEFAULT '' COMMENT '科室描述',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（1-启用，0-禁用）',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序字段',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_department_code` (`code`),
  INDEX `idx_department_category_id` (`department_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入平台初始数据
INSERT IGNORE INTO `dict_platforms` (`code`, `name`, `type`, `description`, `status`, `sort`) VALUES
('A', '微信订阅号', 1, '微信订阅号平台', 1, 1),
('B', '微信视频号', 1, '微信视频号平台', 1, 2),
('C', '微博', 1, '微博平台', 1, 3),
('D', '快手', 1, '快手平台', 1, 4),
('E', '抖音', 1, '抖音平台', 1, 5),
('F', 'B站', 1, 'B站平台', 1, 6),
('G', '小红书', 1, '小红书平台', 1, 7),
('H', '喜马拉雅', 1, '喜马拉雅平台', 1, 8),
('I', '官网', 1, '医院官方网站', 1, 9),
('J', '媒体（电视）', 0, '电视媒体', 1, 10),
('K', '媒体（网络）', 0, '网络媒体', 1, 11),
('L', '媒体（报刊）', 0, '报刊媒体', 1, 12),
('M', '媒体（音频）', 0, '音频媒体', 1, 13);

-- 插入内容分类初始数据
INSERT IGNORE INTO `dict_content_categories` (`code`, `name`, `description`, `status`, `sort`) VALUES
('1', '医院新闻', '医院相关新闻', 1, 1),
('2', '医学科普', '医学科普内容', 1, 2),
('3', '就诊信息', '就诊相关信息', 1, 3),
('4', '医学人文', '医学人文内容', 1, 4),
('5', '医疗技术', '医疗技术相关内容', 1, 5),
('6', '其他', '其他内容', 1, 6);

-- 删除不需要的科室分类数据
DELETE FROM `dict_department_categories` WHERE `id` IN (1, 2, 3);

-- 插入科室分类初始数据
INSERT IGNORE INTO `dict_department_categories` (`code`, `name`, `description`, `status`, `sort`) VALUES
('1', '医技科室', '医技科室', 1, 1),
('2', '内科', '内科', 1, 2),
('3', '外科', '外科', 1, 3),
('4', '职能处室', '职能处室', 1, 4),
('5', '急诊内科', '急诊内科', 1, 5),
('6', '分院区', '分院区', 1, 6),
('7', '医院', '医院', 1, 7);

-- 插入科室初始数据
INSERT IGNORE INTO `dict_departments` (`code`, `name`, `department_category_id`, `description`, `status`, `sort`) VALUES
('1', '药学部', 1, '药学部', 1, 1),
('2', '麻醉科', 1, '麻醉科', 1, 2),
('3', '内分泌科', 2, '内分泌科', 1, 3),
('4', '风湿免疫科', 2, '风湿免疫科', 1, 4),
('5', '呼吸与危重症医学科', 2, '呼吸与危重症医学科', 1, 5),
('6', '中医科', 2, '中医科', 1, 6),
('7', '耳鼻喉科', 2, '耳鼻喉科', 1, 7),
('8', '心血管内科', 2, '心血管内科', 1, 8),
('9', '消化科', 2, '消化科', 1, 9),
('10', '神经内科', 2, '神经内科', 1, 10),
('11', '儿科', 2, '儿科', 1, 11),
('12', '临床营养科', 2, '临床营养科', 1, 12),
('13', '骨科', 3, '骨科', 1, 13),
('14', '成形科', 3, '成形科', 1, 14),
('15', '运动医学科', 3, '运动医学科', 1, 15),
('16', '普通外科', 3, '普通外科', 1, 16),
('17', '生殖医学中心', 3, '生殖医学中心', 1, 17),
('18', '科研处', 4, '科研处', 1, 18),
('19', '宣传中心', 4, '宣传中心', 1, 19),
('20', '门诊部', 4, '门诊部', 1, 20),
('21', '信息管理与大数据中心', 4, '信息管理与大数据中心', 1, 21),
('22', '医务处', 4, '医务处', 1, 22),
('23', '互联网医院办公室', 4, '互联网医院办公室', 1, 23),
('24', '急诊科', 5, '急诊科', 1, 24),
('25', '海淀北部院区', 6, '海淀北部院区', 1, 25),
('26', '皮肤科', 3, '皮肤科', 1, 26),
('27', '医院', 7, '医院', 1, 27);
