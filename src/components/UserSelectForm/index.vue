<!--
 * @Author: zhangsd
 * @Date: 2025-12-17 18:07:42
 * @LastEditTime: 2025-12-18 11:30:43
 * @LastEditors: zhangsd
 * @Description: 人员选择
 * @FilePath: \view\src\components\UserSelectForm\index.vue
-->
<template>
	<Dialog v-model:visible="dialogVisible" title="人员选择" width="600">
		<el-row class="gap2" v-loading="formLoading">
			
			<el-col :span="24">
				<el-transfer
					v-model="selectedUserIdList"
					:titles="['未选', '已选']"
					filterable
					filter-placeholder="搜索成员"
					:data="transferUserList"
					:props="{ label: 'label', key: 'value' }"
					style="justify-content: center;"
				/>
			</el-col>
		</el-row>
		<template #footer>
			<el-button :disabled="formLoading || !selectedUserIdList?.length" type="primary" @click="submitForm">确 定</el-button>
			<el-button @click="dialogVisible = false">取 消</el-button>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import Dialog from '@/components/Dialog'
import publicApi from '@/api/public'
// 组件名称定义
defineOptions({ name: 'UserSelectForm' })

const { proxy } = getCurrentInstance()
const message = proxy.$message // 消息弹窗

// 定义事件（替代TS泛型写法）
const emit = defineEmits(['confirm'])

// ========== 状态管理 ==========
const userList = ref([]) // 所有用户列表（直接接口获取）
const selectedUserIdList = ref([]) // 选中的用户ID列表
const dialogVisible = ref(false) // 弹窗显示状态
const formLoading = ref(false) // 加载状态
const activityId = ref('') // 关联的业务ID

// ========== 计算属性 ==========
/** 穿梭框数据源 */
const transferUserList = computed(() => {
	return [...userList.value]
})

// ========== 核心方法 ==========
/**
 * 打开弹窗
 * @param {number} id - 关联的业务ID
 * @param {Array} selectedList - 已选中的用户列表（回显用）
 */
const open = async (id, selectedList = []) => {
	activityId.value = id
	resetForm() // 重置表单状态

	// 加载用户列表
	formLoading.value = true
	try {
		// 直接调用用户列表接口，
		const userData = await publicApi.getLocalSelect({ type: 'USER' })
		userList.value = userData.data || []
		console.log('userList.value =>', userList.value)
		// 回显已选中的用户ID
		selectedUserIdList.value = selectedList.map(item => item.id) || []
	} finally {
		formLoading.value = false
	}

	dialogVisible.value = true
}

/**
 * 提交选择结果
 */
const submitForm = () => {
	try {
		// 筛选出已选中的用户信息
		const emitUserList = userList.value.filter(user => selectedUserIdList.value.includes(user.value))
		// 触发确认事件，返回业务ID和选中的用户列表
		emit('confirm', activityId.value, emitUserList)
		message.success('选择成功')
		dialogVisible.value = false
	} catch (err) {
		message.error('操作失败')
		console.error('提交人员选择失败：', err)
	}
}

/**
 * 重置表单状态
 */
const resetForm = () => {
	userList.value = []
	selectedUserIdList.value = []
	activityId.value = ''
}

// 暴露open方法供父组件调用
defineExpose({ open })
</script>

<style lang="scss" scoped>
// 保留穿梭框样式优化
:deep() {
	.el-transfer {
		display: flex;
		height: 400px; // 固定穿梭框高度，提升体验
	}
	.el-transfer__buttons {
		display: flex !important;
		flex-direction: column-reverse;
		justify-content: center;
		gap: 20px;

		.el-transfer__button:nth-child(2) {
			margin: 0;
		}
	}
}

// 间距样式
.gap2 {
	//gap: 16px;
}
</style>