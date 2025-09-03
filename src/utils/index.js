import { parseTime } from './common/day'
import { pinyin } from './constant/constant'

/**
 * 表格时间格式化
 * yyyy-MM-dd hh:mm:ss格式
 * @param {*} cellValue
 */
export function formatDate(cellValue) {
	if (cellValue == null || cellValue == '') return ''
	var date = new Date(cellValue)
	var year = date.getFullYear()
	var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
	var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
	var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
	var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
	var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
	return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 * 系统时间与传入时间差值小于30秒则返回“刚刚”
 * 大于30秒小于1小时则返回xx分钟前
 * 大于1小时小于24小时则返回xx小时前
 * 大于24小数小于48小时返回一天前
 * 如果都不满足则返回传入时间，格式为传入的option
 * 
 */
export function formatTime(time, option) {
	if (('' + time).length === 10) {
		time = parseInt(time) * 1000
	} else {
		time = +time
	}
	const d = new Date(time)
	const now = Date.now()

	const diff = (now - d) / 1000

	if (diff < 30) {
		return '刚刚'
	} else if (diff < 3600) {
		// less 1 hour
		return Math.ceil(diff / 60) + '分钟前'
	} else if (diff < 3600 * 24) {
		return Math.ceil(diff / 3600) + '小时前'
	} else if (diff < 3600 * 24 * 2) {
		return '1天前'
	}
	if (option) {
		return parseTime(time, option)
	} else {
		return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
	}
}

/**
 * 
 * 根据传入的时间戳，返回一个时间字符串
 * 示例：
 * 使用默认格式（秒级时间戳）parseDate(1684132225) 
 * 输出："2023-05-15 14:30:25"（假设时间戳对应此时间）
 * 自定义格式（毫秒级时间戳）parseDate(1684132225000, '{yyyy}年{mm}月{dd}日 星期{a}') 
 * 输出："2023年05月15日 星期一"
 * 传入Date对象 parseDate(new Date(), '{hh}:{ii}:{ss}') 
 * 输出："14:30:25"（当前时间的时分秒）
 */
export function parseDate(time, cFormat) {
	if (!time) {
	  return ''
	}
	const format = cFormat || '{yyyy}-{mm}-{dd} {hh}:{ii}:{ss}'
	let date
	if (typeof time === 'object') {
	  date = time
	} else {
	  if (parseInt(time) + ''.length === 10) {
		time = parseInt(time) * 1000
	  }
	  date = new Date(time)
	}
	const formatObj = {
	  y: date.getFullYear(),
	  m: date.getMonth() + 1,
	  d: date.getDate(),
	  h: date.getHours(),
	  i: date.getMinutes(),
	  s: date.getSeconds(),
	  a: date.getDay()
	}
	const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
	  let value = formatObj[key]
	  if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
	  if (result.length > 0 && value < 10) {
		value = '0' + value
	  }
	  return value || 0
	})
	return time_str
  }
/**
 * 格式化金额
 * 每三位用一个逗号隔开
 * 保留两位小数
 * @param value
 * @returns {string|boolean}
 */
export function formatMoney(value) {
	if (!value) {
		return '-'
	}
	//强制保留两位小数
	let f = parseFloat(value)
	if (isNaN(f)) return false
	f = Math.round(value * 100) / 100
	let s = f.toString()
	let rs = s.indexOf('.')
	if (rs < 0) {
		rs = s.length
		s += '.'
	}
	while (s.length < rs + 1 + 2) {
		s += '0'
	}
	//每三位用一个逗号隔开
	let leftNum = s.split('.')[0]
	let rightNum = '.' + s.split('.')[1]
	let result
	//定义数组记录截取后的价格
	let resultArray = new Array()
	if (leftNum.length > 3) {
		let i = true
		while (i) {
			resultArray.push(leftNum.slice(-3))
			leftNum = leftNum.slice(0, leftNum.length - 3)
			if (leftNum.length < 4) {
				i = false
			}
		}
		//由于从后向前截取，所以从最后一个开始遍历并存到一个新的数组，顺序调换
		let sortArray = new Array()
		for (let i = resultArray.length - 1; i >= 0; i--) {
			sortArray.push(resultArray[i])
		}
		result = leftNum + ',' + sortArray.join(',') + rightNum
	} else {
		result = s
	}
	return result
}
/**
 * 数组去重
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
	return Array.from(new Set(arr))
}
/**
 * 数组对象去重
 * @param {*} arr 去重数组
 * @param {*} uniId 根据哪个字段去重
 */
