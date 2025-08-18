import request from '@/utils/request'

const api = {

	getList(params) {
		return request({
			url: `/api/v1/internal/eas/getList`,
			method: 'get',
			params: params,
		})
	},
  resend2EAS(params) {
    return request({
      url: '/api/v1/internal/eas/resend2EAS',
      method: 'post',
      data: params,
    })
  },
}

export default api
