<template>
  <div class="chat-app-container">
		<!-- 工作区 -->
    <aside class="sidebar">
      <div class="sidebar-section">
        <h2 class="section-title">工作区</h2>
        <div
          v-for="item in workspaceItems"
          :key="item.id"
          class="sidebar-item"
          :class="{ active: agentId === item.id }"
          @click="agentClick(item)"
        >
          <img src="@/assets/images/dili.jpeg" alt="" class="item-icon" />
          <span class="item-label">{{ item.name }}</span>
        </div>
      </div>
    </aside>
    <!-- 会话列表 -->
    <section class="conversation-list">
      <div class="conversation-header">
        <h2 class="app-title">{{agentName}}</h2>
				<!-- <button class="expand-btn">🗖️</button> -->
      </div>
      <el-button class="new-chat-btn" icon="Edit" @click="createNewChat">开启新对话</el-button>
     	<div class="chat-list">
				<Conversations
   			  v-model:active="conversationId"
   			  :items="chatList"
   			  :label-max-width="220"
   			  :show-tooltip="true"
   			  row-key="id"
   			  labelKey="name"
   			  tooltip-placement="right"
   			  :tooltip-offset="35"
   			  show-to-top-btn
   			  show-built-in-menu
					@change="switchChat"
   			  @menu-command="handleMenuCommand"
   			/>
			</div>
    </section>
    <!-- 右侧聊天区域 -->
    <main class="chat-main">
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messagesList.length === 0" class="empty-chat">
          请输入您的问题，我会为您解答港口设备相关问题
        </div>
        <BubbleList v-else :list="messagesList" max-height="500px">
      		<!-- 自定义头像 -->
      		<template #avatar="{  }">
      		  <div class="avatar-wrapper">
      		    <img src="@/assets/images/dili.jpeg" style="width: 30px" alt="avatar">
      		  </div>
      		</template>

      		<!-- 自定义头部 -->
      		<template #header="{ item }">
      		  <div class="header-wrapper">
      		    <div class="header-name">
      		      {{ item.role === 'ai' ? 'AI' : '用户' }}
      		    </div>
      		  </div>
      		</template>

      		<!-- 自定义气泡内容 -->
      		<template #content="{ item }">
      		  <div class="content-wrapper">
      		    <div class="content-text" v-html="parseMarkdown(item.content)">
      		    </div>
      		  </div>
      		</template>

      		<!-- 自定义底部 -->
      		<template #footer="{ item }">
      		  <div class="footer-wrapper">
      		    <div class="footer-container">
      		      <el-button type="info" :icon="Refresh" size="small" circle />
      		      <el-button type="success" :icon="Search" size="small" circle />
      		      <el-button type="warning" :icon="Star" size="small" circle />
      		      <el-button
      		        color="#626aef"
      		        :icon="DocumentCopy"
      		        size="small"
      		        circle
      		      />
      		    </div>
      		    <div class="footer-time">
      		      {{ item.timestamp }}
      		    </div>
      		  </div>
      		</template>
    		</BubbleList>
      </div>

      <!-- 输入区域（增加文件上传） -->
      <div class="chat-input-area">
        <Sender
    		  v-model="inputText"
    		  variant="updown"
    		  :auto-size="{ minRows: 2, maxRows: 5 }"
    		  clearable
					@submit="sendMessage"
    		  placeholder="请输入内容"
    		>
    		  <template #prefix>
    		    <div
    		      style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap"
    		    >
    		      <el-button round plain color="#626aef">
    		        <el-icon><Paperclip /></el-icon>
    		      </el-button>
    		    </div>
    		  </template>
    		</Sender>
      </div>
    </main>
		<!--  修改会话名称  -->
    <el-dialog title="修改会话名称" v-model="isShow" width="40%">
      <el-form :model="chatFormData" label-position="top" ref="rejectFormRef" label-width="80px">
        <el-form-item
          label="会话名称"
          prop="rejectReason"
        >
          <el-input type="textarea" v-model="chatFormData.name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isShow = false">关 闭</el-button>
          <el-button @click="submitChatForm" type="primary" >保 存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="difyAgent">
import { ref, nextTick, computed, watch } from 'vue'
import api from '@/api/system/difyAgent/index'
import useUserStore from '@/store/modules/user'
// import { useEventSource } from '@/utils/eventSource'
import { BubbleList, Sender, XMarkdown, Thinking, Conversations } from 'vue-element-plus-x';
import { DocumentCopy, Refresh, Search, Star } from '@element-plus/icons-vue';
const { proxy } = getCurrentInstance()
const baseURL = import.meta.env.VITE_APP_BASE_API
import hookFetch from 'hook-fetch';
import { sseTextDecoderPlugin } from 'hook-fetch/plugins/sse';

