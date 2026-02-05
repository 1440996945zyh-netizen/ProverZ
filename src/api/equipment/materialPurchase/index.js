import request from '@/utils/request'

const url = '/api/v1/internal/materialPurchase'

const api = {
	/**
	 * 查询物资采购列表
	 * @param {Object} params  参数对象
	 * @returns {Array} 物资采购列表
	 */
	getList(params) {
		return request({
			url: `${url}/list`,
			method: 'get',
			params: params,
		})
	},

	/**
	 * 根据ID查询物资采购
	 * @param {Number} id 物资采购id
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
	 * 新增物资采购
	 * @param {Object} data 物资采购信息
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
	 * 修改物资采购
	 * @param {Object} data 物资采购信息
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
	 * 删除物资采购
	 * @param {Number} id 物资采购id
	 * @returns
	 */
	delete(id) {
		return request({
			url: `${url}/delete/${id}`,
			method: 'delete',
		})
	},

	/**
	 * 标记采购失败
	 * @param {Number} id 物资采购id
	 * @param {String} failureReason 失败原因
	 * @returns
	 */
	markAsFailed(id, failureReason) {
		return request({
			url: `${url}/markAsFailed`,
			method: 'put',
			params: { id, failureReason },
		})
	},

	/**
	 * 审核物资采购
	 * @param {Number} id 物资采购id
	 * @param {String} status 审核状态（3-审核通过，4-驳回）
	 * @param {String} approvalRemark 审核备注
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
}

export default api

