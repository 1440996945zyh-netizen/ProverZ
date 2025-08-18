import request from '@/utils/request'

const api = {

	/**
	 * 查询场地列表
	 * @param {Object} query
	 */
	getList(query) {
		return request({
			url: '/api/internal/mHqStorageStack/getList',
			method: 'get',
			params: query,
		})
	},

	/**
	 * 根据id查询场地列表
	 * @param {String} id
	 */
	getStorageStackById(id) {
		return request({
			url: `/api/internal/mHqStorageStack/getDetail?id=${id}`,
			method: 'get',
		})
	},

	/**
	 * 新增场地
	 * @param {Ojbect} data
	 */
	insertStorageStack(data) {
		return request({
			url: '/api/internal/mHqStorageStack/add',
			method: 'post',
			data: data,
		})
	},

	/**
	 * 修改场地
	 * @param {Ojbect} data
	 */
	updateStorageStack(data) {
		return request({
			url: '/api/internal/mHqStorageStack/update',
			method: 'put',
			data: data,
		})
	},

	/**
	 * 删除场地
	 * @param {String} id
	 */
	deleteStorageStack(id) {
		return request({
			url: `/api/internal/mHqStorageStack/delete/${id}`,
			method: 'delete',
		})
	},
}
export default api
