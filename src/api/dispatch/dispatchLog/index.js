import request from '@/utils/request'

const api = {
// 获取列表
getList(query) {
  return request({
    url: '/api/v1/internal/tDisLog/getList',
    method: 'get',
    params: query
  })
},


// 根据Id查询单条
getDataById(id) {
  return request({
    url: `/api/v1/internal/tDisLog/getDetail?id=${id}`,
    method: 'get'
  })
},


// 新建
insert(data) {
  return request({
    url: '/api/v1/internal/tDisLog/add',
    method: 'post',
    data: data
  })
},


// 修改
update(data) {
  return request({
    url: '/api/v1/internal/tDisLog/update',
    method: 'put',
    data: data
  })
},


  //删除
  delete(id) {
  return request({
    url: `/api/v1/internal/tDisLog/delete/${id}`,
    method: 'delete'
  })
},
}
export default api

