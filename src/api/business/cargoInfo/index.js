import request from '@/utils/request'

const api = {
	// 获取列表
	getList(query) {
		return request({
			url: '/api/v1/internal/tBusCargoInfo/getList',
			method: 'get',
			params: query,
		})
	},
  // 表格数据汇总
  getSummary(query) {
    return request({
      url: '/api/v1/internal/tBusCargoInfo/summary',
      method: 'get',
      params: query,
    })
  },
  // 获取磅单列表
	getPoundbillList(query) {
		return request({
			url: '/api/v1/internal/tBusCargoInfo/getPoundbillList',
			method: 'get',
			params: query,
		})
	},

	// 根据Id查询单条
	getDataById(id) {
		return request({
			url: `/api/v1/internal/tBusCargoInfo/getDetail/${id}`,
			method: 'get',
		})
	},

	// 新增
	insert(data) {
		return request({
			url: '/api/v1/internal/tBusCargoInfo/add',
			method: 'post',
			data: data,
		})
	},
	// 编辑
	update(data) {
		return request({
			url: '/api/v1/internal/tBusCargoInfo/update',
			method: 'put',
			data: data,
		})
	},

	//货权转移删除
	deleteTransfer(id) {
		return request({
			url: `/api/v1/internal/tBusCargoTransfer/deleteById/${id}`,
			method: 'delete',
		})
	},
	getCargoInfoList(id,businessType) {
		return request({
			url: `/api/v1/internal/tBusCargoInfo/getCargoListInfo/${id}?businessType=${businessType}`,
			method: 'get',
		})
	},
	// 获取货物清单列表
	getCargoListByCargoId(id,businessType) {
		return request({
			url: `/api/v1/internal/tBusCargoInfo/getCargoListInfoByCargoId/${id}?businessType=${businessType}`,
			method: 'get',
		})
	},
  // 获取货物清单列表
  getCargoBoxListByCargoId(id) {
    return request({
      url: `/api/v1/internal/tBusCargoInfo/getCargoBoxListByCargoId/${id}`,
      method: 'get',
    })
  },

	// 货权转移新建
	insertTransfer(data) {
		return request({
			url: '/api/v1/internal/tBusCargoTransfer/add',
			method: 'post',
			data: data,
		})
	},
	// 货转查询列表
	getTransferList(query) {
		return request({
			url: '/api/v1/internal/tBusCargoInfo/getTransferList',
			method: 'get',
			params: query,
		})
	},
	// 货权转移修改
	updateTransfer(data) {
		return request({
			url: '/api/v1/internal/tBusCargoTransfer/update',
			method: 'put',
			data: data,
		})
	},
	// 完货
	cleanAllPortStorage(data) {
		return request({
			url: '/api/v1/internal/tBusCargoInfo/cleanAllPortStorage',
			method: 'put',
			data: data,
		})
	},
  // 是否海清物流
  updateIsHq(data) {
		return request({
			url: '/api/v1/internal/tBusCargoInfo/updateIsHq',
			method: 'put',
			data: data,
		})
	},
	// 撤销完货
	cancelCleanAllPortStorage(params) {
		return request({
			url: '/api/v1/internal/tBusCargoInfo/cancelCleanAllPortStorage',
			method: 'put',
			params,
		})
	},
	uploadFile(id, data) {
		return request({
			url: `/api/v1/internal/tBusCargoInfo/importCargoList/${id}`,
			method: 'post',
			data: data,
		})
	},
  uploadBoxFile(id, data) {
    return request({
      url: `/api/v1/internal/tBusCargoInfo/importCargoBoxList/${id}`,
      method: 'post',
      data: data,
    })
  },
	downTemplate() {
		return request({
			url: '/api/v1/internal/tBusCargoInfo/downTemplate',
			method: 'get',
			responseType: 'blob',
		})
	},
  downBoxTemplate() {
    return request({
      url: '/api/v1/internal/tBusCargoInfo/downBoxTemplate',
      method: 'get',
      responseType: 'blob',
    })
  },
  export(query) {
    return request({
      url: '/api/v1/internal/tBusCargoInfo/export',
      method: 'get',
      params: query,
      responseType: 'blob'
    })
  },
  isLogoutStatus(data) {
    return request({
      url: '/api/v1/internal/tBusCargoInfo/isLogoutStatus',
      method: 'put',
      data: data
    })
  },
}
export default api
