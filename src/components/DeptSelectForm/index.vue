<!--
 * @Author: zhangsd
 * @Date: 2025-12-17 17:08:47
 * @LastEditTime: 2025-12-18 16:34:27
 * @LastEditors: zhangsd
 * @Description: 部门选择
 * @FilePath: \view\src\components\DeptSelectForm\index.vue
-->

<template>
	<Dialog v-model:visible="dialogVisible" title="部门选择" width="600px">
        <div style="height: 400px;">
            <el-row v-loading="formLoading">
			<el-col :span="24">
				<div class="content-wrap h-full">
					<el-tree
						ref="treeRef"
						:data="deptTree"
						:props="defaultProps"
						show-checkbox
						:check-strictly="checkStrictly"
						check-on-click-node
						default-expand-all
						highlight-current
						node-key="id"
						@check="handleCheck"
					/>
				</div>
			</el-col>
		</el-row>
        </div>
		
		<template #footer>
			<el-button :disabled="formLoading || !selectedDeptIds?.length" type="primary" @click="submitForm">确 定</el-button>
			<el-button @click="dialogVisible = false">取 消</el-button>
		</template>
	</Dialog>
</template>
<script>
export default {
	name: 'DeptSelectForm',
}
</script>
<script setup>
import { ref, nextTick } from 'vue'
import Dialog from '@/components/Dialog'
import { ElMessage } from 'element-plus'

import  publicApi  from '@/api/public'

const emit = defineEmits(['confirm']) // 定义 emit 事件
const { proxy } = getCurrentInstance()
// --- Props ---
const props = defineProps({
	// 是否严格的遵循父子不互相关联
	checkStrictly: {
		type: Boolean,
		default: false,
	},
	// 是否支持多选
	multiple: {
		type: Boolean,
		default: true,
	},
})

// --- Refs ---
const treeRef = ref()
const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const defaultProps = ref({
	children: 'children',
	label: 'deptName',
	value: 'id',
	isLeaf: 'leaf',
})
// --- Reactive Data ---
const deptTree = ref([]) // 部门树形结构，
const selectedDeptIds = ref([]) // 选中的部门 ID 列表，

/** 打开弹窗 */
const open = async selectedList => {
	// 移除参数类型
	resetForm()
	formLoading.value = true
	try {
		// 加载部门列表
		const deptData = await publicApi.getDeptList()
		deptTree.value = proxy.flattenToTree(deptData.data, 'id', 'parentId', 'children')
		console.log('deptTree.value =>', deptTree.value)
	} finally {
		formLoading.value = false
	}
	dialogVisible.value = true
	// 设置已选择的部门
	if (selectedList?.length) {
		await nextTick()
		// 过滤掉 undefined/null 的 id 并转换为数字
		const selectedIds = selectedList
			.map(dept => dept.id) // 移除类型断言
			.filter(id => id !== undefined && id !== null)
			.map(id => Number(id)) // 确保是数字类型
		selectedDeptIds.value = selectedIds
		treeRef.value?.setCheckedKeys(selectedIds)
	}
	console.log('dialogVisible.value =>', dialogVisible.value)
}

/** 处理选中状态变化 */
const handleCheck = (data, checked) => {
	// 移除参数类型
	selectedDeptIds.value = treeRef.value.getCheckedKeys()
	if (!props.multiple && selectedDeptIds.value.length > 1) {
		// 单选模式下，只保留最后选择的节点
		const lastSelectedId = selectedDeptIds.value[selectedDeptIds.value.length - 1]
		selectedDeptIds.value = [lastSelectedId]
		treeRef.value.setCheckedKeys([lastSelectedId])
	}
}

/** 提交选择 */
const submitForm = async () => {
	try {
		// 获取选中的完整部门数据
		const checkedNodes = treeRef.value.getCheckedNodes()
		ElMessage.success('选择成功') // 使用 ElMessage
		dialogVisible.value = false
		emit('confirm', checkedNodes)
	} finally {
		// 空的 finally 块可以移除，除非有特殊用途
	}
}

/** 重置表单 */
const resetForm = () => {
	deptTree.value = []
	selectedDeptIds.value = []
	if (treeRef.value) {
		treeRef.value.setCheckedKeys([])
	}
}

// --- Expose ---
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>

<style scoped>
/* 如果原项目中有 ContentWrap 的全局样式，可以移除此定义，否则保留 */
.content-wrap {
	/* 原 ContentWrap 可能包含的样式，根据实际情况调整 */
	padding: 20px;
	height: 400px; /* 示例高度，根据实际需要调整 */
	overflow-y: auto;
}

.h-full {
	height: 100%;
}
</style>