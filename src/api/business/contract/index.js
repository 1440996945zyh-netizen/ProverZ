import request from '@/utils/request'

const url = '/api/v1/internal/tBusContract'

const api = {
	/**
	 * 查询合同列表
	 * @param {Object} params  参数对象
	 * @param {Number} startPage 当前页
	 * @param {Number} pageSize 每页多少条
	 * @returns {Array} 合同列表
	 */
	getList(params) {
		return request({
			url: `${url}/getList`,
			method: 'get',
			params: params,
		})
	},

	/**
	 *
	 * @param {Number} parentId 合同父id
	 * @returns
	 */
	getListByParentId(parentId) {
		return request({
			url: `${url}/getListByParentId/${parentId}`,
			method: 'get',
		})
	},

	/**
	 *
	 * @param {Number} id 合同id
	 * @returns
	 */
	getById(id) {
		return request({
			url: `${url}/getDetail/${id}`,
			method: 'get',
		})
	},

	/**
	 * 新增合同
	 * @param {Object} data 合同信息
	 * @returns
	 */
	// add(data) {
	// 	return request({
	// 		url: `${url}/add`,
	// 		method: 'post',
	// 		data: data,
	// 	})
	// },
	add(data) {
		return request({
			url: '/api/v1/internal/tBusContract/add',
			method: 'post',
			data: data,
		})
	},
	/**
	 * 修改合同
	 * @param {Object} data 合同信息
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
	 * 修改合同状态
	 * @param {Object} data 合同信息状态
	 * @returns
	 */
	updateStatus(data) {
		return request({
			url: `${url}/updateStatus`,
			method: 'put',
			data: data,
		})
	},
	/**
	 * 取消生效
	 * @param {Object} data 合同信息状态
	 * @returns
	 */
	cancel(id) {
		return request({
			url: `${url}/cancel?id=` + id,
			method: 'put',
		})
	},
	/**
	 * 删除合同
	 * @param {Array} id 合同id
	 * @returns
	 */
	delete(id) {
		return request({
			url: `${url}/delete/${id}`,
			method: 'delete',
		})
	},
	// 获取费率列表信息
	getRateList(query) {
		return request({
			url: '/api/external/miscbilling/getratelist',
			method: 'get',
			params: query,
		})
	},
	// 生成货物费率
	getCargoRateList(data) {
		return request({
			url: '/api/v1/internal/tBusContract/listCargoRate?cargoCodes=' + data.cargoCodes + '&startTime=' + data.startTime,
			method: 'get',
			// params: query,
		})
	},
	// 匹配阶梯费率
	getMatchTrate(data) {
		return request({
			url: `/api/v1/internal/tBusContract/matchTrate?contractNo=${data.contractNo}&customerId=${data.customerId}&startTime=${data.startTime}&endTime=${data.endTime}&cargoCode=${data.cargoCode}`,
			method: 'get',
			// params: query,
		})
	},
}

export default api
