// src/store/modules/webSocket.js
import { defineStore } from 'pinia';
import { webSocketService } from '@/utils/common/webSocket';
import useUserStore from './user'; // 引入用户Store，用于重连时获取用户信息

// -------------------------- 常量配置 --------------------------
// 本地存储键名（避免硬编码）
const WS_MSG_STORAGE_KEY = 'ws_messages';
const WS_UNREAD_COUNT_KEY = 'ws_unread_count';

// 心跳配置（15秒一次，与后端约定一致）
const HEARTBEAT_INTERVAL = 30000; // 30000ms = 30秒
const HEARTBEAT_MSG = { // 心跳包格式（需与后端协商字段）
    mesType: '9',       // 约定：mesType=9 为心跳消息
    type: 'ping',
    contentType: '',    // 内容类型（按业务定义）
    content: 'heartbeat',// 心跳标识
    timestamp: Date.now()// 时间戳（避免重复消息）
};

// -------------------------- Store定义 --------------------------
const useWebSocketStore = defineStore('webSocket', {
    state: () => ({
        // 1. 连接状态管理
        connected: false,          // 是否连接成功
        connectTimestamp: null,    // 连接建立时间戳
        reconnectCount: 0,         // 重连次数（避免无限重连）
        maxReconnectCount: 5,      // 最大重连次数（防止死循环）

        // 2. 消息数据管理
        messages: [],              // 所有消息列表（含历史）
        unreadCount: 0,            // 未读消息计数

        // 3. 事件与定时器管理
        handlers: {},              // 事件处理器（用于解绑）
        heartbeatTimer: null,      // 心跳定时器ID（用于清除）
        heartbeatInterval: HEARTBEAT_INTERVAL // 心跳间隔（可动态调整）
    }),

    getters: {
        // 过滤未读消息（仅服务器发来的未读消息，且只保留mesType为30和40的类型）
        unreadMessages(state) {
            return state.messages.filter(msg =>
                // 基础条件：必须是未读的服务器消息
                msg.unread && this.isIncomingMessage(msg) &&
                // 额外条件：只保留mesType为30或40的消息
                ['30', '40'].includes(msg.data?.mesType)
            );
        },

        // 总消息数（用于界面显示）
        totalMessageCount(state) {
            return state.messages.length;
        },

        // 连接状态文本（用于界面显示）
        connectStatusText(state) {
            return state.connected ? '已连接' : '未连接';
        }
    },

    actions: {
        // -------------------------- 初始化与持久化 --------------------------
        /**
         * 从localStorage恢复消息和未读状态（页面刷新后保留）
         */
        initFromStorage() {
            try {
                const storedMsgs = localStorage.getItem(WS_MSG_STORAGE_KEY);
                const storedUnread = localStorage.getItem(WS_UNREAD_COUNT_KEY);

                if (storedMsgs) this.messages = JSON.parse(storedMsgs);
                if (storedUnread) this.unreadCount = Number(storedUnread);
                console.log('WebSocket状态从本地存储恢复成功');
            } catch (error) {
                console.error('WebSocket状态恢复失败:', error);
                this.clearAllMessages(); // 恢复失败时清空，避免数据异常
            }
        },

        /**
         * 将当前消息和未读状态持久化到localStorage
         */
        saveToStorage() {
            try {
                localStorage.setItem(WS_MSG_STORAGE_KEY, JSON.stringify(this.messages));
                localStorage.setItem(WS_UNREAD_COUNT_KEY, String(this.unreadCount));
            } catch (error) {
                console.error('WebSocket状态持久化失败:', error);
            }
        },

        // -------------------------- 消息核心逻辑 --------------------------
        /**
         * 判断是否为服务器发来的消息（排除客户端消息和心跳）
         * @param {Object} msg - 消息对象
         * @returns {Boolean} 是否为服务器消息
         */
        isIncomingMessage(msg) {
            const clientMsgTypes = ['9', '30']; // 9=心跳，30=客户端业务消息
            return !clientMsgTypes.includes(msg.data?.mesType);
        },

        /**
         * 添加新消息到列表（统一入口）
         * @param {Object} msg - 消息对象（含data、timestamp）
         */
        addMessage(msg) {
            // 1. 格式化消息（补全默认字段）
            const formatMsg = {
                data: msg.data || {},
                timestamp: msg.timestamp || Date.now(),
                unread: false // 默认未读为false，后续按需修改
            };

            // 2. 区分消息类型处理
            if (this.isIncomingMessage(formatMsg)) {
                // 服务器消息：标记未读 + 触发通知
                formatMsg.unread = true;
                this.unreadCount++;
                this.triggerNotification(formatMsg);
            } else {
                // 客户端/心跳消息：不标记未读，不触发通知
                formatMsg.unread = false;
            }

            // 3. 加入列表并持久化
            this.messages.push(formatMsg);
            this.saveToStorage();

            // 4. 触发全局事件（供界面组件监听更新）
            window.dispatchEvent(new CustomEvent('ws:message-added', {
                detail: {
                    msg: formatMsg,
                    unreadCount: this.unreadCount,
                    totalCount: this.messages.length
                }
            }));
        },

        /**
         * 触发全局消息通知（仅服务器消息）
         * @param {Object} msg - 服务器消息对象
         */
        triggerNotification(msg) {
            // 1. 浏览器桌面通知（需用户授权）
            if (Notification.permission === 'granted') {
                new Notification('新消息通知', {
                    title: `来自 ${msg.data?.sender || '服务器'}`,
                    body: this.getBriefContent(msg),
                    icon: '/favicon1.ico', // 替换为项目实际图标路径
                    requireInteraction: false // 是否需要用户手动关闭（false=自动关闭）
                });
            } else if (Notification.permission !== 'denied') {
                // 首次使用时请求授权（仅触发一次）
                Notification.requestPermission();
            }

            // 2. Element Plus 全局弹窗通知
            import('element-plus').then(({ ElNotification }) => {
                ElNotification({
                    title: `来自 ${msg.data?.sender || '服务器'}`,
                    message: this.getBriefContent(msg),
                    position: 'bottom-right', // 右下角显示（不遮挡主要内容）
                    duration: 4000,            // 4秒后自动关闭
                    type: 'info',              // 通知类型（info/success/warning/error）
                    showClose: true            // 显示关闭按钮
                });
            });
        },

        /**
         * 获取消息简要内容（避免通知过长）
         * @param {Object} msg - 消息对象
         * @returns {String} 简化后的内容
         */
        getBriefContent(msg) {
            // 心跳消息特殊处理（不显示具体内容）
            if (msg.data?.mesType === '9') {
                return '【系统】WebSocket心跳保活';
            }

            // 普通消息：截取前50字符，超出加省略号
            const content = msg.data?.msg || JSON.stringify(msg.data || '无内容');
            return content.length > 50 ? `${content.slice(0, 50)}...` : content;
        },

        // -------------------------- 未读消息管理 --------------------------
        /**
         * 标记单条消息为已读
         * @param {Object} msg - 消息对象
         */
        markAsRead(msg) {
            if (this.isIncomingMessage(msg) && msg.unread) {
                msg.unread = false;
                this.unreadCount = Math.max(0, this.unreadCount - 1); // 避免负数
                this.saveToStorage();
                this.emitUnreadChange(); // 通知界面更新未读计数
            }
        },

        /**
         * 标记所有消息为已读
         */
        markAllAsRead() {
            this.messages.forEach(msg => {
                if (this.isIncomingMessage(msg) && msg.unread) {
                    msg.unread = false;
                }
            });
            this.unreadCount = 0;
            this.saveToStorage();
            this.emitUnreadChange();
        },

        /**
         * 清空所有消息（含本地存储）
         */
        clearAllMessages() {
            this.messages = [];
            this.unreadCount = 0;
            this.saveToStorage();
            this.emitUnreadChange();

            // 触发全局清空事件
            window.dispatchEvent(new CustomEvent('ws:messages-cleared'));
        },

        /**
         * 触发未读计数变化事件（供导航栏等组件监听）
         */
        emitUnreadChange() {
            window.dispatchEvent(new CustomEvent('ws:unread-changed', {
                detail: { unreadCount: this.unreadCount }
            }));
        },

        // -------------------------- 心跳保活机制 --------------------------
        /**
         * 发送心跳包（核心心跳逻辑）
         */
        sendHeartbeat() {
            // 仅在连接状态下发送（避免无效请求）
            if (!this.connected || !webSocketService.isConnected) {
                console.warn('WebSocket未连接，跳过心跳发送');
                this.reconnect(); // 未连接时触发重连
                return;
            }

            try {
                // 构建心跳包（带实时时间戳和用户ID）
                const userStore = useUserStore();
                const heartbeatMsg = {
                    ...HEARTBEAT_MSG,
                    timestamp: Date.now(),
                    userId: userStore.userId || '' // 携带用户ID（按业务需求）
                };

                // 发送心跳包
                webSocketService.sendMessage(heartbeatMsg);
                // console.log(`WebSocket心跳包发送成功（${new Date().toLocaleTimeString()}）`);

                // （可选）将心跳包添加到消息列表（便于调试，可注释）
                // this.addMessage({
                //     data: heartbeatMsg,
                //     timestamp: Date.now()
                // });
            } catch (error) {
                console.error('WebSocket心跳包发送失败:', error);
                this.reconnect(); // 发送失败时触发重连
            }
        },

        /**
         * 启动心跳定时器（15秒一次）
         */
        startHeartbeat() {
            // 先停止已有定时器（避免重复启动导致多次发送）
            this.stopHeartbeat();

            // 启动新定时器
            this.heartbeatTimer = setInterval(() => {
                this.sendHeartbeat();
            }, this.heartbeatInterval);

            console.log(`WebSocket心跳机制启动（间隔：${this.heartbeatInterval / 1000}秒）`);
        },

        /**
         * 停止心跳定时器（避免内存泄漏）
         */
        stopHeartbeat() {
            if (this.heartbeatTimer) {
                clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = null;
                console.log('WebSocket心跳机制停止');
            }
        },

        // -------------------------- 连接与重连 --------------------------
        /**
         * 建立WebSocket连接（主入口）
         * @param {String} token - 用户认证token
         * @param {String} userId - 用户ID
         * @returns {Promise} 连接结果
         */
        async connect(token, userId) {
            // 1. 状态判断（避免重复连接）
            if (this.connected) {
                console.log('WebSocket已处于连接状态，无需重复连接');
                return Promise.resolve('已连接');
            }

            // 2. 重置重连计数
            this.reconnectCount = 0;

            try {
                // 3. 清理旧资源（事件+定时器）
                this.unbindEvents();
                this.stopHeartbeat();

                // 4. 存储用户ID（供心跳包使用）
                webSocketService.userId = userId;

                // 5. 绑定新事件处理器
                this.bindEvents();

                // 6. 调用WebSocket服务建立连接
                await webSocketService.connect(token); // 假设webSocketService.connect返回Promise

                // 7. 连接成功后发送认证信息（按业务需求）
                webSocketService.sendMessage({
                    userId,
                    mesType: '10',       // 约定：mesType=10 为认证消息
                    contentType: '',
                    content: '用户认证',
                    timestamp: Date.now()
                });

                console.log('WebSocket连接建立成功');
                return Promise.resolve('连接成功');
            } catch (error) {
                console.error('WebSocket连接失败:', error);
                // 连接失败时触发重连
                this.reconnect(token, userId);
                return Promise.reject(error);
            }
        },

        /**
         * 自动重连（失败后重试，有次数限制）
         * @param {String} token - 用户认证token
         * @param {String} userId - 用户ID
         */
        reconnect(token, userId) {
            // 1. 限制重连次数（避免无限循环）
            if (this.reconnectCount >= this.maxReconnectCount) {
                console.error(`WebSocket重连次数已达上限（${this.maxReconnectCount}次），停止重连`);
                this.connected = false;
                this.stopHeartbeat();
                return;
            }

            // 2. 递增重连计数
            this.reconnectCount++;

            // 3. 延迟重连（指数退避：1s、2s、4s...避免频繁请求）
            const delay = Math.pow(2, this.reconnectCount) * 1000; // 1s, 2s, 4s...
            console.log(`WebSocket第${this.reconnectCount}次重连（延迟${delay / 1000}秒）`);

            setTimeout(async () => {
                try {
                    await this.connect(token, userId);
                } catch (error) {
                    // 重连失败时继续重试（会触发下一次reconnect）
                    console.error(`WebSocket第${this.reconnectCount}次重连失败`, error);
                }
            }, delay);
        },

        /**
         * 绑定WebSocket事件处理器（连接、消息、关闭、错误）
         */
        bindEvents() {
            // 1. 连接成功事件
            this.handlers.onOpen = () => {
                this.connected = true;
                this.connectTimestamp = Date.now();
                this.startHeartbeat(); // 连接成功后启动心跳
                this.reconnectCount = 0; // 重置重连计数

                // 触发全局连接成功事件
                window.dispatchEvent(new CustomEvent('ws:connected', { detail: true }));
            };

            // 2. 接收消息事件
            this.handlers.onMessage = (data) => {
                console.log('WebSocket收到消息:', data);
                // 包装成统一格式并添加到列表
                // this.addMessage({
                //     data,
                //     timestamp: Date.now()
                // });
            };

            // 3. 连接关闭事件
            this.handlers.onClose = (event) => {
                this.connected = false;
                this.stopHeartbeat(); // 关闭时停止心跳

                console.log(`WebSocket连接关闭（代码：${event.code}，原因：${event.reason}）`);
                // 触发全局连接关闭事件
                window.dispatchEvent(new CustomEvent('ws:connected', { detail: false }));

                // 非主动关闭时触发重连（code=1000为正常关闭）
                if (event.code !== 1000) {
                    const userStore = useUserStore();
                    this.reconnect(userStore.token, userStore.userId);
                }
            };

            // 4. 连接错误事件
            this.handlers.onError = (error) => {
                this.connected = false;
                this.stopHeartbeat(); // 错误时停止心跳

                console.error('WebSocket连接错误:', error);
                // 触发全局错误事件
                window.dispatchEvent(new CustomEvent('ws:error', { detail: error }));

                // 错误时触发重连
                const userStore = useUserStore();
                this.reconnect(userStore.token, userStore.userId);
            };

            // 5. 订阅WebSocket服务的事件
            webSocketService.on('open', this.handlers.onOpen);
            webSocketService.on('message', this.handlers.onMessage);
            webSocketService.on('close', this.handlers.onClose);
            webSocketService.on('error', this.handlers.onError);
        },

        /**
         * 解绑WebSocket事件处理器（避免内存泄漏）
         */
        unbindEvents() {
            if (this.handlers.onOpen) {
                webSocketService.off('open', this.handlers.onOpen);
            }
            if (this.handlers.onMessage) {
                webSocketService.off('message', this.handlers.onMessage);
            }
            if (this.handlers.onClose) {
                webSocketService.off('close', this.handlers.onClose);
            }
            if (this.handlers.onError) {
                webSocketService.off('error', this.handlers.onError);
            }
            this.handlers = {}; // 清空处理器引用
        },

        /**
         * 主动关闭WebSocket连接（含资源清理）
         */
        disconnect() {
            if (this.connected) {
                // 1. 停止心跳和事件
                this.stopHeartbeat();
                this.unbindEvents();

                // 2. 主动关闭连接（发送正常关闭码1000）
                webSocketService.close(1000, '用户主动关闭');

                // 3. 更新状态
                this.connected = false;
                console.log('WebSocket已主动关闭');
            }
        }
    }
});

export default useWebSocketStore;
