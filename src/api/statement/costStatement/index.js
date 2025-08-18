import request from '@/utils/request'

const api = {
  // 获取列表
	queryAll(query) {
		return request({
			url: '/api/external/TCostStatementController/queryAll',
			method: 'get',
			params: query,
		})
	},
  // 获取列表
  queryAllDetail(query) {
    return request({
      url: '/api/external/TCostStatementController/queryAllDetail',
      method: 'get',
      params: query,
    })
  },
  // 获取当前时间班次
  getCurrentShift(params) {
    return request({
      url: '/api/internal/public/getDateAndShift',
      method: 'get',
      params,
    })
  },
  exportExcel(query) {
    return request({
      url: '/api/external/TCostStatementController/exportExcel',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
  // 商务审核
	review(params) {
		return request({
			url: '/api/external/TCostStatementController/review',
			method: 'post',
			data: params,
		})
	},
  // 财务审核
	financeReview(query) {
		return request({
			url: '/api/external/TCostStatementController/financeReview',
			method: 'get',
			params: query,
		})
	},
	// 查询标准费率
	queryRate(query) {
		return request({
			url: '/api/external/TCostStatementController/queryRate',
			method: 'get',
			params: query,
		})
	},
	// 查询费目
	queryRateItem(query) {
		return request({
			url: '/api/external/TCostStatementController/queryRateItem',
			method: 'get',
			params: query,
		})
	},
	// 采销订单保存
	insert(data) {
		return request({
			url: '/api/external/TCostStatementController/insert',
			method: 'post',
			data: data,
		})
	},
	// 查询详情
	queryById(query) {
		return request({
			url: '/api/external/TCostStatementController/queryById',
			method: 'get',
			params: query,
		})
	},
  queryByIdzk(query) {
    return request({
      url: '/api/external/TCostStatementController/queryByIdzk',
      method: 'get',
      params: query,
    })
  },
	// 采销订单编辑
	update(data) {
		return request({
			url: '/api/external/TCostStatementController/update',
			method: 'put',
			data: data,
		})
	},
	// 采销订单删除
	deleteById(query) {
		return request({
			url: '/api/external/TCostStatementController/deleteById',
			method: 'delete',
			params: query,
		})
	},
	saveFile(data) {
		return request({
			url: '/api/external/TCostStatementController/uploadConfirmFile',
			method: 'post',
			data: data,
		})
	},
	getTaxInvoiceTypeList() {
		return request({
			url: 'api/internal/public/getLocalSelect?type=DICT&dictType=TAX_INVOICE',
			method: 'get',
		})
	},
	getCustomerInfo(param) {
		return request({
			url: '/api/external/miscbilling/getCustomerInfo/' + param,
			method: 'get',
		})
	},
	// 复核/取消复核
	recheck(params) {
		return request({
			url: '/api/external/TCostStatementController/recheck',
			method: 'post',
			data: params,
		})
	},
	// 申请开票/取消
	applyInvoice(params) {
		return request({
			url: '/api/external/TCostStatementController/applyInvoice',
			method: 'post',
			data: params,
		})
	},
	// 获取过程列表
	listWaterElectricity(id) {
		return request({
			url: '/api/external/costShipWaterElectricity/listWaterElectricity?trustId=' + id,
			method: 'get',
		})
	},
	// 获取文件
	queryFiles(params) {
		return request({
			url: '/api/external/TCostStatementController/queryFiles',
			method: 'get',
			params: params
		})
	},
	// 结算明细修改
	updateStatementItem(params) {
		return request({
			url: '/api/external/TCostStatementController/updateStatementItem',
			method: 'post',
			data: params,
		})
	},
  updateStatementItemD(params) {
    return request({
      url: '/api/external/TCostStatementController/updateStatementItemD',
      method: 'post',
      data: params,
    })
  },
	// 红冲
	redRush(query) {
		return request({
			url: '/api/external/TCostStatementController/redRush',
			method: 'get',
			params: query,
		})
	},
	// 打印标记
	printMark(params) {
		return request({
			url: '/api/external/TCostStatementController/printMark',
			method: 'post',
			data: params,
		})
	},
}
export default api
