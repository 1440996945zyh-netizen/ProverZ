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
			url: '/api/internal/EMaterialWasteDisposal/getList',
			method: 'get',
			params: params,
		})
	},

	getById(id) {
		return request({
			url: '/api/internal/EMaterialWasteDisposal/getById?id=' + id,
			method: 'get',
		})
	},

	add(data) {
		return request({
			url: '/api/internal/EMaterialWasteDisposal/add',
			method: 'post',
			data: data,
		})
	},

	update(data) {
		return request({
			url: '/api/internal/EMaterialWasteDisposal/update',
			method: 'put',
			data: data,
		})
	},
	delete(id) {
		return request({
			url: '/api/internal/EMaterialWasteDisposal/delete',
			method: 'delete',
			params: { id },
		})
	},
}
export default api
