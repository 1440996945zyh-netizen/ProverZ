/**
 * @Author: zhangsd
 * @Date: 2025-09-12 14:23:00
 * @LastEditTime: 2025-09-12 14:23:00
 * @LastEditors: zhangsd
 * @Description: validate.js 围绕 “合法性校验” 展开，仅返回 “是否合法” 的结果（布尔值、错误信息），不改变原始输入
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\verify\validate.js
 */
/**
 * 判断url是否是http或https
 * @param {string} path
 * @returns {Boolean}
 */
export function isHttp(url) {
	return url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1
}

/**
 * 判断path是否为外链
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
	return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
	const valid_map = ['admin', 'editor']
	return valid_map.indexOf(str.trim()) >= 0
}

/**
 * @param {string} url
 * @returns {Boolean}
 * 判断输入的字符串是否符合标准 URL 的结构
 */
export function validURL(url) {
	const reg =
		/^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
	return reg.test(url)
}

/**
 * @param {string} str
 * @returns {Boolean}
 * 验证字符串是否仅包含小写字母
 */
export function validLowerCase(str) {
	const reg = /^[a-z]+$/
	return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 * 验证字符串是否仅包含大写字母
 */
export function validUpperCase(str) {
	const reg = /^[A-Z]+$/
	return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 * 验证字符串是否仅包含字母
 */
export function validAlphabets(str) {
	const reg = /^[A-Za-z]+$/
	return reg.test(str)
}

/**
 * @param {string} email
 * @returns {Boolean}
 * 验证邮箱是否有效
 */
export function validEmail(email) {
	const reg =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return reg.test(email)
}

/**
 * @param {string} str
 * @returns {Boolean}
 * 验证是否为字符串
 */
export function isString(str) {
	if (typeof str === 'string' || str instanceof String) {
		return true
	}
	return false
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 * 验证是否为数组
 */
export function isArray(arg) {
	if (typeof Array.isArray === 'undefined') {
		return Object.prototype.toString.call(arg) === '[object Array]'
	}
	return Array.isArray(arg)
}

/**
 * 表单验证解析
 */
export function getRules(rules) {
	// eslint-disable-next-line no-array-constructor
	const array = new Array()
	try {
		for (const key in rules) {
			const rule = {}
			switch (key) {
				case 'required':
					const isRequired = rules['required']
					if (isRequired) {
						rule.required = true
						rule.message = check_msg.required
					}
					break
				case 'length':
					const val = rules['length']
					rule.min = parseInt(val.split('-')[0])
					rule.max = parseInt(val.split('-')[1])
					rule.message = '请输入长度在( ' + rule.min + '到 ' + rule.max + ')的字符。'
					break
				case 'numericLenthCheck':
					rule.intLength = rules['numericLenthCheck']['intLength']
					rule.decLength = rules['numericLenthCheck']['decLength']
					rule.plus_minus = rules['numericLenthCheck']['plus_minus']
					rule.validator = numericLenthCheck
					break

				case 'numberCheck':
					rule.int = rules['numberCheck']['int'] // 整数最大位数
					rule.dec = rules['numberCheck']['dec'] // 小数最大位数
					rule.startWith = rules['numberCheck']['startWith'] // 以什么开头 +|-
					rule.validator = numberCheck
					break
				case 'handset': //手机号
					rule.validator = isHandset
					break
				case 'telephone': //电话号
					rule.validator = isTelephone
					break
				case 'email':
					rule.validator = isEmail
					break
				case 'idCard':
					rule.validator = isIdCard
					break
				case 'bankCard':
					rule.validator = isBankCard
					break
			}
			if (isEmpty(rules.trigger)) {
				rule.trigger = 'blur'
			} else {
				rule.trigger = rules.trigger
			}
			array.push(rule)
		}
		return array
		// eslint-disable-next-line no-empty
	} catch (e) { }
}
/**
 * 验证邮箱
 */
export const isEmail = (rule, value = rule.cellValue, callback) => {
	if (isEmpty(value)) {
		if (!callback) return
		callback()
	}
	var pattern =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	if (!pattern.test(value)) {
		return new Error('输入的邮箱错误')
	}
	if (!callback) return
	callback()
}

/**
 * 数字位数验证
 */
export const numberCheck = (rule, value = rule.cellValue, callback) => {
	if (value === null) {
		if (!callback) return
		callback()
	}
	if (value === '') {
		if (!callback) return
		callback()
	}
	let intLength = rule.rule ? rule.rule.int : rule.int
	let decLength = rule.rule ? rule.rule.dec : rule.dec
	const plus_minus = rule.rule ? rule.rule.startWith : rule.startWith
	// 不是数字的场合
	if (!isLong(value) && !isDouble(value)) {
		return new Error(check_msg.number)
	}
	value = value + ''
	// 有负号
	if (value.substring(0, 1) === '-') {
		if (plus_minus === '+') {
			// 正数
			return new Error('请输入正数')
		}
		value = value.substring(1)
	} else {
		// 无负号
		if (plus_minus == '-') {
			// 负数
			return new Error('请输入负数')
		}
	}
	if (isEmptyTrim(intLength)) {
		intLength = -1
	}

	if (isEmptyTrim(decLength)) {
		decLength = -1
	}

	let intLen = 0
	let decLen = 0

	if (value.indexOf('.') > -1) {
		intLen = value.substring(0, value.indexOf('.')).length
		decLen = value.substring(value.indexOf('.') + 1).length
	} else {
		intLen = value.length
	}
	if (intLength > 0 && intLen > intLength) {
		return new Error(notGreater('整数', intLength))
	}
	if (decLength >= 0 && decLen > decLength) {
		if (decLength === 0) {
			return new Error(check_msg.long)
		} else {
			return new Error(notGreater('小数', decLength))
		}
	} else {
		if (!callback) return
		callback()
	}
}

/**
 * 数字验证抛错
 * @param msg
 * @param num
 * @returns {string}
 */
export const notGreater = (msg, num) => {
	return msg + '位不能大于' + num + '位'
}

/**
 * 空验证（trim）
 */
export const isEmptyTrim = value => {
	if (value === undefined || value === null || (value + '').trim() === '') {
		return true
	}
	return false
}

/**
 * 半角数字
 */
export const isLong = value => {
	// -01 01 00
	let reg = /^-?0[0-9]+/
	if (reg.test(value)) {
		return false
	}

	// -0 -0.0
	reg = /^-0/
	if (reg.test(value)) {
		return false
	}

	reg = /^-?\d+$/
	return reg.test(value)
}

/**
 * 半角数字
 */
export const isDouble = value => {
	// -01 01 00
	let reg = /^-?0[0-9]+/
	if (reg.test(value)) {
		return false
	}

	// -0 -0.0
	reg = /^(-0|-0.0+)$/
	if (reg.test(value)) {
		return false
	}

	// reg = /^((-?[1-9]+\d(\.\d+)?)|(0(\.\d+)?))$/;
	reg = /^-?([1-9]\d*\.\d+|0\.\d*[1-9]\d*|0?\.0+|0)$/
	return reg.test(value)
}

// 验证银行卡号
 export const isBankCard = (rule, value = rule.cellValue, callback) => {
	if (isEmpty(value)) {
		if (!callback) return
		callback()
	}
	var pattern = /^([1-9]{1})(\d{15}|\d{18})$/
	if (!pattern.test(value)) {
		return new Error('格式不正确')
	}
	if (!callback) return
	callback()
}

// 手机号码
 export const isHandset = (rule, value = rule.cellValue, callback) => {
	if (isEmpty(value)) {
		if (!callback) return
		callback()
	}
	var pattern = /^1[3456789]\d{9}$/
	if (!pattern.test(value)) {
		return new Error('格式不正确')
	}
	if (!callback) return
	callback()
}

/* 电话号码*/
 export const isTelephone = (rule, value = rule.cellValue, callback) => {
	if (isEmpty(value)) {
		if (!callback) return
		callback()
	}
	var pattern = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,4}))?$/
	if (!pattern.test(value)) {
		return new Error('格式不正确')
	}
	if (!callback) return
	callback()
}

