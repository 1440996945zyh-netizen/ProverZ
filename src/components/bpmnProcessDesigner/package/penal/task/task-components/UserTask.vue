<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-19 13:44:10
 * @LastEditors: zhangsd
 * @Description: 用户任务配置
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\task\task-components\UserTask.vue
-->
<template>
	<el-form label-width="120px">
		<el-form-item label="规则类型" prop="candidateStrategy">
			<el-select v-model="userTaskForm.candidateStrategy" clearable style="width: 100%" @change="changeCandidateStrategy">
				<el-option v-for="(dict, index) in CANDIDATE_STRATEGY" :key="index" :label="dict.label" :value="dict.value" />
			</el-select>
		</el-form-item>
		<el-form-item v-if="userTaskForm.candidateStrategy == CandidateStrategy.ROLE" label="指定角色" prop="candidateParam">
			<el-select v-model="userTaskForm.candidateParam" clearable multiple style="width: 100%" @change="updateElementTask">
				<el-option v-for="item in roleOptions" :key="item.id" :label="item.name" :value="item.id" />
			</el-select>
		</el-form-item>
		<el-form-item
			v-if="
				userTaskForm.candidateStrategy == CandidateStrategy.DEPT_MEMBER ||
				userTaskForm.candidateStrategy == CandidateStrategy.DEPT_LEADER ||
				userTaskForm.candidateStrategy == CandidateStrategy.MULTI_LEVEL_DEPT_LEADER
			"
			label="指定部门"
			prop="candidateParam"
			span="24"
		>
			<el-tree-select
				ref="treeRef"
				v-model="userTaskForm.candidateParam"
				:data="deptTreeOptions"
				:props="defaultProps"
				empty-text="加载中，请稍后"
				multiple
				node-key="id"
				show-checkbox
				@change="updateElementTask"
			/>
		</el-form-item>
		<el-form-item v-if="userTaskForm.candidateStrategy == CandidateStrategy.POST" label="指定岗位" prop="candidateParam" span="24">
			<el-select v-model="userTaskForm.candidateParam" clearable multiple style="width: 100%" @change="updateElementTask">
				<el-option v-for="item in postOptions" :key="item.id" :label="item.name" :value="item.id" />
			</el-select>
		</el-form-item>
		<el-form-item v-if="userTaskForm.candidateStrategy == CandidateStrategy.USER" label="指定用户" prop="candidateParam" span="24">
			<el-select v-model="userTaskForm.candidateParam" clearable multiple style="width: 100%" @change="updateElementTask">
				<el-option v-for="item in userOptions" :key="item.id" :label="item.nickname" :value="item.id" />
			</el-select>
		</el-form-item>
		<el-form-item v-if="userTaskForm.candidateStrategy === CandidateStrategy.USER_GROUP" label="指定用户组" prop="candidateParam">
			<el-select v-model="userTaskForm.candidateParam" clearable multiple style="width: 100%" @change="updateElementTask">
				<el-option v-for="item in userGroupOptions" :key="item.id" :label="item.name" :value="item.id" />
			</el-select>
		</el-form-item>
		<el-form-item v-if="userTaskForm.candidateStrategy === CandidateStrategy.FORM_USER" label="表单内用户字段" prop="formUser">
			<el-select v-model="userTaskForm.candidateParam" clearable style="width: 100%" @change="handleFormUserChange">
				<el-option
					v-for="(item, idx) in userFieldOnFormOptions"
					:key="idx"
					:label="item.title"
					:value="item.field"
					:disabled="!item.required"
				/>
			</el-select>
		</el-form-item>
		<el-form-item v-if="userTaskForm.candidateStrategy === CandidateStrategy.FORM_DEPT_LEADER" label="表单内部门字段" prop="formDept">
			<el-select v-model="userTaskForm.candidateParam" clearable style="width: 100%" @change="updateElementTask">
				<el-option
					v-for="(item, idx) in deptFieldOnFormOptions"
					:key="idx"
					:label="item.title"
					:value="item.field"
					:disabled="!item.required"
				/>
			</el-select>
		</el-form-item>
		<el-form-item
			v-if="
				userTaskForm.candidateStrategy == CandidateStrategy.MULTI_LEVEL_DEPT_LEADER ||
				userTaskForm.candidateStrategy == CandidateStrategy.START_USER_DEPT_LEADER ||
				userTaskForm.candidateStrategy == CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER ||
				userTaskForm.candidateStrategy == CandidateStrategy.FORM_DEPT_LEADER
			"
			:label="deptLevelLabel"
			prop="deptLevel"
			span="24"
		>
			<el-select v-model="deptLevel" clearable @change="updateElementTask">
				<el-option v-for="(item, index) in MULTI_LEVEL_DEPT" :key="index" :label="item.label" :value="item.value" />
			</el-select>
		</el-form-item>
		<el-form-item v-if="userTaskForm.candidateStrategy === CandidateStrategy.EXPRESSION" label="流程表达式" prop="candidateParam">
			<el-input type="textarea" v-model="userTaskForm.candidateParam[0]" clearable style="width: 100%" @change="updateElementTask" />
			<XButton
				class="!w-1/1 mt-5px"
				type="success"
				preIcon="ep:select"
				title="选择表达式"
				size="small"
				@click="openProcessExpressionDialog"
			/>
			<!-- 选择弹窗 -->
			<ProcessExpressionDialog ref="processExpressionDialogRef" @select="selectProcessExpression" />
		</el-form-item>

		<el-form-item label="跳过表达式" prop="skipExpression">
			<el-input type="textarea" v-model="userTaskForm.skipExpression" clearable style="width: 100%" @change="updateSkipExpression" />
		</el-form-item>
	</el-form>
