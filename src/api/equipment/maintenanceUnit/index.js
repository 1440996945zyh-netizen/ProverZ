import request from '@/utils/auth/request'

const api = {
	getList(params) {
		return request({
			url: '/api/internal/EMEquipRepairContract/getList',
			method: 'get',
			params: params,
		})
	},

	getById(id) {
		return request({
			url: '/api/internal/EMEquipRepairContract/getById?id=' + id,
			method: 'get',
		})
	},

	add(data) {
		return request({
			url: '/api/internal/EMEquipRepairContract/add',
			method: 'post',
			data: data,
		})
	},

	update(data) {
		return request({
			url: '/api/internal/EMEquipRepairContract/update',
			method: 'put',
			data: data,
		})
	},

	delete(id) {
		return request({
			url: '/api/internal/EMEquipRepairContract/delete',
			method: 'delete',
			params: { id },
		})
	},
}
export default api
