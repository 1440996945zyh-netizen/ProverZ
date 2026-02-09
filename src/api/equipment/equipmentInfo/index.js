import request from '@/utils/auth/request'

const api = {
	// 查询设备台账信息列表（分页）
	getList(params) {
		return request({
			url: '/api/v1/internal/equipmentInfo/list',
			method: 'get',
			params: params,
		})
	},

	// 根据id查询设备台账信息
	getById(id) {
		return request({
			url: '/api/v1/internal/equipmentInfo/getById?id=' + id,
			method: 'get',
		})
	},

	// 新增设备台账信息
	add(data) {
		return request({
			url: '/api/v1/internal/equipmentInfo/add',
			method: 'post',
			data: data,
		})
	},

	// 修改设备台账信息
	update(data) {
		return request({
			url: '/api/v1/internal/equipmentInfo/update',
			method: 'put',
			data: data,
		})
	},

	// 修改设备基本信息
	updateBasicInfo(data) {
		return request({
			url: '/api/v1/internal/equipmentInfo/updateBasicInfo',
			method: 'put',
			data: data,
		})
	},

	// 修改财务/供货信息
	updateFinanceSupply(data) {
		return request({
			url: '/api/v1/internal/equipmentInfo/updateFinanceSupply',
			method: 'put',
			data: data,
		})
	},

	// 修改特种设备信息
	updateSpecialInfo(data) {
		return request({
			url: '/api/v1/internal/equipmentInfo/updateSpecialInfo',
			method: 'put',
			data: data,
		})
	},

	// 保存设备照片
	updateEquipmentImages(data) {
		return request({
			url: '/api/v1/internal/equipmentInfo/updateEquipmentImages',
			method: 'put',
			data: data,
		})
	},

	// 删除设备台账信息
	delete(id) {
		return request({
			url: '/api/v1/internal/equipmentInfo/delete/' + id,
			method: 'delete',
		})
	},

	// 查询变更记录列表
	getChangeLogList(params) {
		return request({
			url: '/api/v1/internal/equipmentChangeLog/list',
			method: 'get',
			params: params,
		})
	},

	// 根据ID查询变更记录详情
	getChangeLogById(id) {
		return request({
			url: '/api/v1/internal/equipmentChangeLog/getById?id=' + id,
			method: 'get',
		})
	},

	// 查询设备改造记录列表（分页）
	getModificationList(params) {
		return request({
			url: '/api/v1/internal/equipmentModification/list',
			method: 'get',
			params: params,
		})
	},

	// 根据ID查询设备改造记录
	getModificationById(id) {
		return request({
			url: '/api/v1/internal/equipmentModification/getById?id=' + id,
			method: 'get',
		})
	},

	// 新增设备改造记录
	addModification(data) {
		return request({
			url: '/api/v1/internal/equipmentModification/add',
			method: 'post',
			data: data,
		})
	},

	// 修改设备改造记录
	updateModification(data) {
		return request({
			url: '/api/v1/internal/equipmentModification/update',
			method: 'post',
			data: data,
		})
	},

	// 删除设备改造记录
	deleteModification(id) {
		return request({
			url: '/api/v1/internal/equipmentModification/delete?id=' + id,
			method: 'post',
		})
	},

	// 批量删除设备改造记录
	deleteModificationBatch(ids) {
		return request({
			url: '/api/v1/internal/equipmentModification/deleteBatch',
			method: 'post',
			data: ids,
		})
	},

	// 查询设备选择列表（用于下拉框）
	getSelectList(keyword) {
		return request({
			url: '/api/v1/internal/equipmentInfo/getSelectList',
			method: 'get',
			params: { keyword },
		})
	},

	// 查询设备指标统计（按月份）
	getIndicatorByMonth(params) {
		return request({
			url: '/api/v1/internal/equipmentInfo/getIndicatorByMonth',
			method: 'get',
			params: params,
		})
	},

	// 查询设备检修历史统计（按月份）
	getMaintenanceByMonth(params) {
		return request({
			url: '/api/v1/internal/equipmentInfo/getMaintenanceByMonth',
			method: 'get',
			params: params,
		})
	},

	// 根据设备ID查询备品备件列表
	getSpareList(params) {
		return request({
			url: '/api/v1/internal/equipmentInfo/getSpareList',
			method: 'get',
			params: params,
		})
	},
}
export default api

