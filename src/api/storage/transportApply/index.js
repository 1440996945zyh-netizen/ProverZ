import request from '@/utils/request'

const api = {
	// 获取列表
	getList(query) {
		return request({
			url: '/api/v1/internal/transportApply/getList',
			method: 'get',
			params: query,
		})
	},


  reqGetCurrentShiftClassInfo(params) {
    return request({
      url: '/api/internal/public/getCurrentShiftClassInfo',
      method: 'get',
      params,
    })
  },


	// 获取列表
	getDetail(id) {
		return request({
			url: `/api/v1/internal/transportApply/getDetail?id=${id}`,
			method: 'get',
		})
	},
	// 新建
	insert(data) {
		return request({
			url: `/api/v1/internal/transportApply/add`,
			method: 'post',
			data: data,
		})
	},

	// 修改
	update(data) {
		return request({
			url: `/api/v1/internal/transportApply/update`,
			method: 'put',
			data: data,
		})
	},


	//删除
	delete(id) {
		return request({
			url: `/api/v1/internal/transportApply/delete/${id}`,
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
  getProcessName() {
    return request({
      url: '/api/v1/internal/transportApply/getProcessName',
      method: 'get',
    })
  },
  getNormalProcess() {
    return request({
      url: `/api/v1/internal/tPrdWorkPlan/normalWorkProcess`,
      method: 'get',
    })
  },
}
export default api
