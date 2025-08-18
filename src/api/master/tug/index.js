import request from '@/utils/request'
import get from "../../../../docs/.vitepress/cache/deps/element-plus";

const api = {
// 获取列表
  getList(query) {
    return request({
      url: 'api/v1/internal/mTug/getList',
      method: 'get',
      params: query
    })
  },

  //新增拖轮数据
  insert(data) {
    return request({
      url: '/api/v1/internal/mTug/add',
      method: 'post',
      data: data
    })
  },

  //通过ID获取拖轮数据
  getDataById(id){
    return request({
      url: '/api/v1/internal/mTug/getDetail?id='+id,
      method: 'get'
    })
  },

  //修改拖轮数据
  update(data){
    return request({
      url: '/api/v1/internal/mTug/update',
      method: 'put',
      data: data
    })
  },

  //通过ID删除拖轮数据
  delete(id){
    return request({
      url: '/api/v1/internal/mTug/delete/'+id,
      method: 'delete'
    })
  }
}
export default api

