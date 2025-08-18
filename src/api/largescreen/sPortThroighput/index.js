import request from '@/utils/request'

const api = {
  // 获取列表
  getList(query) {
    return request({
      url: '/api/v1/internal/sPortThroighput/getPageList',
      method: 'get',
      params: query,
    })
  },
  exportExcel(query) {
    return request({
      url: '/api/v1/internal/sPortThroighput/exportExcel',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
  downTemplate() {
    return request({
      url: '/api/v1/internal/sPortThroighput/downTemplate',
      method: 'get',
      responseType: 'blob',
    })
  },
  uploadFile(data) {
    return request({
      url: '/api/v1/internal/sPortThroighput/importList',
      method: 'post',
      data: data,
    })
  },
  // 新建
  insert(data) {
    return request({
      url: `/api/v1/internal/sPortThroighput/addList`,
      method: 'post',
      data: data,
    })
  },
  // 删除数据
  deleteById(id) {
    return request({
      url: '/api/v1/internal/sPortThroighput/delete/' + id,
      method: 'delete'
    })
  },
  //删除
  deleteByStandardSystemIdAndProcessId(query) {
    return request({
      url: `/api/v1/internal/tStdProcessPersonnelMac/delete`,
      method: 'get',
      params : query,
    })
  },
  detailByStandardSystemIdAndProcessId(query) {
    return request({
      url: `/api/v1/internal/tStdProcessPersonnelMac/getDetail`,
      method: 'get',
      params : query,
    })
  },
  getProcessListBySystemId(query) {
    return request({
      url: '/api/v1/internal/tStdProcessPersonnelMac/getProcessBySystemId',
      method: 'get',
      params: query,
    })
  },
  getBySystemIdAndProcessId(query) {
    return request({
      url: '/api/v1/internal/tStdProcessPersonnelMac/getBySystemIdAndProcessId',
      method: 'get',
      params: query,
    })
  },
  listByRoleClass(query) {
    return request({
      url: '/api/internal/sysRole/listByRoleClass',
      method: 'get',
      params: query,
    })
  },

  // // 获取列表
  // getDetail(id) {
  //   return request({
  //     url: `/api/v1/internal/openPortApply/getDetail?id=${id}`,
  //     method: 'get',
  //   })
  // },

  //
  //
  // reqGetCurrentShiftClassInfo(params) {
  //   return request({
  //     url: '/api/internal/public/getCurrentShiftClassInfo',
  //     method: 'get',
  //     params,
  //   })
  // },
  // // 修改
  // update(data) {
  //   return request({
  //     url: `/api/v1/internal/openPortApply/update`,
  //     method: 'put',
  //     data: data,
  //   })
  // },
  //

  //
  // // 获取其他列表
  // getotherList(trustCargoId) {
  //   return request({
  //     url: `/api/external/trustTradeReservation/listTrustCargo?startPage=1&pageSize=15&trustCargoId=${trustCargoId}`,
  //     method: 'get',
  //   })
  // },
  //
  // // 查询车队剩余可约件数重量
  // getAvailable(data) {
  //   return request({
  //     url: `/api/external/trustTradeReservation/getAvailableQuantityAndTon?assignFleetId=${data.assignFleetId}&trustTradeReservationId=${data.trustTradeReservationId}`,
  //     method: 'get',
  //   })
  // },
  //
  // // 上传
  // uploadFile(data) {
  //   return request({
  //     url: `/api/external/trustTradeReservation/parseCars`,
  //     method: 'post',
  //     data: data,
  //   })
  // },
  //
  // // 文件下载
  // downloadFile() {
  //   return request({
  //     url: `/api/internal/file/download?id=1677281148688011264`,
  //     method: 'get',
  //     responseType: 'arraybuffer',
  //   })
  // },
}
export default api
