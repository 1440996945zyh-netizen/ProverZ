import request from '@/utils/request'

const api = {

	getList(query) {
		return request({
			url: '/api/v1/internal/tBusVehicleTransfer/getList',
			method: 'get',
			params: query,
		})
	},

	//查询指令关联配工信息列表
	getTrustCagroDispatchSecondary(query) {
		return request({
			url: '/api/v1/internal/tBusVehicleTransfer/getTrustCagroDispatchSecondary',
			method: 'get',
			params: query,
		})
	},

  //查询指令关联配工信息列表
  getSecondWeighTon(query) {
    return request({
      url: '/api/v1/internal/tBusVehicleTransfer/getSecondWeighTon',
      method: 'get',
      params: query,
    })
  },

	// 查询过磅数据
	getVehicleTransferList(query) {
		return request({
			url: '/api/v1/internal/tBusVehicleTransfer/getVehicleTransferList',
			method: 'get',
			params: query,
		})
	},
  // 查询过磅数据
  getMiscFeeList(query) {
    return request({
      url: '/api/v1/internal/tBusVehicleTransfer/getMiscFeeList',
      method: 'get',
      params: query,
    })
  },

	// 新增倒运设备信息
	insertVehicleTransferList(data) {
		return request({
			url: '/api/v1/internal/tBusVehicleTransfer/insertVehicleTransferList',
			method: 'post',
			data: data,
		})
	},

	// 新增倒运设备信息
	addOrDeleteVehicleTransfer(data) {
		return request({
			url: '/api/v1/internal/tBusVehicleTransfer/addOrDeleteVehicleTransfer',
			method: 'post',
			data: data,
		})
	},
  updateInvert(data) {
    return request({
      url: '/api/v1/internal/tBusVehicleTransfer/updateInvert',
      method: 'put',
      data: data,
    })
  },
  getEmptyHeavy(params) {
    return request({
      url: '/api/v1/internal/tBusVehicleTransfer/getEmptyHeavy',
      method: 'put',
      params: params,
    })
  },
  changeStatus(data) {
    return request({
      url: '/api/v1/internal/tBusVehicleTransfer/changeStatus',
      method: 'put',
      data: data
    })
  },

  //获取下方已派列表
  getVehicleList(params) {
    return request({
      url: '/api/v1/internal/tBusVehicleTransfer/getVehicleList',
      method: 'get',
      params
    })
  },

  /**
   * 查询机械列表(不控制权限)
   * @param map
   * @return
   */
  getMachineList(query){
    return request({
      url: '/api/internal/public/getMachineList2',
      method: 'get',
      params: query
    })
  },
  //配工状态修改
  changeDetailStatus(data) {
    return request({
      url: '/api/v1/internal/tBusVehicleTransfer/changeDetailStatus',
      method: 'put',
      data: data
    })
  },
}
export default api
