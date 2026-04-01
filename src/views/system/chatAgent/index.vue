<template>
  <div class="chat-app-container">
    <!-- 工作区 -->
    <aside class="sidebar">
      <!-- 顶部标题栏（头像+标题+收起按钮） -->
      <div class="sidebar-header">
        <div class="blue-square-a">A</div>
        <div class="title-container hide-on-collapse">
          <div class="app-title">A-Port智能体</div>
        </div>
        <div class="collapse-btn" id="collapseBtn">
          <i class="fas fa-chevron-left"></i>
        </div>
      </div>
      <div class="sidebar-section">
        <div
          v-for="item in workspaceItems"
          :key="item.id"
          class="sidebar-item"
          :class="{ active: agentId === item.id }"
          @click="agentClick(item)"
        >
          <!-- 解决item.icon为空时报错的问题-->
          <img :src="getAvatarUrl(item.avatar)"  alt="" class="item-icon" />
          <span class="item-label">{{ item.name }}</span>
        </div>
      </div>
      <div class="sidebar-workbench-btn">
        <el-button
          type="text"
          icon="Menu"
          size="mini"
          @click="goToWorkbench"
          class="sidebar-workbench-btn-inner"
        >
          前往工作台
        </el-button>
      </div>
    </aside>
    <!-- 会话列表 -->
    <section class="conversation-list" v-if="isOpen">
      <div class="conversation-header">
        <img :src="agentIcon" alt="" class="item-icon" />
        <h2 class="app-title">{{agentName}}</h2>
        <el-tooltip content='收起边栏' placement="bottom">
          <el-button type="text" @click="collangeClick" style="margin-left:auto;margin-right:0">
            <template #default>
              <svg t="1770001751340" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="27733" width="16" height="16"><path d="M70.4 153.6c0-45.9264 37.2736-83.2 83.2-83.2h716.8c45.9264 0 83.2 37.2736 83.2 83.2v716.8c0 45.9264-37.2736 83.2-83.2 83.2H153.6A83.2 83.2 0 0 1 70.4 870.4V153.6z m64 0v716.8c0 10.5984 8.6016 19.2 19.2 19.2h716.8a19.2 19.2 0 0 0 19.2-19.2V153.6A19.2 19.2 0 0 0 870.4 134.4H153.6A19.2 19.2 0 0 0 134.4 153.6z" fill="#515151" p-id="27734"></path><path d="M307.2 544a32 32 0 1 1 0-64h409.6a32 32 0 1 1 0 64H307.2z" fill="#515151" p-id="27735"></path></svg>
            </template>
          </el-button>
        </el-tooltip>
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
          :items-style="{
            padding: '10px 10px',
          }"
          @menu-command="handleMenuCommand"
        />
      </div>
    </section>
    <!-- 右侧聊天区域 -->
    <main class="chat-main">
      <div v-if="!isOpen" class="sidebutton">
        <el-tooltip content='打开边栏' placement="bottom">
          <el-button circle @click="collangeClick">
            <template #default>
              <svg t="1770001751340" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="27733" width="16" height="16"><path d="M70.4 153.6c0-45.9264 37.2736-83.2 83.2-83.2h716.8c45.9264 0 83.2 37.2736 83.2 83.2v716.8c0 45.9264-37.2736 83.2-83.2 83.2H153.6A83.2 83.2 0 0 1 70.4 870.4V153.6z m64 0v716.8c0 10.5984 8.6016 19.2 19.2 19.2h716.8a19.2 19.2 0 0 0 19.2-19.2V153.6A19.2 19.2 0 0 0 870.4 134.4H153.6A19.2 19.2 0 0 0 134.4 153.6z" fill="#515151" p-id="27734"></path><path d="M307.2 544a32 32 0 1 1 0-64h409.6a32 32 0 1 1 0 64H307.2z" fill="#515151" p-id="27735"></path></svg>
            </template>
          </el-button>
        </el-tooltip>
        <el-tooltip content='开启新对话' placement="bottom">
          <el-button icon="Edit" circle @click="createNewChat"/>
        </el-tooltip>
      </div>
      <div :class="isOpen?'chat-messages':'chat-messages1'" ref="messagesContainer">
        <div v-if="messagesList.length === 0" class="empty-chat">
          请输入您的问题，我将优先从知识库中检索与您问题相关的信息，以确保回答的专业性和准确性。
        </div>
        <BubbleList v-else :list="messagesList" ref="scrollContainer" max-height="700px">
          <!-- 自定义头像 -->
          <template #avatar="{ item }">
            <div class="avatar-wrapper">
              <img v-if = "item.role === 'ai'" src="@/assets/images/agent/AIzhinengti1.png" style="width: 30px" alt="avatar">
              <img v-else src="@/assets/images/agent/Agent_MyAgent.png" style="width: 30px" alt="avatar">
            </div>
          </template>

          <!-- 自定义头部 -->
          <template #header="{ item }">
            <div class="header-wrapper">
              <div class="header-name">
                {{ item.role === 'ai' ? 'A-Port' : useUserStore().name }}
              </div>
            </div>
          </template>

          <template #loading>
            <Thinking
              status="thinking"
            />
          </template>

          <!-- 自定义气泡内容 -->
          <template #content="{ item }">
            <div class="content-wrapper">
              <template v-if="item.role === 'ai'">
                <div v-if="item.loading">
                  <XMarkdown
                    :markdown="item.content"
                    class="markdown-body"
                    :themes="{ light: 'github-light', dark: 'github-dark' }"
                    default-theme-mode="light"
                  />
                </div>
                <template v-else>
                  <!-- AI markdown -->
                  <XMarkdown
                    v-if="!item.content || !item.content.includes('```html')"
                    :markdown="item.content"
                    :code-x-render="selfCodeXRender"
                    class="markdown-body"
                    :themes="{ light: 'github-light', dark: 'github-dark' }"
                    default-theme-mode="light"
                  />
                  <!-- AI 内容html页面 -->
                  <XMarkdown v-else  :markdown="extractFrontendCodeFromMarkdown(item.content)" :allow-html="true" />
                </template>
              </template>
              <!-- user 内容 纯文本 -->
              <div v-if="item.content && item.role === 'user'" class="user-content" >
                {{ item.content }}
              </div>
            </div>
          </template>

          <!-- 自定义底部 -->
          <template #footer="{ item,index }">
            <div class="footer-wrapper">
              <div class="footer-container">
                <el-button v-if="item.role=='ai' && item.feedbackStatus != 'dislike'" size="small" circle @click="likeClick(item)">
                  <template #default>
                    <svg t="1769068580466" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4862" width="16" height="16"><path d="M832 364.8h-147.2s19.2-64 32-179.2c6.4-57.6-38.4-115.2-102.4-121.6h-12.8c-51.2 0-83.2 32-102.4 76.8l-38.4 96c-32 64-57.6 102.4-76.8 115.2-25.6 12.8-121.6 12.8-128 12.8H128c-38.4 0-64 25.6-64 57.6v480c0 32 25.6 57.6 64 57.6h646.4c96 0 121.6-64 134.4-153.6l51.2-307.2c6.4-70.4-6.4-134.4-128-134.4z m-576 537.6H128V422.4h128v480z m640-409.6l-51.2 307.2c-12.8 57.6-12.8 102.4-76.8 102.4H320V422.4c44.8 0 70.4-6.4 89.6-19.2 32-12.8 64-64 108.8-147.2 25.6-64 38.4-96 44.8-102.4 6.4-19.2 19.2-32 44.8-32h6.4c32 0 44.8 32 44.8 51.2-12.8 102.4-32 166.4-32 166.4l-25.6 83.2h243.2c19.2 0 32 0 44.8 12.8 12.8 12.8 6.4 38.4 6.4 57.6z" p-id="4863" fill="#707070"></path></svg>
                  </template>
                </el-button>
                <el-button v-if="item.role=='ai' && item.feedbackStatus != 'like'" size="small" circle @click="nolikeClick(item)">
                  <template #default>
                    <svg t="1769148343729" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4906" width="16" height="16"><path d="M192 659.2l147.2 0s-19.19999999 64-32 179.2c-6.4 57.60000001 38.4 115.2 102.4 121.6l12.8 0c51.2 0 83.2-32 102.4-76.79999999l38.4-96.00000001c32-64 57.6-102.4 76.8-115.2 25.6-12.8 121.6-12.8 127.99999999-12.8L896 659.20000001c38.4 0 64-25.6 64-57.60000001l0-480c0-32-25.6-57.6-64-57.6l-646.4 0c-95.99999999 0-121.6 64-134.4 153.59999999l-51.2 307.20000001c-6.4 70.40000001 6.4 134.4 128 134.4z m576-537.6L896 121.6 896 601.6l-128 0 0-480z m-640 409.59999999l51.2-307.19999999c12.8-57.60000001 12.8-102.4 76.8-102.4L704 121.6 704 601.6c-44.8 0-70.40000001 6.4-89.6 19.2-32 12.8-64 64-108.8 147.19999999-25.6 64-38.4 96-44.8 102.40000001-6.4 19.2-19.2 32-44.8 32l-6.4 0c-32 0-44.8-32-44.8-51.2 12.8-102.4 32-166.4 32-166.4l25.6-83.2-243.19999999 0c-19.2 0-32 0-44.80000001-12.8-12.8-12.8-6.4-38.4-6.4-57.60000001z" p-id="4907" fill="#707070"></path></svg>
                  </template>
                </el-button>
                <el-button :icon="DocumentCopy" size="small" circle @click="copyClick(item)"/>
                <el-button v-if="item.role=='ai'" :icon="Refresh" size="small" circle @click="refreshClick(item,index)"/>
              </div>
              <div class="footer-time">
                {{ item.timestamp }}
              </div>
            </div>
          </template>
        </BubbleList>

        <!-- 输入区域（增加文件上传） -->
        <div class="chat-input-area">
          <Sender
            v-model="inputText"
            variant="updown"
            :auto-size="{ minRows: 2, maxRows: 5 }"
            clearable
            :loading="isLoading"
            @submit="sendMessage"
            @cancel="cancelMeassage"
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
    <!--  提供反馈  -->
    <el-dialog title="提供反馈" v-model="isShowFeedback" width="40%">
      <el-form :model="feedbackFormData" label-position="top" ref="rejectFormRef" label-width="80px">
        <el-form-item
          label="反馈内容"
          prop="rejectReason"
        >
          <el-input type="textarea" v-model="feedbackFormData.content"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isShowFeedback = false">关 闭</el-button>
          <el-button @click="submitFeeback" type="primary" >保 存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="chatAgent">
