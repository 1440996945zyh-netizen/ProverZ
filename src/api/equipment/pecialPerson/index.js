import request from '@/utils/request'

const api = {
	// 查询特种作业人员证书列表（分页）
	getList(params) {
		return request({
			url: '/api/v1/internal/pecialPerson/list',
			method: 'get',
			params: params,
		})
	},

	// 根据id查询特种作业人员证书
	getById(id) {
		return request({
			url: '/api/v1/internal/pecialPerson/getById?id=' + id,
			method: 'get',
		})
	},

	// 新增特种作业人员证书
	add(data) {
		return request({
			url: '/api/v1/internal/pecialPerson/add',
			method: 'post',
			data: data,
		})
	},

	// 修改特种作业人员证书
	update(data) {
		return request({
			url: '/api/v1/internal/pecialPerson/update',
			method: 'put',
			data: data,
		})
	},

	// 删除特种作业人员证书
	delete(id) {
		return request({
			url: '/api/v1/internal/pecialPerson/delete/' + id,
			method: 'delete',
		})
	},
}

export default api

