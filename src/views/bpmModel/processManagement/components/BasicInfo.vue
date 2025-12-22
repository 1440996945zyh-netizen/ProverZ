<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 13:38:46
 * @LastEditTime: 2025-12-18 11:31:53
 * @LastEditors: zhangsd
 * @Description: 基本信息
 * @FilePath: \view\src\views\bpmModel\processManagement\components\BasicInfo.vue
-->
<template>
	<div class="app-containers">
		<el-form ref="formRef" :model="modelData" :rules="rules" label-width="120px" class="form-margin-top-20">
			<el-form-item label="流程标识" prop="key" class="form-item-gap">
				<div class="flex-align-center">
					<el-input v-model="modelData.key" :disabled="!!modelData.id" placeholder="请输入流程标识，以字母或下划线开头" />
					<div class="modelIcon">
						<el-tooltip
							class="item"
							:content="modelData.id ? '流程标识不可修改！' : '新建后，流程标识不可修改！'"
							effect="light"
							placement="top"
						>
							<el-icon class="margin-left-5"><QuestionFilled /></el-icon>
						</el-tooltip>
					</div>
				</div>
			</el-form-item>

			<el-form-item label="流程名称" prop="name" class="form-item-gap">
				<el-input v-model="modelData.name" :disabled="!!modelData.id" clearable placeholder="请输入流程名称" />
			</el-form-item>

			<el-form-item label="流程分类" prop="category" class="form-item-gap">
				<el-select class="width-full" v-model="modelData.category" clearable placeholder="请选择流程分类">
					<el-option v-for="category in categoryList" :key="category.code" :label="category.name" :value="category.code" />
				</el-select>
			</el-form-item>

			<!-- <el-form-item label="流程图标" class="form-item-gap">
				<UploadImg v-model="modelData.icon" :limit="1" height="64px" width="64px" />
			</el-form-item> -->

			<el-form-item label="流程描述" prop="description" class="form-item-gap">
				<el-input v-model="modelData.description" clearable type="textarea" />
			</el-form-item>

			<el-form-item label="流程类型" prop="type" class="form-item-gap">
				<el-radio-group v-model="modelData.type">
					<el-radio v-for="dict in dictBpmModelType" :key="dict.value" :value="dict.value">
						{{ dict.label }}
					</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item label="是否可见" prop="visible" class="form-item-gap">
				<el-radio-group v-model="modelData.visible">
					<el-radio v-for="dict in dictTypeMap" :key="dict.value" :value="dict.value">
						{{ dict.label }}
					</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item label="谁可以发起" prop="startUserType" class="form-item-gap">
				<el-select v-model="modelData.startUserType" placeholder="请选择谁可以发起" @change="handleStartUserTypeChange">
					<el-option label="全员" :value="0" />
					<el-option label="指定人员" :value="1" />
					<el-option label="指定部门" :value="2" />
				</el-select>

				<div v-if="modelData.startUserType === 1" class="margin-top-16 flex flex-wrap gap-16">
					<div v-for="user in selectedStartUsers" :key="user.id" class="tag-item">
						<el-avatar class="margin-5-important" :size="28" v-if="user.avatar" :src="user.avatar" />
						<el-avatar class="margin-5-important" :size="28" v-else>
							{{ user.name.substring(0, 1) }}
						</el-avatar>
						{{ user.name }}
						<el-icon class="margin-left-8 close-icon" @click="handleRemoveStartUser(user)"><Close /></el-icon>
					</div>
					<el-button type="primary" link @click="openStartUserSelect">
						<el-icon><Plus /></el-icon>
						选择人员
					</el-button>
				</div>

				<div v-if="modelData.startUserType === 2" class="margin-top-16 flex flex-wrap gap-16">
					<div v-for="dept in selectedStartDepts" :key="dept.id" class="tag-item">
						<el-icon class="margin-5-important font-size-20"><Discount /></el-icon>
						{{ dept.deptName }}
						<el-icon class="margin-left-8 close-icon" @click="handleRemoveStartDept(dept)"><Close /></el-icon>
					</div>
					<el-button type="primary" link @click="openStartDeptSelect">
						<el-icon><Plus /></el-icon>
						选择部门
					</el-button>
				</div>
			</el-form-item>

			<el-form-item label="流程管理员" prop="managerUserIds" class="form-item-gap">
				<div class="flex flex-wrap gap-16">
					<div v-for="user in selectedManagerUsers" :key="user.id" class="tag-item">
						<el-avatar class="margin-5-important" :size="28" v-if="user.avatar" :src="user.avatar" />
						<el-avatar class="margin-5-important" :size="28" v-else>
							{{ user.name.substring(0, 1) }}
						</el-avatar>
						{{ user.name }}
						<el-icon class="margin-left-8 close-icon" @click="handleRemoveManagerUser(user)"><Close /></el-icon>
					</div>
					<el-button type="primary" link @click="openManagerUserSelect">
						<el-icon><Plus /></el-icon>
						选择人员
					</el-button>
				</div>
			</el-form-item>
		</el-form>

		<!-- 用户选择弹窗 -->
		<UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />

		<!-- 部门选择弹窗 -->
		<DeptSelectForm ref="deptSelectFormRef" :multiple="true" :check-strictly="true" @confirm="handleDeptSelectConfirm" />
	</div>
