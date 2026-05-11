import request from '@/utils/auth/request'

const api = {
	getList(params) {
		return request({
			url: '/api/internal/educationTraining/result/getList',
			method: 'get',
			params,
		})
	},
	getById(params) {
		return request({
			url: '/api/internal/educationTraining/result/getById',
			method: 'get',
			params,
		})
	},
	input(data) {
		return request({
			url: '/api/internal/educationTraining/result/input',
			method: 'put',
			data,
		})
	},
	generate(params) {
		return request({
			url: '/api/internal/educationTraining/result/generate',
			method: 'post',
			params,
		})
	},
}

export default api
