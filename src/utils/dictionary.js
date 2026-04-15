// 字典管理工具函数

/**
 * 根据代码获取平台名称
 * @param {Array} platforms - 平台列表
 * @param {string} code - 平台代码
 * @returns {string} 平台名称
 */
export const getPlatformNameByCode = (platforms, code) => {
  if (!platforms || !Array.isArray(platforms)) return code;
  const platform = platforms.find(p => p.code === code);
  return platform ? platform.name : code;
};

/**
 * 根据代码获取内容分类名称
 * @param {Array} contentCategories - 内容分类列表
 * @param {string} code - 内容分类代码
 * @returns {string} 内容分类名称
 */
export const getContentCategoryNameByCode = (contentCategories, code) => {
  if (!contentCategories || !Array.isArray(contentCategories)) return code;
  const category = contentCategories.find(c => c.code === code);
  return category ? category.name : code;
};

/**
 * 根据代码获取科室分类名称
 * @param {Array} departmentCategories - 科室分类列表
 * @param {string} code - 科室分类代码
 * @returns {string} 科室分类名称
 */
export const getDepartmentCategoryNameByCode = (departmentCategories, code) => {
  if (!departmentCategories || !Array.isArray(departmentCategories)) return code;
  const category = departmentCategories.find(c => c.code === code);
  return category ? category.name : code;
};

/**
 * 根据代码获取科室名称
 * @param {Array} departments - 科室列表
 * @param {string} code - 科室代码
 * @returns {string} 科室名称
 */
export const getDepartmentNameByCode = (departments, code) => {
  if (!departments || !Array.isArray(departments)) return code;
  const department = departments.find(d => d.code === code);
  return department ? department.name : code;
};

/**
 * 根据ID获取科室分类名称
 * @param {Array} departmentCategories - 科室分类列表
 * @param {number} id - 科室分类ID
 * @returns {string} 科室分类名称
 */
export const getDepartmentCategoryNameById = (departmentCategories, id) => {
  if (!departmentCategories || !Array.isArray(departmentCategories)) return '';
  const category = departmentCategories.find(c => c.id === id);
  return category ? category.name : '';
};