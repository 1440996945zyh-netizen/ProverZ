import request from '@/utils/request'

const url = '/api/v1/internal/tBusCargoTransfer'
const api = {

  /**
   * 查询货权列表
   * @param {Object} params  参数对象
   * @param {Number} startPage 当前页
   * @param {Number} pageSize 每页多少条
   * @returns {Array} 合同列表
   */
  getList(params) {
    return request({
      url: `${url}/getList`,
      method: 'get',
      params: params
    })
  },
  getStorageList(params) {
    return request({
      url: `${url}/getStorageList`,
      method: 'get',
      params: params
    })
  },


    /**
   *
   * @param {Number} id 货权转移id
   * @returns
   */
     getById(id) {
      return request({
        url: `api/internal/file/getBusFiles/${id}`,
        method: 'get'
      })
    },


  /**
   * 修改
   * @param {Object} data 货权转移
   * @returns
   */
   update(data) {
    return request({
      url: `/api/v1/internal/tBusCargoTransfer/update`,
      method: 'put',
      data: data
    })
  },

  /**
   * 审核
   * @param data
   * @returns {*}
   */
  approve(data) {
    return request({
      url: `${url}/approve`,
      method: 'put',
      data: data
    })
  },
  yardApprove(data) {
    return request({
      url: `${url}/yardApprove`,
      method: 'put',
      data: data
    })
  },
  yardCancelApprove(data) {
    return request({
      url: `${url}/yardCancelApprove`,
      method: 'put',
      data: data
    })
  },
  cancelApprove(data) {
    return request({
      url: `${url}/cancelApprove`,
      method: 'put',
      data: data
    })
  },
    /**
   * 删除货权转移
   * @param {Array} id id
   * @returns
   */
     delete(id) {
      return request({
        url: `/api/v1/internal/tBusCargoTransfer/deleteById/${id}`,
        method: 'delete'
      })
    },


}


export default api