// 工具函数：获取当前时间
const getCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
// 格式化时间
const formatTime = (item) => {
  const now = new Date(item.timestamp * 1000)
  return now.toLocaleTimeString()
}

// 响应式数据
const inputText = ref('')
const messagesContainer = ref(null)
const chatList = ref([]) // 会话列表
const aiMessageIndex = ref(0)
const conversationId = ref('') // 会话ID
const workspaceItems = ref([]) // 智能体List
const agentId = ref('1') // 智能体ID
const agentName = ref('港口设备专家')
const messagesList = ref([]) // 会话历史
const isCon = ref(true) // 是否执行查询消息历史
const isShow = ref(false) // Dialog弹框
const chatFormData = ref({
	name: '',
})
const editConversationId = ref('') // 待修改会话ID

// 智能体点击事件
const agentClick = (item) => {
	agentId.value = item.id
	agentName.value = item.name
	isCon.value = true
	// 获取历史对话
	getConversations()
}
// 获取请求体
const getAgents = () => {
	api.getAgents().then(res => {
		workspaceItems.value = res.data
	})
}
// 根据智能体ID获取会话列表
const getConversations = () => {
	api.getConversations({agentId: agentId.value}).then(res => {
		chatList.value = res.data
		// 如果为空 添加一条空的会话
		if (chatList.value.length == 0) {
			const newChat = {
  		  id: '1',
  		  name: '新的对话',
  		}
			chatList.value.push(newChat)
			conversationId.value = '1'
		}
		// 创建新对话时，完成提问及回答后不执行获取消息列表
		conversationId.value = chatList.value[0].id
		if (isCon.value) {
			messagesList.value = []
			getMessages()
		}
	})
}
// 根据智能体ID和会话ID获取历史记录
const getMessages = () => {
	messagesList.value = []
	let params = {
		agentId: agentId.value,
		conversationId: conversationId.value
	}
	api.getMessages(params).then(res => {
		res.data.forEach(v => {
			let date = new Date(v.created_at * 1000)
			// 添加用户消息
  		const userMsg = {
  		  role: 'user',
				id: v.id,
  		  content: v.query,
				agentId: agentId.value, // 智能体ID
  		  placement: 'end',
  		  timestamp: date.toLocaleTimeString()
  		}
			messagesList.value.push(userMsg)
			// 添加AI回复消息
  		const AIMsg = {
  		  role: 'ai',
				id: v.id,
  		  content: v.answer,
				agentId: agentId.value, // 智能体ID
				placement: 'start',
  		  timestamp: date.toLocaleTimeString()
  		}
			messagesList.value.push(AIMsg)
		})
	})
}
// 会话列表菜单事件 -- 删除 - 编辑
const handleMenuCommand = (command,item) => {
	console.log('内置菜单点击事件：', command, item);
  // 直接修改 item 是否生效
  if (command === 'delete') {
		let params = {
			agentId: agentId.value,
			conversationId: item.id
		}
    api.deleteConversation(params).then(res => {
			proxy.$message.success('删除成功');
			// 如果删除的会话与当前选中的会话相同--查询信息列表
			if (item.id == conversationId.value){
				isCon.value = true
			} else {
				isCon.value = false
			}
			getConversations()
		})
  }
  if (command === 'rename') {
    isShow.value = true
		editConversationId.value = item.id
		chatFormData.value.name = item.name
  }
}

// 提交会话名称
const submitChatForm = () => {
	let params = {
		agentId: agentId.value,
		conversationId: editConversationId.value,
		name: chatFormData.value.name
	}
	api.renameConversation(params).then(res => {
		proxy.$message.success('修改成功');
		isCon.value = false
		isShow.value = false
		getConversations()
	})
}

// 计算属性：当前选中的会话
const currentChat = computed(() => {
  return messagesList.value.find(chat => chat.id === conversationId.value) || messagesList.value[0]
})

// 工具函数：格式化文件大小（字节转KB/MB）
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 工具函数：获取会话摘要
const getChatSummary = (messages) => {
  if (messages.length === 0) return '新对话'
  const lastMsg = messages[messages.length - 1]
  if (lastMsg.file) {
    return `[文件] ${lastMsg.file.name}`
  }
  return lastMsg.content.length > 20
    ? lastMsg.content.substring(0, 20) + '...'
    : lastMsg.content
}

// 工具函数：滚动到最新消息
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 切换聊天会话
const switchChat = (item) => {
  conversationId.value = item.id
  getMessages()
}

// 创建新的聊天会话
const createNewChat = () => {
  const newChat = {
    id: '1',
    name: '新的对话',
  }
  chatList.value.unshift(newChat)
  conversationId.value = '1'
	messagesList.value = []
}

