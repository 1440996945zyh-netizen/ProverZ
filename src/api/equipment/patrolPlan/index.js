import request from '@/utils/auth/request'

const api = {
	// 查询巡检计划列表
	getList(params) {
		return request({
			url: '/api/internal/ePatrolPlan/getList',
			method: 'get',
			params
		})
	},
	// 查询巡检路线列表
	getRouteList(params) {
		return request({
			url: '/api/internal/ePatrolPlan/getRouteList',
			method: 'get',
			params
		})
	},
	// 根据ID查询巡检计划
	getById(params) {
		return request({
			url: '/api/internal/ePatrolPlan/getById',
			method: 'get',
			params
		})
	},
	// 新增
	add(data) {
		return request({
			url: '/api/internal/ePatrolPlan/add',
			method: 'post',
			data
		})
	},
	// 编辑
	update(data) {
		return request({
			url: '/api/internal/ePatrolPlan/update',
			method: 'put',
			data
		})
	},
	// 删除
	delete(params) {
		return request({
			url: '/api/internal/ePatrolPlan/delete',
			method: 'delete',
			params
		})
	},
}

export default api
