import request from '@/utils/auth/request'
import get from "../../../../docs/.vitepress/cache/deps/element-plus";

const api = {
// 获取列表
  getList(query) {
    return request({
      url: 'api/v1/internal/waifuProcess/getList',
      method: 'get',
      params: query
    })
  },
  getMainProcessList(query) {
    return request({
      url: 'api/v1/internal/waifuProcess/getMainProcessList',
      method: 'get',
      params: query
    })
  },
  getProcessListNoMain(query) {
    return request({
      url: 'api/v1/internal/waifuProcess/getProcessListNoMain',
      method: 'get',
      params: query
    })
  },
  getDeptOut(query) {
    return request({
      url: 'api/v1/internal/waifuProcess/getDeptOut',
      method: 'get',
      params: query
    })
  },
  machinTypeList(query) {
    return request({
      url: 'api/v1/internal/waifuProcess/machinTypeList',
      method: 'get',
      params: query
    })
  },
  waifuPackageCodeList(query) {
    return request({
      url: 'api/v1/internal/waifuProcess/waifuPackageCodeList',
      method: 'get',
      params: query
    })
  },
  getPositionList(query) {
    return request({
      url: 'api/v1/internal/waifuProcess/getPositionList',
      method: 'get',
      params: query
    })
  },
  delete(id) {
    return request({
      url: 'api/v1/internal/waifuProcess/delete/'+id,
      method: 'get',
    })
  },

  //新增拖轮数据
  doSave(data) {
    return request({
      url: '/api/v1/internal/waifuProcess/doSave',
      method: 'post',
      data: data
    })
  },
  downReport(query) {
    return request({
      url: '/api/v1/internal/waifuProcess/downReport',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },

}
export default api