</template>

<script setup>
// 导入Vue3核心API
import { ref, computed, inject, watch, onMounted, onBeforeUnmount, nextTick, toRaw } from 'vue'
// 导入常量（TS枚举改为JS对象）
import { CANDIDATE_STRATEGY, CandidateStrategy, FieldPermissionType, MULTI_LEVEL_DEPT } from '../../consts.js'
// 导入工具函数
import { flattenToTree } from '@/utils/common/data.js'
import publicApi from '@/api/public'
// 导入API
// import * as RoleApi from '@/api/system/role'
// import * as DeptApi from '@/api/system/dept'
// import * as PostApi from '@/api/system/post'
// import * as UserApi from '@/api/system/user'
// import * as UserGroupApi from '@/api/bpm/userGroup'
// 导入组件
import ProcessExpressionDialog from './ProcessExpressionDialog.vue'
import { useFormFieldsPermission } from '@/components/bpmnProcessDesigner/package/penal/node'

// 定义组件名称
defineOptions({ name: 'UserTask' })

// 定义Props（移除TS类型注解）
const props = defineProps({
	id: String,
	type: String,
})
const defaultProps = ref({
	children: 'children',
	label: 'name',
	value: 'id',
	isLeaf: 'leaf',
})
// 注入全局配置
const prefix = inject('prefix')

// 响应式变量定义（移除TS类型注解）
const userTaskForm = ref({
	candidateStrategy: undefined, // 分配规则
	candidateParam: [], // 分配选项
	skipExpression: '', // 跳过表达式
})
const bpmnElement = ref()
// 获取bpmn实例（移除TS类型断言）
const bpmnInstances = () => window.bpmnInstances

// 下拉选项列表（移除TS类型注解）
const roleOptions = ref([]) // 角色列表
const deptTreeOptions = ref() // 部门树
const postOptions = ref([]) // 岗位列表
const userOptions = ref([]) // 用户列表
const userGroupOptions = ref([]) // 用户组列表

// 获取表单字段权限
// const { formFieldOptions } = useFormFieldsPermission(FieldPermissionType.READ)
const formFieldOptions = ref([
	{
		field: 'Fgyomj6yl6fnabc',
		title: '输入框',
		type: 'input',
		required: false,
	},
	{
		field: 'Fpvwmj6yl7giaec',
		title: '多行输入框',
		type: 'input',
		required: false,
	},
	{
		field: 'Ft94mj6yl8amahc',
		title: '多选框',
		type: 'checkbox',
		required: false,
	},
])

