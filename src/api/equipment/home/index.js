import request from '@/utils/auth/request'

/**
 * 获取首页数据
 * @returns {Promise}
 */
export function getHomeMap() {
	return request({
		url: '/api/internal/home/getHomeMap',
		method: 'get'
	})
}

/**
 * 获取工单趋势数据
 * @param {string} startTime - 开始时间
 * @param {string} endTime - 结束时间
 * @returns {Promise}
 */
export function getMaintInfo(startTime, endTime) {
	return request({
		url: '/api/internal/home/getMaintInfo',
		method: 'get',
		params: {
			startTime,
			endTime
		}
	})
}
