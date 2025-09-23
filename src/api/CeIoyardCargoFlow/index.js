import request from '@/utils/auth/request'

const api = {
	/**
	 * 卷类
	 * @param {Object} query 筛选条件
	 */
	getBatchList(query) {
		return request({
			url: '/api/internal/tCeIoyardCargoFlow/getBatchList',
			method: 'get',
			params: query,
		})
	},

	/**
	 * 非卷类
	 * @param {String} query
	 */
	getNoBatchList(query) {
		return request({
			url: '/api/internal/tCeIoyardCargoFlow/getNoBatchList',
			method: 'get',
			params: query,
		})
	},
}
export default api
