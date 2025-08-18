import request from '@/utils/request'

const api = {
	/**
	 * 获取船舶预报
	 * @param {Object} query 筛选条件
	 */
	listDisShipVoyage(query) {
		return request({
			url: '/api/external/disShipVoyage/listDisShipVoyage',
			method: 'get',
			params: query,
		})
	},
	/**
	 * 新增船舶预报
	 * @param {Object} query detail form
	 */
	insertDisShipVoyage(query) {
		return request({
			url: '/api/external/disShipVoyage/insertDisShipVoyage',
			method: 'post',
			data: query,
		})
	},
	/**
	 * 修改船舶预报
	 * @param {Object} query detail form
	 */
	updateDisShipVoyage(query) {
		return request({
			url: '/api/external/disShipVoyage/updateDisShipVoyage',
			method: 'put',
			data: query,
		})
	},
	/**
	 * 根据id编辑
	 * @param {Object} id row.gid
	 */
	getbyid(id) {
		return request({
			url: `/api/external/freeItem/getbyid/${id}`,
			method: 'get',
		})
	},
	/**
	 * 删除船舶预报
	 * @param {String} params row.id
	 */
	deleteDisShipvoyage(params) {
		return request({
			url: `/api/external/disShipVoyage/deleteDisShipvoyage`,
			method: 'delete',
			params,
		})
	},
	/**
	 * 作废船舶预报
	 * @param {String} params {ids:row.id,delRemark:作废原因}
	 */
	voidDisShipvoyage(params) {
		return request({
			url: `/api/external/disShipVoyage/voidDisShipvoyage`,
			method: 'put',
			params,
		})
	},
	/**
	 * 接收船舶预报
	 * @param {String} params {ids:row.id}
	 */
	receiveDisShipvoyage(params) {
		return request({
			url: `/api/external/disShipVoyage/receiveDisShipvoyage`,
			method: 'put',
			params,
		})
	},
  changeAmount(params) {
		return request({
			url: `/api/external/disShipVoyage/changeAmount`,
			method: 'put',
			params,
		})
	},
  lastArrivalType(params) {
		return request({
			url: `/api/external/disShipVoyage/lastArrivalType`,
			method: 'put',
			params,
		})
	},
	/**
	 * 拒收船舶预报
	 * @param {String} params {ids:row.id,delRemark:作废原因}
	 */
	rejectionShipvoyage(params) {
		return request({
			url: `/api/external/disShipVoyage/rejectionDisShipvoyage`,
			method: 'put',
			params,
		})
	},
	/**
	 * 拒收船舶预报
	 * @param {String} params {ids:row.id,delRemark:作废原因}
	 */
  getBankCustomerPrepayment(params) {
		return request({
			url: `/api/v1/internal/tFdBankCustomerPrepayment/getBankCustomerPrepayment`,
			method: 'get',
			params,
		})
	},

	/**
	 * 查询是否已经下发通知单
	 * @param {String} params {ids:row.id,delRemark:作废原因}
	 */
  listTrustByShipVoyageId(params) {
		return request({
			url: `/api/v1/internal/tBusTrust/listTrustByShipVoyageId`,
			method: 'get',
			params,
		})
	},

  /**
   * 获取二级货类
   */
  getSecCargoCateList() {
    return request({
      url: '/api/external/disShipVoyage/listSecCargoCate',
      method: 'get',
    })
  },
  getBlackShipData(query) {
    return request({
      url: `/api/v1/internal/mShip/getBlackShip`,
      method: 'post',
      data:query
    })
  },
  getDataById(id) {
    return request({
      url: `/api/v1/internal/mShip/getDetail?id=${id}`,
      method: 'get'
    })
  },
}
export default api
