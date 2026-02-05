import request from '@/utils/request'

const api = {
	// 查询设备资料文件列表（分页）
	getList(params) {
		return request({
			url: '/api/v1/internal/eqptFile/list',
			method: 'get',
			params: params,
		})
	},

	// 根据id查询设备资料文件
	getById(id) {
		return request({
			url: '/api/v1/internal/eqptFile/getById?id=' + id,
			method: 'get',
		})
	},

	// 新增设备资料文件
	add(data) {
		return request({
			url: '/api/v1/internal/eqptFile/add',
			method: 'post',
			data: data,
		})
	},

	// 修改设备资料文件
	update(data) {
		return request({
			url: '/api/v1/internal/eqptFile/update',
			method: 'put',
			data: data,
		})
	},

	// 删除设备资料文件
	delete(id) {
		return request({
			url: '/api/v1/internal/eqptFile/delete/' + id,
			method: 'delete',
		})
	},
}

export default api

