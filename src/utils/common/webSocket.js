/**
 * @Author: zhangsd
 * @Date: 2025-09-05 11:06:15
 * @LastEditTime: 2025-09-05 11:06:15
 * @LastEditors: zhangsd
 * @Description: webSocket连接
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\common\webSocket.js
 */
import { getToken, setToken, removeToken } from '@/utils/auth/token.js'
class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isManualClose = false;
    this.url = this.getWsUrl();
    this.reconnectInterval = 3000;
    this.maxReconnectAttempts = 10;
    this.reconnectCount = 0;
    this.eventListeners = {};
    this.saveToken = ''; // 新增：存储登录后的 Token（用于重连）
  }

  getWsUrl() {
    const baseUrl = import.meta.env.VITE_WS_BASE_URL;
    if (!baseUrl) {
      console.error('请配置 VITE_WS_BASE_URL');
      return '';
    }
    // 自动切换 ws/wss（无需修改）
    return window.location.protocol === 'https:' 
      ? baseUrl.replace('http:', 'ws:').replace('https:', 'wss:')
      : baseUrl.replace('https:', 'wss:').replace('http:', 'ws:');
  }

  /**
   * 建立连接（存储 Token，用于重连）
   * @param {string} token - 登录后的用户 Token
   */
  connect(token) {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve('已连接');
        return;
      }
      this.isManualClose = false;
      this.saveToken = token; // 存储 Token（重连时用）

      if (!this.url) {
        const err = new Error('连接地址无效');
        reject(err);
        this.emit('error', err);
        return;
      }
      // 拼接 Token（用存储的 saveToken，确保重连时也有 Token）
      const fullUrl = `${this.url}/api/websocket?token=${encodeURIComponent(this.saveToken)}`;
      this.ws = new WebSocket(fullUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectCount = 0;
        console.log(`已连接到: ${fullUrl}`);
        this.emit('open');
        resolve('连接成功');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
        } catch (err) {
          console.warn('非JSON消息:', event.data);
          this.emit('message', event.data);
        }
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        console.log(`关闭（代码: ${event.code}，原因: ${event.reason}）`);
        this.emit('close', event);

        // 重连：传递存储的 Token（关键修改）
        if (!this.isManualClose && 
            (this.maxReconnectAttempts === -1 || this.reconnectCount < this.maxReconnectAttempts)) {
          this.reconnectCount++;
          console.log(`第${this.reconnectCount}次重连（${this.reconnectInterval}ms后）`);
          setTimeout(() => this.connect(this.saveToken), this.reconnectInterval);
        }
      };

      this.ws.onerror = (err) => {
        console.error('WebSocket错误:', err);
        this.emit('error', err);
        reject(err);
      };
    });
  }

  /**
   * 发送消息
   * @param {any} data 要发送的数据（会自动转为JSON字符串）
   * @returns {boolean} 发送成功返回true，失败返回false
   */
  sendMessage(data) {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket未连接，无法发送消息');
      return false;
    }

    try {
      // 发送JSON格式消息（与服务端约定好格式）
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
      this.emit('error', new Error(`发送消息失败: ${error.message}`));
      return false;
    }
  }

  /**
   * 手动关闭WebSocket连接（不会触发自动重连）
   */
  close() {
    if (this.ws) {
      this.isManualClose = true; // 标记为手动关闭
      this.isConnected = false;
      this.ws.close(1000, '手动关闭连接'); // 1000表示正常关闭
      this.ws = null;
      console.log('WebSocket已手动关闭');
    }
  }

  /**
   * 订阅事件
   * @param {string} eventName 事件名称（open/message/close/error）
   * @param {Function} callback 事件回调函数
   */
  on(eventName, callback) {
    if (typeof callback !== 'function') {
      console.error('事件回调必须是函数');
      return;
    }

    // 初始化事件监听器数组
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }

    // 添加回调（去重处理）
    if (!this.eventListeners[eventName].includes(callback)) {
      this.eventListeners[eventName].push(callback);
    }
  }

  /**
   * 取消订阅事件
   * @param {string} eventName 事件名称
   * @param {Function} callback 要取消的回调函数（不传则取消所有该事件的回调）
   */
  off(eventName, callback) {
    if (!this.eventListeners[eventName]) return;

    if (callback) {
      // 移除指定回调
      this.eventListeners[eventName] = this.eventListeners[eventName].filter(
        cb => cb !== callback
      );
    } else {
      // 移除所有回调
      this.eventListeners[eventName] = [];
    }
  }

  /**
   * 触发事件（内部使用）
   * @param {string} eventName 事件名称
   * @param {any} data 事件数据
   */
  emit(eventName, data) {
    if (!this.eventListeners[eventName]) return;

    // 复制一份回调数组再执行（避免执行中移除回调导致的问题）
    const callbacks = [...this.eventListeners[eventName]];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`事件${eventName}的回调执行失败:`, error);
      }
    });
  }
}

// 导出单例实例（确保全局唯一WebSocket服务）
export const webSocketService = new WebSocketService();
