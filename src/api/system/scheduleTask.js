import request from '@/utils/auth/request'

const api = {

 /**
     * 查看正在进行的http类型定时任务
     * @param httpJobDetailSearchDTO
     * @return
     */
 getJobs(params) {
    return request({
      url: '/api/internal/quartzJob/getJobs',
      method: 'get',
      params: params
    })
  },
 /**
     * 查看历史的http类型定时任务
     * @param httpJobDetailSearchDTO
     * @return
     */
 historyJobs(params) {
    return request({
      url: '/api/internal/quartzJob/historyJobs',
      method: 'get',
      params: params
    })
  },
  /**
     * 查看http类型的job执行记录
     *
     * @param httpJobLogsSearchDTO
     * @return
     */
  getJobLogs(params) {
    return request({
      url: '/api/internal/quartzJob/jobLogs',
      method: 'get',
      params: params
    })
  },


  /**
   * 新增定时任务
   * @param {Object} data 版本信息
   * @returns
   */
  addPostJsonJob(data) {
    return request({
      url: '/api/internal/quartzJob/addPostJsonJob',
      method: 'post',
      data: data
    })
  },
   /**
     * 暂停任务
     *
     * @param jobName
     * @param jobGroup
     */
   pause(jobName, jobGroup) {
    return request({
      url: `/api/internal/quartzJob/pause?jobName=${jobName}&jobGroup=${jobGroup}`,
      method: 'post',
    })
  },
  /**
     * 恢复任务
     *
     * @param jobName
     * @param jobGroup
     */
    resume(jobName, jobGroup) {
    return request({
      url: `/api/internal/quartzJob/resume?jobName=${jobName}&jobGroup=${jobGroup}`,
      method: 'post',
    })
  },
  /**
     * 更新任务cron表达式
     *
     * @param jobName
     * @param jobGroup
     * @param cronExpression
     */
  updateJob(jobName,jobGroup,cronExpression) {
    return request({
      url: `/api/internal/quartzJob/updateJob?jobName=${jobName}&jobGroup=${jobGroup}&cronExpression=${cronExpression}`,
      method: 'post',
    })
  },

  /**
   * 删除任务
   * @param
   * @returns
   */
  delete(jobName,jobGroup) {
    return request({
      url: `/api/internal/quartzJob/delete?jobName=${jobName}&jobGroup=${jobGroup}`,
      method: 'delete'
    })
  },

}
export default api


