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

// 防抖函数
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
export function resetForm(vm, refName) {
  if (vm.$refs[refName]) {
    vm.$refs[refName].resetFields()
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


export function formatMoney(value) {
  if (!value && value !== 0) {
    return '-'
  }
  
  // 处理负数
  let isNegative = false
  let num = Number(value)
  
  if (isNaN(num)) return '-'
  if (num < 0) {
    isNegative = true
    num = Math.abs(num)
  }
  
  // 格式化数字为两位小数
  const formatted = num.toFixed(2)
  
  // 分割整数和小数部分
  const [integerPart, decimalPart] = formatted.split('.')
  
  // 添加千分位分隔符
  const integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // 组合结果并处理负数
  const result = `${integerWithCommas}.${decimalPart}`
  return isNegative ? `-${result}` : result
}

/**
 * 将格式化的金额字符串转换回数字
 * @param {*} formattedValue 
 * @returns 
 */
export function unformatMoney(formattedValue) {
  // 如果值为空或无效，返回 0
  if (!formattedValue || formattedValue === '-' || formattedValue === 'N/A') {
    return 0
  }
  
  // 移除千分位分隔符(逗号)
  let cleanedValue = String(formattedValue).replace(/,/g, '')
  
  // 转换为数字
  const numericValue = parseFloat(cleanedValue)
  
  // 如果转换结果不是数字，返回 0
  if (isNaN(numericValue)) {
    console.warn(`无法将 '${formattedValue}' 转换为数字`);
    return 0;
  }
  
  return numericValue;
}