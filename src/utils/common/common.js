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
  if (p.length === 0 || !p || p === 'undefined') return p
  let res = p.replace('//', '/')
  if (res[res.length - 1] === '/') res = res.slice(0, res.length - 1)
  return res
}
/**
 * 可编辑表格中的下拉框赋值方法
 * @param {Array} columns 表头
 * @param {Object} propsObj {需要赋值的列的prop：赋值的数据}
 */
export const setEditTableOptions = (columns, propsObj) => {
	columns.forEach(item => {
		if (propsObj[item.prop]) {
			item.selectData = propsObj[item.prop]
		}
	})
}
/**
 * 深拷贝
 */
export const deepClone = v => {
	return JSON.parse(JSON.stringify(v))
}
