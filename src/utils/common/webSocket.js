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
    // 核心状态
    this.ws = null; // WebSocket实例
    this.isConnected = false; // 连接状态
    this.isManualClose = false; // 是否手动关闭（用于区分自动重连场景）

    // 配置参数（可根据实际需求调整）
    this.url = this.getWsUrl(); // WebSocket连接地址
    this.reconnectInterval = 3000; // 重连间隔（毫秒）
    this.maxReconnectAttempts = 10; // 最大重连次数（-1表示无限重连）
    this.reconnectCount = 0; // 当前重连次数

    // 事件监听器存储（用于外部订阅事件）
    this.eventListeners = {};

    this.token = getToken()
  }

  /**
   * 获取WebSocket连接地址（从环境变量读取，自动区分ws/wss）
   */
  getWsUrl() {
    // 从Vite环境变量获取基础地址（需在.env文件中配置VITE_WS_BASE_URL）
    const baseUrl = import.meta.env.VITE_WS_BASE_URL;
    if (!baseUrl) {
      console.error('请在.env文件中配置VITE_WS_BASE_URL（WebSocket基础地址）');
      return '';
    }

    // 自动根据当前页面协议切换ws/wss
    return window.location.protocol === 'https:'
      ? baseUrl.replace('http:', 'ws:').replace('https:', 'wss:')
      : baseUrl.replace('https:', 'wss:').replace('http:', 'ws:');
  }

  /**
   * 建立WebSocket连接
   * @returns {Promise} 连接结果Promise
   */
  connect(token) {
    return new Promise((resolve, reject) => {
      // 避免重复连接
      if (this.isConnected) {
        resolve('已处于连接状态');
        return;
      }

      // 重置手动关闭状态（重新连接时视为自动连接）
      this.isManualClose = false;

      // 验证URL有效性
      if (!this.url) {
        const error = new Error('WebSocket连接地址无效');
        reject(error);
        this.emit('error', error);
        return;
      }
      const fullUrl = this.url + `/api/websocket?token=${encodeURIComponent(token)}`

      // 创建WebSocket实例
      this.ws = new WebSocket(fullUrl);

      // 连接成功回调
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectCount = 0; // 重置重连计数
        console.log(`WebSocket已连接到: ${this.url}`);
        this.emit('open'); // 触发open事件
        resolve('连接成功');
      };

      // 接收消息回调
      this.ws.onmessage = (event) => {
        try {
          // 尝试解析JSON格式消息（如果服务端返回JSON）
          const data = JSON.parse(event.data);
          console.log("data===>", data)
          this.emit('message', data); // 触发message事件（传递解析后的数据）
        } catch (error) {
          // 非JSON格式消息直接传递原始数据
          console.warn('收到非JSON格式消息:', event.data);
          this.emit('message', event.data);
        }
      };

      // 连接关闭回调
      this.ws.onclose = (event) => {
        this.isConnected = false;
        console.log(`WebSocket连接关闭（代码: ${event.code}，原因: ${event.reason}）`);
        this.emit('close', event); // 触发close事件

        // 自动重连逻辑（非手动关闭且未超过最大重连次数）
        if (!this.isManualClose &&
          (this.maxReconnectAttempts === -1 || this.reconnectCount < this.maxReconnectAttempts)) {
          this.reconnectCount++;
          console.log(`准备第${this.reconnectCount}次重连（间隔${this.reconnectInterval}ms）`);
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      // 连接错误回调
      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.emit('error', error); // 触发error事件
        reject(error);
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
