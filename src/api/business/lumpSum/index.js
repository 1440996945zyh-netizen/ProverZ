import request from '@/utils/request'

const api = {
// 获取列表
getList(query) {
  return request({
    url: '/api/v1/internal/tBusRate/getListCargo',
    method: 'get',
    params: query
  })
},


// 根据Id查询单条
getDataById(data) {
  return request({
    url: `/api/v1/internal/tBusRate/getDetailCargo`,
    method: 'post',
    data:data
  })
},
// 查询服务内容
getListService() {
    return request({
      url: `/api/v1/internal/tBusRate/getListService`,
      method: 'get'
    })
  },

// 新建
insert(data) {
  return request({
    url: '/api/v1/internal/tBusRate/addCargo',
    method: 'post',
    data: data
  })
},
  //审核
  auditStatus(data) {
  return request({
    url: `/api/v1/internal/tBusRate/busRatePassCargo`,
    method: 'post',
    data: data
  })
},

  //撤销
  revoke(data) {
    return request({
      url: `/api/v1/internal/tBusRate/busRateRevokeCargo`,
      method: 'post',
      data: data
    })
  },
// 修改
update(data) {
  return request({
    url: '/api/v1/internal/tBusRate/updateCargo',
    method: 'put',
    data: data
  })
},


  //删除
  delete(data) {
  return request({
    url: `/api/v1/internal/tBusRate/delRateCargo`,
    method: 'post',
    data: data
  })
},
}
export default api

