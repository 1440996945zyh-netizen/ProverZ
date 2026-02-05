import request from '@/utils/request'

const api = {
	// 查询物资类别树形列表
	getTree(params) {
		return request({
			url: '/api/v1/internal/materialCategory/tree',
			method: 'get',
			params: params,
		})
	},

	// 根据id查询物资类别
	getById(id) {
		return request({
			url: '/api/v1/internal/materialCategory/getById?id=' + id,
			method: 'get',
		})
	},

	// 新增物资类别
	add(data) {
		return request({
			url: '/api/v1/internal/materialCategory/add',
			method: 'post',
			data: data,
		})
	},

	// 修改物资类别
	update(data) {
		return request({
			url: '/api/v1/internal/materialCategory/update',
			method: 'put',
			data: data,
		})
	},

	// 删除物资类别
	delete(id) {
		return request({
			url: '/api/v1/internal/materialCategory/delete/' + id,
			method: 'delete',
		})
	},

	// 根据父级ID查询子级列表（用于树形表格懒加载）
	getByParentId(parentId) {
		return request({
			url: '/api/v1/internal/materialCategory/getByParentId/' + parentId,
			method: 'get',
			loading: false,
		})
	},

	// 根据级别和父级ID查询物资类别列表
	getByLevelAndParent(categoryLevel, parentId) {
		return request({
			url: '/api/v1/internal/materialCategory/getByLevelAndParent?categoryLevel=' + categoryLevel + (parentId ? '&parentId=' + parentId : ''),
			method: 'get',
		})
	},
}
export default api

