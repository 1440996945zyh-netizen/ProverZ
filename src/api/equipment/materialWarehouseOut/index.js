import request from '@/utils/request'

const url = '/api/v1/internal/materialWarehouseOut'

const api = {
	/**
	 * 查询物资出库列表
	 * @param {Object} params 查询参数
	 * @returns
	 */
	getList(params) {
		return request({
			url: `${url}/list`,
			method: 'get',
			params,
		})
	},

	/**
	 * 根据ID查询物资出库
	 * @param {Number} id 物资出库id
	 * @returns
	 */
	getById(id) {
		return request({
			url: `${url}/getById`,
			method: 'get',
			params: { id },
		})
	},

	/**
	 * 新增物资出库
	 * @param {Object} data 物资出库数据
	 * @returns
	 */
	add(data) {
		return request({
			url: `${url}/add`,
			method: 'post',
			data,
		})
	},

	/**
	 * 修改物资出库
	 * @param {Object} data 物资出库数据
	 * @returns
	 */
	update(data) {
		return request({
			url: `${url}/update`,
			method: 'put',
			data,
		})
	},

	/**
	 * 删除物资出库
	 * @param {Number} id 物资出库id
	 * @returns
	 */
	delete(id) {
		return request({
			url: `${url}/delete/${id}`,
			method: 'delete',
		})
	},

	/**
	 * 确认物资出库
	 * @param {Number} id 物资出库id
	 * @returns
	 */
	confirm(id) {
		return request({
			url: `${url}/confirm/${id}`,
			method: 'put',
		})
	},
}

export default api

