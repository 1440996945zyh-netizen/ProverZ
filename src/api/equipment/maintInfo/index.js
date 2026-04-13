import request from '@/utils/auth/request'

const api = {
	// 查询设备维修派工信息列表（分页）
	getList(params) {
		return request({
			url: '/api/v1/internal/maintInfo/list',
			method: 'get',
			params: params,
		})
	},

	// 根据id查询设备维修派工信息
	getById(id) {
		return request({
			url: '/api/v1/internal/maintInfo/getById?id=' + id,
			method: 'get',
		})
	},

	// 新增设备维修派工信息
	add(data) {
		return request({
			url: '/api/v1/internal/maintInfo/add',
			method: 'post',
			data: data,
		})
	},

	// 修改设备维修派工信息
	update(data) {
		return request({
			url: '/api/v1/internal/maintInfo/update',
			method: 'put',
			data: data,
		})
	},

	// 删除设备维修派工信息
	delete(id) {
		return request({
			url: '/api/v1/internal/maintInfo/delete/' + id,
			method: 'delete',
		})
	},
	// 批量删除设备维修派工信息
	deleteBatch(ids) {
		return request({
			url: '/api/v1/internal/maintInfo/deleteBatch',
			method: 'delete',
			data: ids,
		})
	},
	// 更新派工信息（只更新派工相关字段）
	updateDispatch(data) {
		return request({
			url: '/api/v1/internal/maintInfo/updateDispatch',
			method: 'put',
			data,
		})
	},
	// 作废工单
	cancelWorkOrder(ids) {
		return request({
			url: '/api/v1/internal/maintInfo/cancel',
			method: 'put',
			data: ids,
		})
	},
	// 开始维修
	startMaintenance(data) {
		return request({
			url: '/api/v1/internal/maintInfo/startMaintenance',
			method: 'put',
			data,
		})
	},
	// 结束维修
	endMaintenance(data) {
		return request({
			url: '/api/v1/internal/maintInfo/endMaintenance',
			method: 'put',
			data,
		})
	},
	// 验收通过
	acceptMaintenance(data) {
		return request({
			url: '/api/v1/internal/maintInfo/acceptMaintenance',
			method: 'put',
			data,
		})
	},
	// 根据设备ID查询可用的出库单和申领单明细（用于配件更换选择）
	getAvailableDetailsByEquipId(equipId) {
		return request({
			url: '/api/v1/internal/maintInfo/getAvailableDetailsByEquipId?equipId=' + equipId,
			method: 'get',
		})
	},
	// 根据出库单明细ID查询已使用数量总和（临时接口，实际应该在后端计算）
	getTotalUsedQuantityByWarehouseOutDetailId(warehouseOutDetailId) {
		// 注意：这个接口需要后端实现，这里先返回一个模拟数据
		return Promise.resolve({ code: '0000', data: 0 })
	},
	// 根据维修信息ID查询配件更换列表
	getPartReplaceListByMaintInfoId(maintInfoId) {
		return request({
			url: '/api/v1/internal/maintInfo/getPartReplaceListByMaintInfoId?maintInfoId=' + maintInfoId,
			method: 'get',
		})
	},
	// 根据设备ID和类型查询维修单位信息
	getRepairContractByEquipId(equipId, outType) {
		return request({
			url: '/api/internal/EMEquipRepairContract/getRepairContractByEquipId',
			method: 'get',
			params: {
				equipId: equipId,
				outType: outType
			}
		})
	},
	// 根据承修单位ID查询维修人员下拉列表
	getRepairUserListByMaintOrgId(maintOrgId) {
		return request({
			url: '/api/v1/internal/maintInfo/getRepairUserListByMaintOrgId',
			method: 'get',
			params: {
				maintOrgId,
			},
		})
	},
	// 根据设备小类ID查询设备零部件树（设备小类 -> 设备机构 -> 设备部件）
	getPartsTreeBySmallCategoryId(smallCategoryId) {
		return request({
			url: '/api/v1/internal/maintInfo/getPartsTreeBySmallCategoryId?smallCategoryId=' + smallCategoryId,
			method: 'get',
		})
	},
	// 根据申请单号查询维修项目申请信息
	getMaintProjApplyByAppNumber(appNumber) {
		return request({
			url: '/api/v1/internal/maintInfo/getMaintProjApplyByAppNumber',
			method: 'get',
			params: {
				appNumber,
			},
		})
	},
	getStatusCount(params) {
		return request({
			url: '/api/v1/internal/maintInfo/getStatusCount',
			method: 'get',
			params: params,
		})
	},
	// 根据设备ID查询派工人员列表
	getDispatchUserListByEquipId(equipId) {
		return request({
			url: '/api/v1/internal/maintInfo/getDispatchUserListByEquipId',
			method: 'get',
			params: {
				equipId,
			},
		})
	},
}

export default api

