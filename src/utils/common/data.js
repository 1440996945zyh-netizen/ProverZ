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

// 数组去重
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

// 数组对象去重
export const uniqueFunc = (arr, uniId) => {
  const res = new Map()
  return arr.filter(item => !res.has(item[uniId]) && res.set(item[uniId], 1))
}

// 数组对象排序
export const compareValues = (key, order = 'asc') => {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0
    const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key]
    const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key]
    let comparison = 0
    if (varA > varB) comparison = 1
    else if (varA < varB) comparison = -1
    return order === 'desc' ? comparison * -1 : comparison
  }
}

// 清除数组空元素
export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) newArray.push(actual[i])
  }
  return newArray
}

// 深度合并对象
export function objectMerge(target, source) {
  if (typeof target !== 'object') target = {}
  if (Array.isArray(source)) return source.slice()
  Object.keys(source).forEach(property => {
    if (typeof source[property] === 'object') {
      target[property] = objectMerge(target[property], source[property])
    } else {
      target[property] = source[property]
    }
  })
  return target
}

// 对象重置（递归清空）
export const resetObj = obj => {
  for (const key in obj) {
    if (obj[key] instanceof Array) obj[key] = []
    else if (obj[key] instanceof Object) resetObj(obj[key])
    else obj[key] = ''
  }
}

// 深拷贝
export function deepClone(source) {
  if (!source && typeof source !== 'object') throw new Error('error arguments')
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

// 带函数的JSON序列化
export const stringify = obj => {
  try {
    return JSON.stringify(obj, (k, v) => 
      typeof v === 'function' ? `FUNCTION_FLAG ${v}` : v
    )
  } catch (error) {
    console.log(error)
    return '出错了'
  }
}

// 带函数的JSON反序列化
export const parse = jsonStr => {
  try {
    return JSON.parse(jsonStr, (key, value) => 
      value && typeof value === 'string' && value.indexOf('FUNCTION_FLAG') > -1
        ? new Function(`return ${value.replace('FUNCTION_FLAG', '')}`)()
        : value
    )
  } catch (error) {
    console.log(error)
    return '出错了'
  }
}

