import request from '@/utils/auth/request'

/**
 * 创建工作流的表单定义
 * @param {*} data
 * @returns
 */
export const insertForm = async data => {
	return request({
		url: '/bpm/form/insert',
		method: 'post',
		data, // 简化对象属性简写，等价于 data: data
	})
}

/**
 * 更新工作流的表单定义
 * @param {*} data
 * @returns
 */
export const updateForm = async data => {
	return request({
		url: '/bpm/form/update',
		method: 'put',
		data, // 简化对象属性简写
	})
}

/**
 * 删除工作流的表单定义
 * @param {*} id
 * @returns
 */
export const deleteForm = async id => {
	return request({
		url: `/bpm/form/delete/${id}`,
		method: 'delete',
	})
}

/**
 * 获得工作流的表单定义
 * @param {*} id
 * @returns
 */
export const getDetail = async id => {
	return request({
		url: '/bpm/form/getDetail?id=' + id,
		method: 'get',
	})
}

// 获得工作流的表单设计
export const getForm = async id => {
	return request({
		url: '/bpm/form/get?id=' + id,
		method: 'get',
	})
}

/**
 * 获得工作流的表单定义分页
 * @param {*} params
 * @returns
 */
export const getFormPage = async params => {
	return request({
		url: '/bpm/form/getList',
		method: 'get',
		params,
	})
}

/**
 * 获得动态表单的精简列表
 * @returns
 */
export const getFormSimpleList = async () => {
	return request({
		url: '/bpm/form/simple-list',
		method: 'get',
	})
}
