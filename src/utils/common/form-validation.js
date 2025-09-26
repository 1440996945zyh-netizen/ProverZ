/**
 * @Author: zhangsd
 * @Date: 2025-09-15 10:14:03
 * @LastEditTime: 2025-09-15 10:14:03
 * @LastEditors: zhangsd
 * @Description: 表单验证工具 包含表单传力，验证规则，输入修正等工具函数
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\common\form-validation.js
 */

/**
 * ========================================================================
 * 表单处理相关
 * ========================================================================
 */
/**
 * 表单重置
 * @param {string} refName - 表单引用名
 */
export function resetForm(refName) {
	if (this.$refs[refName]) {
		this.$refs[refName].resetFields()
	}
}

/**
 * 表单数据赋值
 * @param {Object} formData - 表单数据对象
 * @param {Object} value - 要赋值的数据
 */
export function setFormData(formData, value) {
	if (!value) return
	for (const key in formData) {
		if (value.hasOwnProperty(key) && typeof value[key] !== 'object') {
			formData[key] = value[key]
		}
	}
}

/**
 * ========================================================================
 * URL/外链验证相关
 * ========================================================================
 */
/**
 * 判断URL是否为HTTP或HTTPS协议
 * @param {string} url - 要验证的URL
 * @returns {boolean} 是否为http://或https://协议
 */
export function isHttpOrHttps(url) {
	return url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1
}

/**
 * 判断path是否为外链
 * @param {string} path - 要验证的路径
 * @returns {boolean} 是否为外链
 */
