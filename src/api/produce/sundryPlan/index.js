import request from '@/utils/request'

const api = {
	// 根据查询机械类型
  getList(query) {
		return request({
			url: '/api/v1/internal/tWeightPlan/getList',
			method: 'get',
			params: query,
		})
	},

	// 根据id查询机械类型
  getDetailById(id) {
		return request({
			url: '/api/v1/internal/tWeightPlan/getDetail?id=' + id,
			method: 'get',
		})
	},

	// 新增机械类型
  insert(data) {
		return request({
			url: '/api/v1/internal/tWeightPlan/add',
			method: 'post',
			data: data,
		})
	},

	// 修改机械类型
  update(data) {
		return request({
			url: '/api/v1/internal/tWeightPlan/update',
			method: 'put',
			data: data,
		})
	},

	// 删除机械类型
  delete(id) {
		return request({
			url: '/api/v1/internal/tWeightPlan/delete/' + id,
			method: 'delete',
		})
	},
  changeMainStatus(data) {
    return request({
      url: '/api/v1/internal/tWeightPlan/changeMainStatus',
      method: 'put',
      data: data
    })
  },
  changeChildStatus(data) {
    return request({
      url: '/api/v1/internal/tWeightPlanItem/changeChildStatus',
      method: 'put',
      data: data
    })
  },
  // 查询过磅数据
  getSundryList(query) {
    return request({
      url: '/api/v1/internal/tWeightPlan/getSundryList',
      method: 'get',
      params: query,
    })
  },
  examine(data) {
    return request({
      url: '/api/v1/internal/tWeightPlan/examine',
      method: 'post',
      data: data,
    })
  },
  uploadFile(data) {
    return request({
      url: `/api/v1/internal/tWeightPlan/parseCars`,
      method: 'post',
      data: data
    })
  },
  // 文件下载
  downloadFile() {
    return request({
      url: `/api/internal/file/download?id=1677281148688011264`,
      method: 'get',
      responseType:'arraybuffer'
    })
  },

}
export default api
