import request from '@/utils/request'

const api = {

	// 获取港存流水列表
	getList(query) {
		return request({
			url: '/api/external/portStorageDetail/listPortStorageDetail',
			method: 'get',
			params: query,
		})
	},

	// 票货汇总
	listPortStorage(query) {
		return request({
			url: '/api/external/portStorageDetail/listPortStorage',
			method: 'get',
			params: query,
		})
	},

	// 票货汇总
	getPortStorage(query) {
		return request({
			url: '/api/external/portStorageDetail/getPortStorage',
			method: 'get',
			params: query,
		})
	},

	// 提交 交接清单 列表
	insertPortStorage(data) {
		return request({
			url: '/api/external/portStorageDetail/insertPortStorage',
			method: 'post',
			data: data,
		})
	},
}
export default api
