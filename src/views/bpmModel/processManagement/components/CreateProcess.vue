<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 11:26:00
 * @LastEditTime: 2026-02-11 10:38:22
 * @LastEditors: zhangsd
 * @Description: 创建流程
 * @FilePath: \view\src\views\bpmModel\processManagement\components\CreateProcess.vue
-->
<template>
	<div class="process-container">
		<!-- 头部导航栏 -->
		<div class="header-bar">
			<!-- 左侧标题 -->
			<div class="header-left" @click="handleBack">
				<el-icon><ArrowLeftBold /></el-icon>
				<span class="title-text" :title="formData.name || '创建流程'">
					{{ formData?.name || '创建流程' }}
				</span>
			</div>

			<!-- 步骤条 -->
			<div class="header-middle">
				<div class="step-container">
					<div
						v-for="(step, index) in steps"
						:key="index"
						class="step-item"
						:class="{ 'step-active': currentStep === index }"
						@click="handleStepClick(index)"
					>
						<div class="step-number" :class="{ 'number-active': currentStep === index }">
							{{ index + 1 }}
						</div>
						<span class="step-title">{{ step.title }}</span>
					</div>
				</div>
			</div>

			<!-- 右侧按钮 -->
			<div class="header-right">
				<el-button v-if="actionType === 'update'" type="success" @click="handleDeploy">发 布</el-button>
				<el-button type="primary" @click="handleSave">
					<span v-if="actionType === 'definition'">恢 复</span>
					<span v-else>保 存</span>
				</el-button>
			</div>
		</div>

		<!-- 主体内容 -->
		<div class="main-content" :class="{ 'is-full-screen': currentStep === 2 }">
			<el-card class="step-content-card" v-if="currentStep === 0">
				<!-- 第一步：基本信息 -->
				<div class="step-content basic-info">
					<BasicInfo
						v-model="formData"
						:categoryList="categoryList"
						:userList="userList"
						:deptList="deptList"
						ref="basicInfoRef"
					/>
				</div>
			</el-card>
			<!-- 第二步：表单设计 -->
			<el-card class="step-content-card" v-if="currentStep === 1">
				<div class="step-content form-design">
					<FormDesign v-model="formData" :formList="formList" ref="formDesignRef" />
				</div>
			</el-card>

			<!-- 第三步：流程设计 -->
			<el-card style="padding: 10px !important;" v-if="currentStep === 2">
				<ProcessDesign v-model="formData" ref="processDesignRef" />
			</el-card>

			<!-- 第四步：更多设置 -->
			<el-card class="step-content-card" v-show="currentStep === 3">
				<div class="step-content extra-settings">
					<ExtraSettings ref="extraSettingsRef" v-model="formData" />
				</div>
			</el-card>
		</div>
	</div>
</template>

<script setup>
defineOptions({
	name: 'CreateProcess',
})
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from '@/plugins/useMessage.js'
import ModelApi from '@/api/system/bpm/model/index'
import DefinitionApi from '@/api/system/bpm/definition/index'
import { BpmModelFormType, BpmModelType, BpmAutoApproveType } from '@/utils/bpm/constantEnumeration'
import BasicInfo from './BasicInfo.vue'
import FormDesign from './FormDesign.vue'
import ProcessDesign from './ProcessDesign.vue'
import publicApi from '@/api/public'
import ExtraSettings from './ExtraSettings.vue'
// import { useTagsView } from '@/hooks/web/useTagsView'
import useUserStore from '@/store/modules/user'
import { ref, reactive, watch, onMounted, onBeforeUnmount, provide, nextTick } from 'vue'
import { listDept } from '@/api/system/dept'
const route = useRoute()
const router = useRouter()
// const { delView } = useTagsViewStore()
// const tagsView = useTagsView()

const message = useMessage()
const userStore = useUserStore()
// const userStore = useUserStoreWithOut()

// 组件引用
const basicInfoRef = ref()
const formDesignRef = ref()
const processDesignRef = ref()
const extraSettingsRef = ref()

/** 步骤校验函数 */
const validateBasic = async () => {
	await basicInfoRef.value?.validate()
}

/** 表单设计校验 */
const validateForm = async () => {
	await formDesignRef.value?.validate()
}