export const uniqueFunc = (arr, uniId) => {
	const res = new Map()
	return arr.filter(item => !res.has(item[uniId]) && res.set(item[uniId], 1))
}
/**
 * 数组对象排序
 * @param {*} key 根据哪个字段排序
 * @param {*} order 升序/降序（desc） 默认升序
 */
export const compareValues = (key, order = 'asc') => {
	return function innerSort(a, b) {
		if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
			// 该属性在任何一个对象上都不存在
			return 0
		}

		const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key]
		const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key]

		let comparison = 0
		if (varA > varB) {
			comparison = 1
		} else if (varA < varB) {
			comparison = -1
		}
		return order === 'desc' ? comparison * -1 : comparison
	}
}
// 带函数的数据JSON转化
export const stringify = obj => {
	try {
		return JSON.stringify(obj, (k, v) => {
			if (typeof v === 'function') {
				return `FUNCTION_FLAG ${v}`
			} else {
				return v
			}
		})
	} catch (error) {
		console.log(error)
		return '出错了'
	}
}
export const parse = jsonStr => {
	try {
		return JSON.parse(jsonStr, (key, value) => {
			if (value && typeof value === 'string') {
				return value.indexOf('FUNCTION_FLAG') > -1 ? new Function(`return ${value.replace('FUNCTION_FLAG', '')}`)() : value
			}
			return value
		})
	} catch (error) {
		console.log(error)
		return '出错了'
	}
}
// 中文转拼音
export const chineseToPinYin = l1 => {
	var l2 = l1.length
	var I1 = ''
	var reg = new RegExp('[\u4e00-\u9fa5]+')
	const arraySearch = (l1, l2) => {
		for (var name in pinyin) {
			if (pinyin[name].indexOf(l1) !== -1) {
				return ucfirst(name)
			}
		}
		return false
	}
	const ucfirst = l1 => {
		if (l1.length > 0) {
			var first = l1.substr(0, 1).toUpperCase()
			var spare = l1.substr(1, l1.length)
			return first + spare
		}
	}
	for (var i = 0; i < l2; i++) {
		var val = l1.substr(i, 1)
		var name = arraySearch(val, pinyin)
		if (!reg.test(val)) {
			I1 += val
		}
		if (name !== false) {
			I1 += name
		}
	}
	I1 = I1.replace(/ /g, '-')
	/*while (I1.indexOf('--') > 0) {
      I1 = I1.replace('--', '-');
    }*/
	return I1
}
/**
 * 创建速记码
 * @param {*} targetData 需要转换的字符串
 */
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
// ---------------------------<<时间格式转换>>-----------------------------
/**
 * 时间段计算时长
 * 默认小数点后一位四舍五入
 * @param {*} timeList 需要转换的字符串
 * * @param {*} type 传Sting类型 hour date min
 */
export const getDuration = (type, timeList) => {
	if (timeList.length == 2) {
		var beginTime = new Date(timeList[0])
		var endTime = new Date(timeList[1])
		if (type == 'hour') {
			//获取多少小时
			var hours = (endTime - beginTime) / (1000 * 60 * 60)
			return Math.round(hours * 10) / 10
		} else if (type == 'date') {
			//获取多少天
			var date = (endTime - beginTime) / (1000 * 60 * 60 * 24)
			return Math.round(date * 10) / 10
		} else if (type == 'min') {
			//获取多少分钟
			var min = (endTime - beginTime) / (1000 * 60)
			return Math.round(min * 10) / 10
		}else if (type == 'hourMin'){
		//获取时分
      var timeDifference = endTime - beginTime;

      var hoursWithDecimal = timeDifference / (1000 * 60 * 60);

      return hoursWithDecimal.toFixed(2);
    }
	} else {
		return
	}
}
/**
 * 获取当前日期时间
 */
