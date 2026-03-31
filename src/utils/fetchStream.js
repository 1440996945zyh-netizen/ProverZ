import { getToken, setToken, removeToken } from '@/utils/auth/token'
import { ElNotification, ElMessageBox, ElMessage } from 'element-plus'
import errorCode from '@/utils/constant/errorCode'
import router from '@/router/index'
import useUserStore from '@/store/modules/user'

let isRelogin = { show: false }
const baseURL = import.meta.env.VITE_APP_BASE_API || 'http://localhost:9092/wfppm'

export default async function fetchStream(url, options = {}) {
	const config = {
		...options,
		headers: {
			'Content-Type': 'application/json',
			token: getToken(),
			...options.headers,
		},
	}

	try {
		const fullUrl = `${baseURL}${url}`
		const response = await fetch(fullUrl, config)

		const newToken = response.headers.get('token')
		if (newToken) {
			setToken(newToken)
		}

		const contentType = response.headers.get('content-type')

		if (contentType && contentType.includes('text/event-stream')) {
			return response
		} else if (contentType && contentType.includes('application/json')) {
			const errorData = await response.json()
			const code = errorData.code || '0000'
			const msg = errorCode[code] || errorData.msg || errorCode['default']

			if (code === 401) {
				if (!isRelogin.show) {
					isRelogin.show = true
					ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
						confirmButtonText: '重新登录',
						cancelButtonText: '取消',
						type: 'warning',
					})
						.then(() => {
							isRelogin.show = false
							useUserStore()
								.logOut()
								.then(() => {
									location.href = '/index'
								})
						})
						.catch(() => {
							isRelogin.show = false
						})
				}
				return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
			} else if (code === 500) {
				ElMessage({ message: msg, type: 'error' })
				return Promise.reject(new Error(msg))
			} else if (code === 601) {
				ElMessage({ message: msg, type: 'warning' })
				return Promise.reject(new Error(msg))
			} else if (code === '0002' || code === '0100' || code === '0004' || code === '0001') {
				ElNotification.error({ title: msg })
				removeToken()
				router.push('/login')
				return Promise.reject(code)
			} else if (code !== '0000') {
				ElNotification.error({ title: msg })
				return Promise.reject(new Error(msg))
			} else {
				return response
			}
		} else {
			const errorText = await response.text()
			ElMessage.error(`未知响应类型或错误: ${response.status} ${response.statusText}`)
			return Promise.reject(new Error(errorText || 'Unknown response type'))
		}
	} catch (error) {
		console.log('err' + error)
		let { message } = error
		if (message == 'Network Error' || message.includes('Failed to fetch')) {
			message = '后端接口连接异常'
		} else if (message.includes('timeout')) {
			message = '系统接口请求超时'
		}
		ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
		return Promise.reject(error)
	}
}
