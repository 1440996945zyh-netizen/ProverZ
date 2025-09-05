import { login, logout, getInfo } from '../../api/login'
import { getToken, setToken, removeToken } from '../../utils/auth/token'
import { defineStore } from 'pinia'
import { webSocketService } from '@/utils/common/webSocket'
const useUserStore = defineStore('user', {
	state: () => ({
		token: getToken(),
		userAccount: '',
		userId: '',
		name: '',
		roles: [],
		permissions: ['test'],
		user: {},
		isSuperadmin: '',
		pageNum: '20',
		noticeList: {},
		// 添加WebSocket相关状态
		wsConnected: false,
		wsMessages: []
	}),
	actions: {
		/**
		* 初始化WebSocket（返回Promise，便于捕获错误）
		* 即使连接失败，也仅内部处理，不影响外部登录流程
		*/
		async initWebSocket() {
			// 仅在有token时尝试连接
			if (!this.token) return Promise.reject('无登录token，无法初始化WebSocket')

			try {
				// 1. 调用WebSocket服务的connect（假设connect返回Promise，若原服务未返回需微调，见下方备注）
				await webSocketService.connect(this.token)

				// 2. 监听连接成功事件
				webSocketService.on('open', () => {
					this.wsConnected = true
					console.log('WebSocket连接成功')
					// 发送认证信息（连接成功后执行，失败不影响）
					webSocketService.sendMessage({
						type: 'auth',
						token: this.token,
						userId: this.userId
					})
				})

				// 3. 监听消息事件
				webSocketService.on('message', (data) => {
					console.log('收到WebSocket消息:', data)
					this.wsMessages.push(data)
					this.handleWebSocketMessage(data)
				})

				// 4. 监听连接关闭事件
				webSocketService.on('close', () => {
					this.wsConnected = false
					console.log('WebSocket连接关闭（将自动重连）')
				})

				// 5. 监听WebSocket自身错误（仅内部打印，不抛出）
				webSocketService.on('error', (error) => {
					this.wsConnected = false
					console.error('WebSocket内部错误:', error)
				})

				return Promise.resolve('WebSocket初始化完成（连接结果后续异步通知）')
			} catch (error) {
				// 捕获connect过程中的同步错误（如参数错误），不向上抛出
				this.wsConnected = false
				console.error('WebSocket初始化失败:', error)
				return Promise.resolve('WebSocket初始化失败（不影响登录）') // 此处用resolve，确保不阻塞登录
			}
		},

		// 处理WebSocket消息（逻辑不变）
		handleWebSocketMessage(data) {
			
			switch (data.type) {
				case 'notice':
					this.noticeList = data.content
					break
				case 'system':
					console.log('系统消息:', data.content)
					break
				default:
					console.log('未知类型消息:', data)
			}
		},

		// 发送WebSocket消息（逻辑不变，增加连接判断）
		sendWebSocketMessage(data) {
			if (this.wsConnected) {
				webSocketService.sendMessage(data)
			} else {
				console.warn('WebSocket未连接，暂不发送消息（将在重连后尝试）')
				// 可选：添加消息队列，重连后补发（需在state中添加wsMessageQueue: []）
				// this.wsMessageQueue.push(data)
			}
		},

		// 登录
		login(userInfo) {
			const userAccount = userInfo.userAccount.trim()
			const passwd = userInfo.passwd
			const code = userInfo.code
			const uuid = userInfo.uuid
			return new Promise((resolve, reject) => {
				login(userAccount, passwd, code, uuid)
					.then(res => {
						// update by yy
						// setToken(res.headers.token)
						// this.token = res.headers.token
						this.user = res.data
						localStorage.setItem('userInfo', JSON.stringify(res.data))
						this.deptName = res.data.deptName
						this.postName = res.data.postName
						this.token = getToken()
						
						resolve()
					})
					.catch(error => {
						reject(error)
					})
			})
		},
		// 获取用户信息
		getInfo() {
			return new Promise((resolve, reject) => {
				getInfo()
					.then(res => {
						//const avatar = '';user.avatar == '' || user.avatar == null ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar

						if (res.data.roles && res.data.roles.length > 0) {
							// 验证返回的roles是否是一个非空数组
							this.roles = res.data.roles
							this.permissions = res.data.permissions
							// TODO ROLE_DEFAULT如何使用
						} else {
							this.roles = ['ROLE_DEFAULT']
						}
						this.name = res.data.userName
						this.userId = res.data.userId
						this.userAccount = res.data.userAccount
						this.deptName = res.data.deptName
						this.posts = res.data.posts
						this.isSuperadmin = res.data.isSuperadmin
						const token = getToken()
						// 若WebSocket未连接，尝试重连（不影响getInfo结果）
						if (!this.wsConnected && this.token) {
							this.initWebSocket().catch(err =>
								console.error('getInfo后WebSocket重连失败:', err)
							)
						}
						resolve(res)
					})
					.catch(error => {
						reject(error)
					})
			})
		},
		// 退出系统
		logOut() {
			return new Promise((resolve, reject) => {
				logout(this.token)
					.then(() => {
						this.token = ''
						this.roles = []
						this.permissions = []
						this.wsMessages = []
						removeToken()
						// 退出时关闭WebSocket连接
						webSocketService.close()
						this.wsConnected = false


						resolve()
					})
					.catch(error => {
						reject(error)
					})
			})
		},
	},
})

export default useUserStore
