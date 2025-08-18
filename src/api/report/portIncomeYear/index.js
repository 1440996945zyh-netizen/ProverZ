import request from '@/utils/request'

const api = {
	/**
	 * 查询
	 * @param {*} params {workDate，classCode}
	 */
   getListCustomer(params) {
		return request({
			url: '/api/internal/portIncomeYear/getListCustomer',
			method: 'get',
			params,
		})
	},

	/**
	 * 获取
	 * @param {*} params {workDate，classCode}
	 */
   getListRate(params) {
		return request({
			url: '/api/internal/portIncomeYear/getListRate',
			method: 'get',
			params,
		})
	},
  exportExcelCustomer(query) {
    return request({
      url: '/api/internal/portIncomeYear/exportExcelCustomer',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
	exportExcelType(query) {
    return request({
      url: '/api/internal/portIncomeYear/exportExcelType',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
}
export default api
