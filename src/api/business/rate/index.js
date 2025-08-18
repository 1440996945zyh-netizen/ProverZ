import request from '@/utils/request'

const api = {
// 获取列表
getList(query) {
  return request({
    url: '/api/v1/internal/tBusRate/getList',
    method: 'get',
    params: query
  })
},


// 根据Id查询单条
getDataById(id) {
  return request({
    url: `/api/v1/internal/tBusRate/getDetail?id=${id}`,
    method: 'get'
  })
},


// 新建
insert(data) {
  return request({
    url: '/api/v1/internal/tBusRate/add',
    method: 'post',
    data: data
  })
},
  //审核
auditStatus(id) {
  return request({
    url: `/api/v1/internal/tBusRate/busRatePass/${id}`,
    method: 'get'
  })
},
  //消审
auditStatusCancle(id) {
  return request({
    url: `/api/v1/internal/tBusRate/busRateCancle/${id}`,
    method: 'get'
  })
},

// 修改
update(data) {
  return request({
    url: '/api/v1/internal/tBusRate/update',
    method: 'put',
    data: data
  })
},


  //删除
  delete(id) {
  return request({
    url: `/api/v1/internal/tBusRate/delete/${id}`,
    method: 'delete'
  })
},
}
export default api

