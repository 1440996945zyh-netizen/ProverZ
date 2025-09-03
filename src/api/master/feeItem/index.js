import request from '@/utils/auth/request'

const api = {
	/**
	 * 获取费目信息
	 * @param {Object} query 筛选条件
	 */
	getlist(query) {
		return request({
			url: '/api/external/freeItem/getlist',
			method: 'get',
			params: query,
		})
	},
	/**
	 * 新增费目
	 * @param {Object} query detail form
	 */
	insert(query) {
		return request({
			url: '/api/external/freeItem/insert',
			method: 'post',
			data: query,
		})
	},
	/**
	 * 修改费目
	 * @param {Object} query detail form
	 */
	update(query) {
		return request({
			url: '/api/external/freeItem/update',
			method: 'put',
			data: query,
		})
	},
	/**
	 * 根据id编辑
	 * @param {Object} id row.gid
	 */
	getbyid(id) {
		return request({
			url: `/api/external/freeItem/getbyid/${id}`,
			method: 'get',
		})
	},
	/**
	 * 删除费目
	 * @param {String} id row.id
	 */
	deletebyid(id) {
		return request({
			url: `/api/external/freeItem/deletebyid/${id}`,
			method: 'delete',
		})
	},
}
export default api
