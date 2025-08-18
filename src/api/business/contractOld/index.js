import request from '@/utils/request'

const url = '/api/v1/internal/tBusOldContract'

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

  syncData(params) {
    return request({
      url: `/api/v1/internal/tBusOldContract/syncData/${params}`,
      method: 'post',
    })
  },

  syncWeightData(params) {
    return request({
      url: `/api/v1/internal/tBusOldContract/syncWeightData/${params}`,
      method: 'post',
    })
  },
}

export default api
