/**
 * @Author: zhangsd
 * @Date: 2025-09-15 09:54:10
 * @LastEditTime: 2025-09-15 09:54:10
 * @LastEditors: zhangsd
 * @Description:  包含防抖、DOM操作、字符串处理、日期处理、数学运算、滚动、标题、路径等基础工具函数
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\common\core.js
 */

import { pinyin } from '../constant/constant'

/*
 * ===================================================================================================
 * 防抖函数
 * ===================================================================================================
 */

/**
 * 防抖函数
 * @param {Function} func - 需要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 * @example
 * const debouncedSearch = debounce(fetchSearchResults, 500, false);
 */
export function debounce(func, wait, immediate) {
	let timeout, context, timestamp, result

	const later = function (args) {
		const last = +new Date() - timestamp
		if (last < wait && last > 0) {
			timeout = setTimeout(() => later(args), wait - last)
		} else {
			timeout = null
			if (!immediate) {
				result = func.apply(context, args)
			}
		}
	}

	return function (...args) {
		context = this
		timestamp = +new Date()
		const callNow = immediate && !timeout

		if (!timeout) timeout = setTimeout(() => later(args), wait)

		if (callNow) {
			result = func.apply(context, args)
		}

		return result
	}
}

/*
 * ===================================================================================================
 * DOM操作
 * ===================================================================================================
 */
/**
 * 判断某个元素是否包含某个class
 * @param {HTMLElement} ele - DOM元素
 * @param {string} cls - 要检查的class
 * @returns {boolean} 是否包含该class
 */