// 表单内用户字段选项, 必须是必填和用户选择器
const userFieldOnFormOptions = computed(() => {
	return formFieldOptions.value.filter(item => item.type === 'UserSelect')
})

// 表单内部门字段选项, 必须是必填和部门选择器
const deptFieldOnFormOptions = computed(() => {
	return formFieldOptions.filter(item => item.type === 'DeptSelect')
})

// 部门层级相关
const deptLevel = ref(1)
const deptLevelLabel = computed(() => {
	let label = '部门负责人来源'
	if (userTaskForm.value.candidateStrategy == CandidateStrategy.MULTI_LEVEL_DEPT_LEADER) {
		label = label + '(指定部门向上)'
	} else if (userTaskForm.value.candidateStrategy == CandidateStrategy.FORM_DEPT_LEADER) {
		label = label + '(表单内部门向上)'
	} else {
		label = label + '(发起人部门向上)'
	}
	return label
})

const otherExtensions = ref()

/** 重置表单数据 */
const resetTaskForm = () => {
	const businessObject = bpmnElement.value.businessObject
	if (!businessObject) {
		return
	}

	const extensionElements = businessObject.extensionElements ?? bpmnInstances().moddle.create('bpmn:ExtensionElements', { values: [] })

	// 解析候选策略
	userTaskForm.value.candidateStrategy = extensionElements.values?.filter(ex => ex.$type === `${prefix}:CandidateStrategy`)?.[0]?.value

	// 解析候选参数
	const candidateParamStr = extensionElements.values?.filter(ex => ex.$type === `${prefix}:CandidateParam`)?.[0]?.value

	if (candidateParamStr && candidateParamStr.length > 0) {
		if (userTaskForm.value.candidateStrategy === CandidateStrategy.EXPRESSION) {
			// 特殊：流程表达式，只有一个 input 输入框
			userTaskForm.value.candidateParam = [candidateParamStr]
		} else if (userTaskForm.value.candidateStrategy == CandidateStrategy.MULTI_LEVEL_DEPT_LEADER) {
			// 特殊：多级部门负责人，需要通过'|'分割
			userTaskForm.value.candidateParam = candidateParamStr
				.split('|')[0]
				.split(',')
				.map(item => {
					// 如果数字超出了最大安全整数范围，则将其作为字符串处理
					let num = Number(item)
					return num > Number.MAX_SAFE_INTEGER || num < -Number.MAX_SAFE_INTEGER ? item : num
				})
			deptLevel.value = +candidateParamStr.split('|')[1]
		} else if (
			userTaskForm.value.candidateStrategy == CandidateStrategy.START_USER_DEPT_LEADER ||
			userTaskForm.value.candidateStrategy == CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER
		) {
			userTaskForm.value.candidateParam = +candidateParamStr
			deptLevel.value = +candidateParamStr
		} else if (userTaskForm.value.candidateStrategy == CandidateStrategy.FORM_DEPT_LEADER) {
			userTaskForm.value.candidateParam = candidateParamStr.split('|')[0]
			deptLevel.value = +candidateParamStr.split('|')[1]
		} else {
			userTaskForm.value.candidateParam = candidateParamStr.split(',').map(item => {
				// 如果数字超出了最大安全整数范围，则将其作为字符串处理
				let num = Number(item)
				return num > Number.MAX_SAFE_INTEGER || num < -Number.MAX_SAFE_INTEGER ? item : num
			})
		}
	} else {
		userTaskForm.value.candidateParam = []
	}

	// 过滤其他扩展字段
	otherExtensions.value =
		extensionElements.values?.filter(ex => ex.$type !== `${prefix}:CandidateStrategy` && ex.$type !== `${prefix}:CandidateParam`) ?? []

	// 解析跳过表达式
	if (businessObject.skipExpression != undefined) {
		userTaskForm.value.skipExpression = businessObject.skipExpression
	} else {
		userTaskForm.value.skipExpression = ''
	}
}

