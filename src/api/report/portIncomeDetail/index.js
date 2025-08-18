import request from '@/utils/request'

const api = {
	/**
	 * 查询
	 * @param {*} params {workDate，classCode}
	 */
   getListShip(params) {
		return request({
			url: '/api/internal/portIncomeDetail/getListShip',
			method: 'get',
			params,
		})
	},

	/**
	 * 获取
	 * @param {*} params {workDate，classCode}
	 */
   getListCargo(params) {
		return request({
			url: '/api/internal/portIncomeDetail/getListCargo',
			method: 'get',
			params,
		})
	},
	/**
	 * 获取
	 * @param {*} params {workDate，classCode}
	 */
   getListCustomer(params) {
		return request({
			url: '/api/internal/portIncomeDetail/getListCustomer',
			method: 'get',
			params,
		})
	},

  exportExcelShip(query) {
    return request({
      url: '/api/internal/portIncomeDetail/exportExcelShip',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
	exportExcelCargo(query) {
    return request({
      url: '/api/internal/portIncomeDetail/exportExcelCargo',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
   exportExcelCustomer(query) {
		return request({
			url: '/api/internal/portIncomeDetail/exportExcelCustomer',
			method: 'get',
      responseType: 'blob',
      params: query,
		})
	},
}
export default api