export function hasClass(ele, cls) {
	return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * 给元素新增一个class
 * @param {HTMLElement} ele - DOM元素
 * @param {string} cls - 要添加的class
 */
export function addClass(ele, cls) {
	if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * 删除元素中的class
 * @param {HTMLElement} ele - DOM元素
 * @param {string} cls - 要删除的class
 */
export function removeClass(ele, cls) {
	if (hasClass(ele, cls)) {
		const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
		ele.className = ele.className.replace(reg, ' ')
	}
}
/**
 * 切换元素的class
 * @param {HTMLElement} element - DOM元素
 * @param {string} className - 要切换的class
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

/**
 * 生成检查函数：判断值是否在指定列表中
 * @param {string} str - 逗号分隔的字符串
 * @param {boolean} expectsLowerCase - 是否需要小写转换
 * @returns {Function} 检查函数
 * @example
 * const isUserField = createValueCheckMap("name,age,gender", false);
 * isUserField("name"); // true（存在）
 * isUserField("Name"); // false（大小写不同，严格区分）
 * isUserField("email"); // false（不存在）
 */
export function createValueCheckMap(str, expectsLowerCase) {
	const map = Object.create(null)
	const list = str.split(',')
	for (let i = 0; i < list.length; i++) {
		map[list[i]] = true
	}
	return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}

/**
 * ========================================================================
 * 字符串处理相关
 * ========================================================================
 */
/**
 * 字符串格式化（%s占位符）
 * @param {string} str - 格式化字符串
 * @param {...any} args - 替换参数
 * @returns {string} 格式化后的字符串
 */
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

/**
 * 转换空字符串（undefined/null→""）
 * @param {string} str - 要转换的字符串
 * @returns {string} 转换后的字符串
 */
export function normalizeEmptyString(str) {
	if (!str || str === 'undefined' || str === 'null') return ''
	return str
}

/**
 * 计算字符串的字节长度
 * @param {string} str - 要计算的字符串
 * @returns {number} 字节长度
 */
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

/**
 * 将HTML字符串转换为纯文本
 * @param {string} val - HTML字符串
 * @returns {string} 纯文本内容
 */
export function html2Text(val) {
	const div = document.createElement('div')
	div.innerHTML = val
	return div.textContent || div.innerText
}

/**
 * 将字符串的首字母大写
 * @param {string} str - 要转换的字符串
 * @returns {string} 首字母大写后的字符串
 */
export function capitalize(str) {
	return str.replace(/( |^)[a-z]/g, L => L.toUpperCase())
}

/**
 * 将下划线命名转换为驼峰命名
 * @param {string} str - 下划线命名的字符串
 * @returns {string} 驼峰命名的字符串
 */
export function snakeToCamel(str) {
	return str.replace(/_[a-z]/g, str1 => str1.substr(-1).toUpperCase())
}

/**
 * 中文转拼音
 * @param {string} l1 - 中文字符串
 * @returns {string} 拼音字符串
 */
export const chineseToPinYin = l1 => {
	const l2 = l1.length
	let I1 = ''
	const reg = new RegExp('[\u4e00-\u9fa5]+')
	const arraySearch = l1 => {
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

/**
 * 创建速记码
 * @param {string} targetData - 目标数据
 * @returns {string} 速记码
 */
export const createShortCode = targetData => {
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

/**
 * URL参数解析为对象
 * @param {string} [url=window.location.href] - URL字符串
 * @returns {Object} 参数对象
 */
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

/**
 * 参数对象转为URL参数
 * @param {Object} json - 参数对象
 * @returns {string} URL参数字符串
 */
export function objectToQueryString(json) {
	if (!json) return ''
	return Object.keys(json)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`)
		.join('&')
}

/**
 * URL查询参数解析为对象
 * @param {string} url - URL字符串
 * @returns {Object} 参数对象
 */
export function queryStringToObject(url) {
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
 * 生成唯一字符串
 * @returns {string} 唯一字符串
 */
export function createUniqueString() {
	const timestamp = +new Date() + ''
	const randomNum = parseInt((1 + Math.random()) * 65536) + ''
	return (+(randomNum + timestamp)).toString(32)
}

/**
 * ========================================================================
 * 数字与金额处理相关
 * ========================================================================
 */
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
	const decimalDigits = Math.max(0, Math.floor(Number(precision))) ?? 2
	// 处理负数
	let isNegative = false
	let num = Number(value)
	if (isNaN(num)) return '-'
	if (num < 0) {
		isNegative = true
		num = Math.abs(num)
	}
	// 格式化数字为指定小数位数
	const formatted = num.toFixed(decimalDigits)
	// 分割整数和小数部分
	const parts = formatted.split('.')
	const integerPart = parts[0]
	const decimalPart = parts[1] || ''
	// 添加千分位分隔符
	const integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	// 组合结果（重点修复0位小数的显示问题）
	let result
	if (decimalDigits === 0) {
		// 0位小数时不显示小数点和小数部分
		result = integerWithCommas
	} else {
		// 有小数位时才显示小数点和小数部分
		result = `${integerWithCommas}.${decimalPart}`
	}
	return isNegative ? `-${result}` : result
}

/**
 * 将格式化的金额字符串转换回数字
 * @param {string} formattedValue - 格式化的金额字符串
 * @returns {number} 转换后的数字
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
		console.warn(`无法将 '${formattedValue}' 转换为数字`)
		return 0
	}
	return numericValue
}

/**
 * 检查字符串是否为数字
 * @param {*} str - 要检查的字符串
 * @returns {boolean} 是否为数字字符串
 */
export function isNumberStr(str) {
	return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str)
}

/**
 * 加法运算（解决浮点数精度问题）
 * @param {number} num1 - 第一个数
 * @param {number} num2 - 第二个数
 * @returns {number} 计算结果
 */
export function safeAdd(num1, num2) {
	let result = null
	if (!num1 && !num2) {
		result = 0
	} else {
		var baseNum, baseNum1, baseNum2
		try {
			baseNum1 = num1.toString().split('.')[1].length
		} catch (e) {
			baseNum1 = 0
		}
		try {
			baseNum2 = num2.toString().split('.')[1].length
		} catch (e) {
			baseNum2 = 0
		}
		baseNum = Math.pow(10, Math.max(baseNum1, baseNum2))
		result = (num1 * baseNum + num2 * baseNum) / baseNum
	}
	return result
}

/**
 * 减法运算（解决浮点数精度问题）
 * @param {number} num1 - 第一个数
 * @param {number} num2 - 第二个数
 * @returns {number} 计算结果
 */
export function safeSubtract(num1, num2) {
	let result = null
	if (!num1 && !num2) {
		result = 0
	} else {
		var baseNum, baseNum1, baseNum2
		try {
			baseNum1 = num1.toString().split('.')[1].length
		} catch (e) {
			baseNum1 = 0
		}
		try {
			baseNum2 = num2.toString().split('.')[1].length
		} catch (e) {
			baseNum2 = 0
		}
		baseNum = Math.pow(10, Math.max(baseNum1, baseNum2))
		result = (num1 * baseNum - num2 * baseNum) / baseNum
	}
	return result
}

/**
 * 乘法运算（解决浮点数精度问题）
 * @param {number} num1 - 第一个数
 * @param {number} num2 - 第二个数
 * @param {number} [digit] - 保留的小数位数
 * @returns {number} 计算结果
 */
export function safeMultiply(num1, num2, digit) {
	if (num1 == null || num1 == undefined) return
	if (num2 == null || num2 == undefined) return
	let result = null
	if (!num1 && !num2) {
		result = 0
	} else {
		var baseNum = 0
		try {
			baseNum += num1.toString().split('.')[1].length
		} catch (e) {}
		try {
			baseNum += num2.toString().split('.')[1].length
		} catch (e) {}
		result = (Number(num1.toString().replace('.', '')) * Number(num2.toString().replace('.', ''))) / Math.pow(10, baseNum)
	}
	return result
}

/**
 * 除法运算（解决浮点数精度问题）
 * @param {number} num1 - 被除数
 * @param {number} num2 - 除数
 * @returns {number} 计算结果
 */
export function safeDivide(num1, num2) {
	let result = null
	if (!num1 || !num2) {
		result = 0
	} else {
		var baseNum1 = 0,
			baseNum2 = 0
		var baseNum3, baseNum4
		try {
			baseNum1 = num1.toString().split('.')[1].length
		} catch (e) {
			baseNum1 = 0
		}
		try {
			baseNum2 = num2.toString().split('.')[1].length
		} catch (e) {
			baseNum2 = 0
		}
		baseNum3 = Number(num1.toString().replace('.', ''))
		baseNum4 = Number(num2.toString().replace('.', ''))
		result = (baseNum3 / baseNum4) * Math.pow(10, baseNum2 - baseNum1)
	}
	return result
}

/**
 * ========================================================================
 * 路径处理相关
 * ========================================================================
 */
/**
 * 路径规范化（去除重复斜杠）
 * @param {string} p - 要规范化的路径
 * @returns {string} 规范化后的路径
 */
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
 * 请求参数序列化
 * @param {Object} params - 请求参数对象
 * @returns {string} 序列化后的参数字符串
 */
export function paramsToQueryString(params) {
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

/**
 * 生成 UUID（通用唯一识别码）
 * @returns {string} 生成的 UUID 字符串
 */
export const generateUUID = () => {
  if (typeof crypto === 'object') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    if (typeof crypto.getRandomValues === 'function' && typeof Uint8Array === 'function') {
      const callback = (c) => {
        const num = Number(c)
        return (num ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(
          16
        )
      }
      return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, callback)
    }
  }
  let timestamp = new Date().getTime()
  let performanceNow =
    (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let random = Math.random() * 16
    if (timestamp > 0) {
      random = (timestamp + random) % 16 | 0
      timestamp = Math.floor(timestamp / 16)
    } else {
      random = (performanceNow + random) % 16 | 0
      performanceNow = Math.floor(performanceNow / 16)
    }
    return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16)
  })
}