// 处理文件选择
const handleFileSelect = (e) => {
  const target = e.target
  const files = target.files
  if (!files || files.length === 0) return

  const file = files[0]
  // 限制文件大小：10MB
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    alert(`文件大小超过限制（最大10MB），当前文件大小：${formatFileSize(file.size)}`)
    target.value = '' // 清空文件选择
    return
  }

  // 1. 创建文件消息并添加到当前会话
  const fileMsg = {
    role: 'user',
    content: inputText.value.trim() || `请分析这个${file.name}文件的内容`,
    time: getCurrentTime(),
    file: {
      name: file.name,
      size: file.size
    },
    uploadProgress: 0,
    uploadSuccess: false
  }
  currentChat.value.messages.push(fileMsg)

  // 2. 更新会话信息
  if (!currentChat.value.title) {
    currentChat.value.title = `[文件] ${file.name}`
  }
  currentChat.value.updateTime = getCurrentTime()

  // 3. 清空输入和文件选择
  inputText.value = ''
  target.value = ''

  // 4. 滚动到底部
  scrollToBottom()

  // 5. 模拟文件上传（实际项目中替换为真实接口请求）
  simulateFileUpload(fileMsg)
}

// 模拟文件上传（含进度更新）
const simulateFileUpload = (msg) => {
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 5
    if (progress >= 100) {
      progress = 100
      clearInterval(interval)

      // 模拟上传结果（80%成功率）
      setTimeout(() => {
        msg.uploadProgress = 100
        msg.uploadSuccess = Math.random() > 0.2 // 随机成功/失败

        // 更新会话更新时间
        currentChat.value.updateTime = getCurrentTime()

        // 上传成功后模拟AI回复
        if (msg.uploadSuccess) {
          setTimeout(() => {
            const aiReply = `我已收到您上传的文件【${msg.file?.name}】，文件大小${formatFileSize(msg.file?.size || 0)}。\n已完成文件内容解析，请问您想了解关于这个文件的哪些信息？`
            currentChat.value.messages.push({
              role: 'ai',
              content: aiReply,
              time: getCurrentTime()
            })
            currentChat.value.updateTime = getCurrentTime()
            scrollToBottom()
          }, 1000)
        }
        scrollToBottom()
      }, 500)
    }
    msg.uploadProgress = progress
    scrollToBottom()
  }, 200)
}

// 发送文字消息
const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text) return

  // 添加用户消息
  const userMsg = {
    role: 'user',
		id: conversationId.value, // 会话ID
    content: text,
		agentId: agentId.value, // 智能体ID
    placement: 'end',
    timestamp: getCurrentTime()
  }
  messagesList.value.push(userMsg)

  // 清空输入 + 标记发送中
  inputText.value = ''
  scrollToBottom()

  // 添加AI回复消息
  const AIMsg = {
    role: 'ai',
		id: conversationId.value, // 会话ID
    content: '',
		agentId: agentId.value, // 智能体ID
		loading: true,
		isMarkdown: true,
		placement: 'start',
    timestamp: getCurrentTime()
  }
  aiMessageIndex.value = messagesList.value.push(AIMsg) - 1

  // 创建实例
  const chatApi = hookFetch.create({
    baseURL: baseURL+'/api/v1/internal/chat/message',
    timeout: 10000,
    headers: {
			'Accept': 'text/event-stream',
    	'Content-Type': 'application/json',
    	// 'Authorization': 'Bearer '+ useUserStore().token,
    	'token': useUserStore().token
    },
    plugins: [
      sseTextDecoderPlugin({
        json: true, // 自动解析 JSON
        prefix: 'data: ', // 移除 "data: " 前缀
        splitSeparator: '\n\n', // 事件分隔符
        lineSeparator: '\n', // 行分隔符
        trim: true, // 去除首尾空白
        doneSymbol: '[DONE]' // 结束标记
      })
    ]
  });
  const response = chatApi.get('/stream',{
    query: text,
		agentId: agentId.value,
		conversationId: conversationId.value=='1'?'':conversationId.value,
    stream: true,
  })

	// 创建新的对话 调用会话列表
	if (chatList.value[0].id=='1') {
		setTimeout(() => {
			isCon.value = false
			getConversations()
		},5000)
	}
  for await (const chunk of response.stream()) {
    if (chunk.result.indexOf("event") == -1) {
			messagesList.value[aiMessageIndex.value].loading = false
      let data = JSON.parse(chunk.result.replace('data:', ''))
      messagesList.value[aiMessageIndex.value].content += data.content
      scrollToBottom()
    }
  }
}

