/**
 * 通用js方法封装处理
 * Copyright (c) 2019 yangyi
 */


// 表单重置
export function resetForm(refName) {
	if (this.$refs[refName]) {
		this.$refs[refName].resetFields()
	}
}

// 添加日期范围
export function addDateRange(params, dateRange, propName) {
	let search = params
	// search.params = typeof (search.params) === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {};
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


// 字符串格式化(%s )
export function sprintf(str) {
	var args = arguments,
		flag = true,
		i = 1
	str = str.replace(/%s/g, function () {
		var arg = args[i++]
		if (typeof arg === 'undefined') {
			flag = false
			return ''
		}
		return arg
	})
	return flag ? str : ''
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str) {
	if (!str || str == 'undefined' || str == 'null') {
		return ''
	}
	return str
}

// 数据合并
export function mergeRecursive(source, target) {
	for (var p in target) {
		try {
			if (target[p].constructor == Object) {
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

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
	let config = {
		id: id || 'id',
		parentId: parentId || 'parentId',
		childrenList: children || 'children',
	}

	// 所有父id
	var childrenListMap = {}
	// 数据对象 id: 一条数据
	var nodeIds = {}
	var tree = []

	// 获取所有父id
	for (let d of data) {
		let parentId = d[config.parentId]
		if (childrenListMap[parentId] == null) {
			childrenListMap[parentId] = []
		}
		nodeIds[d[config.id]] = d
		// 所有父id
		childrenListMap[parentId].push(d)
	}

	// 遍历出根节点放到tree
	for (let d of data) {
		let parentId = d[config.parentId]
		if (nodeIds[parentId] == null) {
			tree.push(d)
		}
	}

	for (let t of tree) {
		adaptToChildrenList(t)
	}

	function adaptToChildrenList(o) {
		if (childrenListMap[o[config.id]] !== null) {
			o[config.childrenList] = childrenListMap[o[config.id]]
		}
		if (o[config.childrenList]) {
			for (let c of o[config.childrenList]) {
				adaptToChildrenList(c)
			}
		}
	}
	return tree
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params) {
	let result = ''
	for (const propName of Object.keys(params)) {
		const value = params[propName]
		var part = encodeURIComponent(propName) + '='
		if (value !== null && value !== '' && typeof value !== 'undefined') {
			if (typeof value === 'object') {
				for (const key of Object.keys(value)) {
					if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
						let params = propName + '[' + key + ']'
						var subPart = encodeURIComponent(params) + '='
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

// 返回项目路径
export function getNormalPath(p) {
	if (p.length === 0 || !p || p == 'undefined') {
		return p
	}
	let res = p.replace('//', '/')
	if (res[res.length - 1] === '/') {
		return res.slice(0, res.length - 1)
	}
	return res
}


// 详情赋值
export function setFormData(formData, value) {
	for (const key in formData) {
		for (const v in value) {
			if (v === key) {
				formData[key] = value[v]
			}
		}
	}
}
