import fetchStream from '@/utils/fetchStream.js'
import request from '@/utils/auth/request.js'

const api = {

  /**
   * 发送消息获取回复
   */
  chatMessagesStream(data) {
    return fetchStream(`/api/v1/internal/chat/message/stream?query=${data}`, {
      method: 'get',
    })
  },
  /**
   * 获取智能体
   */
  getAgents() {
    return request({
      url: '/api/v1/internal/chat/agents',
      method: 'get',
    })
  },
  /**
   * 获取智能体对应会话列表及历史会话
   * agentId 智能体ID
   */
  getHistory(params) {
    return request({
      url: '/api/v1/internal/chat/history',
      method: 'get',
      params: params
    })
  },
  /**
   * 获取智能体对应会话列表
   * agentId 智能体ID
   */
  getConversations(params) {
    return request({
      url: '/api/v1/internal/chat/conversations',
      method: 'get',
      loading: false,
      params: params
    })
  },
  /**
   * 获取智能体对应会话列表
   * agentId 智能体ID
   * conversationId 会话ID
   */
  getMessages(params) {
    return request({
      url: '/api/v1/internal/chat/messages',
      method: 'get',
      loading: false,
      params: params
    })
  },
  /**
   * 删除会话
   * agentId 智能体ID
   * conversationId 会话ID
   */
  deleteConversation(params) {
    return request({
      url: '/api/v1/internal/chat/conversation',
      method: 'delete',
      loading: true,
      params: params
    })
  },
  /**
   * 重命名会话
   * agentId 智能体ID
   * conversationId 会话ID
   * name 会话名称
   */
  renameConversation(params) {
    return request({
      url: '/api/v1/internal/chat/conversation/rename',
      method: 'post',
      loading: true,
      params: params
    })
  },
  /**
   * 点赞、点踩、撤销
   * agentId 智能体ID
   * conversationId 会话ID
   * name 会话名称
   */
  feedback(params) {
    return request({
      url: '/api/v1/internal/chat/message/feedback',
      method: 'post',
      loading: true,
      params: params,
      data: params
    })
  },
  /**
   * 停止会话
   * agentId 智能体ID
   * taskId 任务ID
   */
  stopConversation(params) {
    return request({
      url: '/api/v1/internal/chat/message/stop',
      method: 'post',
      loading: false,
      params: params
    })
  },
  /**
   * 单据识别上传文件
   * file 文件
   */
  upload(params) {
    return request({
      url: '/api/v1/internal/chat/files/upload',
      method: 'post',
      loading: false,
      data: params
    })
  },
  /**
   * 获取识别内容
   * uploadFileId 文件ID
   */
  workflowsRun(params) {
    return request({
      url: '/api/v1/internal/chat/workflows/run',
      method: 'get',
      loading: false,
      params: params
    })
  },
  /**
   * 合同审查上传文件
   * file 文件
   */
  filesUpload(params) {
    return request({
      url: '/api/v1/internal/chat/contract/filesUpload',
      method: 'post',
      loading: false,
      data: params
    })
  },
}
export default api


