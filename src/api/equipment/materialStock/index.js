import request from '@/utils/auth/request'

const api = {
	// 查询物资库存列表（分页）
	getList(params) {
		return request({
			url: '/api/v1/internal/materialStock/list',
			method: 'get',
			params: params,
		})
	},
	// 查询物资库存明细列表（根据仓库ID和物资ID）
	getStockDetailList(warehouseId, materialId, params) {
		const requestParams = {
			warehouseId: warehouseId,
			materialId: materialId,
		}
		if (params && params.warehouseInTimeStart) {
			requestParams.warehouseInTimeStart = params.warehouseInTimeStart
		}
		if (params && params.warehouseInTimeEnd) {
			requestParams.warehouseInTimeEnd = params.warehouseInTimeEnd
		}
		return request({
			url: '/api/v1/internal/materialStock/detailList',
			method: 'get',
			params: requestParams,
		})
	},
	// 查询物资库存流水列表（根据仓库ID和物资ID）
	getStockFlowList(warehouseId, materialId, params) {
		const requestParams = {
			warehouseId: warehouseId,
			materialId: materialId,
		}
		if (params && params.warehouseInTimeStart) {
			requestParams.warehouseInTimeStart = params.warehouseInTimeStart
		}
		if (params && params.warehouseInTimeEnd) {
			requestParams.warehouseInTimeEnd = params.warehouseInTimeEnd
		}
		return request({
			url: '/api/v1/internal/materialStock/flowList',
			method: 'get',
			params: requestParams,
		})
	},
	// 创建盘点单（整个仓库）
	createCheck(params) {
		return request({
			url: '/api/v1/internal/materialStockCheck/create',
			method: 'post',
			params: params,
		})
	},
	// 创建盘点单（单个物资）
	createCheckForMaterial(params) {
		return request({
			url: '/api/v1/internal/materialStockCheck/createForMaterial',
			method: 'post',
			params: params,
		})
	},
	// 查询盘点单列表
	getCheckList(params) {
		return request({
			url: '/api/v1/internal/materialStockCheck/list',
			method: 'get',
			params: params,
		})
	},
	// 根据ID查询盘点单
	getCheckById(id) {
		return request({
			url: `/api/v1/internal/materialStockCheck/${id}`,
			method: 'get',
		})
	},
	// 查询盘点明细列表
	getCheckDetailList(checkId) {
		return request({
			url: `/api/v1/internal/materialStockCheck/detail/${checkId}`,
			method: 'get',
		})
	},
	// 更新盘点数量
	updateCheckQuantity(params) {
		return request({
			url: '/api/v1/internal/materialStockCheck/updateQuantity',
			method: 'put',
			data: params,
		})
	},
	// 完成盘点
	completeCheck(checkId) {
		return request({
			url: '/api/v1/internal/materialStockCheck/complete',
			method: 'post',
			params: { checkId },
		})
	},
	// 快速盘点（创建盘点单、保存盘点数量、完成盘点并生成出入库单）
	quickCheck(params) {
		return request({
			url: '/api/v1/internal/materialStockCheck/quickCheck',
			method: 'post',
			params: params,
		})
	},
	// 盘点调整
	adjustCheck(params) {
		return request({
			url: '/api/v1/internal/materialStockCheck/adjust',
			method: 'post',
			params: params,
		})
	},
	// 删除盘点单
	deleteCheck(id) {
		return request({
			url: `/api/v1/internal/materialStockCheck/${id}`,
			method: 'delete',
		})
	},
	// 导出库存查询数据
	pageExport(params) {
		return request({
			url: '/api/v1/internal/materialStock/pageExport',
			method: 'get',
			params: params,
			responseType: 'blob',
		})
	},
}
export default api

