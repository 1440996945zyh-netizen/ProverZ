import request from '@/utils/request'

const api = {
	/**
	 * 查询
	 * @param {*} params {workDate，classCode}
	 */
   getList(params) {
		return request({
			url: '/api/internal/PortThroughputController/getList',
			method: 'get',
			params,
		})
	},
   exportExcel(query) {
		return request({
			url: '/api/internal/PortThroughputController/exportExcel',
			method: 'get',
      responseType: 'blob',
      params: query,
		})
	},
}
export default api
