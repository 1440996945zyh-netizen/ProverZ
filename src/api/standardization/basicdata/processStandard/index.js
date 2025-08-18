import request from '@/utils/request'

const api = {
  // 获取列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tStdProcessStandard/getList',
      method: 'get',
      params: query,
    })
  },
  // 新建
  insert(data) {
    return request({
      url: `/api/v1/internal/tStdProcessStandard/addList`,
      method: 'post',
      data: data,
    })
  },
  // 新建
  insertDetail(data) {
    return request({
      url: `/api/v1/internal/tStdProcessStandardDetail/addList`,
      method: 'post',
      data: data,
    })
  },
  //删除
  deleteByStandardSystemIdAndProcessId(query) {
    return request({
      url: `/api/v1/internal/tStdProcessStandard/delete`,
      method: 'delete',
      params : query,
    })
  },
  detailByStandardSystemIdAndProcessId(query) {
    return request({
      url: `/api/v1/internal/tStdProcessStandard/getDetail`,
      method: 'get',
      params : query,
    })
  },
  getItemDetail(query) {
    return request({
      url: `/api/v1/internal/tStdProcessStandardDetail/getDetail`,
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
      url: '/api/v1/internal/tStdProcessStandard/getBySystemIdAndProcessId',
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
}
export default api
