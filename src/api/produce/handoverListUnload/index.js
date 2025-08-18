import request from '@/utils/request'

const url = '/api/external/busHandoverlistUnload'
const api = {
	// 获取 航次列表 列表
	getList(query) {
		return request({
			url: `${url}/listDisShipvoyageItemUnload`,
			method: 'get',
			params: query,
		})
	},
  // 获取 航次列表 列表
  getAllTon(query) {
    return request({
      url: `${url}/getAllTon`,
      method: 'get',
      params: query,
    })
  },
	// 获取 票货理货信息 列表
  getCargoStatistics(ids) {
		return request({
			url: `/api/external/tally/getCargoStatistics?ids=` + ids,
			method: 'get',
		})
	},

  // 获取 票货信息 列表
  getCargoInfo(id) {
    return request({
      url: `${url}/listBusCargoInfo?shipvoyageItemId=` + id,
      method: 'get',
    })
  },
	// 获取 交接清单 列表
	getHandoverList(id) {
		return request({
			url: `${url}/listBusHandoverlist?shipvoyageItemId=` + id,
			method: 'get',
		})
	},

	// 提交 交接清单 列表
	busHandoverList(data) {
		return request({
			url: `${url}/updateBusHandoverlist`,
			method: 'post',
			data: data,
		})
	},
	// 提交 交接清单 列表
  checkHaveTrust(voyageId) {
		return request({
			url: `${url}/checkHaveTrust/`+voyageId,
			method: 'get'
		})
	},
	// 校验是否存在交接清单
  isHaveTrust(cargoInfoId) {
		return request({
			url: `${url}/isHaveTrust/`+cargoInfoId,
			method: 'get',
		})
	},
}
export default api
