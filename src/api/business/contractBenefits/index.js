import request from '@/utils/request'

const api = {
	/**
	 * 查询阶梯费率列表
	 * @param {Object} params  参数对象
	 * @param {Number} startPage 当前页
	 * @param {Number} pageSize 每页多少条
	 * @returns {Array} 合同列表
	 */
	getList(params) {
		return request({
			url: `api/external/trate/listTrate`,
			method: 'get',
			params: params,
		})
	},

	/**
	 * 新增阶梯费率
	 * @param {Object} data 合同信息
	 * @returns
	 */
	insertTrate(data) {
		return request({
			url: 'api/external/trate/insertTrate',
			method: 'post',
			data: data,
		})
	},
	/**
	 * 修改阶梯费率
	 * @param {Object} data 合同信息
	 * @returns
	 */
	updateTrate(data) {
		return request({
			url: 'api/external/trate/updateTrate',
			method: 'put',
			data: data,
		})
	},
	// 获取合同编号
	getLocalSelect(query) {
		return request({
			url: 'api/internal/public/getLocalSelect?type=CONTRACT&customerIds=' + query.customerIds,
			method: 'get',
		})
	},
	/**
	 * 删除阶梯费率
	 * @param {Array} id 合同id
	 * @returns
	 */
	delete(id) {
		return request({
			url: `api/external/trate/deleteTrate?id=${id}`,
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
	getCargoRateList(cargoCodes) {
		return request({
			url: '/api/v1/internal/tBusContract/listCargoRate?cargoCodes=' + cargoCodes,
			method: 'get',
			// params: query,
		})
	},
	/**
	 * 合同发布
	 * @param {Object} data 合同信息
	 * @returns
	 */
	release(id) {
		return request({
			url: 'api/external/trate/release?id=' + id,
			method: 'put',
		})
	},
	/**
	 * 合同撤销发布
	 * @param {Object} data 合同信息
	 * @returns
	 */
	cancelRelease(id) {
		return request({
			url: 'api/external/trate/cancelRelease?id=' + id,
			method: 'put',
		})
	},
  /**
   * 修改原始累积量
   * @param trateItemId
   * @param originAccNumber
   * @returns {*}
   */
  updateOriginAccNumber(trateItemId, originAccNumber) {
    return request({
      url: 'api/external/trate/updateOriginAccNumber?trateItemId=' + trateItemId + "&originAccNumber=" + originAccNumber,
      method: 'put',
    })
  },
}

export default api
