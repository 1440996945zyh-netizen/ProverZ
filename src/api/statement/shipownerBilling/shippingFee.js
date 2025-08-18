import request from '@/utils/request'

const api = {
	// 获取列表
	getList(query) {
		return request({
			url: '/api/external/costShip/listShipvoyage',
			method: 'get',
			params: query,
		})
	},

	// 获取费率
	listRate(id) {
		return request({
			url: '/api/external/costShip/listRate?shipvoyageId=' + id,
			method: 'get',
		})
	},
  listRateNew(id,itemId) {
    return request({
      url: '/api/external/costShip/listRateNew?shipvoyageId=' + id + '&shipvoyageItemId='+ itemId,
      method: 'get',
    })
  },
	// 获取详情
	getDetail(id) {
		return request({
			url: '/api/external/costShip/listCostShip?shipvoyageItemId=' + id,
			method: 'get',
		})
	},
  // 获取详情
  listOtherCost(id) {
    return request({
      url: '/api/external/costShip/listOtherCostShip?shipvoyageItemId=' + id,
      method: 'get',
    })
  },
  getBerthDys(param){
    return request({
      url: '/api/external/costShip/getBerthDyas?shipvoyageItemId='+param,
      method: 'get'
    })
  },
  //获取特殊停泊时间
  getSpecialDynamicList(param){
    return request({
      url: '/api/external/costShip/getSpecialDynamicList?shipvoyageItemId='+param,
      method: 'get'
    })
  },
	// 结算
	statement(data) {
		return request({
			url: '/api/external/costShip/statement',
			method: 'post',
			data: data,
		})
	},

	// 撤销结算
	cancelStatement(id) {
		return request({
			url: '/api/external/costShip/cancelStatement?shipvoyageItemId=' + id,
			method: 'DELETE',
		})
	},
  //导出结算
  exportFee(id,itemId) {
    return request({
      url: '/api/external/costShip/exportFee?shipvoyageId=' + id + '&shipvoyageItemId=' + itemId,
      method: 'get',
      responseType: 'blob',
    })
  },
	// 审核
	review(id) {
		return request({
			url: '/api/external/costShip/review?shipvoyageItemId=' + id,
			method: 'put',
		})
	},

	// 撤销审核
	cancelReview(id) {
		return request({
			url: '/api/external/costShip/cancelReview?shipvoyageItemId=' + id,
			method: 'put',
		})
	},

	// 查询停工列表
	listStopRecord(id) {
		return request({
			url: '/api/external/costShip/listStopRecord?shipvoyageId=' + id,
			method: 'get',
		})
	},
}
export default api
