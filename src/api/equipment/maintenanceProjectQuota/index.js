import request from '@/utils/auth/request'

const api = {
	getList(params) {
		return request({
			url: '/api/internal/EMMaintenanceProjectQuota/getList',
			method: 'get',
			params: params,
		})
	},

	getById(id) {
		return request({
			url: '/api/internal/EMMaintenanceProjectQuota/getById?id=' + id,
			method: 'get',
		})
	},

	add(data) {
		return request({
			url: '/api/internal/EMMaintenanceProjectQuota/add',
			method: 'post',
			data: data,
		})
	},

	update(data) {
		return request({
			url: '/api/internal/EMMaintenanceProjectQuota/update',
			method: 'put',
			data: data,
		})
	},

	delete(id) {
		return request({
			url: '/api/internal/EMMaintenanceProjectQuota/delete',
			method: 'delete',
			params: { id },
		})
	},

/**
 * 批量修改维修定额项目状态
 * @param {Object} data 请求参数
 * @param {Array<number>} data.ids 选中的维修定额主键ID集合
 * @param {string} data.status 目标状态：1-生效，0-失效
 */
updateStatusBatch(data) {
  return request({
    url: '/api/internal/EMMaintenanceProjectQuota/updateStatusBatch',
    method: 'put',
    data,
  })
},
}
export default api