export function isExternal(path) {
	return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 验证URL格式是否有效
 * @param {string} url - 要验证的URL
 * @returns {boolean} 是否为有效URL
 */
export function validURL(url) {
	const reg =
		/^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
	return reg.test(url)
}

/**
 * ========================================================================
 * 基础验证相关
 * ========================================================================
 */

/**
 * 验证用户名是否有效
 * @param {string} str - 要验证的用户名
 * @returns {boolean} 是否为有效用户名
 */
export function validUsername(str) {
	const valid_map = ['admin', 'editor']
	return valid_map.indexOf(str.trim()) >= 0
}

/**
 * 验证字符串是否仅包含小写字母
 * @param {string} str - 要验证的字符串
 * @returns {boolean} 是否仅包含小写字母
 */
export function validLowerCase(str) {
	const reg = /^[a-z]+$/
	return reg.test(str)
}

/**
 * 验证字符串是否仅包含大写字母
 * @param {string} str - 要验证的字符串
 * @returns {boolean} 是否仅包含大写字母
 */
export function validUpperCase(str) {
	const reg = /^[A-Z]+$/
	return reg.test(str)
}

/**
 * 验证字符串是否仅包含字母
 * @param {string} str - 要验证的字符串
 * @returns {boolean} 是否仅包含字母
 */
export function validAlphabets(str) {
	const reg = /^[A-Za-z]+$/
	return reg.test(str)
}

/**
 * 验证邮箱格式是否有效
 * @param {string} email - 要验证的邮箱
 * @returns {boolean} 是否为有效邮箱
 */
export function validEmail(email) {
	const reg =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return reg.test(email)
}

/**
 * 验证是否为字符串类型
 * @param {string} str - 要验证的值
 * @returns {boolean} 是否为字符串
 */
export function isString(str) {
	if (typeof str === 'string' || str instanceof String) {
		return true
	}
	return false
}

/**
 * 验证是否为数组类型
 * @param {Array} arg - 要验证的值
 * @returns {boolean} 是否为数组
 */
export function isArray(arg) {
	if (typeof Array.isArray === 'undefined') {
		return Object.prototype.toString.call(arg) === '[object Array]'
	}
	return Array.isArray(arg)
}

/**
 * ========================================================================
 * 表单验证规则相关
 * ========================================================================
 */

/**
 * 将验证规则对象转换为验证规则数组
 * @param {Object} rules - 验证规则对象
 * @returns {Array} 验证规则数组
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
						rule.message = validationMessages.required
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
					rule.validator = validateNumberFormat
					break
				case 'handset': //手机号
					rule.validator = isMobilePhone
					break
				case 'telephone': //电话号
					rule.validator = isTelephone
					break
				case 'email':
					rule.validator = validateEmailRule
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
	} catch (e) {}
}

/**
 * 验证邮箱格式（用于表单验证规则）
 * @param {Object} rule - 验证规则
 * @param {string} [value=rule.cellValue] - 要验证的值
 * @param {Function} [callback] - 验证回调函数
 * @returns {void} 通过回调返回验证结果
 */
export const validateEmailRule = (rule, value = rule.cellValue, callback) => {
	if (isEmpty(value)) {
		if (!callback) return
		callback()
		return
	}

	const pattern = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
	if (!pattern.test(value)) {
		const error = new Error('输入的邮箱错误')
		if (callback) {
			callback(error)
		}
		return error
	}

	if (!callback) return
	callback()
}

/**
 * 验证数字格式（位数、正负等）
 * @param {Object} rule - 验证规则
 * @param {string} [value=rule.cellValue] - 要验证的值
 * @param {Function} [callback] - 验证回调函数
 * @returns {void} 通过回调返回验证结果
 */
export const validateNumberFormat = (rule, value = rule.cellValue, callback) => {
	console.log(value, 'value')
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
	if (!isInteger(value) && !isDecimal(value)) {
		const error = new Error(validationMessages.number)
		if (callback) {
			callback(error)
		}
		return error
	}
	value = value + ''
	// 有负号
	if (value.substring(0, 1) === '-') {
		if (plus_minus === '+') {
			// 正数
			const error = new Error('请输入正数')
			if (callback) {
				callback(error)
			}
			return error
		}
		value = value.substring(1)
	} else {
		// 无负号
		if (plus_minus == '-') {
			// 负数
			const error = new Error('请输入负数')
			if (callback) {
				callback(error)
			}
			return error
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
		const error = new Error(createNumberValidationError('整数', intLength))
		if (callback) {
			callback(error)
		}
		return error
	}

	if (decLength >= 0 && decLen > decLength) {
		let error
		if (decLength === 0) {
			error = new Error(validationMessages.long)
		} else {
			error = new Error(createNumberValidationError('小数', decLength))
		}
		if (callback) {
			callback(error)
		}
		return error
	} else {
		if (!callback) return
		callback()
	}
}

/**
 * 创建数字验证错误消息
 * @param {string} msg - 错误消息前缀
 * @param {number} num - 最大允许位数
 * @returns {string} 错误消息
 */
export const createNumberValidationError = (msg, num) => {
	return msg + '位不能大于' + num + '位'
}

/**
 * 空验证（trim）
 * @param {*} value - 要验证的值
 * @returns {boolean} 是否为空
 */
export const isEmptyTrim = value => {
	if (value === undefined || value === null || (value + '').trim() === '') {
		return true
	}
	return false
}

/**
 * 验证是否为整数
 * @param {*} value - 要验证的值
 * @returns {boolean} 是否为整数
 */
export const isInteger = value => {
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
 * 验证是否为小数
 * @param {*} value - 要验证的值
 * @returns {boolean} 是否为小数
 */
export const isDecimal = value => {
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
	reg = /^-?([1-9]\d*\.\d+|0\.\d*[1-9]\d*|0?\.0+|0)$/
	return reg.test(value)
}

/**
 * 验证银行卡号格式
 * @param {Object} rule - 验证规则
 * @param {string} [value=rule.cellValue] - 要验证的值
 * @param {Function} [callback] - 验证回调函数
 * @returns {void} 通过回调返回验证结果
 */
export const isBankCard = (rule, value = rule.cellValue, callback) => {
	if (isEmpty(value)) {
		if (!callback) return
		callback()
	}
	var pattern = /^([1-9]{1})(\d{15}|\d{18})$/
	if (!pattern.test(value)) {
		const error = new Error('格式不正确')
		if (callback) {
			callback(error)
		}
		return error
	}
	// 验证通过时也需要调用 callback 并返回
	if (!callback) return
	callback()
}

/**
 * 验证手机号码格式
 * @param {Object} rule - 验证规则
 * @param {string} [value=rule.cellValue] - 要验证的值
 * @param {Function} [callback] - 验证回调函数
 * @returns {void} 通过回调返回验证结果
 */
export const isMobilePhone = (rule, value = rule.cellValue, callback) => {
	if (isEmpty(value)) {
		if (!callback) return
		callback()
	}
	var pattern = /^1[3456789]\d{9}$/
	if (!pattern.test(value)) {
		const error = new Error('格式不正确')
		if (callback) {
			callback(error)
		}
		return error
	}
	if (!callback) return
	callback()
}

/**
 * 验证电话号码格式
 * @param {Object} rule - 验证规则
 * @param {string} [value=rule.cellValue] - 要验证的值
 * @param {Function} [callback] - 验证回调函数
 * @returns {void} 通过回调返回验证结果
 */
export const isTelephone = (rule, value = rule.cellValue, callback) => {
	if (isEmpty(value)) {
		if (!callback) return
		callback()
	}
	var pattern = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,4}))?$/
	if (!pattern.test(value)) {
		const error = new Error('格式不正确')
		if (callback) {
			callback(error)
		}
		return error
	}
	if (!callback) return
	callback()
}
/**
 * 验证身份证格式
 * @param {Object} rule - 验证规则
 * @param {string} [value=rule.cellValue] - 要验证的值
 * @param {Function} [callback] - 验证回调函数
 * @returns {void} 通过回调返回验证结果
 */
