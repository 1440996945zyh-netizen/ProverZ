import request from '@/utils/request'
import axios from "axios";

let contextPath = '/api/external/shipAis'
/**
 * 船舶历史
 *
 * @returns {*}
 */
const listAisHistory = (mmsi, beginTime, endTime) => {
  return request({
    url: contextPath + `/getShipTrack?mmsi=${mmsi}&startTime=${beginTime}&endTime=${endTime}`,
    method: 'GET'
  })
}
/**
 * 船舶详情
 * @returns {*}
 */
const getShipInfo = (id) => {
  console.log(id)
  return request({
    url: contextPath + `/getShipInfo?id=${id}`,
    method: 'GET'
  })
}

/**
 * 获取船舶AIS
 * @param queryTime
 * @returns {*}
 */
const getShipAis = (queryTime) => {
  return axios.get(`/ais/getAis?queryTime=${queryTime}`, { timeout: 3000 });
}
/**
 * 获取船舶列表
 * @returns {*}
 */
const getShipList = () => {
  return axios.get('/ais/geShipList', { timeout: 3000 });
}
export default {
  listAisHistory,
  getShipInfo,
  getShipAis,
  getShipList,
}
