import request from '@/utils/auth/request'

const api = {
	getList(params) {
		return request({
			url: '/api/internal/EMMaintenanceProjectQuota/getList',
			method: 'get',
			params: params,
		})
	},

	getById(id) {
		return request({
			url: '/api/internal/EMMaintenanceProjectQuota/getById?id=' + id,
			method: 'get',
		})
	},

	add(data) {
		return request({
			url: '/api/internal/EMMaintenanceProjectQuota/add',
			method: 'post',
			data: data,
		})
	},

	update(data) {
		return request({
			url: '/api/internal/EMMaintenanceProjectQuota/update',
			method: 'put',
			data: data,
		})
	},

	delete(id) {
		return request({
			url: '/api/internal/EMMaintenanceProjectQuota/delete',
			method: 'delete',
			params: { id },
		})
	},
}
export default api