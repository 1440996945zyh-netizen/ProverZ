<template>
	<div class="user-container">
		<!-- 个人信息卡片 -->
		<div class="user-info-card">
			<div class="avatar-wrapper">
				<img class="avatar" src="../../../assets/images/dili.jpeg" alt="用户头像" />
			</div>
			<div class="user-base-info">
				<div class="info-item">
					<span class="info-label">用户姓名：</span>
					<span class="info-value">{{ userStore.name }}</span>
				</div>
				<div class="info-item">
					<span class="info-label">所属部门：</span>
					<span class="info-value">{{ userStore.user.deptName }}</span>
				</div>
				<div class="info-item">
					<span class="info-label">岗位：</span>
					<span class="info-value">{{ userStore.user.postName }}</span>
				</div>
			</div>
		</div>

		<!-- 基础设置区域 -->
		<div class="setting-section">
			<el-divider content-position="left"><span class="divider-title">基础设置</span></el-divider>
			<div class="setting-grid">
				<div class="setting-card" @click="changePassWord">
					<div class="setting-icon">
						<svg-icon icon-class="password"></svg-icon>
					</div>
					<span class="setting-text">登录密码</span>
					<el-button type="text" class="setting-btn">修改密码</el-button>
				</div>
				<div class="setting-card" @click="changePhone">
					<div class="setting-icon">
						<svg-icon icon-class="phone"></svg-icon>
					</div>
					<span class="setting-text">手机号</span>
					<el-button type="text" class="setting-btn">修改手机号</el-button>
				</div>
				<div class="setting-card" @click="changeEmail">
					<div class="setting-icon">
						<svg-icon icon-class="email"></svg-icon>
					</div>
					<span class="setting-text">邮箱</span>
					<el-button type="text" class="setting-btn">修改邮箱</el-button>
				</div>
			</div>
		</div>

		<!-- 个性化设置区域 -->
		<div class="setting-section">
			<el-divider content-position="left"><span class="divider-title">个性化</span></el-divider>
			<div class="setting-grid">
				<div class="setting-card" @click="changePageSize">
					<div class="setting-icon">
						<svg-icon icon-class="pagination"></svg-icon>
					</div>
					<span class="setting-text">分页</span>
					<el-button type="text" class="setting-btn">列表条数设置</el-button>
				</div>
				<div class="setting-card">
					<div class="setting-icon">
						<svg-icon icon-class="project"></svg-icon>
					</div>
					<span class="setting-text">关注项目</span>
					<el-button type="text" class="setting-btn">关注项目设置</el-button>
				</div>
				<div class="setting-card">
					<div class="setting-icon">
						<svg-icon icon-class="special"></svg-icon>
					</div>
					<span class="setting-text">个性化</span>
					<el-button type="text" class="setting-btn">个性化设置</el-button>
				</div>
			</div>
		</div>

		<!-- 弹窗组件（逻辑不变，保留原功能） -->
		<Dialog v-model:visible="changeVisible" :title="title" width="30%">
			<change ref="changeRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="changeVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</span>
			</template>
		</Dialog>
		<Dialog v-model:visible="mobileVisible" :title="title" width="30%">
			<mobile ref="mobileRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="mobileVisible = false">取消</el-button>
					<el-button type="primary" @click="saveMobile">保存</el-button>
				</span>
			</template>
		</Dialog>
		<Dialog v-model:visible="emailVisible" :title="title" width="30%">
			<email ref="emailRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="emailVisible = false">取消</el-button>
					<el-button type="primary" @click="saveEmail">保存</el-button>
				</span>
			</template>
		</Dialog>
		<Dialog v-model:visible="pageVisible" title="每页数量" width="20%">
			<page ref="pageRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="pageVisible = false">取消</el-button>
					<el-button type="primary" @click="savePage">保存</el-button>
				</span>
			</template>
		</Dialog>
		<Dialog v-model:visible="followVisible" title="关注项目" width="60%" appendToBody>
			<follow ref="followRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="followVisible = false">关闭</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
// 原有逻辑不变，直接保留
import change from './change/index.vue'
import email from './email/index.vue'
import mobile from './mobile/index.vue'
import page from './page/index.vue'
import useUserStore from '@/store/modules/user'
import Dialog from '@/components/Dialog/index.vue'
import api from '@/api/system/user'
import { nextTick, getCurrentInstance, ref } from 'vue'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const title = ref('修改密码')
const changeVisible = ref(false)
const changeRef = ref()
const pageVisible = ref(false)
const pageRef = ref(false)
const followVisible = ref(false)
const mobileVisible = ref(false)
const mobileRef = ref()
const emailVisible = ref(false)
const emailRef = ref()

