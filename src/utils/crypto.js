import crypto from 'crypto';

/**
 * 加密密码
 * @param {string} password - 原始密码
 * @returns {string} 加密后的密码
 */
export function encryptPassword(password) {
  // 使用 MD5 加密
  const md5 = crypto.createHash('md5');
  return md5.update(password).digest('hex');
}

/**
 * 生成随机盐值
 * @param {number} length - 盐值长度
 * @returns {string} 随机盐值
 */
export function generateSalt(length = 8) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

/**
 * 使用盐值加密密码
 * @param {string} password - 原始密码
 * @param {string} salt - 盐值
 * @returns {string} 加密后的密码
 */
export function encryptPasswordWithSalt(password, salt) {
  const md5 = crypto.createHash('md5');
  return md5.update(password + salt).digest('hex');
}
