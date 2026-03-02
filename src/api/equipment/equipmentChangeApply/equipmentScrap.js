import request from '@/utils/auth/request'

const api = {
	/**
   * 查询设备报废申请列表
   * @param {Object} params 查询参数
   * @param {Number} params.startPage 当前页
   * @param {Number} params.pageSize 每页条数
   * @param {String} params.scrapCode 工单号
   * @param {String} params.title 标题
   * @param {Number} params.useOrgId 所属部门id
   * @param {Number} params.status 审批状态
   * @returns {Promise}
   */
	getList(params) {
		return request({
			url: '/api/v1/internal/equipScrap/list',
			method: 'get',
			params: params
		})
	},

	/**
   * 查询设备报废详情
   * @param {Number} id 申请ID
   * @returns {Promise}
   */
	getById(id) {
		return request({
			url: '/api/v1/internal/equipScrap/getById',
			method: 'get',
			params: { id }
		})
	},

	/**
   * 查询设备报废详情（含设备列表）
   * @param {Number} orderId 订单ID
   * @returns {Promise}
   */
	getDetail(orderId) {
		return request({
			url: '/api/v1/internal/equipScrap/getDetail/' + orderId,
			method: 'get'
		})
	},

	/**
   * 查询报废设备历史列表
   * @param {Number} orderId 订单ID
   * @param {Number} pageNum 当前页
   * @param {Number} pageSize 每页条数
   * @returns {Promise}
   */
	getHistory(orderId, pageNum = 1, pageSize = 10) {
		return request({
			url: '/api/v1/internal/equipScrap/getHistory/' + orderId,
			method: 'get',
			params: { pageNum, pageSize }
		})
	},

	/**
   * 新增设备报废申请
   * @param {Object} data 报废申请数据
   * @param {String} data.scrapCode 工单号
   * @param {String} data.title 标题
   * @param {Number} data.useCompanyId 所属公司id
   * @param {Number} data.useOrgId 所属部门id
   * @param {String} data.applyReason 申请原因
   * @param {Array} data.scrapHistoryList 设备详情列表
   * @returns {Promise}
   */
	create(data) {
		return request({
			url: '/api/v1/internal/equipScrap/create',
			method: 'post',
			data: data
		})
	},

	/**
   * 选择可报废的设备列表
   * @param {Object} params 查询参数
   * @param {Number} params.useOrgId 所属部门id（必填）
   * @param {Number} params.startPage 当前页
   * @param {Number} params.pageSize 每页条数
   * @param {String} params.equipName 设备名称（可选）
   * @returns {Promise}
   */
	selectEquip(params) {
		return request({
			url: '/api/v1/internal/equipScrap/selectEquip',
			method: 'get',
			params: params
		})
	},

	/**
   * 获取部门树形数据
   * @returns {Promise}
   */
	getDeptTree() {
		return request({
			url: '/api/internal/sysRole/getDeptTree',
			method: 'get'
		})
	},

	/**
   * 根据部门级别查询部门列表
   * @param {Number} deptLevel 部门级别
   * @returns {Promise}
   */
	getDeptListByLevel(deptLevel) {
		return request({
			url: '/api/internal/sysDept/getListByLevel',
			method: 'get',
			params: { deptLevel }
		})
	},

	/**
   * 确认设备报废
   * @param {Number} id 申请ID
   * @param {String} flowId 流程ID（可选）
   * @returns {Promise}
   */
	confirm(id, flowId) {
		return request({
			url: '/api/v1/internal/equipScrap/confirm',
			method: 'post',
			params: { id, flowId }
		})
	},

	/**
	 * 导出设备报废申请列表
	 * @param {Object} params 查询参数
	 * @returns {Promise}
	 */
	exportExcel(params) {
		return request({
			url: '/api/v1/internal/equipScrap/export',
			method: 'get',
			params: params,
			responseType: 'blob'
		})
	}
}

export default api
