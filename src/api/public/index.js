import request from '../../utils/auth/request'
import axios from 'axios'
import { getToken } from '../../utils/auth/token'
const api = {
	/**
	 * 获取字典，数据结构为res.data中key:[]
	 * @param {Object} query
	 */
	getDictList(query) {
		return request({
			url: '/api/internal/public/getDictList',
			method: 'get',
			params: query,
		})
	},
	/**
	 * 获取字典，数据结构为res.data
	 * @param {String} type 字典类型
	 */
	getDictListByType(type) {
		return request({
			url: `/api/internal/public/getDictListByType/${type}`,
			method: 'get',
		})
	},
	/**
	 * 获取远程下拉框数据
	 * @param {*} query { type:String 下拉框类型,valueContent:String 根据value查,labelContent:String 根据label查, number:Number 默认显示条数 }
	 */
	getRemoteSelect(query) {
		return request({
			url: '/api/internal/public/getRemoteSelect',
			method: 'post',
			data: query,
		})
	},
	/**
	 * 根据type获取本地下拉框数据
	 * @param {*} params 下拉框类型type,其他参数
	 */
	getLocalSelect(params) {
		return request({
			url: `/api/internal/public/getLocalSelect`,
			method: 'get',
			params,
		})
	},
	/**
	 * 根据types获取本地下拉框数据
	 * @param {*} params { types:String 下拉框类型 }
	 */
	getLocalSelects(params) {
		return request({
			url: '/api/internal/public/getLocalSelects',
			method: 'get',
			params,
		})
	},
	/**
	 * 上传文件
	 * @param {*} query
	 */
	getFileInfo(query) {
		return request({
			url: '/api/internal/file/upload',
			method: 'post',
			data: query,
		})
	},
	/**
	 * 下载文件
	 * @param {String} id 文件id
	 */
	down(id, responseType = 'arraybuffer') {
		return axios({
			url: `${import.meta.env.VITE_APP_BASE_API}/api/internal/file/download?id=${id}`,
			method: 'get',
			responseType,
			params: {
				token: getToken(),
			},
		})
	},
	/**
	 * 通过id获取文件信息
	 * @param {Object} params {businessId:'',businessType:''}
	 */
	getBusFiles(params) {
		return request({
			url: '/api/internal/file/getBusFiles',
			method: 'get',
			params,
		})
	},
	/**
	 * 通用组织架构树
	 * @param {*} params 查询条件
	 * @returns
	 */
	getDeptList(params) {
		return request({
			url: '/api/internal/public/getDeptList',
			method: 'get',
			params,
		})
	},
	/**
	 * 业务机械
	 * @param {*} params {workPlanId：根据Id去查询， workPositionCode }
	 * @returns
	 */
	getEquipmentDispatch(params) {
		return request({
			url: '/api/internal/businessCommon/getEquipmentDispatch',
			method: 'get',
			params,
		})
	},

	/**
	 * 通用指令
	 * @param {*} params {trustType：1.装卸船2.集疏港3.倒运4.杂项/辅助 }
	 * @returns
	 */
	getPopupTrust(params) {
		return request({
			url: '/api/internal/public/getPopupTrust',
			method: 'get',
			params,
		})
	},
	/**
	 * 获取当前班次时间
	 * @param {Object} params 检索条件的obj
	 */
	getNowDate(params) {
		return request({
			url: '/api/internal/public/getDateAndShift',
			method: 'get',
			params,
		})
	},
	/**
	 * 获取当前登录人信息
	 * @param {Object} params 检索条件的obj
	 */
	getLoginMess() {
		return request({
			url: '/api/v1/internal/tPrdAttendance/getCompanyClass',
			method: 'get',
		})
	},
  /**
   * 获取当前登录人信息
   * @param {Object} params 检索条件的obj
   */
  getLoginDeptMess() {
    return request({
      url: '/api/v1/internal/tPrdAttendance/getCompanyDeptClass',
      method: 'get',
    })
  },
  getSystemParams(params){
    return request({
      url: '/api/internal/public/getSystemParams',
      method: 'get',
      params,
    })
  },
  /**
   * * 通过id获取文件信息(船舶资料专用)
   * @param {Object} params {businessId:'',businessType:''}
   */
  getBusFiles2(params) {
    return request({
      url: '/api/v1/internal/mShip/queryBusFiles',
      method: 'get',
      params,
    })
  },
  /**
   * 下载文件(船舶资料专用)
   * @param {String} id 文件id
   */
  down2(id, responseType = 'arraybuffer') {
    return request({
      url: `/api/v1/internal/mShip/queryDownload?id=${id}`,
      method: 'get',
      responseType
    })
  },
}
export default api
