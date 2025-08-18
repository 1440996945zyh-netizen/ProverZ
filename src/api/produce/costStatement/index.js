import request from '@/utils/request'

const api = {
	// 获取 交接清单 列表
	getHandoverList(query) {
		return request({
			url: '/api/external/costStatement/listBusHandoverlist',
			method: 'get',
			params: query,
		})
	},
	// 获取 结算单 列表
	getCostList(id,type) {
		return request({
			url: '/api/external/costStatement/listCostStatement?handoverlistId=' + id +'&isFinal='+type,
			method: 'get',
		})
	},
	// 获取 根据交接清单id 预结算量
	getServiceContentNum(id) {
		return request({
			url: '/api/external/costStatement/listPreSettlement?handoverlistId=' + id,
			method: 'get',
		})
	},
	// 获取 根据交接清单id 预结算量
	getSettlementBasis(id) {
		return request({
			url: '/api/external/costStatement/getSettlementBasis?handoverlistId=' + id,
			method: 'get',
		})
	},
  // 获取 根据交接清单id 预结算量
  getSettlementBasisByHandover(id) {
    return request({
      url: '/api/external/costStatement/getSettlementBasisByHandover?handoverlistId=' + id,
      method: 'get',
    })
  },

  // 获取 根据交接清单id 获取直取作业量
  getZQQuantity(id,zqTallyStatistic) {
    return request({
      url: '/api/external/costStatement/getZQQuantity?handoverlistId=' + id+"&zqTallyStatistic="+zqTallyStatistic,
      method: 'get',
    })
  },

  // 获取 根据交接清单id 获取过磅量
  getWeighCapacity(id) {
    return request({
      url: '/api/external/costStatement/getWeighCapacity?handoverlistId=' + id,
      method: 'get',
    })
  },

	// 获取 根据结算单信息
	getDetail(id,bhId) {
		return request({
			url: '/api/external/costStatement/getCostStatement?id=' + id + '&bhId=' + bhId,
			method: 'get',
		})
	},

	// 获取 根据结算单信息
	listService(data) {
		return request({
			url: '/api/external/costStatement/listService?impExp=' + data.impExp + '&type=' + data.type,
			method: 'get',
		})
	},
  getJSGWeight(id) {
		return request({
			url: '/api/external/costStatement/getJSGWeight?id='+id,
			method: 'get',
		})
	},

	// 结算
	statement(data) {
		return request({
			url: '/api/external/costStatement/statement',
			method: 'post',
			data: data,
		})
	},

	// 撤销结算
	cancelStatement(id) {
		return request({
			url: '/api/external/costStatement/cancelStatement?id=' + id,
			method: 'delete',
		})
	},
  // 获取 根据交接清单id 获取过磅量
  getBondedAreaTon(cargoInfoId) {
    return request({
      url: '/api/external/costStatement/getBondedAreaTon?cargoInfoId=' + cargoInfoId,
      method: 'get',
    })
  },
}
export default api