const changePassWord = () => {
	changeVisible.value = true
	title.value = '修改密码'
	nextTick(() => {
		changeRef.value?.resetForm()
	})
}

const save = async () => {
	if (await changeRef.value?.validate()) {
		const params = JSON.parse(JSON.stringify(changeRef.value.formData))
		proxy.$modal.confirm('确定保存？').then(() => {
			api.updateUserPwd(params.oldPassword, params.newPassword).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				changeVisible.value = false
			})
		})
	}
}

const changePhone = () => {
	mobileVisible.value = true
	title.value = '修改手机号'
	nextTick(() => {
		mobileRef.value?.resetForm()
		api.getById(userStore.userId).then(res => {
			mobileRef.value.formData.oldMobile = res.data.mobile
		})
	})
}

const saveMobile = async () => {
	if (await mobileRef.value?.validate()) {
		const params = JSON.parse(JSON.stringify(mobileRef.value.formData))
		params.id = userStore.userId
		proxy.$modal.confirm('确定保存？').then(() => {
			api.updatePhone(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				mobileVisible.value = false
			})
		})
	}
}
const changeEmail = () => {
	emailVisible.value = true
	title.value = '修改邮箱'
	nextTick(() => {
		emailRef.value?.resetForm()
		api.getById(userStore.userId).then(res => {
			emailRef.value.formData.oldEmail = res.data.email
		})
	})
}

const saveEmail = async () => {
	if (await emailRef.value?.validate()) {
		const params = JSON.parse(JSON.stringify(emailRef.value.formData))
		params.id = userStore.userId
		proxy.$modal.confirm('确定保存？').then(() => {
			api.updateEmail(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				emailVisible.value = false
			})
		})
	}
}

const changePageSize = () => {
	pageVisible.value = true
}

const savePage = async () => {
	if (await pageRef.value?.validate()) {
		const params = JSON.parse(JSON.stringify(pageRef.value.formData))
		proxy.$modal.confirm('确定保存？').then(() => {
			api.updatePageNum(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				pageVisible.value = false
				api.getPageNum().then(res => {
					userStore.pageNum = res.data ? (res.data.pageNum ? res.data.pageNum : '20') : '20'
				})
			})
		})
	}
}
</script>

<style lang="scss" scoped>
// 全局容器样式
.user-container {
	width: 100%;
	min-height: 100%;
	padding: 1rem;
	box-sizing: border-box;
}

// 个人信息卡片
.user-info-card {
	display: flex;
	align-items: center;
	padding: 2rem;
	background: #f5f7fa;
	border-radius: 0.75rem;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
	margin-bottom: 2rem;
}

.avatar-wrapper {
	width: 8rem;
	height: 8rem;
	border-radius: 50%;
	overflow: hidden;
	margin-right: 2.5rem;
	border: 4px solid #f5f7fa;
}

.avatar {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.user-base-info {
	color: #303133;
}

.info-item {
	margin-bottom: 1rem;
	font-size: 1rem;
}

.info-label {
	color: #606266;
	margin-right: 0.5rem;
}

.info-value {
	font-weight: 500;
}

// 设置区域通用样式
.setting-section {
	margin-bottom: 2.5rem;
}

.divider-title {
	font-size: 1.1rem;
	font-weight: 500;
	color: #303133;
}

// 设置项网格布局
.setting-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1.5rem;
	margin-top: 1rem;
}

// 设置项卡片样式
.setting-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 2rem 1rem;
	background: #f5f7fa;
	border-radius: 0.75rem;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	transition: all 0.3s ease;
	cursor: pointer;

	&:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		transform: translateY(-2px);
	}
}

.setting-icon {
	color: #409eff;
	width: 3.5rem;
	height: 3.5rem;
	margin-bottom: 1rem;

	.svg-icon {
		width: 100%;
		height: 100%;
	}
}

.setting-text {
	font-size: 1rem;
	color: #303133;
	margin-bottom: 1rem;
}

.setting-btn {
	color: #409eff !important;
	font-size: 0.9rem;
}

// 响应式适配
@media (max-width: 1200px) {
	.setting-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 768px) {
	.user-info-card {
		flex-direction: column;
		text-align: center;
	}

	.avatar-wrapper {
		margin-right: 0;
		margin-bottom: 1.5rem;
	}

	.setting-grid {
		grid-template-columns: 1fr;
	}
}
</style>