import { ref, nextTick, computed, watch } from 'vue'
import api from '@/api/system/difyAgent/index'
import useUserStore from '@/store/modules/user'
// import { useEventSource } from '@/utils/eventSource' // 文件不存在且未使用，移除以修复构建错误
import { BubbleList, Sender, XMarkdown, Thinking, Conversations } from 'vue-element-plus-x';
import { DocumentCopy, Refresh, Search, Star } from '@element-plus/icons-vue';
import { h } from 'vue';
import Echarts from './echarts.vue'; // 根据你的实际文件路径调整
const { proxy } = getCurrentInstance()
const baseURL = import.meta.env.VITE_APP_BASE_API
import hookFetch from 'hook-fetch';
import { sseTextDecoderPlugin } from 'hook-fetch/plugins/sse';
import { ChatDotRound, ChatLineRound } from '@element-plus/icons-vue';

const value1 = ref(true);
const statusValue = ref('thinking');

const bgColor =
  'linear-gradient(97deg, rgba(90,196,255,0.12) 0%, rgba(174,136,255,0.12) 100%)'

const extractFrontendCodeFromMarkdown = (markdownText) => {
  // 匹配```html 包裹的代码块（忽略大小写，如```HTML也能匹配）
  const htmlCodeRegex = /```html\s*\n([\s\S]*?)\n```/gi;
  let htmlCode = '';
  let match;

  // 循环匹配所有HTML代码块并拼接
  while ((match = htmlCodeRegex.exec(markdownText)) !== null) {
    // 提取代码块内的HTML内容，清理首尾空白
    const singleHtmlBlock = match[1].trim();
    // 多个HTML代码块用换行分隔拼接
    htmlCode += (htmlCode ? '\n' : '') + singleHtmlBlock;
  }

  // 3. 去除多余空白：
  // - 匹配所有换行、回车、制表符、连续空格，替换为单个空格
  // - 最后去掉首尾空格（防止开头/结尾残留空格）
  const compactHtml = htmlCode.replace(/[\n\r\t\s]+/g, ' ').trim();
  // 如果没提取到任何HTML代码，返回空字符串（也可自定义默认值）
  return compactHtml || markdownText;
}
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
const scrollContainer = ref(null)
const chatList = ref([]) // 会话列表
const aiMessageIndex = ref(0)
const conversationId = ref('1') // 会话ID
const workspaceItems = ref([]) // 智能体List
const agentId = ref('1') // 智能体ID
const agentName = ref('港口设备专家')
const agentIcon = ref('')
const messagesList = ref([]) // 会话历史
const isCon = ref(false) // 是否执行查询消息历史
const isShow = ref(false) // 修改会话Dialog
const messageId = ref(null) // 消息ID
const chatFormData = ref({
  name: '',
})
const editConversationId = ref('') // 待修改会话ID
const isShowFeedback = ref(false) // 反馈Dialog
const feedbackFormData = ref({
  content: '',
})
const isLoading = ref(false) // 是否加载
const taskId = ref(null) // 消息ID
const isOpen = ref(true) // 显示会话列表

