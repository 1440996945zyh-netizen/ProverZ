import request from '@/utils/request'
const api = {
	/**
	 * 获取船舶状态
	 * @param {Object} params 检索条件的obj
	 */
	reqGetBoatStatus(params) {
		return request({
			url: '/api/external/disShipDynamic/listDisShipDynamic',
			method: 'get',
			params,
		})
	},
	listDisShipVoyage(query) {
		return request({
			url: '/api/external/disShipVoyage/listDisShipVoyage',
			method: 'get',
			params: query,
		})
	},
	getCostShipList(params) {
		return request({
			url: '/api/external/disLeavePort/getCostShipList',
			method: 'get',
			params,
		})
	},
  downShipWorkReport(query) {
    return request({
      url: '/api/external/disShipVoyage/downShipWorkReport',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
}
export default api
