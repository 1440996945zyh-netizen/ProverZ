import request from '@/utils/request'

const api = {
	// 查询物资代码列表（分页）
	getList(params) {
		return request({
			url: '/api/v1/internal/materialCode/list',
			method: 'get',
			params: params,
		})
	},

	// 根据id查询物资代码
	getById(id) {
		return request({
			url: '/api/v1/internal/materialCode/getById?id=' + id,
			method: 'get',
		})
	},

	// 新增物资代码
	add(data) {
		return request({
			url: '/api/v1/internal/materialCode/add',
			method: 'post',
			data: data,
		})
	},

	// 修改物资代码
	update(data) {
		return request({
			url: '/api/v1/internal/materialCode/update',
			method: 'put',
			data: data,
		})
	},

	// 删除物资代码
	delete(id) {
		return request({
			url: '/api/v1/internal/materialCode/delete/' + id,
			method: 'delete',
		})
	},

	// 查询所有物资代码列表（无分页，用于下拉选择）
	getAllList() {
		return request({
			url: '/api/v1/internal/materialCode/getAllList',
			method: 'get',
		})
	},
}
export default api

