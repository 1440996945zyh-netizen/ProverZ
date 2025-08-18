import request from '@/utils/request'

const api = {
	// 获取列表
	getList(query) {
		return request({
			url: '/api/v1/internal/openPortApply/getList',
			method: 'get',
			params: query,
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
			url: `/api/v1/internal/openPortApply/add`,
			method: 'post',
			data: data,
		})
	},
  insertBatch(data) {
		return request({
			url: `/api/v1/internal/openPortApply/addBatch`,
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
	// 修改
	update(data) {
		return request({
			url: `/api/v1/internal/openPortApply/update`,
			method: 'put',
			data: data,
		})
	},

	//删除
	delete(id) {
		return request({
			url: `/api/v1/internal/openPortApply/delete/${id}`,
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
  getNormalProcess() {
    return request({
      url: `/api/v1/internal/tPrdWorkPlan/workProcessType/2`,
      method: 'get',
    })
  },
  /**
   * 集疏港计划导入作业指令
   * @param {Object} params 检索条件的obj
   */
  insertWorkPlan(data, workDate, classCode, className) {
    return request({
      url:
        '/api/v1/internal/openPortApply/importTrust?workDate=' + workDate + '&classCode=' + classCode + '&className=' + className,
      method: 'post',
      data: data,
    })
  },
  /**
   * 集疏港计划保存
   * @param {Object} params 检索条件的obj
   */
  updatePlan(data) {
    return request({
      url: '/api/v1/internal/tPrdWorkPlan/updateWorkPlan',
      method: 'put',
      data: data,
    })
  },
  /**
   * 删除
   * @param {Object} params 检索条件的obj
   */
  reqDelete(data) {
    return request({
      url: '/api/v1/internal/tPrdWorkPlan/delete',
      method: 'delete',
      data: data,
    })
  },
}

export default api