/** 流程设计校验 */
const validateProcess = async () => {
	await processDesignRef.value?.validate()
}

const currentStep = ref(-1) // 步骤控制

const steps = [
	{ title: '基本信息', validator: validateBasic },
	{ title: '表单设计', validator: validateForm },
	{ title: '流程设计', validator: validateProcess },
	{ title: '更多设置', validator: null },
]

// 表单数据
const formData = ref({
	id: undefined,
	name: '',
	key: '',
	category: undefined,
	icon: undefined,
	description: '',
	type: BpmModelType.BPMN,
	formType: BpmModelFormType.NORMAL,
	formId: '',
	formCustomCreatePath: '',
	formCustomViewPath: '',
	visible: true,
	startUserType: undefined,
	startUserIds: [],
	startDeptIds: [],
	managerUserIds: [],
	allowCancelRunningProcess: true,
	processIdRule: {
		enable: false,
		prefix: '',
		infix: '',
		postfix: '',
		length: 5,
	},
	autoApprovalType: BpmAutoApproveType.NONE,
	titleSetting: {
		enable: false,
		title: '',
	},
	summarySetting: {
		enable: false,
		summary: [],
	},
	allowWithdrawTask: false,
	printTemplateSetting: {
		enable: false,
	},
})

// 流程数据
const processData = ref()

provide('processData', processData)
provide('modelData', formData)

// 数据列表
const formList = ref([])
const categoryList = ref([])
const userList = ref([])
const deptList = ref([])

