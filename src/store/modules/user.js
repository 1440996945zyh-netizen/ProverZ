import { login, logout, getInfo } from '../../api/login'
import { getToken, setToken, removeToken } from '../../utils/auth/token'
import { defineStore } from 'pinia'
import api from '@/api/system/user'
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
						const token = res.headers.token;
						if (token) {
							// 2. 将 Token 保存到 Pinia 的 state 中
							this.token = token;
							// 3. 将 Token 持久化到 localStorage 中
							setToken(token);
						}
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
						api.getPageNum().then(res => {
							this.pageNum = res.data ? (res.data.pageNum ? res.data.pageNum : '20') : '20'
						})
						this.name = res.data.userName
						this.userId = res.data.userId
						this.userAccount = res.data.userAccount
						this.deptName = res.data.deptName
						this.posts = res.data.posts
						this.isSuperadmin = res.data.isSuperadmin
						const token = getToken()
						// 若WebSocket未连接，尝试重连（不影响getInfo结果）

						// 在 userStore.getInfo() 的成功回调中修改
						const wsStore = useWebSocketStore();
						wsStore.initFromStorage();
						// 新增：若已连接，则不重复调用connect
						if (!wsStore.connected && !wsStore.isUnrecoverableError && !wsStore.isPaused) {
							wsStore.connect(this.token, this.userId)
								.then(() => console.log('WebSocket初始化成功'))
								.catch(err => console.warn('WebSocket初始化失败（不影响登录）:', err));
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
						// 获取WebSocket实例
						const wsStore = useWebSocketStore();

						// 1. 先关闭WebSocket连接（无论后端请求是否成功都执行）
						try {
							// 1. 先关闭WebSocket
							wsStore.disconnect();
							// 2. 重置wsStore所有状态（关键：清除残留定时器和状态）
							wsStore.$reset(); // 若使用Pinia，$reset()可重置所有state
							// 3. 清除webSocketService的残留状态
							webSocketService.isConnected = false;
							webSocketService.ws = null;
							console.log('登出时WebSocket资源已彻底清理');
						} catch (error) {
							console.error('关闭WebSocket失败:', error);
						}

						this.token = ''
						this.roles = []
						this.permissions = []
						removeToken()
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
