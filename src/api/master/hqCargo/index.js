import request from '@/utils/auth/request'

const api = {

	/**
	 * 查询货物列表
	 * @param {Object} query
	 */
	getList(query) {
		return request({
			url: '/api/internal/mHqCargo/getList',
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
			url: `/api/internal/mHqCargo/getDetail?id=${id}`,
			method: 'get',
		})
	},

	/**
	 * 新增货物
	 * @param {Ojbect} data
	 */
	insertCargo(data) {
		return request({
			url: '/api/internal/mHqCargo/add',
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
			url: '/api/internal/mHqCargo/update',
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
			url: `/api/internal/mHqCargo/delete/${id}`,
			method: 'delete',
		})
	},
}
export default api