/** 初始化数据 */
const actionType = ref('')
const initData = async () => {
	actionType.value = route.query.type
	console.log('actionType =>', actionType.value)
	if (actionType.value === 'definition') {
		// 流程定义场景（恢复）
		const definitionId = route.query.id
		const res = await DefinitionApi.getProcessDefinition(definitionId)
		const data = res.data
		data.type = data.modelType
		delete data.modelType
		data.id = data.modelId
		delete data.modelId
		if (data.simpleModel) {
			data.simpleModel = JSON.parse(data.simpleModel)
		}
		formData.value = data
		if (formData.value.type === BpmModelType.BPMN) {
			processData.value = formData.value.bpmnXml
		} else if (formData.value.type === BpmModelType.SIMPLE) {
			processData.value = formData.value.simpleModel
		}
		formData.value.startUserIds = formData.value.startUserIds || []
		formData.value.startDeptIds = formData.value.startDeptIds || []
		formData.value.startUserType = formData.value.startUserIds.length > 0 ? 1 : formData.value.startDeptIds.length > 0 ? 2 : 0
	} else if (['update', 'copy'].includes(actionType.value)) {
		console.log('update', 'copy', actionType.value)
		// 修改/复制场景
		const modelId = route.query.id
		const res = await ModelApi.getModel(modelId)
		formData.value = res.data
		formData.value.bpmnXml = res.data.bpmnXml
		if (formData.value.type === BpmModelType.BPMN) {
			processData.value = formData.value.bpmnXml
		} else if (formData.value.type === BpmModelType.SIMPLE) {
			processData.value = formData.value.simpleModel
		}
		console.log('加载流程数据', processData.value)
		formData.value.startUserIds = formData.value.startUserIds || []
		formData.value.startDeptIds = formData.value.startDeptIds || []
		formData.value.startUserType = formData.value.startUserIds.length > 0 ? 1 : formData.value.startDeptIds.length > 0 ? 2 : 0 // 复制场景处理
		if (route.query.type === 'copy') {
			delete formData.value.id
			if (formData.value.bpmnXml) {
				formData.value.bpmnXml = formData.value.bpmnXml.replaceAll(formData.value.name, formData.value.name + '副本')
				formData.value.bpmnXml = formData.value.bpmnXml.replaceAll(formData.value.key, formData.value.key + '_copy')
			}
			formData.value.name += '副本'
			formData.value.key += '_copy'
			// tagsView.setTitle('复制流程')
		}
	} else {
		formData.value = {
			id: undefined,
			name: '',
			key: '',
			category: undefined,
			icon: undefined,
			description: '',
			type: BpmModelType.BPMN,
			formType: BpmModelFormType.NORMAL,
			formId: '',
			formCustomCreatePath: '',
			formCustomViewPath: '',
			visible: true,
			startUserType: undefined,
			startUserIds: [],
			startDeptIds: [],
			managerUserIds: [],
			allowCancelRunningProcess: true,

			processIdRule: {
				enable: false,
				prefix: '',
				infix: '',
				postfix: '',
				length: 5,
			},
			autoApprovalType: BpmAutoApproveType.NONE,
			titleSetting: {
				enable: false,
				title: '',
			},
			summarySetting: {
				enable: false,
				summary: [],
			},
			allowWithdrawTask: false,
			printTemplateSetting: {
				enable: false,
			},
		}
		processData.value = undefined

		// 新增场景
		formData.value.startUserType = 0 // 全体
		formData.value.managerUserIds.push(userStore.userId)
	}
	console.log('formData.value =>', formData.value)
	// 获取表单列表
	await publicApi
		.getLocalSelect({
			type: 'BPM_FORM',
		})
		.then(res => {
			if (res.code === '0000') {
				formList.value = res.data || []
			} else {
				formList.value = []
			}
		})
		.catch(err => {
			formList.value = []
		})
	// 获取分类列表
	await publicApi
		.getLocalSelect({
			type: 'BPM_CATEGORY',
		})
		.then(res => {
			if (res.code === '0000') {
				categoryList.value =
					res.data.map(item => ({
						name: item.label,
						code: item.value,
					})) || []
				console.log('流程类型数据加载完成:', res.data)
			} else {
				ElMessage.warning('流程类型数据加载失败')
				categoryList.value = []
			}
		})
		.catch(err => {
			console.error('流程类型数据请求失败:', err)
			categoryList.value = []
		})
	// 获取用户列表
	await publicApi
		.getLocalSelect({
			type: 'USER',
		})
		.then(res => {
			if (res.code === '0000') {
				userList.value =
					res.data.map(item => ({
						name: item.label,
						id: item.value,
					})) || []
			} else {
				ElMessage.warning('用户数据加载失败')
				userList.value = []
			}
		})
		.catch(err => {
			console.error('用户数据请求失败:', err)
			users.value = []
		})
	// 获取部门列表
	const deptData = await listDept()
	deptList.value = deptData.data || []
	// await publicApi
	// 	.getLocalSelect({
	// 		type: 'USER',
	// 		types: ['post'],
	// 	})
	// 	.then(res => {
	// 		if (res.code === '0000') {
	// 			deptList.value =
	// 				res.data.map(item => ({
	// 					name: item.label,
	// 					id: item.value,
	// 				})) || []
	// 		} else {
	// 			ElMessage.warning('用户数据加载失败')
	// 			deptList.value = []
	// 		}
	// 	})
	// 	.catch(err => {
	// 		console.error('用户数据请求失败:', err)
	// 		deptList.value = []
	// 	})
	// 切换到第一步
	currentStep.value = 0

	// 兼容旧数据
	// extraSettingsRef.value.initData()
}

// /** 根据类型切换流程数据 */
// watch(
// 	() => formData.value.type,
// 	() => {
// 		console.log(BpmModelType, 'BpmModelType')

// 	},
// 	{
// 		immediate: true,
// 	},
// )

/** 校验所有步骤数据是否完整 */
const validateAllSteps = async () => {
	try {
		// 基本信息校验
		try {
			await validateBasic()
		} catch (error) {
			currentStep.value = 0
			throw new Error('请完善基本信息')
		}

		// 表单设计校验
		try {
			await validateForm()
		} catch (error) {
			currentStep.value = 1
			throw new Error('请完善自定义表单信息')
		}

		// 流程设计校验
		try {
			await validateProcess()
		} catch (error) {
			currentStep.value = 2
			throw new Error('请设计流程')
		}

		return true
	} catch (error) {
		throw error
	}
}

