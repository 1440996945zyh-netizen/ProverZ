/**
 * @Author: zhangsd
 * @Date: 2025-09-03 11:29:56
 * @LastEditTime: 2025-09-03 11:29:56
 * @LastEditors: zhangsd
 * @Description: 通用工具集合（防抖、表单、树结构、参数处理等）
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\common\index.js
 */
/**
 * 通用工具集合（防抖、表单、树结构、参数处理等）
 */
// import cache from '../plugins/cache'

/**
 * 防抖函数
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 * 防抖 const debouncedSearch = debounce(fetchSearchResults, 500, false);
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result
  const later = function () {
    const last = +new Date() - timestamp
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }
  return function (...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }
    return result
  }
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields()
  }
}

// 表单数据赋值
export function setFormData(formData, value) {
  if (!value) return
  for (const key in formData) {
    if (value.hasOwnProperty(key) && typeof value[key] !== 'object') {
      formData[key] = value[key]
    }
  }
}

// 构造树形结构
export function handleTree(data, id, parentId, children) {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  }
  const childrenListMap = {}
  const nodeIds = {}
  const tree = []

  for (const d of data) {
    const parentId = d[config.parentId]
    if (!childrenListMap[parentId]) childrenListMap[parentId] = []
    nodeIds[d[config.id]] = d
    childrenListMap[parentId].push(d)
  }

  for (const d of data) {
    const parentId = d[config.parentId]
    if (!nodeIds[parentId]) tree.push(d)
  }

  for (const t of tree) {
    adaptToChildrenList(t)
  }

  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]]) {
      o[config.childrenList] = childrenListMap[o[config.id]]
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) adaptToChildrenList(c)
    }
  }
  return tree
}

// 添加日期范围参数
export function addDateRange(params, dateRange, propName) {
  let search = params
  dateRange = Array.isArray(dateRange) ? dateRange : []
  if (typeof propName === 'undefined') {
    search['beginTime'] = dateRange[0]
    search['endTime'] = dateRange[1]
  } else {
    search['begin' + propName] = dateRange[0]
    search['end' + propName] = dateRange[1]
  }
  return search
}

// 请求参数序列化
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            const params = propName + '[' + key + ']'
            const subPart = encodeURIComponent(params) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

// 数据合并
export function mergeRecursive(source, target) {
  for (var p in target) {
    try {
      if (target[p].constructor === Object) {
        source[p] = mergeRecursive(source[p], target[p])
      } else {
        source[p] = target[p]
      }
    } catch (e) {
      source[p] = target[p]
    }
  }
  return source
} 

// 路径规范化（去除重复斜杠）
export function getNormalPath(p) {
  if (!p || typeof p !== 'string' || p.length === 0) return p
  // 替换所有连续的斜杠为单个斜杠
  let res = p.replace(/\/+/g, '/')
  // 去除结尾的斜杠（根路径除外）
  if (res.length > 1 && res[res.length - 1] === '/') {
    res = res.slice(0, res.length - 1)
  }
  return res
}
/**
 * 可编辑表格中的下拉框赋值方法
 * @param {Array} columns 表头
 * @param {Object} propsObj {需要赋值的列的prop：赋值的数据}
 */
export const setEditTableOptions = (columns, propsObj) => {
  // 返回新数组，避免修改原数组
  return columns.map(item => {
    if (propsObj[item.prop]) {
      return { ...item, selectData: propsObj[item.prop] }
    }
    return { ...item }
  })
}


/**
 * 格式化金额，支持自定义保留的小数位数
 * @param {number|string} value - 要格式化的金额数值
 * @param {number} [precision=2] - 保留的小数位数，默认为2位
 * @returns {string} 格式化后的金额字符串
 */
export function formatMoney(value, precision = 2) {
  // 处理空值或无效值
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  
  // 验证小数位数参数，确保是有效的非负整数
  const decimalDigits = Math.max(0, Math.floor(Number(precision))) ?? 2;
  
  // 处理负数
  let isNegative = false;
  let num = Number(value);
  
  if (isNaN(num)) return '-';
  if (num < 0) {
    isNegative = true;
    num = Math.abs(num);
  }
  
  // 格式化数字为指定小数位数
  const formatted = num.toFixed(decimalDigits);
  
  // 分割整数和小数部分
  const parts = formatted.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';
  
  // 添加千分位分隔符
  const integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // 组合结果（重点修复0位小数的显示问题）
  let result;
  if (decimalDigits === 0) {
    // 0位小数时不显示小数点和小数部分
    result = integerWithCommas;
  } else {
    // 有小数位时才显示小数点和小数部分
    result = `${integerWithCommas}.${decimalPart}`;
  }
  
  return isNegative ? `-${result}` : result;
}

/**
 * 将格式化的金额字符串转换回数字
 * @param {string} formattedValue - 格式化的金额字符串
 * @returns {number} 转换后的数字
 */
export function unformatMoney(formattedValue) {
  // 如果值为空或无效，返回 0
  if (!formattedValue || formattedValue === '-' || formattedValue === 'N/A') {
    return 0;
  }
  
  // 移除千分位分隔符(逗号)
  let cleanedValue = String(formattedValue).replace(/,/g, '');
  
  // 转换为数字
  const numericValue = parseFloat(cleanedValue);
  
  // 如果转换结果不是数字，返回 0
  if (isNaN(numericValue)) {
    console.warn(`无法将 '${formattedValue}' 转换为数字`);
    return 0;
  }
  
  return numericValue;
}
/**
 * 检查字符串是否为数字
 * @param {*} str 
 * @returns 
 */
export function isNumberStr(str) {
	return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 * 判断某个元素是否包含某个class
 */
export function hasClass(ele, cls) {
	return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 * 给元素新增一个class
 */
export function addClass(ele, cls) {
	if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 * 删除元素中的class
 */
export function removeClass(ele, cls) {
	if (hasClass(ele, cls)) {
		const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
		ele.className = ele.className.replace(reg, ' ')
	}
}

/**
 * 
 * @param {*} str 
 * @param {*} expectsLowerCase 
 * @returns 
 * 生成检查函数：判断值是否在 ["name", "age", "gender"] 中
 * const isUserField = makeMap("name,age,gender", false);
 * isUserField("name"); // true（存在）
 * isUserField("Name"); // false（大小写不同，严格区分）
 * isUserField("email"); // false（不存在）
 */
export function makeMap(str, expectsLowerCase) {
	const map = Object.create(null)
	const list = str.split(',')
	for (let i = 0; i < list.length; i++) {
		map[list[i]] = true
	}
	return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}



/**
 * @param {HTMLElement} element
 * @param {string} className
 * 如果元素已经包含该类名，则移除它；如果不包含，则添加它。
 */
export function toggleClass(element, className) {
	if (!element || !className) {
		return
	}
	let classString = element.className
	const nameIndex = classString.indexOf(className)
	if (nameIndex === -1) {
		classString += '' + className
	} else {
		classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length)
	}
	element.className = classString
}


