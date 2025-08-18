import request from '@/utils/request'

const api = {
	/**
	 * 获取货物信息
	 * @param {Object} query 筛选条件
	 */
	getCargoCategoryList(query) {
		return request({
			url: '/api/internal/mcargo/getListCargoCategory',
			method: 'get',
			params: query,
		})
	},

	/**
	 * 根据id查询货种列表
	 * @param {String} id
	 */
	getCargoCategoryById(id) {
		return request({
			url: '/api/internal/mcargo/getCargoCategoryById/' + id,
			method: 'get',
		})
	},

	/**
	 * 新增货类
	 * @param {Object} data 新增明细object
	 */
	insertCargoCategory(data) {
		return request({
			url: '/api/internal/mcargo/insertCargoCategory',
			method: 'post',
			data: data,
		})
	},

	/**
	 * 修改货类
	 * @param {Object} data 修改货类object
	 */
	updateCargoCategory(data) {
		return request({
			url: '/api/internal/mcargo/updateCargoCategory',
			method: 'put',
			data: data,
		})
	},

	/**
	 * 删除货类
	 * @param {String} id
	 */
	deleteCargoCategory(id) {
		return request({
			url: `/api/internal/mcargo/deleteCargoCategory/${id}`,
			method: 'delete',
		})
	},

	// ↑ 货类操作
	// ↓ 货物操作

	/**
	 * 查询货物列表
	 * @param {Object} query
	 */
	getCargoList(query) {
		return request({
			url: '/api/internal/mcargo/getListCargo',
			method: 'get',
			params: query,
		})
	},

	/**
	 * 根据id查询货物列表
	 * @param {String} id
	 */
	getCargoById(id) {
		return request({
			url: '/api/internal/mcargo/getCargoById/' + id,
			method: 'get',
		})
	},

	/**
	 * 新增货物
	 * @param {Ojbect} data
	 */
	insertCargo(data) {
		return request({
			url: '/api/internal/mcargo/insertCargo',
			method: 'post',
			data: data,
		})
	},

	/**
	 * 修改货物
	 * @param {Ojbect} data
	 */
	updateCargo(data) {
		return request({
			url: '/api/internal/mcargo/updateCargo',
			method: 'put',
			data: data,
		})
	},

	/**
	 * 删除货物
	 * @param {String} id
	 */
	deleteCargo(id) {
		return request({
			url: `/api/internal/mcargo/deleteCargo/${id}`,
			method: 'delete',
		})
	},
}
export default api
