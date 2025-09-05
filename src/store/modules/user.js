import { login, logout, getInfo } from '../../api/login'
import { getToken, setToken, removeToken } from '../../utils/auth/token'
import { defineStore } from 'pinia'

import useWebSocketStore from './webSocket'; // 引入WebSocket Store
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
	}),
	actions: {

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

						// 登录成功后，初始化WebSocket连接（核心修改：调用WebSocket Store）
						const wsStore = useWebSocketStore();
						wsStore.initFromStorage(); // 从本地存储恢复消息
						wsStore.connect(this.token, this.userId)
							.then(() => console.log('WebSocket初始化成功'))
							.catch(err => console.warn('WebSocket初始化失败（不影响登录）:', err));

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
