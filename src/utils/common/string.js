/**
 * @Author: zhangsd
 * @Date: 2025-09-03 11:31:30
 * @LastEditTime: 2025-09-03 11:31:30
 * @LastEditors: zhangsd
 * @Description: description
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\common\string.js
 */
/**
 * 字符串处理工具（格式化、URL、拼音等）
 */
import { pinyin } from '../constant/constant'

// 字符串格式化（%s占位符）
export function sprintf(str) {
  const args = arguments
  let flag = true
  let i = 1
  str = str.replace(/%s/g, () => {
    const arg = args[i++]
    if (typeof arg === 'undefined') {
      flag = false
      return ''
    }
    return arg
  })
  return flag ? str : ''
}

// 转换空字符串（undefined/null→""）
export function parseStrEmpty(str) {
  if (!str || str === 'undefined' || str === 'null') return ''
  return str
}

// 字节长度计算
export function byteLength(str) {
  let s = str.length
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xdc00 && code <= 0xdfff) i--
  }
  return s
}

// HTML转文本
export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

// 首字母大写
export function titleCase(str) {
  return str.replace(/( |^)[a-z]/g, L => L.toUpperCase())
}

// 下划转驼峰
export function camelCase(str) {
  return str.replace(/_[a-z]/g, str1 => str1.substr(-1).toUpperCase())
}

// 中文转拼音
export const chineseToPinYin = l1 => {
  const l2 = l1.length
  let I1 = ''
  const reg = new RegExp('[\u4e00-\u9fa5]+')

  const arraySearch = (l1) => {
    for (const name in pinyin) {
      if (pinyin[name].indexOf(l1) !== -1) return ucfirst(name)
    }
    return false
  }

  const ucfirst = l1 => {
    if (l1.length > 0) {
      const first = l1.substr(0, 1).toUpperCase()
      const spare = l1.substr(1)
      return first + spare
    }
  }

  for (let i = 0; i < l2; i++) {
    const val = l1.substr(i, 1)
    const name = arraySearch(val)
    if (!reg.test(val)) I1 += val
    if (name !== false) I1 += name
  }
  return I1.replace(/ /g, '-')
}

// 创建速记码
export const creatShortCd = targetData => {
  let sx = ''
  let vpy = chineseToPinYin(targetData)
  for (let i = 0; i < vpy.length; i++) {
    let c = vpy.charAt(i)
    if (!/^[a-z]+$/.test(c)) {
      sx += c
    }
  }
  return sx
}

// URL参数解析为对象
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

// 参数对象转为URL参数
export function param(json) {
  if (!json) return ''
  return Object.keys(json)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`)
    .join('&')
}

// URL查询参数解析为对象
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) return {}
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}
/**
 * @description 生成唯一字符串
 * @returns {string}
 */
export function createUniqueString() {
	const timestamp = +new Date() + ''
	const randomNum = parseInt((1 + Math.random()) * 65536) + ''
	return (+(randomNum + timestamp)).toString(32)
}
