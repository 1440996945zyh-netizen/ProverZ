// src/store/modules/webSocket.js
import { defineStore } from 'pinia';
import { webSocketService } from '@/utils/common/webSocket';
import useUserStore from './user';
import { useRouter } from 'vue-router';
import publicApi from '@/api/public/index'

// -------------------------- 常量配置（补充不可恢复错误码） --------------------------
const WS_MSG_STORAGE_KEY = 'ws_messages';
const WS_UNREAD_COUNT_KEY = 'ws_unread_count';
const MIN_STABLE_DURATION = 5000;// 连接稳定阈值（低于此值视为不稳定）
const MAX_RECONNECT_INTERVAL = 30000;
const UNRECOVERABLE_ERROR_CODES = ['0004']; // 异地登录等不可恢复错误
const WS_ERROR_CODES = { NORMAL_CLOSURE: 1000, ABNORMAL_CLOSURE: 1006, POLICY_VIOLATION: 1008 };
const FAST_RECONNECT_LIMIT = 3;
const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_MSG = { mesType: '9', type: 'ping', contentType: '', content: 'heartbeat', timestamp: Date.now() };

// 重连策略配置
const RECONNECT_STRATEGY = { initialDelay: 1000, maxDelay: 30000, backoffFactor: 1.5, maxAttempts: 10, retryAfterPause: 60000 };
//webSocket发送消息枚举
const MESCONNECT_PERSON = {
    mesType: "30",//消息类型
    contentType: "0",//（消息类型，0个人1群体）、
    mesShowType: "0",//（消息展示类型，0通知1弹窗确认）、
    content: "",//消息内容
    receiverAccount: "",//接收人账号
    senderAccount: "",//发送人账号
    // isOffline: "",//（是否离线，0否1是）
}

