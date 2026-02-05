import request from '@/utils/request'

const url = '/api/v1/internal/materialStockCheck'

const api = {
	/**
	 * 查询盘点单列表
	 * @param {Object} params 查询参数
	 * @returns
	 */
	getList(params) {
		return request({
			url: `${url}/list`,
			method: 'get',
			params,
		})
	},

	/**
	 * 根据ID查询盘点单
	 * @param {Number} id 盘点单id
	 * @returns
	 */
	getById(id) {
		return request({
			url: `${url}/${id}`,
			method: 'get',
		})
	},

	/**
	 * 根据仓库创建盘点单
	 * @param {Object} params 创建参数
	 * @returns
	 */
	createByWarehouse(params) {
		return request({
			url: `${url}/createByWarehouse`,
			method: 'post',
			params,
		})
	},

	/**
	 * 保存盘点单（新增或修改）
	 * @param {Object} data 盘点单数据
	 * @returns
	 */
	save(data) {
		return request({
			url: `${url}/save`,
			method: 'post',
			data,
		})
	},

	/**
	 * 删除盘点单
	 * @param {Number} id 盘点单id
	 * @returns
	 */
	deleteCheck(id) {
		return request({
			url: `${url}/${id}`,
			method: 'delete',
		})
	},

	/**
	 * 完成盘点
	 * @param {Number} checkId 盘点单id
	 * @returns
	 */
	completeCheck(checkId) {
		return request({
			url: `${url}/complete`,
			method: 'post',
			params: { checkId },
		})
	},

	/**
	 * 根据仓库ID查询所有入库明细
	 * @param {Number} warehouseId 仓库ID
	 * @returns
	 */
	getInDetailsByWarehouseId(warehouseId) {
		return request({
			url: `${url}/inDetails/${warehouseId}`,
			method: 'get',
		})
	},

	/**
	 * 查询盘点明细列表（包含入库明细和入库主表信息）- 分页
	 * @param {Object} params 查询参数（包含checkId和其他查询条件）
	 * @returns
	 */
	getDetailListWithInInfo(params) {
		return request({
			url: `${url}/detailWithInInfo`,
			method: 'get',
			params,
		})
	},
}

export default api