// 核心：解析markdown标记（### 标题、**加粗**、换行）
function parseMarkdown(text) {
  if (!text) return ''
  let html = text
  // 1. 解析 ### 标题 -> <h3>
  html = html.replace(/### (.*?)\n/g, '<h3>$1</h3>')
  // 2. 解析 **加粗** -> <strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // 3. 解析换行符 \n -> <br>
  html = html.replace(/\n/g, '<br>')
  return html
}

// 核心解析函数：处理各种类型的 SSE 数据
const parseSSEData = (event) => {
  try {
    const parsedData = JSON.parse(event);

    // 返回解析后的对象
    return {
      conversationId: parsedData.conversation_id,
      messageId: parsedData.message_id,
      content: parsedData.content,
      timestamp: new Date().toISOString() // 可以添加处理时间
    };
  } catch (error) {
    console.error("JSON解析错误:", error);
    return null;
  }
}

// 刷新页面
const handleRefresh = () => {
  window.location.reload()
}
// 获取智能体列表
getAgents()
// 获取会话列表
getConversations()
// 初始化滚动
scrollToBottom()
</script>

<style scoped>
.chat-app-container {
  display: flex;
  height: 93vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  margin: 0;
  padding: 0;
}

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
}
.sidebar-header {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #6b7280;
}

.section-title {
  font-size: 16px;
  margin-bottom: 8px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: background 0.2s;
}

.sidebar-item:hover {
  background: #f3f4f6;
}

.sidebar-item.active {
  background: #e5e7eb;
  font-weight: 500;
}

.item-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}
.app-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
.new-chat-btn {
  width: 90%;
	margin: auto;
  padding: 10px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 16px;
  color: #7a82f2;
  font-size: 16px;
  height: 40px;
}
.new-chat-btn:hover {
  background: #f1f3f4;
}
.chat-list {
  flex: 1;
  overflow-y: auto;
}
.chat-item {
  padding: 12px 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 4px;
	width: 90%;
	margin: auto;
}
.chat-item.active {
  background: #e3f2fd;
  color: #1976d2;
  border-left: 3px solid #1976d2;
}
.chat-item:hover:not(.active) {
  background: #f1f3f4;
}
.chat-item-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chat-item-time {
  font-size: 12px;
  color: #6c757d;
}
.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
  margin-top: auto;
}
/* 中间会话列表 */
.conversation-list {
  width: 300px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.conversation-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 30px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  flex: 1;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.new-conversation-btn {
  margin: 16px;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.2s;
}

.new-conversation-btn:hover {
  background: #f9fafb;
}

.conversation-items {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.conversation-item {
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 6px;
  transition: background 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-item:hover {
  background: #f3f4f6;
}

.conv-text {
  font-size: 14px;
}

.conv-count {
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 10px;
}

.footer {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
}
/* 聊天主区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-sizing: border-box;
}
.chat-header {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
}
.refresh-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6c757d;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.refresh-btn:hover {
  background: #f1f3f4;
}
.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
}
.empty-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 16px;
}
.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}
.message.ai {
  align-self: flex-start;
}
.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.message-wrapper {
  display: flex;
  flex-direction: column;
}
.message-content {
  background: #f1f3f4;
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.5;
  white-space: pre-line;
}
.message.user .message-content {
  background: #1976d2;
  color: #fff;
}

/* 文件卡片样式 */
.file-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}
.message.user .file-card {
  background: rgba(255, 255, 255, 0.2);
}
.file-icon {
  font-size: 20px;
}
.file-info {
  flex: 1;
}
.file-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-size {
  font-size: 12px;
  color: #6c757d;
}
.message.user .file-size {
  color: #bbdefb;
}
.upload-progress {
  width: 80px;
  height: 20px;
  border-radius: 10px;
  background: #e9ecef;
  position: relative;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: #2196f3;
  transition: width 0.2s ease;
}
.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #333;
}
.upload-status {
  font-size: 12px;
}
.file-desc {
  margin-top: 8px;
  font-size: 14px;
}

/* 引用样式 */
.reference {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
  font-size: 14px;
  color: #6c757d;
}
.reference-item {
  margin-top: 4px;
  background: #ffffff;
  padding: 6px 10px;
  border-radius: 6px;
  display: inline-block;
}
.message-time {
  font-size: 12px;
  color: #9aa0a6;
  margin-top: 4px;
  align-self: flex-end;
}
.message.user .message-time {
  color: #bbdefb;
}

/* 输入区域（含文件上传） */
.chat-input-area {
  padding: 16px;
  gap: 8px;
  box-sizing: border-box;
  align-items: center;
}
.upload-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f3f4;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
}
.upload-btn:hover {
  background: #e9ecef;
}
.file-input {
  display: none; /* 隐藏原生文件选择框 */
}
.input-field {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.input-field:focus {
  border-color: #1976d2;
}
.input-field:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}
.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1976d2;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.send-btn:disabled {
  background: #90caf9;
  cursor: not-allowed;
}
</style>
