import request from '@/utils/request'

const api = {
	// 查询列表
	getList(params) {
		return request({
			url: '/api/v1/internal/maintainTask/getList',
			method: 'get',
			params: params
		})
	},
	// 根据id查询任务明细
	getById(params) {
		return request({
			url: '/api/v1/internal/maintainTask/getById',
			method: 'get',
			params: params
		})
	},
}
export default api

