import request from '@/utils/auth/request'

const api = {
	getList(params) {
		return request({
			url: '/api/internal/EContractInfoContract/getList',
			method: 'get',
			params: params,
		})
	},

	getById(id) {
		return request({
			url: '/api/internal/EContractInfoContract/getById?id=' + id,
			method: 'get',
		})
	},

	save(data) {
		if (data.id) {
			return request({
				url: '/api/internal/EContractInfoContract/update',
				method: 'put',
				data: data,
			})
		} else {
			return request({
				url: '/api/internal/EContractInfoContract/add',
				method: 'post',
				data: data,
			})
		}
	},

	delete(id) {
		return request({
			url: '/api/internal/EContractInfoContract/delete',
			method: 'delete',
			params: { id },
		})
	},

	batchDelete(ids) {
		return request({
			url: '/api/internal/EContractInfoContract/batchDelete',
			method: 'delete',
			data: ids,
		})
	},
}
export default api