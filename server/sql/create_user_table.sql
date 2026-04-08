-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(50) DEFAULT '',
  `password` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT '',
  `lastLoginTime` DATETIME DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始管理员数据，密码为123456
INSERT IGNORE INTO `users` (`username`, `name`, `password`, `description`) VALUES
('admin', '管理员', '123456', '拥有系统内所有菜单和路由权限');