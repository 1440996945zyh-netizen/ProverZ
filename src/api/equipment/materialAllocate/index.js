import request from '@/utils/auth/request'

/**
 * 物资调拨接口
 */
const api = {
	/**
	 * 查询物资调拨列表
	 * @param {Object} params 查询参数
	 * @returns {Promise}
	 */
	getList(params) {
		return request({
			url: '/api/v1/internal/materialAllocate/list',
			method: 'get',
			params,
		})
	},

	/**
	 * 查询物资调拨详情
	 * @param {number|string} id 调拨单ID
	 * @returns {Promise}
	 */
	getById(id) {
		return request({
			url: '/api/v1/internal/materialAllocate/getById',
			method: 'get',
			params: { id },
		})
	},

	/**
	 * 查询待调拨物资列表
	 * @param {Object} params 查询参数
	 * @returns {Promise}
	 */
	selectMaterial(params) {
		return request({
			url: '/api/v1/internal/materialAllocate/selectMaterial',
			method: 'get',
			params,
		})
	},

	/**
	 * 新增物资调拨单
	 * @param {Object} data 调拨数据
	 * @returns {Promise}
	 */
	add(data) {
		return request({
			url: '/api/v1/internal/materialAllocate/add',
			method: 'post',
			data,
		})
	},

	/**
	 * 修改物资调拨单
	 * @param {Object} data 调拨数据
	 * @returns {Promise}
	 */
	update(data) {
		return request({
			url: '/api/v1/internal/materialAllocate/update',
			method: 'put',
			data,
		})
	},

	/**
	 * 删除物资调拨单
	 * @param {number|string} id 调拨单ID
	 * @returns {Promise}
	 */
	delete(id) {
		return request({
			url: '/api/v1/internal/materialAllocate/delete/' + id,
			method: 'delete',
		})
	},

	/**
	 * 发起物资调拨审批
	 * @param {Object} data 流程参数
	 * @returns {Promise}
	 */
	submitMaterialAllocate(data) {
		return request({
			url: '/api/v1/internal/materialAllocate/submitMaterialAllocate',
			method: 'post',
			data,
		})
	},
}

export default api
