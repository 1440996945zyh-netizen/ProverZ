import request from '@/utils/auth/request'

const url = '/api/v1/internal/materialWarehouseIn'

const api = {
	/**
	 * 查询物资入库列表
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
	 * 根据ID查询物资入库
	 * @param {Number} id 物资入库id
	 * @returns
	 */
	getById(id) {
		return request({
			url: `${url}/getById`,
			method: 'get',
			params: { id },
		})
	},

	/**
	 * 新增物资入库
	 * @param {Object} data 物资入库数据
	 * @returns
	 */
	add(data) {
		return request({
			url: `${url}/add`,
			method: 'post',
			data,
		})
	},

	/**
	 * 修改物资入库
	 * @param {Object} data 物资入库数据
	 * @returns
	 */
	update(data) {
		return request({
			url: `${url}/update`,
			method: 'put',
			data,
		})
	},

	/**
	 * 删除物资入库
	 * @param {Number} id 物资入库id
	 * @returns
	 */
	delete(id) {
		return request({
			url: `${url}/delete/${id}`,
			method: 'delete',
		})
	},

	/**
	 * 验收物资入库
	 * @param {Object} data 验收数据 {id, acceptanceStatus, acceptanceRemarks}
	 * @returns
	 */
	acceptance(data) {
		return request({
			url: `${url}/acceptance`,
			method: 'put',
			data,
		})
	},

	/**
	 * 查询物资库存数量（按物资ID和仓库ID）
	 * @param {Number} materialId 物资ID
	 * @param {Number} warehouseId 仓库ID（可选，不传时查询所有仓库的库存总和）
	 * @returns
	 */
	getStockQuantity(materialId, warehouseId) {
		const params = { materialId }
		if (warehouseId !== undefined && warehouseId !== null) {
			params.warehouseId = warehouseId
		}
		return request({
			url: `${url}/getStockQuantity`,
			method: 'get',
			params,
		})
	},

	/**
	 * 查询物资可用库存数量（按物资ID和仓库ID）
	 * @param {Number} materialId 物资ID
	 * @param {Number} warehouseId 仓库ID（可选，不传时查询所有仓库的库存总和）
	 * @returns
	 */
	getAvailableInventory(materialId, warehouseId) {
		const params = { materialId }
		if (warehouseId !== undefined && warehouseId !== null) {
			params.warehouseId = warehouseId
		}
		return request({
			url: `${url}/getAvailableInventory`,
			method: 'get',
			params,
		})
	},
}

export default api

