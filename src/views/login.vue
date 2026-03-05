<template>
	<div class="header flex justify-between">
		<div class="header-left flex items-center">
			<img class="logo" src="@/assets/logo/logo3.png" alt="" />
			<span style="margin-left: -0.3125rem">设备管理系统</span>
		</div>
	</div>
	<div class="login">
		<div class="flex login-box">
			<div class="left-box"></div>
			<div class="right-box">
				<el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
					<div class="login-title">登录</div>
					<el-form-item prop="userAccount" style="margin-top: 1.25rem">
						<!-- <el-input
							type="text"
							v-model="loginForm.userAccount"
							size="large"
							placeholder="账号"
							prefix-icon="User"
							@keyup.enter="handleLogin"
						/> -->
						<el-input v-model="loginForm.userAccount" type="text" size="mini" auto-complete="off" placeholder="账号">
							<template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
						</el-input>
					</el-form-item>
					<el-form-item prop="passwd" style="margin-top: 3rem">
						<el-input
							type="password"
							v-model="loginForm.passwd"
							size="large"
							show-password
							placeholder="密码"
							auto-complete="off"
							@keyup.enter="handleLogin"
						>
							<template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
						</el-input>
					</el-form-item>
					<el-checkbox v-model="loginForm.rememberMe" style="margin: 1rem 0rem 1.5625rem 0rem">记住密码</el-checkbox>
					<el-form-item style="width: 100%">
						<el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="handleLogin">
							<span v-if="!loading">登 录</span>
							<span v-else>登 录 中...</span>
						</el-button>
						<div style="float: right" v-if="register">
							<router-link class="link-type" :to="'/register'">立即注册</router-link>
						</div>
					</el-form-item>
				</el-form>
			</div>
		</div>
	</div>
	<!--  底部  -->
	<div class="footer">
		<span>Copyright © 2018-2023 yangyi.vip All Rights Reserved.</span>
	</div>
</template>

<script setup>
import { getCodeImg } from '@/api/login'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/auth/jsencrypt'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
	userAccount: '',
	passwd: '',
	rememberMe: false,
	code: '',
	uuid: '',
})

const loginRules = {
	userAccount: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
	passwd: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
	code: [{ required: true, trigger: 'change', message: '请输入验证码' }],
}

// const codeUrl = ref('')
const loading = ref(false)
// 验证码开关,测试暂时关闭
// const captchaEnabled = ref(true)
const captchaEnabled = ref(false)
// 注册开关
const register = ref(false)
const redirect = ref(undefined)

