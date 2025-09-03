import request from '@/utils/auth/request'

const api = {
	/**
	 * 获取服务内容信息
	 * @param {Object} query 筛选条件
	 */
	getlist(query) {
		return request({
			url: '/api/external/service/getlist',
			method: 'get',
			params: query,
		})
	},
	/**
	 * 新增服务内容
	 * @param {Object} query detail form
	 */
	insert(query) {
		return request({
			url: '/api/external/service/insert',
			method: 'post',
			data: query,
		})
	},
	/**
	 * 修改服务内容
	 * @param {Object} query detail form
	 */
	update(query) {
		return request({
			url: '/api/external/service/update',
			method: 'put',
			data: query,
		})
	},
	/**
	 * 根据id编辑
	 * @param {Object} id row.id
	 */
	getbyid(id) {
		return request({
			url: `/api/external/service/getbyid/${id}`,
			method: 'get',
		})
	},
	/**
	 * 删除服务内容
	 * @param {String} id row.id
	 */
	deletebyid(id) {
		return request({
			url: `/api/external/service/deletebyid/${id}`,
			method: 'delete',
		})
	},
}
export default api