/** 保存操作 */
const handleSave = async () => {
	try {
		// 保存前校验
		await validateAllSteps()

		// 准备提交数据
		const modelData = {
			...formData.value,
		}

		if (actionType.value === 'definition') {
			// 恢复场景
			await ModelApi.updateModel(modelData)
			message.success('恢复成功，可点击【发布】按钮，进行发布模型')
		} else if (actionType.value === 'update') {
			// 修改场景
			await ModelApi.updateModel(modelData)
			message.success('修改成功，可点击【发布】按钮，进行发布模型')
		} else if (actionType.value === 'copy') {
			// 复制场景
			formData.value.id = await ModelApi.createModel(modelData)
			message.success('复制成功，可点击【发布】按钮，进行发布模型')
		} else {
			// 新增场景
			formData.value.id = await ModelApi.createModel(modelData)
			message.success('新建成功，可点击【发布】按钮，进行发布模型')
		}

		// 返回列表页（排除更新场景）
		if (actionType.value !== 'update') {
			await router.push({ path: '/bpmModel/processManagement' })
		}
	} catch (error) {
		console.error('保存失败:', error)
		message.warning(error.message || '请完善所有步骤的必填信息')
	}
}

/** 发布操作 */
const handleDeploy = async () => {
	try {
		// 新增场景需要确认
		if (!formData.value.id) {
			await message.confirm('是否确认发布该流程？')
		}
		// 校验所有步骤
		await validateAllSteps()

		// 准备提交数据
		const modelData = {
			...formData.value,
		}

		// 先保存数据
		if (formData.value.id) {
			await ModelApi.updateModel(modelData)
		} else {
			const result = await ModelApi.createModel(modelData)
			formData.value.id = result.id
		}

		// 发布
		await ModelApi.deployModel(formData.value.id)
		message.success('发布成功')
		// 返回列表页
		await router.push({ path: '/bpmModel/processManagement' })
	} catch (error) {
		console.error('发布失败:', error)
		message.warning(error.message || '发布失败')
	}
}

/** 步骤切换处理 */
const handleStepClick = async index => {
	try {
		if (index !== 0) {
			await validateBasic()
		}
		if (index !== 1) {
			await validateForm()
		}
		if (index !== 2) {
			await validateProcess()
		}

		// 切换步骤
		currentStep.value = index

		// 流程设计步骤需要刷新设计器
		if (index === 2) {
			console.log('流程设计步骤需要刷新设计器index', index)
			await nextTick()
			// 等待组件初始化
			await new Promise(resolve => setTimeout(resolve, 200))
			if (processDesignRef.value?.refresh) {
				await processDesignRef.value.refresh()
			}
		}
	} catch (error) {
		console.error('步骤切换失败:', error)
		message.warning('请先完善当前步骤必填信息')
	}
}

/** 返回列表页 */
const handleBack = () => {
	// 删除当前页签
	// delView(unref(router.currentRoute))
	// 跳转到列表页
	router.push({ path: '/bpmModel/processManagement' })
}
// 监听路由参数变化，当 id 或 type 变化时重新初始化数据
watch(
	() => [route.query.id, route.query.type],
	async ([newId, newType], oldValues) => {
		const [oldId, oldType] = oldValues || [] // 添加默认值处理
		console.log('路由参数变化，重新初始化数据', { newId, newType, oldId, oldType })

		// 只有当 id 或 type 真正变化时才重新初始化
		if (newId !== oldId || newType !== oldType) {
			await initData()
		}
	},
	{ immediate: true } // 首次加载也执行
)
/** 初始化 */
onMounted(async () => {
	await initData()
})

// 组件卸载前清理
onBeforeUnmount(() => {
	basicInfoRef.value = null
	formDesignRef.value = null
	processDesignRef.value = null
})
</script>


<style scoped lang="scss">
// ========================================================================
// 设计体系变量 (Design System Variables)
// ========================================================================
$primary-color: #409eff;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$bg-color: #f5f7fa;
$border-color-light: #e4e7ed;
$shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
$shadow-dark: 0 8px 24px 0 rgba(95, 101, 105, 0.1);

$spacing-medium: 16px;
$spacing-large: 24px;
$spacing-xlarge: 32px;

$border-radius-large: 8px;

$transition-duration: 0.3s;
$transition-timing-function: ease;

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

// ========================================================================
// 基础布局与容器
// ========================================================================

