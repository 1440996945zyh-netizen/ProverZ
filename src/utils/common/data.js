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
	columns.forEach(item => {
		if (propsObj[item.prop]) {
			item.selectData = propsObj[item.prop]
		}
	})
};
// 基础运算符映射（通用部分）
const baseOperatorMap = {
  equals: '=',
  notEquals: '!=',
  greaterThan: '>',
  lessThan: '<',
  greaterEqualsThan: '>=',
  lessEqualsThan: '<=',
  contain: 'LIKE',
  notContain: 'NOT LIKE',
  containAll: 'IN',
  containAny: 'IN',
  interval: 'BETWEEN',
  equalsAny: 'IN',
  notEqualsAny: 'NOT IN'
}

// MySQL 专用运算符映射
export const mysqlOperatorMap = {
  ...baseOperatorMap,
  empty: 'IS NULL',          // MySQL 中空值仅需判断 IS NULL
  notEmpty: 'IS NOT NULL'
}

// Oracle 专用运算符映射
export const oracleOperatorMap = {
  ...baseOperatorMap,
  empty: 'IS NULL OR = \'\'', // Oracle 需同时处理 NULL 和空字符串
  notEmpty: 'IS NOT NULL AND != \'\''
}
/**
 * 将查询条件转换为SQL格式
 * @param {Array} conditions - 查询条件数组
 * @param {String} filterType - 过滤类型 (AND/OR)
 * @returns {String} SQL格式的查询条件字符串
 */
export const convertToMysql = (conditions, filterType) => {
	const sqlParts = []
	
	conditions.forEach(condition => {
		const columnName = condition.columnName
		const operator = condition.operator
		const sqlOperator = mysqlOperatorMap[operator]
		
		// 处理不同类型的运算符
		if (operator === 'empty') {
			// 为空: column IS NULL
			sqlParts.push(`${columnName} IS NULL`)
		} else if (operator === 'notEmpty') {
			// 非空: column IS NOT NULL
			sqlParts.push(`${columnName} IS NOT NULL`)
		} else if (operator === 'interval' || operator === 'between') {
			// 区间: column BETWEEN 'startValue' AND 'endValue'
			sqlParts.push(`${columnName} BETWEEN '${condition.startValue}' AND '${condition.endValue}'`)
		} else if (operator === 'contain' || operator === 'notContain') {
			// 包含/不包含: column LIKE '%value%'
			const value = `%${condition.value}%`
			sqlParts.push(`${columnName} ${sqlOperator} '${value}'`)
		} else if (operator === 'containAll' || operator === 'containAny' || operator === 'equalsAny' || operator === 'notEqualsAny') {
			// 多选或单选的IN操作
			const values = Array.isArray(condition.value) ? condition.value : [condition.value]
			if (values.length === 0) {
				// 如果没有选中任何值，根据操作符决定是否添加条件
				if (operator === 'containAll' || operator === 'equalsAny') {
					// 如果是"同时包含"或"等于任意一个"且没有选中值，则条件无法满足
					sqlParts.push('1=0') // 永远为假
				}
				// 如果是"包含任意一个"或"不等于任意一个"且没有选中值，则忽略此条件
			} else {
				const valuesStr = values.map(v => `'${v}'`).join(',')
				const sqlOp = sqlOperator
				sqlParts.push(`${columnName} ${sqlOp} (${valuesStr})`)
			}
		} else {
			// 普通操作符: column = 'value'
			sqlParts.push(`${columnName} ${sqlOperator} '${condition.value}'`)
		}
	})
	
	// 根据过滤类型连接SQL片段
	const sqlConnector = filterType.toLowerCase() === 'and' ? ' AND ' : ' OR '
	const whereClause = sqlParts.length > 0 ? sqlParts.join(sqlConnector) : '1=1'
	const sql = filterType.toUpperCase() + ' ' + whereClause
  return sql
}
/**
 * 将查询条件转换为Oracle SQL格式
 * @param {Array} conditions - 查询条件数组
 * @param {String} filterType - 过滤类型 (AND/OR)
 * @returns {String} Oracle SQL格式的查询条件字符串
 */
export const convertToOracle = (conditions, filterType) => {
  const sqlParts = []
  
  conditions.forEach(condition => {
    const columnName = condition.columnName
    const operator = condition.operator
    const sqlOperator = oracleOperatorMap[operator]
    
    // 处理不同类型的运算符
    if (operator === 'empty') {
      // Oracle中空值判断需同时处理NULL和空字符串（根据实际业务场景调整）
      sqlParts.push(`${columnName} IS NULL OR ${columnName} = ''`)
    } else if (operator === 'notEmpty') {
      // 非空判断（排除NULL和空字符串）
      sqlParts.push(`${columnName} IS NOT NULL AND ${columnName} != ''`)
    } else if (operator === 'interval' || operator === 'between') {
      // 区间查询：Oracle的BETWEEN包含边界值，与MySQL一致
      // 日期类型需用TO_DATE转换（假设前端传递的是'YYYY-MM-DD HH24:MI:SS'格式）
      let startVal = condition.startValue
      let endVal = condition.endValue
      // 如果是日期类型字段，添加TO_DATE转换
      if (condition.columnType === '4') {
        startVal = `TO_DATE('${startVal}', 'YYYY-MM-DD HH24:MI:SS')`
        endVal = `TO_DATE('${endVal}', 'YYYY-MM-DD HH24:MI:SS')`
      } else {
        // 非日期类型加单引号
        startVal = `'${startVal}'`
        endVal = `'${endVal}'`
      }
      sqlParts.push(`${columnName} BETWEEN ${startVal} AND ${endVal}`)
    } else if (operator === 'contain' || operator === 'notContain') {
      // 包含/不包含：Oracle使用LIKE，字符串连接用||
      const value = `%${condition.value}%`
      sqlParts.push(`${columnName} ${sqlOperator} '%' || '${condition.value}' || '%'`)
    } else if (operator === 'containAll' || operator === 'containAny' || operator === 'equalsAny' || operator === 'notEqualsAny') {
      // 多选/单选IN操作：Oracle的IN列表不支持空，需特殊处理
      const values = Array.isArray(condition.value) ? condition.value : [condition.value]
      if (values.length === 0) {
        if (operator === 'containAll' || operator === 'equalsAny') {
          sqlParts.push('1=0') // 永远为假
        }
      } else {
        // 字符串类型值需加单引号，数字类型不加（这里简化处理，假设都是字符串）
        const valuesStr = values.map(v => `'${v}'`).join(',')
        sqlParts.push(`${columnName} ${sqlOperator} (${valuesStr})`)
      }
    } else {
      // 普通操作符：处理日期类型
      let value = condition.value
      if (condition.columnType === '4') {
        // 日期类型转换
        value = `TO_DATE('${value}', 'YYYY-MM-DD HH24:MI:SS')`
      } else {
        // 字符串类型加单引号，数字类型自动识别（这里简化处理）
        value = isNaN(Number(value)) ? `'${value}'` : value
      }
      sqlParts.push(`${columnName} ${sqlOperator} ${value}`)
    }
  })
  
  // 根据过滤类型连接SQL片段，Oracle中AND/OR大小写不敏感，这里统一大写
  const sqlConnector = filterType.toUpperCase() === 'AND' ? ' AND ' : ' OR '
  const whereClause = sqlParts.length > 0 ? sqlParts.join(sqlConnector) : '1=1'
  const sql = filterType.toUpperCase() + ' ' + whereClause
  return sql
}