/**
 * 验证身份证
 */
 export const isIdCard = (rule, value = rule.cellValue, callback) => {
	if (isEmpty(value)) {
		if (!callback) return
		callback()
	}
	var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
	if (!pattern.test(value)) {
		return new Error('格式不正确')
	}
	if (!callback) return
	callback()
}

/**
 * 空验证
 */
 export const isEmpty = val => {
	if (val === '' || val === null || val === undefined) {
		if (val === 0) {
			return false
		}
		return true
	}
	return false
}

/**
 * 通用Msg
 * @type {{number: string, isHandset: string, required: string, long: string}}
 */
 export const check_msg = {
	required: '不能为空',
	number: '请输入数字',
	long: '请输入整数',
	handset: '请输入正确的手机号',
}
/* 数字与字母*/
export function validateAlphanumeric(str, min, max) {
	const reg = new RegExp('^(?![^A-z]+$)(?!\\D+$)[A-z\\d]{' + min + ',' + max + '}$');
	return reg.test(str)
}

/* 可以输入字母、数字*/
export function validateAlphaOrnumeric(str, min, max) {
	const reg = new RegExp('^[A-z\\d]{' + min + ',' + max + '}$');
	return reg.test(str)
}

/* 电话号码*/
export function validatePhone(str) {
	const reg = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,4}))?$/;
	return reg.test(str)
}
/* 邮箱*/
export function validatePostbox(str) {
	const reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
	return reg.test(str)
}
/* 版本号*/
export function validateVersion(str) {
	const reg = /^\d+\.\d+\.\d+$/;
	return reg.test(str)
}
/*
 *  校验IP
 * */
