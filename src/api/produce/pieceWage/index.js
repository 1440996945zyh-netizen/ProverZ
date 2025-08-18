import request from '@/utils/request'

const api = {
	//获取列表
	getListSalary(params) {
		return request({
			url: '/api/external/salary/listSalary',
			method: 'get',
			params: params,
		})
	},
	//获取列表
	getSalarySum(params) {
		return request({
			url: '/api/external/salary/getSalarySum',
			method: 'get',
			params: params,
		})
	},
  examine(params) {
		return request({
			url: '/api/external/salary/examineHr',
			method: 'get',
      params: params,
		})
	},
	//新增数据
	// insertPiecework(data) {
	//   return request({
	//     url:'/api/external/pieceWorkTeam/insertPieceWorkTeam',
	//     method: 'post',
	//     data: data,
	//   })
	// },
	// //更新数据
	// updatePiecework(data) {
	//   return request({
	//     url:'/api/external/pieceWorkTeam/updatePieceWorkTeam',
	//     method: 'put',
	//     data: data
	//   })
	// },
	// //删除
	// deletePiecework(id){
	//   return request({
	//     url:'/api/external/pieceWorkTeam/deletePieceWorkTeam?ids=' + id ,
	//     method:'delete',
	//   })
	// },
  exportExcel(query) {
    return request({
      url: '/api/external/salary/exportSalary2',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
  // 获取当前时间班次
  getCurrentShift(params) {
    return request({
      url: '/api/internal/public/getDateAndShift',
      method: 'get',
      params,
    })
  },
}
export default api
