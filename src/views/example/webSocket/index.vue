<!--
 * @Author: zhangsd
 * @Date: 2025-09-05 16:01:51
 * @LastEditTime: 2025-09-05 17:06:38
 * @LastEditors: zhangsd
 * @Description: WebSocket演示界面（接收/发送消息均显示在左侧）
 * @FilePath: \view\src\views\example\webSocket\index.vue
-->

<template>
  <div class="ws-demo-container">
    <!-- 标题栏 -->
    <div class="header">
      <h2 class="title">
        <i class="icon-websocket" :class="wsStore.connected ? 'connected' : 'disconnected'"></i>
        WebSocket 实时消息演示
        <!-- 未读消息提醒 -->
        <span class="unread-dot" v-if="wsStore.unreadCount > 0">{{ wsStore.unreadCount }}</span>
      </h2>
      <div class="connection-status">
        <span class="status-label">连接状态:</span>
        <span class="status-indicator" :class="wsStore.connected ? 'connected' : 'disconnected'">
          {{ wsStore.connected ? '已连接' : '未连接' }}
        </span>
        <span class="connection-time" v-if="wsStore.connected">
          连接时间: {{ formatTime(wsStore.connectTimestamp) }}
        </span>
      </div>
    </div>

    <!-- 消息区域 -->
    <div class="message-container">
      <!-- 消息列表 -->
      <div class="message-list">
        <div class="message-list-header">
          <h3>消息记录</h3>
          <div class="header-controls">
            <button 
              class="filter-btn" 
              @click="toggleMessageFilter"
            >
              <i class="icon-filter"></i>
              {{ showOnlyUnread ? '显示全部' : '仅看未读' }}
            </button>
            <button 
              class="clear-btn" 
              @click="wsStore.clearAllMessages"
              :disabled="filteredMessages.length === 0"
            >
              清空记录
            </button>
          </div>
        </div>
        
        <div class="message-items">
          <!-- 系统提示消息 -->
          <div class="system-message" v-if="filteredMessages.length === 0 && wsStore.messages.length === 0">
            <i class="icon-info"></i>
            <p>等待接收消息... 连接成功后可以发送消息</p>
          </div>
          
          <!-- 过滤无结果提示 -->
          <div class="system-message" v-if="filteredMessages.length === 0 && wsStore.messages.length > 0">
            <i class="icon-info"></i>
            <p>没有符合条件的消息</p>
          </div>
          
          <!-- 消息列表（从WebSocket Store获取） -->
          <div 
            class="message-item" 
            v-for="(msg, idx) in filteredMessages" 
            :key="idx"
            :class="{ 
              'incoming': wsStore.isIncomingMessage(msg), 
              'outgoing': !wsStore.isIncomingMessage(msg),
              'unread': msg.unread && wsStore.isIncomingMessage(msg)
            }"
            @click="wsStore.markAsRead(msg)"
          >
            <div class="message-meta">
              <div class="sender-info">
                <i class="icon-user" v-if="!wsStore.isIncomingMessage(msg)"></i>
                <i class="icon-server" v-if="wsStore.isIncomingMessage(msg)"></i>
                <span class="sender">
                  {{ getSenderName(msg) }}
                </span>
                <span class="unread-badge" v-if="msg.unread && wsStore.isIncomingMessage(msg)">新</span>
              </div>
              <span class="time">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="message-content">
              <pre>{{ JSON.stringify(msg.data, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 发送区域 -->
      <div class="message-input-area" :class="{ disabled: !wsStore.connected }">
        <textarea
          v-model="inputMsg"
          placeholder="请输入消息内容（按Enter发送，Shift+Enter换行）"
          class="message-input"
          :disabled="!wsStore.connected"
          @keydown.enter.exact="sendCustomMsg"
          @keydown.enter.shift.exact="handleShiftEnter"
        ></textarea>
        <div class="send-controls">
          <div class="char-count">{{ inputMsg.length }} 字符</div>
          <button 
            @click="sendCustomMsg" 
            class="send-btn"
            :disabled="!wsStore.connected || !inputMsg.trim()"
          >
            <i class="icon-send"></i>
            发送消息
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { webSocketService } from '@/utils/common/webSocket';
import useWebSocketStore from '@/store/modules/webSocket'; // 引入WebSocket Store
import useUserStore from '@/store/modules/user';

// 状态管理
const wsStore = useWebSocketStore();
const userStore = useUserStore();
const inputMsg = ref('');
const showOnlyUnread = ref(false);

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const isToday = date.toDateString() === new Date().toDateString();
  
  return isToday 
    ? date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : `${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
};

// 处理Shift+Enter换行
const handleShiftEnter = (e) => {
  e.preventDefault();
  inputMsg.value += '\n';
  nextTick(() => {
    const textarea = document.querySelector('.message-input');
    if (textarea) {
      textarea.focus();
      const len = inputMsg.value.length;
      textarea.setSelectionRange(len, len);
    }
  });
};

// 过滤消息（根据未读状态）
const filteredMessages = computed(() => {
  if (showOnlyUnread.value) {
    return wsStore.unreadMessages; // 直接使用store的getter
  }
  return wsStore.messages;
});

// 切换消息过滤状态
const toggleMessageFilter = () => {
  showOnlyUnread.value = !showOnlyUnread.value;
  if (!showOnlyUnread.value) {
    wsStore.markAllAsRead(); // 关闭未读过滤时，标记所有为已读
  }
};

// 获取发送者名称
const getSenderName = (msg) => {
  if (wsStore.isIncomingMessage(msg)) {
    return msg.data.sender || '服务器 (发送给我)';
  } else {
    return `我 (发送给服务器)`;
  }
};

// 发送消息
const sendCustomMsg = () => {
  const msgContent = inputMsg.value.trim();
  if (!msgContent) return ElMessage.warning('请输入消息内容');

  // 构建消息格式
  const customMsgData = {
    mesType: '30', // 客户端发送的消息标记
    senderAccount: userStore.userAccount,//发送者
    receiverAccount: 'websocket',//接受者
    content: msgContent,//消息内容
    contentType: '',//消息类型 -- 实时通讯
    timestamp: Date.now(),//发送时间
  };

  // 发送消息
  const success = webSocketService.sendMessage(customMsgData);
  if (success) {
    // 通过WebSocket Store添加消息
    wsStore.addMessage({
      data: customMsgData,
      timestamp: Date.now()
    });
    inputMsg.value = '';
    ElMessage.success('消息发送成功');
    scrollToBottom();
  } else {
    ElMessage.error('发送失败，请检查连接状态');
  }
};

// 滚动到最新消息
const scrollToBottom = () => {
  nextTick(() => {
    const listEl = document.querySelector('.message-items');
    if (listEl) {
      listEl.scrollTop = listEl.scrollHeight;
    }
  });
};

// 组件挂载时
onMounted(() => {
  scrollToBottom();
  
  // 监听新消息事件，自动滚动到底部
  const handleNewMessage = () => scrollToBottom();
  window.addEventListener('ws:message-added', handleNewMessage);
  
  // 组件卸载时移除监听
  return () => {
    window.removeEventListener('ws:message-added', handleNewMessage);
  };
});
</script>
<style scoped>
/* 样式与之前保持一致，仅新增未读小红点样式 */
.unread-dot {
  display: inline-block;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  margin-left: 8px;
  vertical-align: middle;
}

/* 其他样式省略（与之前相同） */
.ws-demo-container {
  max-width: 900px;
  height: 93vh;
  margin: 10px auto 0px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow:hidden;
}

.ws-demo-container {
  max-width: 900px;
  height: 93vh;
  margin: 10px auto 0px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow:hidden;
}

/* 标题栏样式（不变） */
.header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.title {
  margin: 0;
  color: #1e293b;
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-websocket {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: #94a3b8;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.icon-websocket::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
}

.icon-websocket.connected {
  background-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.1);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.icon-websocket.disconnected {
  background-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #64748b;
}

.status-label {
  font-weight: 500;
}

.status-indicator {
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s ease;
}

.status-indicator.connected {
  background-color: rgba(34, 197, 94, 0.1);
  color: #166534;
}

.status-indicator.disconnected {
  background-color: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.connection-time {
  font-size: 13px;
  color: #94a3b8;
}

/* 消息容器样式（不变） */
.message-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 消息列表样式（不变） */
.message-list {
  flex: 1;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.message-list:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #f0f0f0;
}

.message-list-header h3 {
  margin: 0;
  font-size: 16px;
  color: #334155;
  font-weight: 600;
}

.header-controls {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 4px 12px;
  background-color: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.filter-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.clear-btn {
  padding: 4px 12px;
  background-color: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-items {
  height: 450px;
  overflow-y: auto;
  padding: 16px;
  background-color: #fafafa;
}

.message-items::-webkit-scrollbar {
  width: 6px;
}

.message-items::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.message-items::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.message-items::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 系统消息（保持居中，与用户消息区分） */
.system-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #f1f5f9;
  border-radius: 6px;
  color: #64748b;
  font-size: 14px;
  text-align: center;
  margin: 20px auto; /* 居中显示 */
  max-width: 80%;
}

.icon-info {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #94a3b8;
  color: white;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}

/* 消息项样式 - 核心修改：统一靠左显示，用背景色区分类型 */
.message-item {
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease forwards;
  max-width: 85%;
  margin-right: auto; /* 统一靠左（取消右侧对齐） */
  position: relative;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 接收的消息（服务器 -> 客户端）- 白色背景 */
.message-item.incoming .message-content {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-top-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* 发送的消息（客户端 -> 服务器）- 蓝色背景 */
.message-item.outgoing .message-content {
  background-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(59, 130, 246, 0.15);
  border-top-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* 未读消息样式（仅服务器消息） */
.message-item.unread .message-content {
  border-left: 3px solid #3b82f6;
}

.unread-badge {
  display: inline-block;
  padding: 1px 6px;
  background-color: #3b82f6;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  margin-left: 6px;
  font-weight: bold;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 用不同颜色图标区分消息来源 */
.icon-user, .icon-server {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
}

.icon-user {
  background-color: #3b82f6; /* 自己发送的消息：蓝色图标 */
}

.icon-server {
  background-color: #22c55e; /* 服务器消息：绿色图标 */
}

.icon-filter {
  font-size: 12px;
}

.icon-send {
  font-size: 16px;
}

/* 发送者名称颜色区分 */
.message-item.incoming .sender {
  color: #22c55e;
  font-weight: 500;
}

.message-item.outgoing .sender {
  color: #3b82f6;
  font-weight: 500;
}

.time {
  opacity: 0.8;
  color: #94a3b8;
}

.message-content {
  padding: 10px 14px;
  border-radius: 8px;
  word-break: break-all;
  transition: all 0.2s ease;
}

.message-content pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  white-space: pre-wrap;
}

/* 输入区域样式（不变） */
.message-input-area {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.message-input-area:hover:not(.disabled) {
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-input-area.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message-input {
  width: 100%;
  min-height: 120px;
  padding: 14px;
  border: none;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  color: #1e293b;
  background-color: #ffffff;
  box-sizing: border-box;
}

.message-input:focus {
  outline: none;
  border-left: 3px solid #3b82f6;
}

.message-input::placeholder {
  color: #94a3b8;
}

.send-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background-color: #f8fafc;
  border-top: 1px solid #f0f0f0;
}

.char-count {
  font-size: 13px;
  color: #94a3b8;
}

.send-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(59, 130, 246, 0.2);
}

.send-btn:active:not(:disabled) {
  transform: translateY(0);
}

.send-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

/* 响应式调整（不变） */
@media (max-width: 768px) {
  .ws-demo-container {
    margin: 15px;
    padding: 15px;
  }
  
  .message-items {
    height: 350px;
  }
  
  .message-item {
    max-width: 90%;
  }
  
  .send-btn {
    padding: 7px 16px;
  }
  
  .header-controls {
    gap: 5px;
  }
  
  .filter-btn, .clear-btn {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>