/** 更新 candidateStrategy 字段时，清空 candidateParam 并触发 bpmn 图更新 */
const changeCandidateStrategy = () => {
	userTaskForm.value.candidateParam = []
	deptLevel.value = 1
	updateElementTask()
}

/** 选中选项时，更新 bpmn 图 */
const updateElementTask = () => {
	let candidateParam = Array.isArray(userTaskForm.value.candidateParam)
		? userTaskForm.value.candidateParam.join(',')
		: userTaskForm.value.candidateParam

	// 特殊处理多级部门情况
	if (
		userTaskForm.value.candidateStrategy == CandidateStrategy.MULTI_LEVEL_DEPT_LEADER ||
		userTaskForm.value.candidateStrategy == CandidateStrategy.FORM_DEPT_LEADER
	) {
		candidateParam += '|' + deptLevel.value
	}
	// 特殊处理发起人部门负责人、发起人连续部门负责人
	if (
		userTaskForm.value.candidateStrategy == CandidateStrategy.START_USER_DEPT_LEADER ||
		userTaskForm.value.candidateStrategy == CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER
	) {
		candidateParam = deptLevel.value + ''
	}

	// 创建扩展元素
	const extensions = bpmnInstances().moddle.create('bpmn:ExtensionElements', {
		values: [
			...otherExtensions.value,
			bpmnInstances().moddle.create(`${prefix}:CandidateStrategy`, {
				value: userTaskForm.value.candidateStrategy,
			}),
			bpmnInstances().moddle.create(`${prefix}:CandidateParam`, {
				value: candidateParam,
			}),
		],
	})

	// 更新bpmn属性
	bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), {
		extensionElements: extensions,
	})
}

/** 更新跳过表达式 */
const updateSkipExpression = () => {
	if (userTaskForm.value.skipExpression && userTaskForm.value.skipExpression !== '') {
		bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), {
			skipExpression: userTaskForm.value.skipExpression,
		})
	} else {
		bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), {
			skipExpression: null,
		})
	}
}

// 流程表达式弹窗相关
const processExpressionDialogRef = ref()
const openProcessExpressionDialog = async () => {
	processExpressionDialogRef.value.open()
}
const selectProcessExpression = expression => {
	userTaskForm.value.candidateParam = [expression.expression]
	updateElementTask()
}

/** 表单用户字段变更处理 */
const handleFormUserChange = e => {
	if (e === 'PROCESS_START_USER_ID') {
		userTaskForm.value.candidateParam = []
		userTaskForm.value.candidateStrategy = CandidateStrategy.START_USER
	}
	updateElementTask()
}

// 监听props.id变化，更新表单数据
watch(
	() => props.id,
	() => {
		bpmnElement.value = bpmnInstances().bpmnElement
		nextTick(() => {
			resetTaskForm()
		})
	},
	{ immediate: true }
)

// 挂载时加载数据
onMounted(async () => {
	// 加载角色列表

	// roleOptions.value = await RoleApi.getSimpleRoleList()
	// 加载部门树
	// const deptOptions = await DeptApi.getSimpleDeptList()
  const deptResData = await publicApi.getDeptList()
  deptTreeOptions.value = flattenToTree(deptResData.data, 'id')
	// 加载岗位列表
	// postOptions.value = await PostApi.getSimplePostList()
	// 加载用户列表
	const userResData = await publicApi.getLocalSelect({ type: 'USER' })
	userOptions.value = userResData.data.map(item => ({
		nickname: item.label,
		id: item.value,
	})) || []
	// userOptions.value = await UserApi.getSimpleUserList()
	// 加载用户组列表
	// userGroupOptions.value = await UserGroupApi.getUserGroupSimpleList()
})

// 卸载时清空引用
onBeforeUnmount(() => {
	bpmnElement.value = null
})
</script>