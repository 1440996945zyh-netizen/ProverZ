<template>
	<div class="user">
		<div class="information">
			<div class="avatar">
				<img style="width: 6.25rem; height: 6.25rem" src="../../../assets/images/dili.jpeg" />
			</div>
			<div>
				<div class="info">
					<span>用户姓名：</span>
					<span>{{ userStore.name }}</span>
				</div>
				<div class="info">
					<span>所属部门：</span>
					<span>{{ userStore.user.deptName }}</span>
				</div>
				<div class="info">
					<span>岗位：</span>
					<span>{{ userStore.user.postName }}</span>
				</div>
			</div>
		</div>
		<div class="change">
			<div class="change_content">
				<div class="icon">
					<svg-icon icon-class="password"></svg-icon>
				</div>
				<span class="text">登录密码</span>
				<el-button @click="changePassWord">修改密码</el-button>
			</div>
			<div class="change_content">
				<div class="icon">
					<svg-icon icon-class="phone"></svg-icon>
				</div>
				<span class="text">手机号</span>
				<el-button>修改手机号</el-button>
			</div>
			<div class="change_content">
				<div class="icon">
					<svg-icon icon-class="email"></svg-icon>
				</div>
				<span class="text">邮箱</span>
				<el-button>修改邮箱</el-button>
			</div>
		</div>
		<!-- <el-divider><span style="color: #606266">个性化</span></el-divider> -->
		<div class="change">
			<div class="change_content">
				<div class="icon">
					<svg-icon icon-class="pagination"></svg-icon>
				</div>
				<span class="text">分页</span>
				<el-button @click="changePageSize">列表条数设置</el-button>
			</div>
			<div class="change_content">
				<div class="icon">
					<svg-icon icon-class="project"></svg-icon>
				</div>
				<span class="text">关注项目</span>
				<el-button @click="setFollow">关注项目设置</el-button>
			</div>
			<div class="change_content">
				<div class="icon">
					<svg-icon icon-class="special"></svg-icon>
				</div>
				<span class="text">个性化</span>
				<el-button>个性化设置</el-button>
			</div>
		</div>
	</div>
	<Dialog v-model:visible="changeVisible" :title="title" width="30%">
		<change ref="changeRef" />
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="changeVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
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
</template>
<script setup>
import change from './change/index.vue'
import page from './page/index.vue'
import follow from './follow/index.vue'
import useUserStore from '@/store/modules/user'
import Dialog from '@/components/Dialog/index.vue'
import api from '@/api/system/user'
import { nextTick, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const title = ref('修改密码')
const changeVisible = ref(false)
const changePassWord = () => {
	changeVisible.value = true
	title.value = '修改密码'
	nextTick(() => {
		changeRef.value.resetForm()
	})
}

const changeRef = ref()
const save = async () => {
	if (await changeRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(changeRef.value.formData)) // 取到子组件的formData
		proxy.$modal.confirm('确定保存？').then(() => {
			api.updateUserPwd(params.oldPassword, params.newPassword).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				changeVisible.value = false
			})
		})
	}
}
const pageVisible = ref(false)
const pageRef = ref(false)
const changePageSize = () => {
	pageVisible.value = true
}
// 保存
const savePage = async () => {
	if (await pageRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(pageRef.value.formData)) // 取到子组件的formData
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
const followVisible = ref(false)
const setFollow = () => {
	followVisible.value = true
}
</script>
<style lang="scss" scoped>
.user {
	width: 100%;
	height: 100%;
	padding: 1.25rem;
}
.information {
	width: 100%;
	height: 11.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #606266;
	background: #f5f7fa;
	position: relative;
	.info {
		margin-bottom: 0.625rem;
	}
	.avatar {
		border-radius: 6.25rem;
		overflow: hidden;
		position: absolute;
		top: 3.125rem;
		left: 3.125rem;
	}
}
.change {
	width: 100%;
	height: 13.75rem;
	display: flex;
	justify-content: space-between;
	margin-top: 1.25rem;
	color: #606266;
	.change_content {
		width: 30%;
		height: 100%;
		background: #f5f7fa;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-around;
		.icon {
			color: rgb(51, 153, 255);
			width: 3.75rem;
			height: 3.75rem;
			.svg-icon {
				width: 100%;
				height: 100%;
			}
		}
	}
}
</style>
