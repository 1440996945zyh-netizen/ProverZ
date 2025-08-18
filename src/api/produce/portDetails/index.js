import request from '@/utils/request'

const api = {
  // 获取当前时间班次
  getCurrentShift(params) {
    return request({
      url: '/api/internal/public/getDateAndShift',
      method: 'get',
      params,
    })
  },
  // 主列表 查询清场的（portDetail中只用到了这个接口 其余都没变化  其他都同portTrends）
  getPortStorageList(query) {
    return request({
      url: '/api/external/portDetail/listPortStorage',
      method: 'get',
      params: query,
    })
  },
  // 获取票货详细堆存
  getCargoInoutDetail(query) {
    return request({
      url: '/api/external/portStorage/getCargoInoutDetail',
      method: 'get',
      params: query,
    })
  },
  // 根据区域id获取垛位
  listMass(id) {
    return request({
      url: '/api/internal/public/listMass?regionId=' + id,
      method: 'get',
    })
  },
  // 票货汇总列表
  getPortStorageGbCargoInfoList(query) {
    return request({
      url: '/api/external/portStorage/listPortStorageGbCargoInfo',
      method: 'get',
      params: query,
    })
  },
  // 货主汇总列表
  getPortStorageGbCargoOwnerList(query) {
    return request({
      url: '/api/external/portStorage/listPortStorageGbCargoOwner',
      method: 'get',
      params: query,
    })
  },
  // 货名汇总列表
  getPortStorageGbCargoList(query) {
    return request({
      url: '/api/external/portStorage/listPortStorageGbCargo',
      method: 'get',
      params: query,
    })
  },
  // 件数、吨数（数量）汇总
  getSummaryQuantityTon(query) {
    return request({
      url: '/api/external/portDetail/summaryQuantityTon',
      method: 'get',
      params: query,
    })
  },
  // 新增堆存
  getinsertPortStorage(data) {
    return request({
      url: '/api/external/portStorage/insertPortStorage',
      method: 'post',
      data: data,
    })
  },
  // 获取详细堆存
  getInoutDetail(query) {
    return request({
      url: '/api/external/portStorage/getInoutDetail',
      method: 'get',
      params: query,
    })
  },
  // 详细堆存清场
  getCleanPortStorage(data) {
    return request({
      url: '/api/external/portStorage/cleanPortStorage',
      method: 'put',
      data: data,
    })
  },
  // 详细堆存撤销清场
  cancelCleanPortStorage(data) {
    return request({
      url: '/api/external/portStorage/cancelCleanPortStorage',
      method: 'put',
      data: data,
    })
  },
  // 详细堆存导出
  getExportPortStorage(query) {
    return request({
      url: '/api/external/portDetail/exportPortStorage',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
  // 票货汇总导出
  getExportStorageGbCargoInfo(query) {
    return request({
      url: '/api/external/portStorage/exportPortStorageGbCargoInfo',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
  // 货主汇总导出
  getExportStorageGbCargoOwner(query) {
    return request({
      url: '/api/external/portStorage/exportPortStorageGbCargoOwner',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
  // 货名汇总导出
  getExportStorageGbCargo(query) {
    return request({
      url: '/api/external/portStorage/exportPortStorageGbCargo',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
}
export default api
