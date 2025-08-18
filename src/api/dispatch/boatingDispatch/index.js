import request from '@/utils/request'
const api = {
	/**
	 * 获取船舶调度
	 * @param {Object} params 检索条件的obj
	 */
	reqGetBoat(params) {
		return request({
			url: '/api/external/disShipDynamic/listDisShipVoyage',
			method: 'get',
			params,
		})
	},
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
  doorStatus(params) {
    return request({
      url: '/api/external/disShipDynamic/queryAllDoor',
      method: 'get',
      params,
    })
  },
	/**
	 * 新增船舶动态跟踪数据
	 * @param {Object} params 检索条件的obj
	 */
	reqAddShipDynamic(params) {
		return request({
			url: '/api/external/disShipDynamic/updateDisShipvoyageStatus',
			method: 'put',
			data: params,
		})
	},
	/**
	 * 删除船舶动态
	 * @param {Object} params 删除
	 */
	reqDeleteShipDynamic(params) {
		return request({
			url: '/api/external/disShipDynamic/deleteDisShipDynamic',
			method: 'delete',
			params,
		})
	},
	/**
	 * 获取船代
	 * @param {Object} params 页码+clientCode = 7
	 */
	getcustomerlist(params) {
		return request({
			url: '/api/internal/public/getcustomerlist',
			method: 'get',
			params,
		})
	},
	/**
	 * 获取船名航次
	 * @param {Object} params 页码+clientCode = 7
	 */
	getVesselNameAndId(params) {
		return request({
			url: '/api/external/shipDispatch/getVesselNameAndId',
			method: 'get',
			params,
		})
	},
  getDynamic(id) {
    return request({
      url: `/api/external/disShipDynamic/getDetail?id=${id}`,
      method: 'get'
    })
  },
  updateDynamic(data) {
    return request({
      url: '/api/external/disShipDynamic/update',
      method: 'put',
      data: data
    })
  },

  getBollard(data) {
    return request({
      url: '/api/v1/internal/mBerth/getBollard',
      method: 'get',
      params: data
    })
  },
  exportExcel(shipvoyageId){
    return request({
      url: '/api/external/disShipDynamic/exportExcel?shipvoyageId='+shipvoyageId,
      method: 'get',
      responseType: 'blob'
    })
  },

  // 获取停时类型
  getStopHourType(query) {
    return request({
      url: '/api/internal/public/getLocalSelect',
      method: 'get',
      params: query
    })
  },
  getShutdownType(query) {
    return request({
      url: '/api/internal/public/getLocalSelect',
      method: 'get',
      params: query
    })
  },
}
export default api
