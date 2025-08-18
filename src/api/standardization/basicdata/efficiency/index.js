import request from '@/utils/request'

const url = '/api/v1/internal/tStdProcessEfficiency'
const api = {

/**
 *
 * @param {*} params
 * @returns
 */

  getList(params) {
    return request({
      url: `${url}/getList`,
      method: 'get',
      params: params
    })
  },

      /**
   *
   * @param {Number} parentId 父id
   * @returns
   */
    // getListByParentId(parentId) {
    //   return request({
    //     url: `${url}/getListByParentId/${parentId}`,
    //     method: 'get'
    //   })
    // },

    /**
   *
   * @param {Number} id
   * @returns
   */
    getAllList(data) {
      return request({
        url: `${url}/getAllList`,
        method: 'post',
        data: data
      })
    },

    /**
   * 新增
   * @param {Object} data 合同信息
   * @returns
   */
    add(data) {
      return request({
        url: `${url}/add`,
        method: 'post',
        data: data
      })
    },

  /**
   * 修改
   * @param {Object} data 合同信息
   * @returns
   */
  update(data) {
    return request({
      url: `${url}/update`,
      method: 'put',
      data: data
    })
  },

    /**
   * 删除
   * @param {Array} id 合同id
   * @returns
   */
    delete(query) {
      return request({
        url: `${url}/delete`,
        method: 'get',
        params : query,
      })
    },
    getProcessListBySYstem(id) {
      return request({
        url: `${url}/getProcessBySystem/${id}`,
        method: 'get'
      })
    },
  //动态判断参数是否合法
  checkParameter(data){
    return request({
      url: `${url}/checkParameter`,
      method: 'post',
      data:data
    })
  }


}


export default api


