import request from '@/utils/auth/request'

const api = {
	// 查询物资仓库列表（分页）
	getList(params) {
		return request({
			url: '/api/v1/internal/materialWarehouse/list',
			method: 'get',
			params: params,
		})
	},

	// 根据id查询物资仓库
	getById(id) {
		return request({
			url: '/api/v1/internal/materialWarehouse/getById?id=' + id,
			method: 'get',
		})
	},

	// 新增物资仓库
	add(data) {
		return request({
			url: '/api/v1/internal/materialWarehouse/add',
			method: 'post',
			data: data,
		})
	},

	// 修改物资仓库
	update(data) {
		return request({
			url: '/api/v1/internal/materialWarehouse/update',
			method: 'put',
			data: data,
		})
	},

	// 删除物资仓库
	delete(id) {
		return request({
			url: '/api/v1/internal/materialWarehouse/delete/' + id,
			method: 'delete',
		})
	},

	/**
	 * 查询物资仓库列表（不分页，用于下拉框）
	 * @returns
	 */
	getListForSelect() {
		return request({
			url: '/api/v1/internal/materialWarehouse/listForSelect',
			method: 'get',
		})
	},
}
export default api

