import request from '@/utils/auth/request'

const api = {
	// 获取列表
	getList(query) {
		return request({
			url: '/api/internal/print/getList',
			method: 'get',
			params: query,
		})
	},

	// 查询单条
	getDetail(id) {
		return request({
			url: `/api/internal/print/getDetail/${id}`,
			method: 'get',
		})
	},

	// 新建
	insert(data) {
		return request({
			url: '/api/internal/print/insert',
			method: 'post',
			data: data,
		})
	},
	// 修改
	update(data) {
		return request({
			url: '/api/internal/print/update',
			method: 'post',
			data: data,
		})
	},

	//删除
	delete(id) {
		return request({
			url: `/api/internal/print/deleteById/${id}`,
			method: 'delete',
		})
	},

	// 获取列表
	getModelTypeList(query) {
		return request({
			url: '/api/internal/print/getModelTypeList',
			method: 'get',
			params: query,
		})
	},
}
export default api
