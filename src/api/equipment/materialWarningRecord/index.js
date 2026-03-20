import request from '@/utils/auth/request'

const api = {
	getList(params) {
		return request({
			url: '/api/v1/internal/materialWarningRecord/list',
			method: 'get',
			params: params,
		})
	},

	getById(id) {
		return request({
			url: '/api/v1/internal/materialWarningRecord/getById?id=' + id,
			method: 'get',
		})
	},

	handle(params) {
		return request({
			url: '/api/v1/internal/materialWarningRecord/handle',
			method: 'put',
			params: params,
		})
	},
}
export default api