export const isIdCard = (rule, value = rule.cellValue, callback) => {
	if (isEmpty(value)) {
		if (!callback) return
		callback()
	}

	// 18位身份证校验
	if (value.length === 18) {
		const Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
		const ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2]
		let sum = 0

		// 验证前17位是否为数字
		if (!/^\d{17}[\dXx]$/.test(value)) {
			const error = new Error('身份证格式不正确')
			if (callback) {
				callback(error)
			}
			return error
		}

		// 计算校验码
		for (let i = 0; i < 17; i++) {
			sum += parseInt(value[i]) * Wi[i]
		}

		const mod = sum % 11
		const checkCode = ValideCode[mod] === 10 ? 'X' : ValideCode[mod].toString()

		if (checkCode !== value[17].toUpperCase()) {
			const error = new Error('身份证校验码不正确')
			if (callback) {
				callback(error)
			}
			return error
		}

		// 可以添加地区码和出生日期的进一步验证
	} else if (value.length === 15) {
		// 15位身份证校验（较老的身份证格式）
		if (!/^\d{15}$/.test(value)) {
			const error = new Error('身份证格式不正确')
			if (callback) {
				callback(error)
			}
			return error
		}
	} else {
		const error = new Error('身份证长度不正确')
		if (callback) {
			callback(error)
		}
		return error
	}

	if (!callback) return
	callback()
}

/**
 * 空验证
 * @param {*} val - 要验证的值
 * @returns {boolean} 是否为空
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
 * 验证错误消息集合
 * @type {{number: string, isHandset: string, required: string, long: string}}
 */
export const validationMessages = {
	required: '不能为空',
	number: '请输入数字',
	long: '请输入整数',
	handset: '请输入正确的手机号',
}

/**
 * ========================================================================
 * 其他验证相关
 * ========================================================================
 */
/**
 * 校验字母数字组合
 * @param {string} str - 要校验的字符串
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @returns {boolean} 是否符合要求
 */
export function validateAlphaNumeric(str, min, max) {
	const reg = new RegExp('^(?![^A-z]+$)(?!\\D+$)[A-z\\d]{' + min + ',' + max + '}$')
	return reg.test(str)
}

/**
 * 电话号码校验
 * @param {string} str - 要校验的电话号码
 * @returns {boolean} 是否符合电话号码格式
 */
export function validatePhone(str) {
	const reg = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,4}))?$/
	return reg.test(str)
}

