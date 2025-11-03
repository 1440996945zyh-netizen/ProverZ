import request from '@/utils/auth/request'

const api = {

  /**
   * 查询用户列表
   * @param {Object} params  参数对象
   * @param {Number} startPage 当前页
   * @param {Number} pageSize 每页多少条
   * @param {String} userAccount 用户账号
   * @param {String} userName 用户姓名
   * @returns {Array} 用户列表
   */
  listUser(params) {
    return request({
      url: '/api/internal/sysUser/getlist',
      method: 'get',
      params: params
    })
  },

  /**
   * 获取部门tree数据
   * @returns {Object}  用户详情信息
   */
  deptTreeSelect() {
    return request({
      url: '/api/internal/sysUser/getDepTtree',
      method: 'get'
    })
  },

  /**
   *
   * @param {Number} userId 用户id
   * @returns
   */
  getById(userId) {
    return request({
      url: '/api/internal/sysUser/getbyid/' + userId,
      method: 'get'
    })
  },

  /**
   *
   * @returns
   */
  getListNoPage() {
    return request({
      url: '/api/internal/sysRole/getListNoPage',
      method: 'get',
      params: {}
    })
  },

  /**
   * 新增用户
   * @param {Object} data 用户信息
   * @returns
   */
  insertUser(data) {
    return request({
      url: '/api/internal/sysUser/insert',
      method: 'post',
      data: data
    })
  },

  /**
   * 修改用户
   * @param {Object} data 用户信息
   * @returns
   */
  updateUser(data) {
    return request({
      url: '/api/internal/sysUser/update',
      method: 'put',
      data: data
    })
  },

  /**
   * 删除用户
   * @param {Array} idList 用户id列表
   * @returns
   */
  deletebyid(idList) {
    return request({
      url: '/api/internal/sysUser/deletebyid/' + idList,
      method: 'delete'
    })
  },

  /**
   * 用户密码重置
   * @param {Number} userId 用户id
   * @returns
   */
  resetUserPwd(userId) {
    return request({
      url: '/api/internal/sysUser/resetpassword/' + userId,
      method: 'put'
    })
  },

  /**
   * 查询授权角色
   * @param {Number} userId 用户id
   * @returns
   */
  getAuthRole(userId) {
    return request({
      url: '/system/user/authRole/' + userId,
      method: 'get'
    })
  },


  /**
   * 查询用户个人信息
   * @returns
   */
  getUserProfile() {
    return request({
      url: '/api/internal/sysUser/profile',
      method: 'get'
    })
  },

  /**
   * 修改用户个人信息
   * @param {Object} data 用户信息
   * @returns
   */
  updateUserProfile(data) {
    return request({
      url: '/system/user/profile',
      method: 'put',
      data: data
    })
  },

  /**
   * 修改用户密码
   * @param {String} oldPassword 旧密码
   * @param {String} newPassword 新密码
   * @returns
   */
  updateUserPwd(oldPassword, newPassword) {
    const data = {
      oldPassword,
      newPassword
    }
    return request({
      url: '/api/internal/sysUser/updatePassword',
      method: 'put',
      params: data
    })
  },


  /**
   * 用户状态更新
   * @param {String} oldPassword 旧密码
   * @param {String} newPassword 新密码
   * @returns
   */
  updateUserStatus(data) {
    return request({
      url: '/api/internal/sysUser/updateStatus',
      method: 'put',
      data: data
    })
  },
  /**
   * 获取快捷入口区域列表
   * @returns
   * 
   */
  getCustomRegionList(){
    return request({
      url:'/api/v1/internal/sysCustomRegion/getList',
      method:'get',
    })
  },
  /**
	 * 设置每页数量
	 * @param {Object} query 筛选条件
	 */
	updatePageNum(data) {
		return request({
			url: 'api/v1/internal/tMySpecialInfo/updatePageNum',
			method: 'post',
			data,
		})
	},
	/**
	 * 查询每页数量
	 * @param {Object} query 筛选条件
	 */
	getPageNum(params) {
		return request({
			url: 'api/v1/internal/tMySpecialInfo/getPageNum',
			method: 'get',
			params,
			loading: false,
		})
	},
}
export default api


