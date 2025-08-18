import request from '@/utils/request'

const api = {
  // 获取列表
  getList(query) {
    return request({
      url: '/api/external/customerEntrust/getList',
      method: 'get',
      params: query,
    })
  },
  getcustomerEntrustById(id) {
    return request({
      url: '/api/external/customerEntrust/getcustomerEntrustById/'+id,
      method: 'get',
    })
  },
  getCustomerEntrustForAddTrust(id) {
    return request({
      url: '/api/external/customerEntrust/getCustomerEntrustForAddTrust/'+id,
      method: 'get',
    })
  },
  // 获取委托单详情列表
  getDetailList(query) {
    return request({
      url: '/api/external/customerEntrust/getDetailList',
      method: 'get',
      params: query,
    })
  },
  // 查询通知单类型
  getListTrustType(params) {
    return request({
      url: `/api/v1/internal/tBusTrust/listTrustType`,
      method: 'get',
      params: params,
    })
  },
  //新增客户委托单
  entrustSave(data){
    return request({
      url: `/api/external/customerEntrust/saveOrUpdate`,
      method: 'post',
      data: data,
    })
  },
  //删除客户委托单
  delCustomerEntrust(id){
    return request({
      url: `/api/external/customerEntrust/delCustomerEntrust/`+id,
      method: 'delete',
    })
  },
  //新增作业指令通用
  addTrustOrder(params) {
    return request({
      url: '/api/v1/internal/tBusTrust/add',
      method: 'post',
      data: params,
    })
  },
  //已发布修改作业指令
  updateAfterRelease(params) {
    return request({
      url: '/api/v1/internal/tBusTrust/updateAfterRelease',
      method: 'put',
      data: params,
    })
  },
  //修改作业指令
  updateTrust(params) {
    return request({
      url: '/api/v1/internal/tBusTrust/update',
      method: 'put',
      data: params,
    })
  },
  //根据货主 货物编码 贸别 查合同列表
  getListContract(params) {
    return request({
      url: `/api/v1/internal/tBusTrust/listContract?cargoOwnerId=${params.cargoOwnerId}&cargoCode=${params.cargoCode}&tradeType=${params.tradeType}`,
      method: 'get',
    })
  },
  getPreferentialRate(params) {
    return request({
      url: `/api/v1/internal/tBusTrust/getPreferentialRate`,
      method: 'get',
      params: params,
    })
  },

}
export default api