/**
 * 版本号校验
 * @param {string} str - 要校验的版本号
 * @returns {boolean} 是否符合版本号格式
 */
export function validateVersion(str) {
	const reg = /^\d+\.\d+\.\d+$/
	return reg.test(str)
}

/**
 * 校验IP地址格式
 * @param {string} ip - 要校验的IP地址
 * @returns {boolean} 是否符合IP格式
 */
export function isValidIP(ip) {
	const reg =
		/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
	return reg.test(ip)
}

/**
 * ========================================================================
 * 文件验证相关
 * ========================================================================
 */

/**
 * 确定文件类型
 * @param {string} type - 允许的文件类型
 * @param {File} file - 要判断的文件
 * @returns {string} 文件类型
 */
export function determineFileType(type, file) {
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

/**
 * 校验上传文件
 * @param {string} type - 允许的文件类型
 * @param {File} file - 要校验的文件
 * @returns {string} 错误信息，空表示通过
 */
export const validUploadFile = (type, file) => {
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

/**
 * ========================================================================
 * 输入修正相关
 * ========================================================================
 */

/**
 * 过滤输入值
 * @param {string} type - 过滤类型
 * @param {string} value - 要过滤的值
 * @returns {string} 过滤后的值
 */
export function filterInput(type, value) {
	switch (type) {
		case 'duty':
			//只能输入数字字母
			value = value.replace(/[^\w]/g, '')
			return value
			break
		case 'charemach*':
			value = value.replace(/[`～ ~!@$%^&()\+=<>?:"{}|,/;'\\[\]·~！@￥%……&（）\+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'charemach':
			// 过滤特殊字符泊位
			value = value.replace(/[`～ *~!@$%^&*()\+=<>?:"{}|,./;'\\[\]·~！@￥%……&*（）\+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'chareBO':
			// 过滤特殊字符泊位
			value = value.replace(/[`～ *~!$%^&*()_\+=<>?:"{}|,./;'\\[\]·~！@￥%……&*（）——\+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'chareOperation':
			// 过滤特殊字符操作过程
			value = value.replace(/[`～ *~!$%^&*()_\-+=<>?:"{}|,.;'\\[\]·~！@￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'char':
			// 过滤特殊字符
			value = value.replace(/[`～ *~!@#$%^&*_\-+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*——\-+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'char1':
			// 过滤特殊字符
			value = value.replace(/[`～ *~!@#$^&*_\-+=<>?:"{}|,/;'\\[\]·~！@#￥……&*——\-+={}|《》？：“”【】；‘'，。]/g, '')
			return value
			break
		case 'charPoint':
			// 过滤特殊字符.
			value = value.replace(/[`～ *~!@#$%^&*_\-+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*——\-+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'charSpace':
			// 过滤特殊字符-不包括空格
			value = value.replace(/[`～*~!@#$%^&*_\-+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*——\-+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'char#':
			// 过滤特殊字符
			value = value.replace(/[`～ *~!@#$%^&*()_\+=<>?:"{}|,./;'\\\·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'char_':
			// 过滤特殊字符
			value = value.replace(/[`～ *~!@#$%^&*()\+=<>?:"{}|,./;'\\\·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘'，。、]/g, '')
			return value
			break
		case 'spaceChar':
			// 过滤特殊字符 包括空格
			value = value.replace(/[`～ *~!@#$%^&*()_\-+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、 ]/g, '')
			return value
			break
		case 'chineseOnly':
			// 只能中文输入
			value.replace(/[^\u4E00-\u9FA5]/g, '')
			break
		case 'number':
			// 正负任意位数-整数
			value = value.replace(/[^0-9|-]/g, '')
			return value
			break
		case 'positiveNumber':
			// 只能正整数
			value = value.replace(/[^0-9]/g, '')
			return value
			break
		case 'decimal':
			// 正负任意位数-小数
			value =
				('' + value) // 第一步：转成字符串
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^[-|\d]\d*(?:\.\d{0,99})?/)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点
			return value
			break
		case 'positiveDecimal':
			// 正小数
			value =
				('' + value) // 第一步：转成字符串
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^\d*(?:\.\d{0,99})?/)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点
			return value
			break
		case 'numChinese':
			// 只能输入数字和中文
			value = value.replace(/[^0-9|^\u4E00-\u9FA5]/g, '')
			return value
			break
		case 'cardNum':
			// 只能输入数字和xX
			value = value.replace(/[^0-9|x|X]/g, '')
			return value
			break
		case 'latin':
			// 只能输入大小写字母下划线
			value = value.replace(/[^a-z|A-Z|0-9|\-|_|\.#]/g, '')
			return value
			break
		case 'latinSpace':
			// 只能输入大小写字母下划线空格
			value = value.replace(/[^a-z|A-Z|0-9|\-|_|\.#| ]/g, '')
			return value
			break
		case 'float2':
			value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
			return value
			break
		case 'double':
			//只能输入正负数（小数，整数）
			value = value.replace(/[^(\-?)\d+(\.\d+)?$]/g, '')
			return value
			break
		case 'digit':
			// 只能输入正数
			value = value.replace(/[^0-9|^\.]/g, '')
			var tmp = value.split('.')
			var first = tmp[0]
			tmp.shift()
			value = tmp.length > 0 ? first + '.' + tmp.join('') : first
			return value
			break
		case 'posInteger':
			// 只能输入正整数
			if (value.length == 1) {
				value = value.replace(/[^1-9]/g, '')
			} else {
				value = value.replace(/\D/g, '')
			}
			return value
			break
		case 'exactDecimal':
			// 精确到两位小数
			value = value.replace(/[^0-9|^\.]/g, '')
			var tmp = value.split('.')
			var first = tmp[0]
			tmp.shift()
			value = tmp.length > 0 ? first + '.' + tmp.join('').slice(0, 2) : first
			return value
			break
		case 'sixDecimal':
			// 精确到六位小数
			value = value.replace(/[^0-9|^\.]/g, '')
			var tmp = value.split('.')
			var first = tmp[0]
			tmp.shift()
			value = tmp.length > 0 ? first + '.' + tmp.join('').slice(0, 6) : first
			return value
			break
		case 'digitThree':
			// 只能输入正数
			value = value.replace(/[^0-9|^\.]/g, '')
			var tmp = value.split('.')
			var first = tmp[0]
			tmp.shift()
			value = tmp.length > 0 ? first + '.' + tmp.join('').slice(0, 3) : first
			return value
			break
		case 'doubleExactDecimal':
			// 只能输入正负两位小数
			value = value ? value.toString().match(/^[-|\d]\d*(?:\.\d{0,2})?/)[0] : ''
			return value
			break
		case 'onePoint':
			// 可以输入小数但是只能输入一位小数
			value =
				('' + value) // 第一步：转成字符串
					.replace(/[^\d^\.]+/g, '') // 第二步：把不是数字，不是小数点的过滤掉
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^\d*(\.?\d{0,1})/g)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
			return value
			break
		case 'twoPoint':
			value =
				('' + value) // 第一步：转成字符串
					.replace(/[^\d^\.]+/g, '') // 第二步：把不是数字，不是小数点的过滤掉
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^\d*(\.?\d{0,2})/g)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
			return value
			break
		case 'threePoint':
			value =
				('' + value) // 第一步：转成字符串
					.replace(/[^\d^\.]+/g, '') // 第二步：把不是数字，不是小数点的过滤掉
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^\d*(\.?\d{0,3})/g)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
			return value
			break
		case 'fourPoint':
			value =
				('' + value) // 第一步：转成字符串
					.replace(/[^\d^\.]+/g, '') // 第二步：把不是数字，不是小数点的过滤掉
					.replace(/^0+(\d)/, '$1') // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
					.replace(/^\./, '0.') // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
					.match(/^\d*(\.?\d{0,4})/g)[0] || '' // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
			return value
			break
		default:
			break
	}
}