export function isValidIP(ip) {
	const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
	return reg.test(ip);
}
/**
 * 
 * @param {*} type 
 * @param {*} file 
 * 判断该文件属于哪种具体的类型类别
 * @returns 
 */
export function fileTypeback(type, file) {
	const typeStr = []
	if (!type) {
		type = 'img'
	}
	const types = type.split(',')
	for (const t in types) {
		typeStr.push(types[t])
	}
	const fileName = file.name
	const m = fileName.match(/\.(\w+)(#|\?|$)/)
	const fileType = (m && m[1]).toString().toLowerCase()
	const allowHook = {
		video: ['mp4', 'ogv', 'ogg', 'webm'],
		audio: ['wav', 'mp3', 'ogg', 'acc', 'webm', 'amr'],
		file: ['pdf'], // 'doc', 'docx', 'xlsx', 'xls',
		excel: ['xlsx', 'xls'],
		img: ['jpg', 'jpeg', 'png', 'gif'],
	}
	let typefile = 'img'
	for (const k in typeStr) {
		const typea = typeStr[k]
		if ((allowHook[typea] || []).includes(fileType)) {
			typefile = typea
		}
	}
	return typefile
}

/*
 *  校验上传文件
 * */
export const validUploadFile = (type, file) => {
	const typeStr = []
	if (!type) {
		type = 'img'
	}
	const types = type.split(',')
	for (const t in types) {
		typeStr.push(types[t])
	}

	// if (!file) {
	//   file = type;
	//   type = 'img'
	// }
	const fileName = file.name
	const m = fileName.match(/\.(\w+)(#|\?|$)/)
	const fileType = (m && m[1]).toString().toLowerCase()
	const allowHook = {
		video: ['mp4', 'ogv', 'ogg', 'webm'],
		audio: ['wav', 'mp3', 'ogg', 'acc', 'webm', 'amr'],
		file: ['pdf'], // 'doc', 'docx', 'xlsx', 'xls',
		excel: ['xlsx', 'xls'],
		img: ['jpg', 'jpeg', 'png', 'gif'],
	}
	let validType = false
	let typefile = 'img'
	for (const k in typeStr) {
		const typea = typeStr[k]
		validType = validType || (allowHook[typea] || []).includes(fileType)
		if ((allowHook[typea] || []).includes(fileType)) {
			typefile = typea
		}
	}
	// (allowHook[type] || []).includes(fileType);
	if (!validType) {
		const supprtTypes = allowHook[typefile].join(',')
		return `只支持${supprtTypes}类型文件上传`
	}
	if (fileName.indexOf('%') > -1 || fileName.indexOf('&') > -1) {
		return '上传文件名称不能带有字符"%","&"'
	}
	const isLt10M = file.size / 1024 / 1024 < 10
	if (typefile === file && !isLt10M) {
		this.$message.error('上传资料大小不能超过 10MB!')
		return false
	}
	return ''
}
