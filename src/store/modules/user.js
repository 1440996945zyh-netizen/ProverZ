import { login, logout, getInfo } from '../../api/login'
import { getToken, setToken, removeToken } from '../../utils/auth/token'
import { defineStore } from 'pinia'
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
