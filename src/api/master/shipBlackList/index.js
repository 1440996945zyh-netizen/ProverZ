import request from '@/utils/auth/request'

const api = {
// 获取列表
getList(query) {
  return request({
    url: '/api/v1/internal/mShipBlackList/getList',
    method: 'get',
    params: query
  })
},


// 根据Id查询单条
getDataById(id) {
  return request({
    url: `/api/v1/internal/mShipBlackList/getDetail?id=${id}`,
    method: 'get'
  })
},


// 新建
insert(data) {
  return request({
    url: '/api/v1/internal/mShipBlackList/add',
    method: 'post',
    data: data
  })
},


// 修改
update(data) {
  return request({
    url: '/api/v1/internal/mShipBlackList/update',
    method: 'put',
    data: data
  })
},


  //删除
  delete(id) {
  return request({
    url: `/api/v1/internal/mShipBlackList/delete/${id}`,
    method: 'delete'
  })
},

}
export default api

