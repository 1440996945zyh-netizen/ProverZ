import request from '@/utils/request'

const api = {

	/**
	 * 查询列表
	 * @param {Object} query
	 */
	getList(query) {
		return request({
			url: '/api/internal/inOutwareHq/getList',
			method: 'get',
			params: query,
		})
	},

	/**
	 * 根据id查询场地列表
	 * @param {String} id
	 */
	getById(id) {
		return request({
			url: `/api/internal/inOutwareHq/getDetail?id=${id}`,
			method: 'get',
		})
	},

	/**
	 * 新增场地
	 * @param {Ojbect} data
	 */
	insert(data) {
		return request({
			url: '/api/internal/inOutwareHq/add',
			method: 'post',
			data: data,
		})
	},

	/**
	 * 修改场地
	 * @param {Ojbect} data
	 */
	update(data) {
		return request({
			url: '/api/internal/inOutwareHq/update',
			method: 'put',
			data: data,
		})
	},

	/**
	 * 删除场地
	 * @param {String} id
	 */
	delete(id) {
		return request({
			url: `/api/internal/inOutwareHq/delete/${id}`,
			method: 'delete',
		})
	},

  exportExcel(query) {
    return request({
      url: '/api/internal/inOutwareHq/exportExcel',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
  getCurrentShift(params) {
    return request({
      url: '/api/internal/public/getDateAndShift',
      method: 'get',
      params,
    })
  },
}
export default api
