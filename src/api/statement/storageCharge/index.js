import request from '@/utils/request'

const api = {
	// 获取列表
	getHandoverList(query) {
		return request({
			url: '/api/external/storagecharge/gethandoverlist',
			method: 'get',
			params: query,
		})
	},
	// 堆存费结算（历史结算信息）
	getInitstoragecharge(query) {
		return request({
			url: '/api/external/storagecharge/initstoragecharge',
			method: 'get',
			params: query,
		})
	},
	//生成结算清单
	generatestatement(data) {
		return request({
			url: `/api/external/storagecharge/generatestatement?historyGid=${data.historyGid}&&cargoInfoId=${data.cargoInfoId}`,
			method: 'get',
		})
	},
	// 取消审核
	cancelstatement(id) {
		return request({
			url: '/api/external/storagecharge/cancelstatement?historyGid=' + id,
			method: 'put',
		})
	},
	// 商务确认
	confirm(id) {
		return request({
			url: '/api/external/storagecharge/confirm?historyGid=' + id,
			method: 'put',
		})
	},
	// 取消商务确认
	cancelConfirm(id) {
		return request({
			url: '/api/external/storagecharge/cancelConfirm?historyGid=' + id,
			method: 'put',
		})
	},
	// 合同计算
	getCalculatestoragefees(params) {
		return request({
			url: '/api/external/storagecharge/calculatestoragefees',
			method: 'post',
			data: params,
		})
	},
	// 保存
	getSavestoragefeesdata(params) {
		return request({
			url: '/api/external/storagecharge/savestoragefeesdata',
			method: 'post',
			data: params,
		})
	},
	// 查看历史结算详情
	getHistoryDetail(id) {
		return request({
			url: '/api/external/storagecharge/gethistorybygid?historyGid=' + id,
			method: 'get',
			// params: query,
		})
	},
	//删除历史结算
	delete(data) {
		return request({
			url: `/api/external/storagecharge/deletehistorybygid?historyGid=${data.historyGid}&&cargoInfoId=${data.cargoInfoId}`,
			method: 'delete',
		})
	},
}
export default api
