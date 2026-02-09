import request from '@/utils/auth/request'

const api = {
	// 查询设备类型分类树形列表
	getTree(params) {
		return request({
			url: '/api/v1/internal/equipmentType/tree',
			method: 'get',
			params: params,
		})
	},
	// 查询设备类型分类树形列表
	partsTree(params) {
		return request({
			url: '/api/v1/internal/equipmentType/partsTree',
			method: 'get',
			params: params
		})
	},

	// 根据id查询设备类型分类
	getById(id) {
		return request({
			url: '/api/v1/internal/equipmentType/getById?id=' + id,
			method: 'get',
		})
	},

	// 新增设备类型分类
	add(data) {
		return request({
			url: '/api/v1/internal/equipmentType/add',
			method: 'post',
			data: data,
		})
	},
	// 新增设备类型分类
	addParts(data) {
		return request({
			url: '/api/v1/internal/equipmentType/addParts',
			method: 'post',
			data: data,
		})
	},

	// 修改设备类型分类
	update(data) {
		return request({
			url: '/api/v1/internal/equipmentType/update',
			method: 'put',
			data: data,
		})
	},

	// 修改设备类型分类
	updateParts(data) {
		return request({
			url: '/api/v1/internal/equipmentType/updateParts',
			method: 'put',
			data: data,
		})
	},
	// 删除设备类型分类
	delete(id) {
		return request({
			url: '/api/v1/internal/equipmentType/delete/' + id,
			method: 'delete',
		})
	},

	// 根据父级ID查询子级列表（用于树形表格懒加载）
	getByParentId(parentId) {
		return request({
			url: '/api/v1/internal/equipmentType/getByParentId/' + parentId,
			method: 'get',
			loading: false,
		})
	},

	// 获取树形选择器数据（用于下拉选择父级）
	getSelectTree() {
		return request({
			url: '/api/v1/internal/equipmentType/getSelectTree',
			method: 'get',
		})
	},

	// 根据级别和父级ID查询设备类型列表
	getByLevelAndParent(categoryLevel, parentId) {
		return request({
			url: '/api/v1/internal/equipmentType/getByLevelAndParent?categoryLevel=' + categoryLevel + (parentId ? '&parentId=' + parentId : ''),
			method: 'get',
		})
	},

	// 根据小类ID获取完整路径（大类、中类、小类）
	getPathBySmallCategoryId(smallCategoryId) {
		return request({
			url: '/api/v1/internal/equipmentType/getPathBySmallCategoryId?smallCategoryId=' + smallCategoryId,
			method: 'get',
		})
	},
}
export default api

