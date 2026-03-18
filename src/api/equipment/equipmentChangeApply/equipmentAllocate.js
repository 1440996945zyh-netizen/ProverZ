import request from '@/utils/auth/request'

export default {
	/**
	 * 获取设备调拨申请列表
	 * @param {Object} params 查询参数
	 * @returns {Promise}
	 */
	getList(params) {
		return request({
			url: '/api/v1/internal/equipAllocate/list',
			method: 'get',
			params: params
		})
	},

	/**
	 * 获取设备调拨申请详情
	 * @param {string|number} id 调拨申请ID
	 * @returns {Promise}
	 */
	getDetail(id) {
		return request({
			url: '/api/v1/internal/equipAllocate/' + id,
			method: 'get'
		})
	},

	/**
	 * 创建设备调拨申请
	 * @param {Object} data 调拨申请数据
	 * @returns {Promise}
	 */
	create(data) {
		return request({
			url: '/api/v1/internal/equipAllocate',
			method: 'post',
			data: data
		})
	},

	/**
	 * 查询可选择的设备列表
	 * @param {Object} params 查询参数
	 * @returns {Promise}
	 */
	selectEquip(params) {
		return request({
			url: '/api/v1/internal/equipAllocate/selectEquip',
			method: 'get',
			params: params
		})
	},

	/**
	 * 导出设备调拨申请列表
	 * @param {Object} params 查询参数
	 * @returns {Promise}
	 */
	exportExcel(params) {
		return request({
			url: '/api/v1/internal/equipAllocate/export',
			method: 'get',
			params: params,
			responseType: 'blob'
		})
	},

	/**
	 * 设备调拨提交审批
	 * @param {Object} data
	 */
	submitEquipAllocate(data) {
		return request({
			url: '/api/v1/internal/equipAllocate/submitEquipAllocate',
			method: 'post',
			data: data
		})
	},

	/**
	 * 删除设备调拨申请
	 * @param {Number|String} id
	 */
	delete(id) {
		return request({
			url: '/api/v1/internal/equipAllocate/delete/' + id,
			method: 'delete'
		})
	},

	/**
	 * 批量删除设备调拨申请
	 * @param {Array} ids
	 */
	deleteBatch(ids) {
		return request({
			url: '/api/v1/internal/equipAllocate/deleteBatch',
			method: 'delete',
			data: ids
		})
	}
}
