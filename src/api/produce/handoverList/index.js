import request from '@/utils/request'

const api = {
	// 获取 航次列表 列表
	getList(query) {
		return request({
			url: '/api/external/busHandoverlist/listDisShipvoyageItem',
			method: 'get',
			params: query,
		})
	},
  // 获取 航次列表 列表
  getAllTon(query) {
    return request({
      url: '/api/external/busHandoverlist/getAllTon',
      method: 'get',
      params: query,
    })
  },
	// 获取 票货理货信息 列表
  getCargoStatistics(ids) {
		return request({
			url: '/api/external/tally/getCargoStatistics?ids=' + ids,
			method: 'get',
		})
	},

  // 获取 票货信息 列表
  getCargoInfo(id) {
    return request({
      url: '/api/external/busHandoverlist/listBusCargoInfo?shipvoyageItemId=' + id,
      method: 'get',
    })
  },
	// 获取 交接清单 列表
	getHandoverList(id) {
		return request({
			url: '/api/external/busHandoverlist/listBusHandoverlist?shipvoyageItemId=' + id,
			method: 'get',
		})
	},

	// 提交 交接清单 列表
	busHandoverList(data) {
		return request({
			url: '/api/external/busHandoverlist/updateBusHandoverlist',
			method: 'post',
			data: data,
		})
	},
}
export default api
