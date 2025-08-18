import request from "@/utils/request";

const api = {
  //获取列表
  getPieceworkList(params){
    return request({
      url:'/api/external/pieceWorkTeam/listPieceWorkTeam',
      method: 'get',
      params: params
    })
  },
  //新增数据
  insertPiecework(data) {
    return request({
      url:'/api/external/pieceWorkTeam/insertPieceWorkTeam',
      method: 'post',
      data: data,
    })
  },
  //更新数据
  updatePiecework(data) {
    return request({
      url:'/api/external/pieceWorkTeam/updatePieceWorkTeam',
      method: 'put',
      data: data
    })
  },
  //删除
  deletePiecework(id){
    return request({
      url:'/api/external/pieceWorkTeam/deletePieceWorkTeam?ids=' + id ,
      method:'delete',
    })
  },

}
export default api
