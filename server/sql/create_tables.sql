-- 创建数据库
CREATE DATABASE IF NOT EXISTS `bj3h` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `bj3h`;

-- 创建DictType表
CREATE TABLE IF NOT EXISTS `dict_type` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type_code` VARCHAR(50) NOT NULL COMMENT '字典类型编码',
  `type_name` VARCHAR(100) NOT NULL COMMENT '字典类型名称',
  `description` VARCHAR(255) COMMENT '描述',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_type_code` (`type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建DictItem表
CREATE TABLE IF NOT EXISTS `dict_item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type_code` VARCHAR(50) NOT NULL COMMENT '字典类型编码',
  `item_code` VARCHAR(50) NOT NULL COMMENT '字典项编码',
  `item_name` VARCHAR(100) NOT NULL COMMENT '字典项名称',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_type_item` (`type_code`, `item_code`),
  INDEX `idx_type_code` (`type_code`),
  CONSTRAINT `fk_dict_item_type` FOREIGN KEY (`type_code`) REFERENCES `dict_type` (`type_code`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建MediaPublishData表
CREATE TABLE IF NOT EXISTS `media_publish_data` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `platform` VARCHAR(255) NOT NULL,
  `article_id` VARCHAR(255) NULL,
  `title` VARCHAR(255) NOT NULL,
  `is_first_release` VARCHAR(255) NULL,
  `publish_time` DATETIME NOT NULL,
  `reading_count` INT NULL,
  `share_count` INT NULL,
  `link` VARCHAR(255) NULL,
  `complete_rate` VARCHAR(255) NULL,
  `avg_play_time` VARCHAR(255) NULL,
  `like_count` INT NULL,
  `collect_count` INT NULL,
  `content_category` VARCHAR(255) NULL,
  `genre_category` VARCHAR(255) NULL,
  `department_name` VARCHAR(255) NULL,
  `department_category` VARCHAR(255) NULL,
  `author` VARCHAR(255) NULL,
  `source` VARCHAR(255) NULL,
  `special_planning` VARCHAR(255) NULL,
  `video_duration` VARCHAR(255) NULL,
  `hot_search_platform` VARCHAR(255) NULL,
  `hot_search_position` INT NULL,
  `hot_search_duration` VARCHAR(255) NULL,
  `hot_search_reading_count` INT NULL,
  `reporter` VARCHAR(255) NULL,
  `media_column` VARCHAR(255) NULL,
  `user_region_distribution` VARCHAR(255) NULL,
  `beijing_ratio` VARCHAR(255) NULL,
  `non_beijing_ratio` VARCHAR(255) NULL,
  `import_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_article_platform_title` (`article_id`, `platform`, `title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建ProvinceRatio表
CREATE TABLE IF NOT EXISTS `province_ratio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `media_publish_id` INT NOT NULL,
  `province_name` VARCHAR(255) NOT NULL,
  `ratio` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_media_publish_id` (`media_publish_id`),
  CONSTRAINT `fk_media_publish_id` FOREIGN KEY (`media_publish_id`) REFERENCES `media_publish_data` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初始化字典数据
-- 平台类型字典
INSERT INTO `dict_type` (`type_code`, `type_name`, `description`) VALUES
('platform', '平台类型', '媒体发布平台类型');

-- 平台类型字典项
INSERT INTO `dict_item` (`type_code`, `item_code`, `item_name`, `sort_order`) VALUES
('platform', 'A', '自媒体（微信订阅号）', 1),
('platform', 'B', '自媒体（微信视频号）', 2),
('platform', 'C', '自媒体（微博）', 3),
('platform', 'D', '自媒体（快手）', 4),
('platform', 'E', '自媒体（抖音）', 5),
('platform', 'F', '自媒体（B站）', 6),
('platform', 'G', '自媒体（小红书）', 7),
('platform', 'H', '自媒体（喜马拉雅）', 8),
('platform', 'I', '自媒体（官网）', 9),
('platform', 'J', '媒体（电视）', 10),
('platform', 'K', '媒体（网络）', 11),
('platform', 'L', '媒体（报刊）', 12),
('platform', 'M', '媒体（音频）', 13);

-- 内容分类字典
INSERT INTO `dict_type` (`type_code`, `type_name`, `description`) VALUES
('content_category', '内容分类', '媒体发布内容分类');

-- 内容分类字典项
INSERT INTO `dict_item` (`type_code`, `item_code`, `item_name`, `sort_order`) VALUES
('content_category', '1', '医院新闻', 1),
('content_category', '2', '医科科普', 2),
('content_category', '3', '就诊信息', 3),
('content_category', '4', '医疗技术', 4),
('content_category', '5', '其他', 5);