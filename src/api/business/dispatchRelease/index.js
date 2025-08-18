import request from '@/utils/request'

const api = {
	// 根据查询机械类型
  getList(query) {
		return request({
			url: '/api/v1/internal/tBusDispatchRelease/getPageList',
			method: 'get',
			params: query,
		})
	},

	// 根据查询机械类型
  addList(data) {
		return request({
			url: '/api/v1/internal/tBusDispatchRelease/addList',
			method: 'post',
			data: data,
		})
	},
	// 根据查询机械类型
  detailListByCondition(data) {
		return request({
			url: '/api/v1/internal/tBusDispatchRelease/detailListByCondition',
			method: 'get',
      params: data,
		})
	},


}
export default api
