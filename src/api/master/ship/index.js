import request from '@/utils/auth/request'

const api = {
// 获取列表
getList(query) {
  return request({
    url: '/api/v1/internal/mShip/getList',
    method: 'get',
    params: query
  })
},


// 根据Id查询单条
getDataById(id) {
  return request({
    url: `/api/v1/internal/mShip/getDetail?id=${id}`,
    method: 'get'
  })
},

getShipLog(id) {
  return request({
    url: `/api/v1/internal/mShip/getShipLog?id=${id}`,
    method: 'get'
  })
},


// 新建
insert(data) {
  return request({
    url: '/api/v1/internal/mShip/add',
    method: 'post',
    data: data
  })
},


// 修改
update(data) {
  return request({
    url: '/api/v1/internal/mShip/update',
    method: 'put',
    data: data
  })
},


  //删除
  delete(id) {
  return request({
    url: `/api/v1/internal/mShip/delete/${id}`,
    method: 'delete'
  })
},

// 驳回
reject(data) {
  return request({
    url: '/api/v1/internal/mShip/reject',
    method: 'put',
    data: data
  })
},
  publishMisc(id){
    return request({
      url: `/api/v1/internal/mShip/publishmisc/${id}`,
      method: 'get',
    })
  },

  revokeMisc(id){
    return request({
      url: `/api/v1/internal/mShip/revokeMisc/${id}`,
      method: 'get',
    })
  },

  getData(query){
    return request({
      url: `/api/v1/internal/mShip/getData`,
      method: 'get',
      params:query
    })
  },
  syncData(query){
    return request({
      url: `/api/v1/internal/mShip/sync`,
      method: 'post',
      data:query
    })
  },
  approve(query){
    return request({
      url: `/api/v1/internal/mShip/approve`,
      method: 'post',
      data:query
    })
  },
  getBlackShipData(query) {
    return request({
      url: `/api/v1/internal/mShip/getBlackShip`,
      method: 'post',
      data:query
    })
  }
}
export default api