.process-container {
	display: flex;
	flex-direction: column;
	height: calc(100vh - 60px);
	background-color: $bg-color;
	overflow: hidden;
}

// ========================================================================
// 头部导航栏 (15% / 70% / 15% Grid)
// ========================================================================

.header-bar {
	flex-shrink: 0;
	height: 60px;
	background-color: #ffffff;
	box-shadow: $shadow-light;
	z-index: 10;
	box-sizing: border-box;

	// 定义 15% / 70% / 15% 的三列网格布局
	display: grid;
	grid-template-columns: 15% 70% 15%;
	align-items: center;
	padding: 0 $spacing-large;
}

.header-left {
	grid-column: 1;
	justify-self: start;
	display: flex;
	align-items: center;
	cursor: pointer;
	overflow: hidden;
	height: 100%;
	.el-icon {
		font-size: 20px;
		color: $text-regular;
		transition: color $transition-duration $transition-timing-function;
	}
	.title-text {
		margin-left: $spacing-medium;
		font-size: 18px;
		font-weight: 600;
		color: $text-primary;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	&:hover .el-icon {
		color: $primary-color;
	}
}

.header-middle {
	// grid-column: 2;
	// justify-self: center; // 步骤条在70%的区域内居中
	width: 100%;
	display: flex;
	justify-content: center;
}

.header-right {
	grid-column: 3;
	justify-self: end;
	display: flex;
	gap: $spacing-medium;
}

// --- 步骤条样式 (无大改动) ---
.step-container {
	display: flex;
	align-items: center;
	gap: 130px;
}
.step-item {
	display: flex;
	align-items: center;
	cursor: pointer;
	position: relative;
	height: 60px;
	line-height: 60px;
	color: $text-secondary;
	transition: color $transition-duration $transition-timing-function;
	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 3px;
		background-color: $primary-color;
		border-radius: 2px;
		transform: scaleX(0);
		transition: transform $transition-duration $transition-timing-function;
	}
	&.step-active {
		color: $primary-color;
		&::after {
			transform: scaleX(1);
		}
	}
	&:hover:not(.step-active) {
		color: $text-primary;
	}
	.step-number {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-right: 8px;
		border: 2px solid $border-color-light;
		color: $text-secondary;
		font-size: 14px;
		font-weight: bold;
		transition: all $transition-duration $transition-timing-function;
		&.number-active {
			background-color: $primary-color;
			color: #ffffff;
			border-color: $primary-color;
		}
	}
	.step-title {
		font-size: 16px;
		font-weight: 500;
	}
}

// ========================================================================
// 主体内容区域 (Conditional Layout)
// ========================================================================

.main-content {
	flex-grow: 1;
	overflow-y: auto;
	box-sizing: border-box;

	// 默认状态：使用与头部相同的网格布局
	display: grid;
	grid-template-columns: 15% 70% 15%;
	align-items: start; // 内容从顶部开始对齐

	// [核心改动] 全屏模式：当 .is-full-screen 类存在时
	&.is-full-screen {
		display: block; // 切换为普通块布局，打破网格
		padding: 0; // 移除内边距，让子元素可以100%填充

		// 让直接子元素 (即 ProcessDesign 组件) 占满所有空间
		> * {
			height: 100%;
			width: 100%;
		}
	}
}

// --- 内容卡片样式 ---
.step-content-card {
	grid-column: 2; // 将卡片放置在中间的 70% 列
	justify-self: center; // 在该列中水平居中

	width: 60%; // 宽度占满中间列
	max-width: 900px; // 但最大不超过900px，避免在大屏上过宽

	// margin-top: $spacing-large;
	margin-bottom: $spacing-large;
	padding: $spacing-large $spacing-xlarge;
	border-radius: $border-radius-large;
	border: none;
	background-color: #ffffff;
	box-shadow: $shadow-dark;
	box-sizing: border-box;

	animation: fadeInUp $transition-duration $transition-timing-function;
}

// --- 卡片内具体内容样式 ---
.step-content {
	margin: 0 auto;
	box-sizing: border-box;
}

.basic-info,
.form-design,
.extra-settings {
	width: 100%;
}
</style>

<style>
	.el-card__body {
		padding: 0 !important;
	}
</style>