export const getNowDate = dateType => {
	var now = new Date()
	var year = now.getFullYear()
	var month = now.getMonth() + 1
	month = month < 10 ? '0' + month : month
	var day = now.getDate()
	day = day < 10 ? '0' + day : day
	var hour = now.getHours()
	var min = now.getMinutes()
	min = min < 10 ? '0' + min : min
	var sec = now.getSeconds()
	sec = sec < 10 ? '0' + sec : sec
	if (dateType == 'YYYY-MM-DD hh:mm:ss') {
		return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec
	} else if (dateType == 'YYYY-MM-DD hh:mm') {
		return year + '-' + month + '-' + day + ' ' + hour + ':' + min
	} else if (dateType == 'YYYY-MM-DD hh') {
		return year + '-' + month + '-' + day + ' ' + hour
	} else if (dateType == 'YYYY-MM-DD') {
		return year + '-' + month + '-' + day
	} else if (dateType == 'YYYY-MM') {
		return year + '-' + month
	} else if (dateType == 'YYYY') {
		return year
	}
}
// 获取当前时间多少天 before之前   after之后
export const getBeforeAfter = (dateType, num,type) => {
	let now
	if (dateType == 'before') {
		now = new Date(new Date().getTime() - num * 1000 * 60 * 60 * 24)
	} else if (dateType == 'after') {
		now = new Date(new Date().getTime() + num * 1000 * 60 * 60 * 24)
	}
	let year = now.getFullYear()
	let month = now.getMonth() + 1
	month = month < 10 ? '0' + month : month
	let day = now.getDate()
	day = day < 10 ? '0' + day : day
	var hour = now.getHours()
	hour = hour < 10 ? '0' + hour : hour
	var min = now.getMinutes()
	min = min < 10 ? '0' + min : min
	var sec = now.getSeconds()
	sec = sec < 10 ? '0' + sec : sec
	if (type == 'YYYY-MM-DD hh:mm:ss') {
		return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec
	} else if (type == 'YYYY-MM-DD hh:mm') {
		return year + '-' + month + '-' + day + ' ' + hour + ':' + min
	} else if (type == 'YYYY-MM-DD hh') {
		return year + '-' + month + '-' + day + ' ' + hour
	} else if (type == 'YYYY-MM-DD') {
		return year + '-' + month + '-' + day
	} else if (type == 'YYYY-MM') {
		return year + '-' + month
	} else if (type == 'YYYY') {
		return year
	}
}
/**
 * 对象重置递归方法
 * @param {Object} obj
 */
export const resetObj = obj => {
	for (const key in obj) {
		if (obj[key] instanceof Array) {
			obj[key] = []
		} else if (obj[key] instanceof Object) {
			resetForm(obj[key])
		} else {
			obj[key] = ''
		}
	}
}
//--------------------------------------------------------------------------------------------------
/**
 * @param {string} url
 * @returns {Object}
 * 解析 URL 中的查询参数
 * 并将其转换为键值对形式的 JavaScript 对象，方便获取 URL 中携带的参数。
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
 * @param {string} input value
 * @returns {number} output value
 * 计算UTF-8 编码下字符串的字节长度
 */
