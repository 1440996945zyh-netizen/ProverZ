import request from '@/utils/auth/request'

const url = '/api/v1/internal/materialApplication'

const api = {
	/**
	 * 查询物资申报列表
	 * @param {Object} params  参数对象
	 * @returns {Array} 物资申报列表
	 */
	getList(params) {
		return request({
			url: `${url}/list`,
			method: 'get',
			params: params,
		})
	},

	/**
	 * 根据ID查询物资申报
	 * @param {Number} id 物资申报id
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
	 * 新增物资申报
	 * @param {Object} data 物资申报信息
	 * @returns
	 */
	add(data) {
		return request({
			url: `${url}/add`,
			method: 'post',
			data: data,
		})
	},

	/**
	 * 修改物资申报
	 * @param {Object} data 物资申报信息
	 * @returns
	 */
	update(data) {
		return request({
			url: `${url}/update`,
			method: 'put',
			data: data,
		})
	},

	/**
	 * 删除物资申报
	 * @param {Number} id 物资申报id
	 * @returns
	 */
	delete(id) {
		return request({
			url: `${url}/delete/${id}`,
			method: 'delete',
		})
	},

	/**
	 * 审批物资申报
	 * @param {Number} id 物资申报id
	 * @param {String} status 审批状态（3-审批通过，4-驳回）
	 * @param {String} approvalRemark 审批备注
	 * @returns
	 */
	approve(id, status, approvalRemark) {
		return request({
			url: `${url}/approve`,
			method: 'post',
			params: {
				id,
				status,
				approvalRemark: approvalRemark || '',
			},
		})
	},

	/**
	 * 查询申报物资明细列表（用于采购时选择）
	 * @param {Object} params 查询参数
	 * @returns
	 */
	getDetailListForPurchase(params) {
		return request({
			url: `${url}/getDetailListForPurchase`,
			method: 'get',
			params: params,
		})
	},

	/**
	 * 查询物资申报明细关联采购明细列表（用于入库时选择）
	 * @param {Object} params 查询参数
	 * @returns
	 */
	getDetailListForWarehouseIn(params) {
		return request({
			url: `${url}/getDetailListForWarehouseIn`,
			method: 'get',
			params: params,
		})
	},

	/**
	 * 查询物资申报主表列表（包含明细列表，用于出库申请时选择）
	 * @param {Object} params 查询参数
	 * @returns
	 */
	getListWithDetails(params) {
		return request({
			url: `${url}/getListWithDetails`,
			method: 'get',
			params: params,
		})
	},

	materialApplicationStart(data) {
		return request({
			url: `${url}/materialApplicationStart`,
			method: 'post',
			data: data,
		})
	},
}

export default api
