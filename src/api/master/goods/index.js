import request from '@/utils/request'

const api = {
	/**
	 * 获取货种信息
	 * @param {Object} query 筛选条件
	 */
	getCargoCategoryList(query) {
		return request({
			url: '/api/internal/mcargo/getListCargoCategory',
			method: 'get',
			params: query,
		})
	},

	/**
	 * 查询货物列表
	 * @param {String} id
	 */

	getList(query) {
		return request({
			url: '/api/internal/mcargo/getListCargo/v1',
			method: 'get',
			params: query,
		})
	},

	/**
	 * 根据id查询货物列表
	 * @param {String} id
	 */
	getCargoById(id) {
		return request({
			url: '/api/internal/mcargo/getCargoById/' + id,
			method: 'get',
		})
	},

	/**
	 * 新增货物
	 * @param {Ojbect} data
	 */
	insertCargo(data) {
		return request({
			url: '/api/internal/mcargo/insertCargo',
			method: 'post',
			data: data,
		})
	},

	/**
	 * 修改货物
	 * @param {Ojbect} data
	 */
	updateCargo(data) {
		return request({
			url: '/api/internal/mcargo/updateCargo',
			method: 'put',
			data: data,
		})
	},

	/**
	 * 删除货物
	 * @param {String} id
	 */
	deleteCargo(id) {
		return request({
			url: `/api/internal/mcargo/deleteCargo/${id}`,
			method: 'delete',
		})
	},

  /**
   * 更新货物状态
   */
  updateStatus(id, status) {
    return request({
      url: `/api/internal/mcargo/updateStatus?id=${id}&status=${status}`,
      method: 'put',
    })
  },
}
export default api
