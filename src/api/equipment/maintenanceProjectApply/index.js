import request from '@/utils/auth/request'

const api = {
	getList(params) {
		return request({
			url: '/api/internal/EMaintProjApply/getList',
			method: 'get',
			params: params,
		})
	},

	getById(id) {
		return request({
			url: '/api/internal/EMaintProjApply/getById?id=' + id,
			method: 'get',
		})
	},

	add(data) {
		return request({
			url: '/api/internal/EMaintProjApply/add',
			method: 'post',
			data: data,
		})
	},

	update(data) {
		return request({
			url: '/api/internal/EMaintProjApply/update',
			method: 'put',
			data: data,
		})
	},

	delete(id) {
		return request({
			url: '/api/internal/EMaintProjApply/deleteProJect',
			method: 'post',
			data: { id },
		})
	},

	projectApplyStart(data) {
		return request({
			url: '/api/internal/EMaintProjApply/projectApplyStart',
			method: 'post',
			data: data,
		})
	},

	void(id) {
		return request({
			url: '/api/internal/EMaintProjApply/delete',
			method: 'post',
			data: { id },
		})
	},
}
export default api
