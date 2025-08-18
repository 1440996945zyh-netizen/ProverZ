import request from '@/utils/request'

const api = {
	// 获取 航次列表 列表
	getList(query) {
		return request({
			url: '/api/external/adjust/list',
			method: 'get',
			params: query,
		})
	},
	// 整船调整
	getCargoInfo(shipvoyageItemId) {
		return request({
			url: '/api/external/adjust/getTicket?shipvoyageItemId=' + shipvoyageItemId,
			method: 'get',
		})
	},
	// 保存
	save(data) {
		return request({
			url: '/api/external/adjust/updateWorkTicket',
			method: 'post',
			data: data,
		})
	},
}
export default api
