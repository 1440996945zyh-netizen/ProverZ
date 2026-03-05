import request from '@/utils/auth/request'

const api = {
	queryUnitName(params) {
		return request({
			url: '/api/internal/EMEquipRepairContract/queryUnitName',
			method: 'get',
			params: params,
		})
	},

	getList(params) {
		return request({
			url: '/api/internal/emequiprepairuser/getList',
			method: 'get',
			params: params,
		})
	},

	getById(id) {
		return request({
			url: '/api/internal/emequiprepairuser/getById?id=' + id,
			method: 'get',
		})
	},

	add(data) {
		return request({
			url: '/api/internal/emequiprepairuser/add',
			method: 'post',
			data: data,
		})
	},

	update(data) {
		return request({
			url: '/api/internal/emequiprepairuser/update',
			method: 'put',
			data: data,
		})
	},
	delete(id) {
		return request({
			url: '/api/internal/emequiprepairuser/delete',
			method: 'delete',
			params: { id },
		})
	},
}
export default api
