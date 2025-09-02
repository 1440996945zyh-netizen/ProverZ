import request from '@/utils/auth/request'

const api = {
// 查询货类列表
getCargoCategoryList(query) {
  return request({
    url: '/api/internal/mcargo/getListCargoCategory',
    method: 'get',
    params: query
  })
},


// 根据id查询货种列表
getCargoCategoryById(id) {
  return request({
    url: '/api/internal/mcargo/getCargoCategoryById/'+id,
    method: 'get'
  })
},


// 新增货类
insertCargoCategory(data) {
  return request({
    url: '/api/internal/mcargo/insertCargoCategory',
    method: 'post',
    data: data
  })
},


// 修改货类
updateCargoCategory(data) {
  return request({
    url: '/api/internal/mcargo/updateCargoCategory',
    method: 'put',
    data: data
  })
},


  //删除货类
deleteCargoCategory(id) {
  return request({
    url: `/api/internal/mcargo/deleteCargoCategory/${id}`,
    method: 'delete'
  })
},



// ↑ 货类操作
// ↓ 货物操作


//查询货物列表
getCargoList(query) {
  return request({
    url: '/api/internal/mcargo/getListCargo',
    method: 'get',
    params: query
  })
},


// 根据id查询货物列表
  getCargoById(id) {
    return request({
      url: '/api/internal/mcargo/getCargoById/'+id,
      method: 'get'
    })
  },


// 新增货物
  insertCargo(data) {
    return request({
      url: '/api/internal/mcargo/insertCargo',
      method: 'post',
      data: data
    })
  },


// 修改货物
  updateCargo(data) {
    return request({
      url: '/api/internal/mcargo/updateCargo',
      method: 'put',
      data: data
    })
  },


  //删除货物
  deleteCargo(id) {
    return request({
      url: `/api/internal/mcargo/deleteCargo/${id}`,
      method: 'delete'
    })
  },
  

}
export default api

