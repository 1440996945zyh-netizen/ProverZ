import request from '@/utils/auth/request'

const api = {
	// 查询列表
	getList(params) {
		return request({
			url: '/api/v1/internal/EPatrolTask/getList',
			method: 'get',
			params: params,
		})
	},
	// 根据id查询任务子表详情
	getById(params) {
		return request({
			url: '/api/v1/internal/EPatrolTask/getById',
			method: 'get',
			params: params,
		})
	},
}

export default api