function handleLogin() {
	loginForm.value.passwd = encrypt(loginForm.value.passwd)
	proxy.$refs.loginRef.validate(valid => {
		if (valid) {
			loading.value = true
			// 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
			if (loginForm.value.rememberMe) {
				Cookies.set('userAccount', loginForm.value.userAccount, { expires: 30 })
				Cookies.set('passwd', encrypt(loginForm.value.passwd), { expires: 30 })
				Cookies.set('rememberMe', loginForm.value.rememberMe, { expires: 30 })
			} else {
				// 否则移除
				Cookies.remove('userAccount')
				Cookies.remove('passwd')
				Cookies.remove('rememberMe')
			}
			// 调用action的登录方法
			userStore
				.login(loginForm.value)
				.then(() => {
					let pattern = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[!#@*&.])[a-zA-Z\d!#@*&.]*$/
					let flag = false
					if (pattern.exec(decrypt(loginForm.value.passwd))) {
						flag = false
						router.push({ path: '/', query: { flagVal: '' } })
						loading.value = false
					} else {
						flag = true
						router.push({ path: '/', query: { flagVal: '1' } })
						loading.value = false
					}
				})
				.catch(() => {
					loginForm.value.passwd = decrypt(loginForm.value.passwd)

					loading.value = false
					// 重新获取验证码
					// if (captchaEnabled.value) {
					// 	getCode()
					// }
				})
		}
	})
}
function getCookie() {
	const userAccount = Cookies.get('userAccount')
	const passwd = Cookies.get('passwd')
	const rememberMe = Cookies.get('rememberMe')
	loginForm.value = {
		userAccount: userAccount === undefined ? loginForm.value.userAccount : userAccount,
		passwd: passwd === undefined ? loginForm.value.passwd : decrypt(passwd),
		rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
	}
}
// 基准大小
const baseSize = 16
function setRem() {
	// 当前页面宽度相对于 1920宽的缩放比例，可根据自己需要修改。这里的1920是设计图的宽度
	const scale = document.documentElement.clientWidth / 1920
	// 设置页面根节点字体大小
	document.documentElement.style.fontSize = baseSize * scale + 'px'
}
// getCode()
getCookie()
onMounted(() => {
	setRem()
	// 改变窗口大小时重新设置 rem
	window.addEventListener('resize', () => {
		setRem()
	})
})
</script>

<style lang="scss" scoped>
.header {
	height: 3.125rem;
	line-height: 3.125rem;
	color: #707070;

	.header-left {
		font-weight: 700;
		font-size: 1.125rem;
		letter-spacing: 0.125rem;
	}
	.header-right {
		font-size: 1rem;
		a {
			/*color: #409eff;*/
			color: #707070;
			text-decoration: underline;
		}
	}

	// background-color: #0067d1;
	.logo {
		width: 4.375rem;
		height: 3.125rem;
		line-height: 3.125rem;
		// margin-top: -0.5rem;
	}
	margin-right: 20px;
}

.login {
	display: flex;
	justify-content: center;
	align-items: center;
	height: calc(100% - 6.25rem);
	background-image: url('../assets/images/login-bg5.jpg');
	background-size: cover;
	.login-box {
		height: 70%;
		min-height: 29.375rem;
		background-color: white;
		border-radius: 0.375rem;
		overflow: hidden;
		.left-box {
			width: 30vw;
			background-image: url('../assets/images/login-bg2.jpg');
			background-size: 100% 100%;
			background-repeat: no-repeat;
			// border-right: 0.0625rem solid #b3aeaa;
		}
		.right-box {
			width: 30vw;
			padding: 2.5rem;
			padding-top: 8%;
		}
	}
}

.title {
	margin: 0px auto 30px auto;
	text-align: center;
	color: #707070;
}

.login-form {
	border-radius: 0.375rem;
	background: #ffffff;
	width: calc(30vw - 2.5rem);
	padding: 0.9375rem 3.4375rem 0.3125rem 0rem;
	.el-input {
		height: 2.5rem;
		input {
			height: 2.5rem;
		}
	}
	.input-icon {
		height: 2.4375rem;
		width: 0.875rem;
		margin-left: 0rem;
	}
}
.login-tip {
	font-size: 13px;
	text-align: center;
	color: #bfbfbf;
}
.login-code {
	width: 33%;
	height: 40px;
	float: right;
	img {
		cursor: pointer;
		vertical-align: middle;
	}
}
.footer {
	height: 3.125rem;
	line-height: 3.125rem;
	text-align: center;
	font-family: Arial;
	font-size: 0.75rem;
	letter-spacing: 0.0625rem;
	background-color: #f5f5f6;
}
.login-code-img {
	height: 40px;
	padding-left: 12px;
}
.login-title {
	font-size: 1.8rem;
	text-align: center;
	margin-bottom: 20px;
	color: rgb(122, 126, 136);
}
:deep(.el-checkbox__label) {
	font-size: 1rem;
}
:deep(.el-input__inner) {
	font-size: 1.1rem;
}
:deep(.el-input__wrapper) {
	height: 3rem;
}

:deep(.el-form-item--default .el-form-item__content) {
	height: 3rem;
	line-height: 3rem;
}
:deep(.el-form-item--default .el-form-item__error) {
	padding-top: 0.625rem;
}
:deep(.el-button--large) {
	--el-button-size: 3rem;
}
</style>
