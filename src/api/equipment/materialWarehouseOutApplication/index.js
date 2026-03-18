import request from '@/utils/auth/request'

const url = '/api/v1/internal/materialOutApplication'

const api = {
	/**
	 * 查询物资出库申请列表
	 * @param {Object} params  参数对象
	 * @returns {Array} 物资出库申请列表
	 */
	getList(params) {
		return request({
			url: `${url}/list`,
			method: 'get',
			params: params,
		})
	},

	/**
	 * 根据ID查询物资出库申请
	 * @param {Number} id 物资出库申请id
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
	 * 新增物资出库申请
	 * @param {Object} data 物资出库申请信息
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
	 * 修改物资出库申请
	 * @param {Object} data 物资出库申请信息
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
	 * 删除物资出库申请
	 * @param {Number} id 物资出库申请id
	 * @returns
	 */
	delete(id) {
		return request({
			url: `${url}/delete/${id}`,
			method: 'delete',
		})
	},

	/**
	 * 审核物资出库申请
	 * @param {Object} params 审核参数 {id, auditStatus, auditRemark}
	 * @returns
	 */
	audit(params) {
		return request({
			url: `${url}/audit`,
			method: 'post',
			params: params,
		})
	},

	/**
	 * 查询物资出库申请列表（包含明细列表和库存数量，用于出库时选择）
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

	/**
	 * 发起物资出库申请流程
	 * @param {Object} data 流程数据
	 * @returns
	 */
	outApplicationStart(data) {
		return request({
			url: `${url}/outApplicationStart`,
			method: 'post',
			data: data,
		})
	},
}

export default api
