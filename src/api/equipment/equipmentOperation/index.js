import request from '@/utils/request'

const api = {
	// 查询设备台账信息列表（分页）
	getList(params) {
		return request({
			url: '/api/internal/MEquipmentOperation/getList',
			method: 'get',
			params: params,
		})
	},

	// 根据id查询设备台账信息
	getById(params) {
		return request({
			url: '/api/internal/MEquipmentOperation/getById',
			method: 'get',
      params: params,
		})
	},

	// 新增设备台账信息
	add(data) {
		return request({
			url: '/api/internal/MEquipmentOperation/add',
			method: 'post',
			data: data,
		})
	},

	// 修改设备台账信息
	update(data) {
		return request({
			url: '/api/internal/MEquipmentOperation/update',
			method: 'put',
			data: data,
		})
	},

	// 删除设备台账信息
	delete(params) {
		return request({
			url: '/api/internal/MEquipmentOperation/delete',
			method: 'delete',
      params: params
		})
	},
}
export default api

