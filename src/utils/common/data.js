/**
 * @Author: zhangsd
 * @Date: 2025-09-03 11:30:49
 * @LastEditTime: 2025-09-03 11:30:49
 * @LastEditors: zhangsd
 * @Description: 数据处理工具（数组、对象、JSON）
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\common\data.js
 */
/**
 * 数据处理工具（数组、对象、JSON）
 */

/**
 * ========================================================================
 * 数组处理相关
 * ========================================================================
 */

/**
 * 数组去重
 * @param {Array} arr - 要去重的数组
 * @returns {Array} 去重后的数组
 */
export function removeDuplicates(arr) {
  return Array.from(new Set(arr));
}

/**
 * 数组对象去重
 * @param {Array} arr - 对象数组
 * @param {string} uniId - 用于去重的唯一标识属性
 * @returns {Array} 去重后的对象数组
 */
export const removeDuplicatesByProperty = (arr, uniId) => {
  const res = new Map();
  return arr.filter(item => !res.has(item[uniId]) && res.set(item[uniId], 1));
};
/**
 * 数组对象排序
 * @param {string} key - 排序的键
 * @param {string} [order='asc'] - 排序顺序（asc: 升序, desc: 降序）
 * @returns {Function} 排序函数
 */
export const createSortComparator = (key, order = 'asc') => {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;
    const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
    let comparison = 0;
    if (varA > varB) comparison = 1;
    else if (varA < varB) comparison = -1;
    return order === 'desc' ? comparison * -1 : comparison;
  };
};
/**
 * 清除数组空元素
 * @param {Array} actual - 要清理的数组
 * @returns {Array} 清理后的数组
 */
export function filterFalsyValues(actual) {
  const newArray = [];
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) newArray.push(actual[i]);
  }
  return newArray;
}




/**
 * ========================================================================
 * 对象处理相关
 * ========================================================================
 */

/**
 * 深度合并对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
export function deepMerge(target, source) {
  if (typeof target !== 'object') target = {};
  if (Array.isArray(source)) return source.slice();
  Object.keys(source).forEach(property => {
    if (typeof source[property] === 'object') {
      target[property] = deepMerge(target[property], source[property]);
    } else {
      target[property] = source[property];
    }
  });
  return target;
}

/**
 * 对象重置（递归清空）
 * @param {Object} obj - 要重置的对象
 */
export const clearObjectValues = obj => {
  for (const key in obj) {
    if (obj[key] instanceof Array) obj[key] = [];
    else if (obj[key] instanceof Object) clearObjectValues(obj[key]);
    else obj[key] = '';
  }
};
/**
 * 深拷贝
 * @param {Object|Array} source - 要拷贝的对象
 * @returns {Object|Array} 深拷贝后的对象
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') throw new Error('error arguments');
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}


/**
 * ========================================================================
 * JSON处理相关
 * ========================================================================
 */

/**
 * 带函数的JSON序列化
 * @param {Object} obj - 要序列化的对象
 * @returns {string} 序列化后的JSON字符串
 */
export const stringifyWithFunctions = obj => {
  try {
    return JSON.stringify(obj, (k, v) => 
      typeof v === 'function' ? `FUNCTION_FLAG ${v}` : v
    );
  } catch (error) {
    console.log(error);
    return '出错了';
  }
};

/**
 * 带函数的JSON反序列化
 * @param {string} jsonStr - JSON字符串
 * @returns {Object} 反序列化后的对象
 */
export const parseWithFunctions = jsonStr => {
  try {
    return JSON.parse(jsonStr, (key, value) => 
      value && typeof value === 'string' && value.indexOf('FUNCTION_FLAG') > -1
        ? new Function(`return ${value.replace('FUNCTION_FLAG', '')}`)()
        : value
    );
  } catch (error) {
    console.log(error);
    return '出错了';
  }
};



/**
 * ========================================================================
 * 数据处理相关
 * ========================================================================
 */
/**
 * 构造树形结构
 * @param {Array} data - 原始数据
 * @param {string} [id='id'] - ID字段名
 * @param {string} [parentId='parentId'] - 父ID字段名
 * @param {string} [children='children'] - 子节点字段名
 * @returns {Array} 树形结构数据
 */
export function flattenToTree(data, id, parentId, children) {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  };
  const childrenListMap = {};
  const nodeIds = {};
  const tree = [];
  for (const d of data) {
    const parentId = d[config.parentId];
    if (!childrenListMap[parentId]) childrenListMap[parentId] = [];
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }
  for (const d of data) {
    const parentId = d[config.parentId];
    if (!nodeIds[parentId]) tree.push(d);
  }
  for (const t of tree) {
    adaptToChildrenList(t);
  }
  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]]) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) adaptToChildrenList(c);
    }
  }
  return tree;
}
/**
 * 数据合并
 * @param {Object} source - 源对象
 * @param {Object} target - 目标对象
 * @returns {Object} 合并后的对象
 */
export function mergeDeeply(source, target) {
  for (var p in target) {
    try {
      if (target[p].constructor === Object) {
        source[p] = mergeDeeply(source[p], target[p]);
      } else {
        source[p] = target[p];
      }
    } catch (e) {
      source[p] = target[p];
    }
  }
  return source;
}

/**
 * 可编辑表格中的下拉框赋值方法
 * @param {Array} columns - 表头
 * @param {Object} propsObj - 需要赋值的列的prop：赋值的数据
 * @returns {Array} 新的表头数据
 */
export const setEditTableOptions = (columns, propsObj) => {
  // 返回新数组，避免修改原数组
  return columns.map(item => {
    if (propsObj[item.prop]) {
      return { ...item, selectData: propsObj[item.prop] };
    }
    return { ...item };
  });
};
