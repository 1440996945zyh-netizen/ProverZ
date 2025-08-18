import request from '@/utils/request'

const api = {
	// 根据查询机械类型
	listbMachineType(query) {
		return request({
			url: '/api/internal/bmachinetype/listbmachinetype',
			method: 'get',
			params: query,
		})
	},

	// 根据id查询机械类型
	selectbMachineTypeById(id) {
		return request({
			url: '/api/internal/bmachinetype/selectbmachinetypebyid?id=' + id,
			method: 'get',
		})
	},

	// 新增机械类型
	insertbMachineType(data) {
		return request({
			url: '/api/internal/bmachinetype/insertbmachinetype',
			method: 'post',
			data: data,
		})
	},

	// 修改机械类型
	updatebMachineType(data) {
		return request({
			url: '/api/internal/bmachinetype/updatebmachinetype',
			method: 'put',
			data: data,
		})
	},

	// 删除机械类型
	deleteMachineType(id) {
		return request({
			url: '/api/internal/bmachinetype/deletemachinetype/' + id,
			method: 'delete',
		})
	},
}
export default api
