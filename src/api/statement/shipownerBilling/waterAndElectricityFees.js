import request from '@/utils/request'

const api = {
	// 获取列表
	getList(query) {
		return request({
			url: '/api/external/costShipWaterElectricity/listTrust',
			method: 'get',
			params: query,
		})
	},

	// 获取过程列表
	listWaterElectricity(id) {
		return request({
			url: '/api/external/costShipWaterElectricity/listWaterElectricity?trustId=' + id,
			method: 'get',
		})
	},
	// 获取费率列表
	listRate(id) {
		return request({
			url: '/api/external/costShipWaterElectricity/listRate?trustId=' + id,
			method: 'get',
		})
	},

	// 获取详情
	getDetail(id) {
		return request({
			url: '/api/external/costShipWaterElectricity/listCostShip?trustId=' + id,
			method: 'get',
		})
	},
	// 附件查看
	getFile(id) {
		return request({
			url: '/api/internal/file/download?id=' + id,
			method: 'get',
		})
	},
	// 结算
	statement(data) {
		return request({
			url: '/api/external/costShipWaterElectricity/statement',
			method: 'post',
			data: data,
		})
	},

	// 撤销结算
	cancelStatement(id) {
		return request({
			url: '/api/external/costShipWaterElectricity/cancelStatement?trustId=' + id,
			method: 'DELETE',
		})
	},

	// 审核
	review(id) {
		return request({
			url: '/api/external/costShipWaterElectricity/review?trustId=' + id,
			method: 'put',
		})
	},

	// 撤销审核
	cancelReview(id) {
		return request({
			url: '/api/external/costShipWaterElectricity/cancelReview?trustId=' + id,
			method: 'put',
		})
	},
}
export default api
