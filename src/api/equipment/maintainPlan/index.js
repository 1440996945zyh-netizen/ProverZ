import request from '@/utils/request'

const api = {
	// 查询设备类型分类树形列表
	getList(params) {
		return request({
			url: '/api/internal/maintainPlan/queryAll',
			method: 'get',
			params: params
		})
	},
	// 查询点检任务
	getTaskDetail(params) {
		return request({
			url: '/api/internal/maintainPlan/getTaskDetail',
			method: 'get',
			params: params
		})
	},
	getById(params) {
		return request({
			url: '/api/internal/maintainPlan/getById',
			method: 'get',
			params: params
		})
	},
	// 新增
	add(data) {
		return request({
			url: '/api/internal/maintainPlan/add',
			method: 'post',
			data
		})
	},
	// 编辑
	update(data) {
		return request({
			url: '/api/internal/maintainPlan/update',
			method: 'put',
			data
		})
	},
	// 保存
	delete(params) {
		return request({
			url: '/api/internal/maintainPlan/delete',
			method: 'delete',
			params: params
		})
	},
	// 查询设备列表
	getEquipListById(params) {
		return request({
			url: '/api/internal/maintainPlan/getEquipListById',
			method: 'get',
			params: params
		})
	},
	// 根据id查询设备类型分类
	queryByUnitId(params) {
		return request({
			url: '/api/internal/maintainStandard/queryByUnitId',
			method: 'get',
			params: params
		})
	},
	// 提报
	report(params) {
		return request({
			url: '/api/internal/maintainPlan/report',
			method: 'get',
			params: params
		})
	},
}
export default api

