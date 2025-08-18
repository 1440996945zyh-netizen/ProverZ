import request from '@/utils/request'

const api = {
// 获取列表
  getList(query) {
    return request({
      url: '/api/external/cargoMix/mixes',
      method: 'get',
      params: query
    })
  },
//查询港存
  listPortStorage(query) {
    return request({
      url: '/api/external/cargoMix/portStorages',
      method: 'get',
      params: query
    })
  },
//查询港存
  mixAdd(data) {
    return request({
      url: '/api/external/cargoMix/mix',
      method: 'post',
      data: data
    })
  },

// 新建
  insert(data) {
    return request({
      url: `/api/external/assignFleet/insertAssignFleet?trustCargoId=${data.trustCargoId}`,
      method: 'post',
      data: data.assignFleets
    })
  },


// 修改
  update(data) {
    return request({
      url: `/api/external/assignFleet/updateAssignFleet?trustCargoId=${data.trustCargoId}`,
      method: 'put',
      data: data.assignFleets
    })
  },


  //删除
  delete(id) {
    return request({
      url: `/api/external/cargoMix/mix/`+id,
      method: 'delete'
    })
  },
  //回显
  backShow(id) {
    return request({
      url: `/api/external/cargoMix/mix/`+id,
      method: 'get'
    })
  },
  //删除
  shenheByid(id) {
    return request({
      url: `/api/external/cargoMix/review/`+id,
      method: 'put'
    })
  },
  //删除
  xiaoshen(id) {
    return request({
      url: `/api/external/cargoMix/cancelReview/`+id,
      method: 'put'
    })
  },

  getContractList(cargoInfoIds){
    return request({
      url: `/api/external/cargoMix/contracts/`+cargoInfoIds,
      method: 'get'
    })
  }



}
export default api