const MESCONNECT_GROUP = {
    mesType: "30",//消息类型
    contentType: "1",//（消息类型，0个人1群体）、
    mesShowType: "0",//（消息展示类型，0通知1弹窗确认）、
    content: "",//消息内容
    deptId: "",//部门id
    postCode: "",//岗位编码
    senderAccount: "",//发送人账号
    // isOffline: "",//（是否离线，0否1是）
}
// -------------------------- Store定义 --------------------------
const useWebSocketStore = defineStore('webSocket', {
    state: () => ({
        connected: false,
        connectTimestamp: null,

        reconnectCount: 0, // 重连次数
        isReconnecting: false, // 新增：重连状态锁（防止并行重连）
        maxReconnectCount: RECONNECT_STRATEGY.maxAttempts,
        messages: [],
        unreadCount: 0,
        handlers: {},
        heartbeatTimer: null,
        heartbeatInterval: HEARTBEAT_INTERVAL,
        lastConnectDuration: 0,
        fastReconnectCount: 0,
        isUnrecoverableError: false, // 不可恢复错误标记
        unrecoverableErrorMsg: '',   // 错误描述
        isPaused: false,             // 重连暂停标记
        lastReconnectAttempt: 0,     // 上次重连时间
        lastCloseCode: null,         // 上次关闭错误码
        mesConnectPerson: MESCONNECT_PERSON,
        mesConnectGroup: MESCONNECT_GROUP
    }),

    getters: {
        unreadMessages(state) {
            return state.messages.filter(msg => msg.unread && this.isIncomingMessage(msg) && ['30', '40'].includes(msg.data?.mesType));
        },
        totalMessageCount(state) { return state.messages.length; },
        connectStatusText(state) {
            if (state.isUnrecoverableError) return `连接失败：${state.unrecoverableErrorMsg}`;
            if (state.isPaused) return '重连已暂停，等待手动操作';
            return state.connected ? '已连接' : '未连接';
        }
    },

    actions: {
        // -------------------------- 基础初始化与清理 --------------------------
        /**
   * 从localStorage恢复消息和未读状态（页面刷新后保留）
   */
        initFromStorage() {
            try {
                const storedMsgs = localStorage.getItem(WS_MSG_STORAGE_KEY);
                const storedUnread = localStorage.getItem(WS_UNREAD_COUNT_KEY);

                if (storedMsgs) this.messages = JSON.parse(storedMsgs);
                if (storedUnread) this.unreadCount = Number(storedUnread);
                // console.log('WebSocket状态从本地存储恢复成功');
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
        resetUnrecoverableError() {
            this.isUnrecoverableError = false;
            this.unrecoverableErrorMsg = '';
            this.isPaused = false;
        },

        // -------------------------- 核心：不可恢复错误处理（修复结构识别） --------------------------
        /**
         * 检查响应是否包含不可恢复错误（支持code在根节点或data下）
         * @param {Object} response - 后端返回的任何响应（消息/关闭原因/错误）
         */
        checkUnrecoverableError(response) {
            if (!response) return;

            // 关键修复：同时检查根节点code和data下的code（适配日志中的消息结构）
            const errorCode = response.code || response.data?.code;
            const isUnrecoverable = UNRECOVERABLE_ERROR_CODES.includes(errorCode);

            if (isUnrecoverable) {
                this.isUnrecoverableError = true;
                this.unrecoverableErrorMsg = response.msg || response.data?.msg || '账号异常，请重新登录';
                this.stopReconnectAndClean(); // 立即阻断所有重连
                console.error(`触发不可恢复错误[${errorCode}]：${this.unrecoverableErrorMsg}`);
            }
        },

        /**
         * 标记不可恢复错误后，彻底清理资源（阻断重连的关键）
         */
        stopReconnectAndClean() {
            // 1. 停止所有定时器和事件
            this.stopHeartbeat();
            this.unbindEvents();

            // 2. 阻断重连状态
            this.reconnectCount = this.maxReconnectCount; // 触发重连上限
            this.fastReconnectCount = FAST_RECONNECT_LIMIT;
            this.isPaused = true;

            // 3. 关闭当前连接（用1008码标识政策原因，区别于正常关闭）
            if (webSocketService.isConnected) {
                webSocketService.close(WS_ERROR_CODES.POLICY_VIOLATION, this.unrecoverableErrorMsg);
            }

            // 4. 清除用户信息（核心：避免用无效token反复重连）
            const userStore = useUserStore();
            userStore.logout(); // 需确保userStore.logout清除token和userId
            localStorage.removeItem('token'); // 双重保险：清除本地存储的token
        },

        // -------------------------- 消息处理（优先检查错误，再过滤类型） --------------------------


        /**
         * 获取消息简要内容（避免通知过长）
         * @param {Object} msg - 消息对象
         * @returns {String} 简化后的内容
         */
        getBriefContent(msg) {
            // console.log('msg =>', msg);
            // 心跳消息特殊处理（不显示具体内容）
            if (msg.data?.mesType === '9') {
                return '【系统】WebSocket心跳保活';
            }

            // 普通消息：截取前50字符，超出加省略号
            const content = msg.data?.content || JSON.stringify(msg.data || '无内容');
            return content.length > 50 ? `${content.slice(0, 50)}...` : content;
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
         * 接收消息处理（修复：先检查错误，再过滤mesType）
         */
        addMessage(msg) {
            // console.log('msg =>', msg);

            // 若已标记不可恢复错误，直接忽略所有消息
            if (this.isUnrecoverableError) return;

            const formatMsg = {
                data: msg.data || {},
                timestamp: msg.timestamp || Date.now(),
                unread: false
            };

            if (this.isIncomingMessage(formatMsg)) {
                formatMsg.unread = true;
                this.unreadCount++;
                // 获取消息展示类型，默认为0
                const mesShowType = formatMsg.data.data?.mesShowType || '0';

                // 根据mesShowType使用不同通知方式
                if (mesShowType == '0') {
                    // 普通通知
                    this.triggerNotification(formatMsg);
                } else if (mesShowType == '1') {
                    // 弹窗确认通知
                    this.showConfirmationDialog(formatMsg);
                }
            }

            this.messages.push(formatMsg);
            this.saveToStorage();
            window.dispatchEvent(new CustomEvent('ws:message-added', {
                detail: { msg: formatMsg, unreadCount: this.unreadCount, totalCount: this.messages.length }
            }));
        },
        /**
             * 显示带确认按钮的弹窗通知
             * @param {Object} msg - 格式化后的消息对象
             */
        showConfirmationDialog(msg) {
            import('element-plus').then(({ ElMessageBox, ElMessage }) => {
                ElMessageBox.confirm(
                    this.getBriefContent(msg.data),
                    `来自 ${msg.data.data?.sender || '服务器'} 的消息`,
                    {
                        confirmButtonText: '确认',
                        cancelButtonText: '取消',
                        type: 'info',
                        closeOnClickModal: false,
                        closeOnPressEscape: false
                    }
                ).then(async () => {
                    // 点击确认按钮，调用API更新消息状态 离线状态并且是弹窗走接口 在线弹窗暂时不走接口
                    if (msg.data.data.isOffline == '1') {
                        try {
                            // 调用接口
                            const response = await publicApi.updateMessageStatus({
                                ...msg.data.data
                            })
                            if (response.code == '0000') {
                                ElMessage.success('已确认消息');
                                // 更新消息状态
                                msg.isConfirmed = true;
                                msg.unread = false;
                                this.unreadCount = Math.max(0, this.unreadCount - 1);
                                this.saveToStorage();
                            } else {
                                ElMessage.error('更新消息状态失败');
                            }
                        } catch (error) {
                            console.error('调用确认API失败:', error);
                            ElMessage.error('确认操作失败，请稍后重试');
                        }
                    } else {
                        ElMessage.success('已确认消息');
                        // 更新消息状态
                        msg.isConfirmed = true;
                        msg.unread = false;
                        this.unreadCount = Math.max(0, this.unreadCount - 1);
                        this.saveToStorage();
                    }

                }).catch(() => {
                    // 点击取消按钮，仅标记为已读但不更新服务器状态
                    msg.unread = false;
                    this.unreadCount = Math.max(0, this.unreadCount - 1);
                    this.saveToStorage();
                });
            });
        },
        /**
         * 通知逻辑（强化0004错误的强制提示）
         */
        triggerNotification(msg) {
            // 不可恢复错误：显示强制登录弹窗（无法关闭，必须操作）
            if (this.isUnrecoverableError) {
                import('element-plus').then(({ ElMessageBox }) => {
                    // 阻止用户忽略：隐藏关闭按钮、禁用遮罩点击、禁用ESC
                    ElMessageBox.alert(
                        `<div>${this.unrecoverableErrorMsg}</div><div style="margin-top:8px;color:#666;">请重新登录以恢复服务</div>`,
                        '账号异常',
                        {
                            type: 'error',
                            confirmButtonText: '立即登录',
                            closeOnClickModal: false,
                            closeOnPressEscape: false,
                            showClose: false,
                            center: true
                        }
                    ).then(() => {
                        const router = useRouter();
                        router.push('/login'); // 强制跳转登录页
                    });
                });
                return;
            }

            // 普通消息通知（已移除浏览器原生通知，避免双重弹窗和遮挡）
            import('element-plus').then(({ ElNotification }) => {
                // 优先使用消息体中的 title 字段，如果没有则显示发送人或兜底“服务器”
                const displayTitle = msg.data.data?.title || `来自 ${msg.data.data?.sender || '服务器'}`;

                ElNotification({
                    title: displayTitle,
                    message: this.getBriefContent(msg.data),
                    position: 'bottom-right',
                    duration: 4000,
                    type: 'info',
                    showClose: true
                });
            });
        },

        // -------------------------- 心跳保活（增加不可恢复错误检查） --------------------------
        sendHeartbeat() {
            // 若已标记不可恢复错误，直接停止心跳
            if (this.isUnrecoverableError) {
                this.stopHeartbeat();
                return;
            }

            if (!this.connected || !webSocketService.isConnected) {
                console.warn('WebSocket未连接，跳过心跳发送');
                // 仅在无不可恢复错误时触发重连
                if (!this.isUnrecoverableError && !this.isPaused) {
                    this.reconnect();
                }
                return;
            }

            try {
                const userStore = useUserStore();
                const heartbeatMsg = { ...HEARTBEAT_MSG, timestamp: Date.now(), userId: userStore.userId || '' };
                webSocketService.sendMessage(heartbeatMsg);
            } catch (error) {
                console.error('WebSocket心跳包发送失败:', error);
                if (!this.isUnrecoverableError && !this.isPaused) {
                    this.reconnect();
                }
            }
        },
        startHeartbeat() {
            this.stopHeartbeat();
            this.heartbeatTimer = setInterval(() => {
                this.sendHeartbeat();
            }, this.heartbeatInterval);
            // console.log(`WebSocket心跳机制启动（间隔：${this.heartbeatInterval / 1000}秒）`);
        },
        stopHeartbeat() {
            if (this.heartbeatTimer) {
                clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = null; // 置空，避免残留引用
                console.log('WebSocket心跳定时器已清除');
            }
            // 额外检查：若有其他隐藏定时器（如webSocketService内部的），一并清除
            if (window.__ws_heartbeat_timer__) { // 假设其他定时器有全局标识
                clearInterval(window.__ws_heartbeat_timer__);
                window.__ws_heartbeat_timer__ = null;
            }
        },

        // -------------------------- 连接与重连（全链路阻断不可恢复错误） --------------------------
        /**
         * 连接方法（保持状态同步）
         */
        async connect(token, userId) {
            // 清除可能存在的重连定时器
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }

            if (this.isReconnecting) {
                console.warn('connect方法检测到isReconnecting为true，强制重置');
                this.isReconnecting = false;
            }

            if (this.isUnrecoverableError || !token || this.isPaused || this.connected || this.isReconnecting) {
                const errMsg = this.isUnrecoverableError ? this.unrecoverableErrorMsg : '连接条件不满足';
                console.warn(`WebSocket 连接拒绝：${errMsg}`);
                this.triggerNotification({});
                return Promise.reject(new Error(errMsg));
            }

            const connectStartTime = Date.now();
            try {
                this.unbindEvents();
                this.stopHeartbeat();
                webSocketService.userId = userId;
                this.bindEvents();

                await webSocketService.connect(token);

                webSocketService.sendMessage({
                    userId, mesType: '10', contentType: '', content: '用户认证', timestamp: Date.now()
                });

                this.connected = true;
                this.connectTimestamp = Date.now();
                this.lastConnectDuration = Date.now() - connectStartTime;
                this.startHeartbeat();
                this.isReconnecting = false;
                console.log('WebSocket 连接建立成功');
                return Promise.resolve('连接成功');
            } catch (error) {
                console.error('WebSocket 连接失败:', error);
                this.isReconnecting = false;
                if (!this.isUnrecoverableError && !this.isPaused && !this.connected) {
                    // 连接失败后延迟触发重连，避免立即重试
                    setTimeout(() => {
                        this.reconnect(token, userId);
                    }, 1000);
                }
                return Promise.reject(error);
            }
        },
        /**
 * webSocket重连核心代码（优化重连时间计算）
 */
        reconnect(token, userId) {
            // 防抖：如果上次重连尝试不到0.5秒前，跳过
            const now = Date.now();
            if (now - this.lastReconnectAttempt < 500) {
                console.warn('重连请求过于频繁，已跳过');
                return;
            }

            // 关键修复1：isReconnecting状态强制检查与重置
            if (this.isReconnecting && (now - this.lastReconnectAttempt > 30000)) {
                console.warn('检测到isReconnecting状态锁死（超过30秒），强制重置');
                this.isReconnecting = false;
            }

            // 阻断条件：保留原有逻辑，但增加isReconnecting的日志说明
            if (this.isUnrecoverableError || !token || this.isPaused || this.connected || this.isReconnecting) {
                console.warn(`WebSocket 重连条件不满足，跳过。状态详情：
            isUnrecoverableError: ${this.isUnrecoverableError},
            有Token: ${!!token},
            isPaused: ${this.isPaused},
            connected: ${this.connected},
            isReconnecting: ${this.isReconnecting}`);
                this.isReconnecting = false;
                return;
            }

            // 重连次数上限处理
            if (this.reconnectCount >= RECONNECT_STRATEGY.maxAttempts) {
                this.isPaused = true;
                this.isReconnecting = false;
                this.lastReconnectAttempt = Date.now();

                import('element-plus').then(({ ElMessageBox }) => {
                    const self = this;
                    ElMessageBox({
                        title: '重连失败',
                        message: `已尝试重连${RECONNECT_STRATEGY.maxAttempts}次失败，可能是服务器维护中`,
                        type: 'warning',
                        showConfirmButton: true,
                        showCancelButton: true,
                        confirmButtonText: '继续等待',
                        cancelButtonText: '手动连接',
                        closeOnClickModal: false,
                        distinguishCancelAndClose: true,
                        customClass: 'reconnect-modal',
                        appendToBody: true
                    }).then(() => {
                        self.isPaused = false;
                        self.isReconnecting = false;
                        self.reconnectCount = Math.floor(RECONNECT_STRATEGY.maxAttempts / 2);
                        const userStore = useUserStore();
                        self.reconnect(userStore.token, userStore.userId);
                    }).catch(action => {
                        if (action === 'cancel') {
                            self.manualReconnect();
                        } else if (action === 'close') {
                            self.isPaused = true;
                            self.isReconnecting = false;
                        }
                    });

                    // 添加"关闭连接"按钮
                    const modal = document.querySelector('.reconnect-modal .el-message-box__btns');
                    if (modal) {
                        const closeBtn = document.createElement('button');
                        closeBtn.className = 'el-button el-button--danger';
                        closeBtn.textContent = '关闭连接';
                        closeBtn.onclick = () => {
                            self.disconnect();
                            self.isPaused = true;
                            self.reconnectCount = 0;
                            self.isReconnecting = false;
                            ElMessageBox.close();
                        };
                        modal.appendChild(closeBtn);
                    }
                });
                return;
            }

            // -------------------------- 优化1：重连延迟计算逻辑 --------------------------
            let delay;
            const baseDelay = RECONNECT_STRATEGY.initialDelay || 1000;
            const maxDelay = RECONNECT_STRATEGY.maxDelay || 30000;

            // 计算抖动延迟（±10%），避免多个客户端同时重连
            const jitter = 0.9 + Math.random() * 0.2; // 0.9-1.1之间的随机数

            // 基于重连次数的指数退避算法，但增长更平缓
            if (this.lastCloseCode === WS_ERROR_CODES.ABNORMAL_CLOSURE) {
                // 异常关闭使用更快的重连策略
                delay = Math.min(baseDelay * Math.pow(1.5, this.reconnectCount), maxDelay);
            } else {
                // 正常关闭使用标准指数退避
                delay = Math.min(baseDelay * Math.pow(2, this.reconnectCount / 2), maxDelay);
            }

            // 应用抖动并取整
            delay = Math.round(delay * jitter);

            // -------------------------- 优化2：控制重连定时器，避免叠加 --------------------------
            // 清除可能存在的旧定时器
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
            }

            // 执行重连准备
            if (!this.isReconnecting) {
                this.reconnectCount++;
                this.lastReconnectAttempt = now;
                this.isReconnecting = true;
                console.log(`WebSocket 第${this.reconnectCount}次重连（延迟${Math.round(delay / 1000)}秒，当前时间: ${new Date().toLocaleTimeString()}`);
            }

            // 使用实例变量保存定时器，方便后续清除
            this.reconnectTimeout = setTimeout(async () => {
                const currentAttempt = this.reconnectCount;
                // 获取最新Token
                const userStore = useUserStore();
                const latestToken = userStore.token;
                const latestUserId = userStore.userId;
                try {
                    if (this.isUnrecoverableError || this.isPaused || this.connected) {
                        console.log(`第${currentAttempt}次重连取消：状态已变化`);
                        return;
                    }


                    if (!latestToken) {
                        console.error(`第${currentAttempt}次重连失败：Token已失效`);
                        return;
                    }

                    // console.log(`开始执行第${currentAttempt}次实际连接（使用最新Token）`);
                    await this.connect(latestToken, latestUserId);
                    // console.log(`第${currentAttempt}次重连成功！`);

                    // 成功后重置重连计数
                    this.reconnectCount = 0;
                } catch (error) {
                    console.error(`第${currentAttempt}次重连失败:`, error.message || error);
                    // 失败后仅在状态有效时才继续重连
                    if (!this.isUnrecoverableError && !this.isPaused && !this.connected) {
                        // 延迟触发下一次重连，避免立即重试
                        setTimeout(() => {
                            this.reconnect(latestToken || token, latestUserId || userId);
                        }, 1000);
                    }
                } finally {
                    if (this.isReconnecting && this.reconnectCount === currentAttempt) {
                        // console.log(`第${currentAttempt}次重连流程结束，重置isReconnecting为false`);
                        this.isReconnecting = false;
                    }
                    // 清除当前定时器引用
                    this.reconnectTimeout = null;
                }
            }, delay);
        },

        /**
      * 手动重连方法（保持状态重置）
      */
        manualReconnect() {
            // console.log('执行手动重连，强制清理所有状态');
            // 清除可能存在的重连定时器
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }

            const userStore = useUserStore();
            const latestToken = userStore.token;
            const latestUserId = userStore.userId;

            if (!latestToken) {
                console.error('无有效Token，无法执行手动重连');
                import('element-plus').then(({ ElMessage }) => {
                    ElMessage.error('Token已失效，请重新登录');
                });
                return;
            }

            // 强制重置所有状态
            this.isPaused = false;
            this.isReconnecting = false;
            this.reconnectCount = 0;
            this.lastCloseCode = null;
            this.lastReconnectAttempt = 0;

            if (this.connected || webSocketService.isConnected) {
                // console.log('手动重连前，关闭旧连接');
                this.disconnect();
            }

            setTimeout(async () => {
                // console.log('手动触发WebSocket连接');
                try {
                    await this.connect(latestToken, latestUserId);
                } catch (err) {
                    console.error('手动连接失败，1秒后重试:', err);
                    setTimeout(() => {
                        this.reconnect(latestToken, latestUserId);
                    }, 1000);
                }
            }, 500);
        },

        /**
         * 手动重连
         */
        manualReconnect() {
            const userStore = useUserStore();
            this.isPaused = false;
            this.reconnectCount = 0;
            this.isReconnecting = false;
            this.reconnect(userStore.token, userStore.userId);
            // console.log('WebSocket 手动重连触发');
        },
        // -------------------------- 事件绑定（全链路检查错误） --------------------------
        bindEvents() {
            // 1. 连接成功事件（保持不变）
            this.handlers.onOpen = () => {
                this.connected = true;
                this.connectTimestamp = Date.now();
                this.reconnectCount = 0;
                this.startHeartbeat();
                window.dispatchEvent(new CustomEvent('ws:connected', { detail: true }));
            };

            // 2. 接收消息事件（修复：先检查错误，再处理消息）
            this.handlers.onMessage = (data) => {
                // console.log('WebSocket收到消息:', data);
                try {
                    const messageData = typeof data === 'string' ? JSON.parse(data) : data;

                    // 关键修复：优先检查消息中的不可恢复错误（如0004）
                    this.checkUnrecoverableError(messageData);
                    // 若已标记错误，直接返回，不处理后续逻辑
                    if (this.isUnrecoverableError) {
                        return;
                    }

                    // 原有mesType过滤逻辑（仅处理40）
                    if (messageData?.data?.mesType === "40") {
                        this.addMessage({ data: messageData, timestamp: Date.now() });
                    } else if (messageData?.data?.mesType === "9") {
                        // console.log('收到心跳反馈，忽略处理');
                    } else {
                        // console.log(`忽略非40类型消息，mesType: ${messageData.data?.mesType || '未知'}`);
                    }
                } catch (error) {
                    console.error('解析WebSocket消息失败:', error);
                    // 解析失败也检查错误（防止消息格式异常但包含code）
                    this.checkUnrecoverableError(data);
                }
            };

            // 3. 关闭事件（修复：不可恢复错误直接阻断重连）
            this.handlers.onClose = (event) => {
                this.connected = false;
                this.stopHeartbeat();
                this.lastCloseCode = event.code;

                if (this.connectTimestamp) {
                    this.lastConnectDuration = Date.now() - this.connectTimestamp;
                }

                // console.log(`WebSocket连接关闭（持续${this.lastConnectDuration}ms，代码：${event.code}，原因：${event.reason || '无'}）`);
                window.dispatchEvent(new CustomEvent('ws:connected', { detail: false }));

                // 阻断重连的情况：不可恢复错误/手动关闭
                if (this.isUnrecoverableError || webSocketService.isManualClose) {
                    console.warn('WebSocket 关闭后不触发重连');
                    this.isReconnecting = false;
                    return;
                }


                // 触发重连（使用最新用户 Token）
                const userStore = useUserStore();
                if (!this.isPaused && userStore.token) {
                    this.reconnect(userStore.token, userStore.userId);
                }
            };

            // 4. 错误事件（修复：检查错误中的code）
            this.handlers.onError = (error) => {
                this.connected = false;
                this.stopHeartbeat();
                this.isReconnecting = false; // 错误时重置锁
                console.error('WebSocket 错误:', error);
                window.dispatchEvent(new CustomEvent('ws:error', { detail: error }));

                // 检查错误中的不可恢复码
                try {
                    let errorResponse = error.response?.data || (error.message?.startsWith('{') && JSON.parse(error.message));
                    this.checkUnrecoverableError(errorResponse);
                } catch (e) {
                    console.log('错误信息解析失败:', e.message);
                }

                // 触发重连
                const userStore = useUserStore();
                if (!this.isUnrecoverableError && !this.isPaused && userStore.token) {
                    this.reconnect(userStore.token, userStore.userId);
                }
            };

            // 订阅事件
            webSocketService.on('open', this.handlers.onOpen);
            webSocketService.on('message', this.handlers.onMessage);
            webSocketService.on('close', this.handlers.onClose);
            webSocketService.on('error', this.handlers.onError);
        },
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
            this.handlers = {};
        },
        disconnect() {
            if (this.connected) {
                this.stopHeartbeat();
                this.unbindEvents();
                webSocketService.close(1000, '用户主动断开'); // 触发 isManualClose = true
                this.connected = false;
                console.log('WebSocket 主动关闭成功');
            }
        },
        // -------------------------- 新增：通用错误处理方法 --------------------------
        /**
         * 处理无法解析的通用错误
         */
        handleGenericError() {
            if (!this.isUnrecoverableError) {
                const userStore = useUserStore();
                // 检查用户是否仍登录状态
                if (userStore.token) {
                    this.reconnect(userStore.token, userStore.userId);
                } else {
                    console.log('用户未登录，停止WebSocket重连');
                }
            }
        },
        /**
         * 标记所有未读消息为已读
         */
        markAllAsRead() {
            // 过滤出所有未读消息并标记为已读
            const unreadMessages = this.messages.filter(msg => msg.unread);
            if (unreadMessages.length === 0) {
                // console.log('没有未读消息需要标记');
                return;
            }

            unreadMessages.forEach(msg => {
                msg.unread = false;
            });

            // 重置未读计数
            this.unreadCount = 0;

            // 保存到本地存储
            this.saveToStorage();

            console.log(`已将${unreadMessages.length}条未读消息标记为已读`);

            // 触发事件通知其他组件
            window.dispatchEvent(new CustomEvent('ws:all-read', {
                detail: {
                    totalCount: this.messages.length,
                    unreadCount: this.unreadCount
                }
            }));
        },
        /**
 * 清空所有消息记录
 */
        clearAllMessages() {
            // 保存清空前的消息数量用于日志
            const clearedCount = this.messages.length;

            // 清空消息数组
            this.messages = [];
            // 重置未读计数
            this.unreadCount = 0;

            // 更新本地存储
            this.saveToStorage();

            console.log(`已清空所有${clearedCount}条消息记录`);

            // 触发事件通知其他组件
            window.dispatchEvent(new CustomEvent('ws:all-cleared', {
                detail: {
                    totalCleared: clearedCount,
                    remainingCount: this.messages.length,
                    unreadCount: this.unreadCount
                }
            }));
        },

    }
});

export default useWebSocketStore;
