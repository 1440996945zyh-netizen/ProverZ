import request from '@/utils/auth/request'

/**
 * 结算申请相关接口
 */
const api = {
	/**
	 * 查询结算申请列表（分页）
	 * @param {Object} params
	 */
	getList(params) {
		return request({
			url: '/api/v1/internal/costSettlementApply/list',
			method: 'get',
			params: params,
		})
	},

	/**
	 * 根据id查询结算申请详情
	 * @param {Number|String} id
	 */
	getById(id) {
		return request({
			url: '/api/v1/internal/costSettlementApply/getById',
			method: 'get',
			params: { id }
		})
	},

	/**
	 * 新增结算申请
	 * @param {Object} data
	 */
	add(data) {
		return request({
			url: '/api/v1/internal/costSettlementApply/add',
			method: 'post',
			data: data,
		})
	},

	/**
	 * 修改结算申请
	 * @param {Object} data
	 */
	update(data) {
		return request({
			url: '/api/v1/internal/costSettlementApply/update',
			method: 'put',
			data: data,
		})
	},

	/**
	 * 删除结算申请
	 * @param {Number|String} id
	 */
	delete(id) {
		return request({
			url: '/api/v1/internal/costSettlementApply/delete/' + id,
			method: 'delete',
		})
	},

	/**
	 * 批量删除结算申请
	 * @param {Array} ids
	 */
	deleteBatch(ids) {
		return request({
			url: '/api/v1/internal/costSettlementApply/deleteBatch',
			method: 'delete',
			data: ids,
		})
	},

	/**
	 * 查询可结算的已验收工单
	 * @param {Object} params { maintOrgId, projectType }
	 */
	getAcceptedWorkOrders(params) {
		return request({
			url: '/api/v1/internal/costSettlementApply/getAcceptedWorkOrders',
			method: 'get',
			params: params,
		})
	},

	/**
	 * 结算申请提交审批
	 * @param {Object} data
	 */
	submitSettlementApply(data) {
		return request({
			url: '/api/v1/internal/costSettlementApply/submitSettlementApply',
			method: 'post',
			data: data,
		})
	}
}

export default api
