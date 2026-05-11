import request from '@/utils/auth/request'

const api = {
	getList(params) {
		return request({
			url: '/api/internal/educationTraining/plan/getList',
			method: 'get',
			params,
		})
	},
	getById(params) {
		return request({
			url: '/api/internal/educationTraining/plan/getById',
			method: 'get',
			params,
		})
	},
	getFormInit() {
		return request({
			url: '/api/internal/educationTraining/plan/getFormInit',
			method: 'get',
		})
	},
	getParticipantOptions(params) {
		return request({
			url: '/api/internal/educationTraining/plan/getParticipantOptions',
			method: 'get',
			params,
		})
	},
	add(data) {
		return request({
			url: '/api/internal/educationTraining/plan/add',
			method: 'post',
			data,
		})
	},
	update(data) {
		return request({
			url: '/api/internal/educationTraining/plan/update',
			method: 'put',
			data,
		})
	},
	delete(params) {
		return request({
			url: '/api/internal/educationTraining/plan/delete',
			method: 'delete',
			params,
		})
	},
}

export default api
