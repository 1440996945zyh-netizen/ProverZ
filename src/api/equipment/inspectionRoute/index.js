import request from '@/utils/auth/request'

const api = {
	// 分页查询列表
	getList(params) {
		return request({
			url: '/api/internal/inspectionRoute/getList',
			method: 'get',
			params: params,
		})
	},
	// 根据 ID 查询详情
	getById(id) {
		return request({
			url: '/api/internal/inspectionRoute/getDetail/' + id,
			method: 'get',
		})
	},
	// 新增
	add(data) {
		return request({
			url: '/api/internal/inspectionRoute/insert',
			method: 'post',
			data,
		})
	},
	// 修改
	update(data) {
		return request({
			url: '/api/internal/inspectionRoute/update',
			method: 'post',
			data,
		})
	},
	// 删除
	delete(id) {
		return request({
			url: '/api/internal/inspectionRoute/deleteById/' + id,
			method: 'delete',
		})
	},
}

export default api
