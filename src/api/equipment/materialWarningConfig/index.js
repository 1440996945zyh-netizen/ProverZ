import request from '@/utils/auth/request'

const api = {
	getList(params) {
		return request({
			url: '/api/v1/internal/materialWarningConfig/list',
			method: 'get',
			params: params,
		})
	},

	getById(id) {
		return request({
			url: '/api/v1/internal/materialWarningConfig/getById?id=' + id,
			method: 'get',
		})
	},

	add(data) {
		return request({
			url: '/api/v1/internal/materialWarningConfig/add',
			method: 'post',
			data: data,
		})
	},

	update(data) {
		return request({
			url: '/api/v1/internal/materialWarningConfig/update',
			method: 'put',
			data: data,
		})
	},

	delete(id) {
		return request({
			url: '/api/v1/internal/materialWarningConfig/delete/' + id,
			method: 'delete',
		})
	},
}
export default api
