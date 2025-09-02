import request from '@/utils/auth/request'

const api = {
// 获取泊位列表
getBerthList(query) {
  return request({
    url: '/api/v1/internal/mBerth/getList',
    method: 'get',
    params: query
  })
},


// 查询单条泊位
getBerthById(id) {
  return request({
    url: `/api/v1/internal/mBerth/getDetail?id=${id}`,
    method: 'get'
  })
},


// 新建泊位
insertBerth(data) {
  return request({
    url: '/api/v1/internal/mBerth/add',
    method: 'post',
    data: data
  })
},


// 修改泊位
updateBerth(data) {
  return request({
    url: '/api/v1/internal/mBerth/update',
    method: 'put',
    data: data
  })
},


  //删除泊位
  deleteBerth(id) {
  return request({
    url: `/api/v1/internal/mBerth/delete/${id}`,
    method: 'delete'
  })
},



// ↑ 泊位操作
// ↓ 揽庄操作


//获取泊位揽庄列表
getBollardList(params) {
  return request({
    url: `/api/v1/internal/mBerth/getBollardList?berthId=${params.berthId}&bollardName=${params.bollardName}`,
    method: 'get'
  })
},


// 查询单条泊位揽庄记录
  getBollardById(id) {
    return request({
      url: `/api/v1/internal/mBerth/getBollardDetail?id=${id}`,
      method: 'get'
    })
  },


// 新建泊位揽庄
  insertBollard(data) {
    return request({
      url: '/api/v1/internal/mBerth/addBollard',
      method: 'post',
      data: data
    })
  },


// 修改泊位揽庄
  updateBollard(data) {
    return request({
      url: '/api/v1/internal/mBerth/updateBollard',
      method: 'put',
      data: data
    })
  },


  //删除泊位揽庄
  deleteBollard(id) {
    return request({
      url: `/api/v1/internal/mBerth/deleteBollard/${id}`,
      method: 'delete'
    })
  },
  

}
export default api