export function byteLength(str) {
	// returns the byte length of an utf8 string
	let s = str.length
	for (var i = str.length - 1; i >= 0; i--) {
		const code = str.charCodeAt(i)
		if (code > 0x7f && code <= 0x7ff) s++
		else if (code > 0x7ff && code <= 0xffff) s += 2
		if (code >= 0xdc00 && code <= 0xdfff) i--
	}
	return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 * 清除数组中的空元素
 */
export function cleanArray(actual) {
	const newArray = []
	for (let i = 0; i < actual.length; i++) {
		if (actual[i]) {
			newArray.push(actual[i])
		}
	}
	return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 * 将 JavaScript 对象转换为 URL 查询参数字符串（如 key1=value1&key2=value2）
 */
export function param(json) {
	if (!json) return ''
	return cleanArray(
		Object.keys(json).map(key => {
			if (json[key] === undefined) return ''
			return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
		})
	).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 * 将 URL 中的查询参数字符串解析为 JavaScript 对象
 */
export function param2Obj(url) {
	const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
	if (!search) {
		return {}
	}
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
 * @param {string} val
 * @returns {string}
 * 将 HTML 字符串转换为纯文本，即移除 HTML 标签，只保留其中的文本内容
 */
export function html2Text(val) {
	const div = document.createElement('div')
	div.innerHTML = val
	return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 * 深度合并两个对象
 * 将源对象（source）的属性合并到目标对象（target）中
 * 支持嵌套对象的递归合并。
 * 与简单的浅拷贝不同，它会处理嵌套的对象结构，而不是直接覆盖。
 */
export function objectMerge(target, source) {
	if (typeof target !== 'object') {
		target = {}
	}
	if (Array.isArray(source)) {
		return source.slice()
	}
	Object.keys(source).forEach(property => {
		const sourceProperty = source[property]
		if (typeof sourceProperty === 'object') {
			target[property] = objectMerge(target[property], sourceProperty)
		} else {
			target[property] = sourceProperty
		}
	})
	return target
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

/**
 * @param {string} type
 * @returns {Date}
 * 返回90 天前的当前时间戳（毫秒级）start
 * 返回当前时间戳（毫秒级）
 */
export function getTime(type) {
	if (type === 'start') {
		return new Date().getTime() - 3600 * 1000 * 24 * 90
	} else {
		return new Date(new Date().toDateString())
	}
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 * 防抖 const debouncedSearch = debounce(fetchSearchResults, 500, false);
 */
export function debounce(func, wait, immediate) {
	let timeout, args, context, timestamp, result

	const later = function () {
		// 据上一次触发时间间隔
		const last = +new Date() - timestamp

		// 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
		if (last < wait && last > 0) {
			timeout = setTimeout(later, wait - last)
		} else {
			timeout = null
			// 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
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
		// 如果延时不存在，重新设定延时
		if (!timeout) timeout = setTimeout(later, wait)
		if (callNow) {
			result = func.apply(context, args)
			context = args = null
		}

		return result
	}
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 * 深度复制对象（递归）
 */
export function deepClone(source) {
	if (!source && typeof source !== 'object') {
		throw new Error('error arguments', 'deepClone')
	}
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

/**
 * @returns {string}
 */
export function createUniqueString() {
	const timestamp = +new Date() + ''
	const randomNum = parseInt((1 + Math.random()) * 65536) + ''
	return (+(randomNum + timestamp)).toString(32)
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

export const exportDefault = 'export default '

export const beautifierConf = {
	html: {
		indent_size: '2',
		indent_char: ' ',
		max_preserve_newlines: '-1',
		preserve_newlines: false,
		keep_array_indentation: false,
		break_chained_methods: false,
		indent_scripts: 'separate',
		brace_style: 'end-expand',
		space_before_conditional: true,
		unescape_strings: false,
		jslint_happy: false,
		end_with_newline: true,
		wrap_line_length: '110',
		indent_inner_html: true,
		comma_first: false,
		e4x: true,
		indent_empty_lines: true,
	},
	js: {
		indent_size: '2',
		indent_char: ' ',
		max_preserve_newlines: '-1',
		preserve_newlines: false,
		keep_array_indentation: false,
		break_chained_methods: false,
		indent_scripts: 'normal',
		brace_style: 'end-expand',
		space_before_conditional: true,
		unescape_strings: false,
		jslint_happy: true,
		end_with_newline: true,
		wrap_line_length: '110',
		indent_inner_html: true,
		comma_first: false,
		e4x: true,
		indent_empty_lines: true,
	},
}

// 首字母大小
export function titleCase(str) {
	return str.replace(/( |^)[a-z]/g, L => L.toUpperCase())
}

// 下划转驼峰
export function camelCase(str) {
	return str.replace(/_[a-z]/g, str1 => str1.substr(-1).toUpperCase())
}

export function isNumberStr(str) {
	return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str)
}