const likeClick = (item) => {
  console.log("item",item)
  let feedbackStatus = item.feedbackStatus == 'like' ? null : 'like'
  let params = {
    agentId: agentId.value,
    messageId: item.id,
    rating: feedbackStatus,
  }
  api.feedback(params).then(res => {
    proxy.$message.success("成功")
    item.feedbackStatus = item.feedbackStatus == 'like' ? null : 'like'
  })
}
const nolikeClick = (item) => {
  console.log("item",item)
  messageId.value = item.id
  let feedbackStatus = item.feedbackStatus == 'dislike' ? null : 'dislike'
  if (feedbackStatus == 'dislike') {
    isShowFeedback.value = true
  } else {
    let params = {
      agentId: agentId.value,
      messageId: item.id,
      rating: feedbackStatus,
      content: feedbackFormData.value.content,
    }
    api.feedback(params).then(res => {
      proxy.$message.success("成功")
      item.feedbackStatus = item.feedbackStatus == 'dislike' ? null : 'dislike'
    })
  }
}
// 提交反馈
const submitFeeback = () => {
  let feedbackStatus = messagesList.value.filter(v=>v.id==messageId.value)[0].feedbackStatus == 'dislike' ? null : 'dislike'
  let params = {
    agentId: agentId.value,
    messageId: messageId.value,
    rating: feedbackStatus,
    content: feedbackFormData.value.content,
  }
  api.feedback(params).then(res => {
    proxy.$message.success("成功")
    isShowFeedback.value = false
    nextTick(() => {
      messagesList.value.forEach(v => {
        if (v.id==messageId.value) {
          v.feedbackStatus = v.feedbackStatus == 'dislike' ? null : 'dislike'
        }
      })
    })

  })
}
const selfCodeXRender = {
  // 渲染自定义代码块标识符 javascript, 返回一个组件
  javascript: (props) => {
    return h(
      'pre',
      { class: 'language-javascript' },
      h('code', { class: 'language-javascript' }, props.raw.content)
    );
  },
  // 渲染自定义代码块标识符 echarts, Echarts 是自己封装的Vue组件
  echarts: (props) => h(Echarts, { code: props.raw.content })
};
// 智能体点击事件
const agentClick = (item) => {
  agentId.value = item.id
  agentName.value = item.name
  agentIcon.value = getAvatarUrl(item.avatar)
  // 获取历史对话
  getConversations()
}
// 获取请求体
const getAgents = () => {
  api.getAgents().then(res => {
    workspaceItems.value = res.data
    if (workspaceItems.value.length > 0) {
      agentId.value = workspaceItems.value[0].id
      agentName.value = workspaceItems.value[0].name
      agentIcon.value = getAvatarUrl(workspaceItems.value[0].avatar)
      // 获取历史对话
      getConversations()
    }
  })
}
// 根据智能体ID获取会话列表
const getConversations = (flag) => {
  api.getConversations({agentId: agentId.value}).then(res => {
    chatList.value = res.data
    //给每个会话添加图标
    chatList.value.forEach(v => {
      v.prefixIcon = h(ChatLineRound)
    })
    // 如果为空 添加一条空的会话
    if (chatList.value.length == 0) {
      const newChat = {
        id: '1',
        name: '新的对话',
        prefixIcon: h(ChatDotRound)
      }
      chatList.value.push(newChat)
      conversationId.value = '1'
    }
    conversationId.value = '1'
    if (flag) {
      conversationId.value = chatList.value[0].id
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
    let index = 0
    res.data.forEach(v => {
      let date = new Date(v.created_at * 1000)
      // 添加用户消息
      const userMsg = {
        role: 'user',
        id: v.id,
        index: index++,
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
        index: index++,
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
      // 如果删除的会话与当前选中的会话相同--清空信息列表
      if (item.id == conversationId.value){
        messagesList.value = []
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
    // if (messagesContainer.value) {
    //   messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    // }
    if (scrollContainer.value) {
      scrollContainer.value.scrollToBottom()
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
  if (chatList.value[0].id == '1') {
    return
  }
  const newChat = {
    id: '1',
    name: '新的对话',
    prefixIcon: h(ChatDotRound)
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

  taskId.value = null
  isLoading.value = true
  // 计算数组长度 赋值下标
  let index = messagesList.value.length*2
  // 添加用户消息
  const userMsg = {
    role: 'user',
    id: conversationId.value, // 会话ID
    content: text,
    index: index,
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
    index: index+1,
    loading: true,
    isMarkdown: true,
    placement: 'start',
    timestamp: getCurrentTime()
  }
  aiMessageIndex.value = messagesList.value.push(AIMsg) - 1
  try {
    // 创建实例
    const chatApi = hookFetch.create({
      baseURL: baseURL+'/api/v1/internal/chat/message',
      timeout: 300000,
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
    })

    for await (const chunk of response.stream()) {
      if (chunk.result.indexOf("event") == -1) {
        messagesList.value[aiMessageIndex.value].loading = false
        let data = JSON.parse(chunk.result.replace('data:', ''))
        messagesList.value[aiMessageIndex.value].content += data.content
        taskId.value = data.task_id
        scrollToBottom()
      } else if (chunk.result.indexOf("event:end") != -1) {
        console.log('打印输出');
        // 创建新的对话 调用会话列表
        if (conversationId.value=='1'||chatList.value[0].id=='1') {
          getConversations(true)
        }
        isLoading.value = false
      }
    }

  } catch (error) {
    console.log("请求出错");
    isLoading.value = false
    if (!messagesList.value[aiMessageIndex.value].content) {
      messagesList.value[aiMessageIndex.value]['content'] = '发送信息时请求出错，请重试'
    }
  }
}
// 停止响应
const cancelMeassage = () => {
  console.log("停止响应")
  let params = {
    agentId: agentId.value,
    taskId: taskId.value
  }
  api.stopConversation(params).then(res => {
    proxy.$message.success('停止成功')
  })
}
// 复制事件
const copyClick = async (item) => {
  console.log("item",item);
  try {
    // 方法1：复制固定的文本
    await navigator.clipboard.writeText(item.content)

    proxy.$message.success('复制成功')

  } catch (err) {
    console.error('复制失败:', err)
  }
}
// 刷新事件
const refreshClick = (item,index) => {
  console.log("item",item);
  inputText.value = messagesList.value[item.index-1].content
  sendMessage()
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
//打开新页面
const goToWorkbench = () => {
  //打开新网页
  window.open('http://114.215.173.72:10005/', '_blank');
}

const getAvatarUrl = (avatarName) => {
  // try {
  //   // 注意：路径要和实际文件匹配，后缀（如.png/.jpg）要写全
  //   return require(`@/assets/images/agent/${avatarName}`).default
  // } catch (e) {
  //   // 图片不存在时的兜底处理
  //   return `/src/assets/images/agent/zhuanjia.png`
  // }
  // 预加载所有头像图片（Vite方式）
  const avatarModules = import.meta.glob('@/assets/images/agent/*', { eager: true });
  // 拼接目标图片路径
  const targetPath = `/src/assets/images/agent/${avatarName}`;
  // 查找并返回，不存在则返回兜底
  return avatarModules[targetPath]?.default || import.meta.glob('@/assets/images/agent/zhuanjia.png', { eager: true }).default;
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
// 打开关闭会话列表
const collangeClick = () => {
  isOpen.value = !isOpen.value
}
// 获取智能体列表
getAgents()
// 获取会话列表
// getConversations()
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
  display: flex;
  padding: 16px;
  font-size: 15px;
  box-sizing: border-box;
  margin-bottom: -2vh;
}

/* 智能体列表区域：正常占据上方空间 */
.sidebar-section {
  flex: 1; /* 让列表区域占满除按钮外的所有空间 */
  overflow-y: auto; /* 列表过长时可滚动，避免挤压按钮 */
}
/* 顶部标题栏样式 */
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 8px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e7eb; /* 底部分隔线 */
}

.section-title {
  font-size: 16px;
  color: #101828;
  margin-bottom: 18px;
  font-weight: 600;
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
  background-color: #e0e7ff; /* 和历史项选中背景一致，保持视觉统一 */
  color: #3b82f6;
  font-weight: 500;
}

.sidebutton {
  position: absolute;
  padding: 20px 20px;
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
/**
字体设置
 */
.app-title {
  font-size: 16px;
  color: #101828;
  font-weight: 600;
  margin: 0;
}
.new-chat-btn {
  width: 90%;
  margin: auto;
  padding: 10px;
  background: #fff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 16px;
  color: #3b82f6;
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
  width: 281px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 102%;
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
  padding: 2px 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-sizing: border-box;
}
.chat-messages1 {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  width: 90%;
  margin-left: auto;
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
:deep(.el-bubble-content-wrapper .el-bubble-content){
  max-width: 800px !important;
}

/* 定位到父元素底部 */
.sidebar-workbench-btn {
  padding: 2px 16px; /* 原16px改成8px，更紧凑 */
  margin-top: auto; /* 关键属性：自动填充上方空间，固定在底部 */
  border-top: 1px solid #f0f2f5; /* 可选：加分割线，和列表区分开 */
}
/* 左侧按钮 hover 样式，和侧边栏item统一 */
.sidebar-workbench-btn-inner:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
}

.blue-square-a {
  /* 宽高相等实现正方形 */
  width: 28px;
  height: 28px;
  /* 蓝色背景 */
  background-color: #007bff;
  /* 字母颜色为白色 */
  color: #ffffff;
  /* 字体大小 */
  font-size: 16px;
  /* 文字水平居中 */
  text-align: center;
  /* 行高等于高度，实现文字垂直居中 */
  line-height: 28px;
  /* 去掉默认的外边距/内边距 */
  margin: 0 10px;
  padding: 0;
  /* 让字母更粗 */
  font-weight: bold;
  /* 核心：添加圆角效果 */
  border-radius: 6px; /* 圆角半径，数值越大圆角越明显 */
}
</style>