</template>

<script setup>
defineOptions({
	name: 'BasicInfo',
})
import { ref, watch } from 'vue'
// import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum, DICT_TYPE } from '@/utils/bpm/constantEnumeration'
import DeptSelectForm from '@/components/DeptSelectForm'
import UserSelectForm from '@/components/UserSelectForm'
// 定义组件属性
const props = defineProps({
	categoryList: {
		type: Array,
		required: true,
	},
	userList: {
		type: Array,
		required: true,
	},
	deptList: {
		type: Array,
		required: true,
	},
})
const dictTypeMap = ref([
	{
		label: '是',
		value: true,
	},
	{
		label: '否',
		value: false,
	},
])
const dictBpmModelType = ref([
	{
		label: 'BPMN 设计器',
		value: 10,
	},
])
// 表单相关引用
const formRef = ref()
const selectedStartUsers = ref([])
const selectedStartDepts = ref([])
const selectedManagerUsers = ref([])
const userSelectFormRef = ref()
const deptSelectFormRef = ref()
const currentSelectType = ref('start') // 'start' | 'manager'

// 表单验证规则
const rules = {
	name: [{ required: true, message: '流程名称不能为空', trigger: 'blur' }],
	key: [
		{ required: true, message: '流程标识不能为空', trigger: 'blur' },
		{
			validator: (_, value, callback) => {
				if (!value) {
					callback()
					return
				}
				if (!/^[a-zA-Z_][\-_.0-9_a-zA-Z$]*$/.test(value)) {
					callback(new Error('只能包含字母、数字、下划线、连字符和点号，且必须以字母或下划线开头'))
					return
				}
				callback()
			},
			trigger: 'blur',
		},
	],
	category: [{ required: true, message: '流程分类不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '是否可见不能为空', trigger: 'blur' }],
	visible: [{ required: true, message: '是否可见不能为空', trigger: 'blur' }],
	managerUserIds: [{ required: true, message: '流程管理员不能为空', trigger: 'blur' }],
}

// 双向绑定数据
const modelData = defineModel({})

// 初始化选中的用户和部门
watch(
	() => modelData.value,
	newVal => {
		if (newVal.startUserIds?.length) {
			selectedStartUsers.value = props.userList.filter(user => newVal.startUserIds.includes(user.id))
		} else {
			selectedStartUsers.value = []
		}

		if (newVal.startDeptIds?.length) {
			selectedStartDepts.value = props.deptList.filter(dept => newVal.startDeptIds.includes(dept.id))
		} else {
			selectedStartDepts.value = []
		}

		if (newVal.managerUserIds?.length) {
			selectedManagerUsers.value = props.userList.filter(user => newVal.managerUserIds.includes(user.id))
			
		} else {
			selectedManagerUsers.value = []
		}
		console.log('newVal =>', newVal)
	},
	{ immediate: true }
)

/** 打开发起人选择 */
const openStartUserSelect = () => {
	currentSelectType.value = 'start'
	console.log('selectedStartUsers.value =>', selectedStartUsers.value);
	userSelectFormRef.value.open(0, selectedStartUsers.value)
}

/** 打开部门选择 */
const openStartDeptSelect = () => {
	deptSelectFormRef.value.open( selectedStartDepts.value)
}

/** 打开管理员选择 */
const openManagerUserSelect = () => {
	currentSelectType.value = 'manager'
	userSelectFormRef.value.open(0, selectedManagerUsers.value)
}

/** 处理用户选择确认 */
const handleUserSelectConfirm = (_, users) => {
	console.log('users =>', users)
	if (currentSelectType.value === 'start') {
		modelData.value = {
			...modelData.value,
			startUserIds: users.map(u => u.value),
		}
	} else {
		modelData.value = {
			...modelData.value,
			managerUserIds: users.map(u => u.value),
		}
	}
}

/** 处理部门选择确认 */
const handleDeptSelectConfirm = depts => {
	modelData.value = {
		...modelData.value,
		startDeptIds: depts.map(d => d.id),
	}
}

/** 处理发起人类型变化 */
const handleStartUserTypeChange = value => {
	if (value === 0) {
		modelData.value = {
			...modelData.value,
			startUserIds: [],
			startDeptIds: [],
		}
	} else if (value === 1) {
		modelData.value = {
			...modelData.value,
			startDeptIds: [],
		}
	} else if (value === 2) {
		modelData.value = {
			...modelData.value,
			startUserIds: [],
		}
	}
}

/** 移除发起人 */
const handleRemoveStartUser = user => {
	modelData.value = {
		...modelData.value,
		startUserIds: modelData.value.startUserIds.filter(id => id !== user.id),
	}
}

/** 移除部门 */
const handleRemoveStartDept = dept => {
	modelData.value = {
		...modelData.value,
		startDeptIds: modelData.value.startDeptIds.filter(id => id !== dept.id),
	}
}

/** 移除管理员 */
const handleRemoveManagerUser = user => {
	modelData.value = {
		...modelData.value,
		managerUserIds: modelData.value.managerUserIds.filter(id => id !== user.id),
	}
}

/** 表单校验 */
const validate = async () => {
	await formRef.value?.validate()
}

// 暴露组件方法
defineExpose({
	validate,
})
</script>

<style lang="scss" scoped>
// 基础布局样式
.flex {
	display: flex;
}

.flex-wrap {
	flex-wrap: wrap;
}

.flex-align-center {
	align-items: center;
	display: flex;
	width: 100%;
	position: relative;
	.modelIcon {
		position: absolute;
		right: -20px;
	}
}

.width-full {
	width: 100% !important;
}

// 间距样式
.form-margin-top-20 {
	margin-top: 20px;
}

.margin-top-16 {
	margin-top: 16px;
}

.margin-left-5 {
	margin-left: 5px;
}

.margin-left-8 {
	margin-left: 8px;
}

.margin-5-important {
	margin: 5px !important;
}

.gap-16 {
	gap: 16px;
}

// 字体样式
.font-size-20 {
	font-size: 20px;
}

// 表单项间距样式
.form-item-gap {
	margin-bottom: 20px;
}

// 标签项样式
.tag-item {
	background-color: var(--el-bg-color-light);
	height: 35px;
	border-radius: 50px;
	display: inline-flex;
	align-items: center;
	padding-right: 8px;
	color: var(--el-text-color-secondary);
	transition: all 0.3s;

	&:hover {
		background-color: var(--el-fill-color);
	}

	.close-icon {
		font-size: 14px;
		color: var(--el-text-color-placeholder);
		transition: color 0.3s;
		cursor: pointer;

		&:hover {
			color: var(--el-color-danger);
		}
	}
}
</style>