import request from '@/utils/request'

const api= {
	//获取列表
  getList(params) {
		return request({
			url: '/api/v1/internal/wholeShip/getList',
			method: 'get',
			params: params,
		})
	},
  getShipPLanTicketStatus(params) {
		return request({
			url: '/api/v1/internal/wholeShip/getShipPLanTicketStatus',
			method: 'get',
			params: params,
		})
	},
  getTicketListForChange(params) {
		return request({
			url: '/api/v1/internal/wholeShip/getTicketListForChange',
			method: 'get',
			params: params,
		})
	},
  updateTickeyDetail(shipVoyageItemId,data) {
		return request({
			url: `/api/v1/internal/wholeShip/updateTickeyDetail/${shipVoyageItemId}`,
			method: 'put',
			data: data,
		})
	},
  updateShipAdjustStatus(shipVoyageItemId,data) {
		return request({
			url: `/api/v1/internal/wholeShip/updateShipAdjustStatus/${shipVoyageItemId}`,
			method: 'get',
			params: data,
		})
	},
  getWorkTiccketTable(data) {
		return request({
			url: `api/external/workTicketNew/getWorkTiccketTable`,
			method: 'get',
			params: data,
		})
	},
  getWfHrNewTable(data) {
		return request({
			url: `api/external/workTicketNew/getWfHrNewTable`,
			method: 'get',
			params: data,
		})
	},

  exportExcel(data) {
    return request({
      url: `api/external/workTicketNew/exportExcel`,
      method: 'get',
      params: data,
      responseType: 'blob',

    })
  },
  exportMx(data) {
    return request({
      url: `api/v1/internal/largeDataScreen/exportMxExcel`,
      method: 'get',
      params: data,
      responseType: 'blob',

    })
  },
  personClearConfirm(params) {
    return request({
      url: '/api/v1/internal/wholeShip/personClearConfirm',
      method: 'put',
      params: params,
    })
  },
  macClearConfirm(params) {
    return request({
      url: '/api/v1/internal/wholeShip/macClearConfirm',
      method: 'put',
      params: params,
    })
  },

  updateShipAdjustClearPersonStatus(shipVoyageItemId) {
    return request({
      url: `/api/v1/internal/wholeShip/updateShipAdjustClearPersonStatus/${shipVoyageItemId}`,
      method: 'get',
    })
  },
  updateShipAdjustClearMacStatus(shipVoyageItemId) {
    return request({
      url: `/api/v1/internal/wholeShip/updateShipAdjustClearMacStatus/${shipVoyageItemId}`,
      method: 'get',
    })
  },
// 查询数据列表
  mxCalculate(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/mxCalculate',
      method: 'get',
      params: query
    })
  },
}
export default api
