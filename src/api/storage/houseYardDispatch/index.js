import request from '@/utils/request'

const api = {
	// 获取列表
  getList(params) {
    return request({
      url: '/api/v1/internal/houseYardDispatch/getList',
      method: 'get',
      params,
    })
  },
	// 获取列表
	getDetail(id) {
		return request({
			url: `/api/v1/internal/openPortApply/getDetail?id=${id}`,
			method: 'get',
		})
	},
	// 新建
	insert(data) {
		return request({
			url: `/api/v1/internal/houseYardDispatch/add`,
			method: 'post',
			data: data,
		})
	},


  reqGetCurrentShiftClassInfo(params) {
    return request({
      url: '/api/internal/public/getCurrentShiftClassInfo',
      method: 'get',
      params,
    })
  },

  //修改理货员
  updateTally(data) {
    return request({
      url: `/api/v1/internal/houseYardDispatch/updateTally`,
      method: 'put',
      data: data,
    })
  },

	// 修改垛位
	updateMass(data) {
		return request({
			url: `/api/v1/internal/houseYardDispatch/updateMass`,
			method: 'put',
			data: data,
		})
	},

	//删除
	delete(id) {
		return request({
			url: `/api/v1/internal/houseYardDispatch/delete/${id}`,
			method: 'delete',
		})
	},

	// 获取其他列表
	getotherList(trustCargoId) {
		return request({
			url: `/api/external/trustTradeReservation/listTrustCargo?startPage=1&pageSize=15&trustCargoId=${trustCargoId}`,
			method: 'get',
		})
	},

	// 查询车队剩余可约件数重量
	getAvailable(data) {
		return request({
			url: `/api/external/trustTradeReservation/getAvailableQuantityAndTon?assignFleetId=${data.assignFleetId}&trustTradeReservationId=${data.trustTradeReservationId}`,
			method: 'get',
		})
	},

	// 上传
	uploadFile(data) {
		return request({
			url: `/api/external/trustTradeReservation/parseCars`,
			method: 'post',
			data: data,
		})
	},

	// 文件下载
	downloadFile() {
		return request({
			url: `/api/internal/file/download?id=1677281148688011264`,
			method: 'get',
			responseType: 'arraybuffer',
		})
	},
}
export default api
