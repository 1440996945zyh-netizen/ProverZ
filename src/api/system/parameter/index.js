import request from '@/utils/auth/request'

const api = {
  // 查询参数列表
  listConfig(query) {
    return request({
      url: '/api/internal/sysParameter/getList',
      method: 'get',
      params: query
    })
  },

  // 查询参数详细
  getConfig(configId) {
    return request({
      url: '/api/internal/sysParameter/' + configId,
      method: 'get'
    })
  },

  // 根据参数键名查询参数值
  getConfigKey(configKey) {
    return request({
      url: '/api/internal/sysParameter/' + configKey,
      method: 'get'
    })
  },

  // 刷新参数缓存
  refreshCache() {
    return request({
      url: '/api/system/parameter/refreshCache',
      method: 'delete'
    })
  },

  //删除
  delete(id) {
    return request({
      url: `/api/internal/sysParameter/delete/${id}`,
      method: 'delete',
    })
  },

  // 保存系统参数
  listSave(query) {
    return request({
      url: '/api/internal/sysParameter/save',
      method: 'post',
      data: query
    })
  },
  checkParLog(query) {
    return request({
      url: '/api/internal/sysParameterLog/getList',
      method: 'get',
      params: query
    })
  },

  // 保存系统参数（用户）
  listSaveUser(query) {
    return request({
      url: '/api/internal/sysParameter/saveUser',
      method: 'post',
      data: query
    })
  },
  // 查询参数列表（用户）
  getUserList(query) {
    return request({
      url: '/api/internal/sysParameter/getUserList',
      method: 'get',
      params: query
    })
  },
  //删除（用户）
  deleteUser(id) {
    return request({
      url: `/api/internal/sysParameter/deleteUser/${id}`,
      method: 'delete',
    })
  },
}

export default api
