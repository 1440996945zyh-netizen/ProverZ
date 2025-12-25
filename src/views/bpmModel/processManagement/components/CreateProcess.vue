<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 11:26:00
 * @LastEditTime: 2025-12-25 16:45:05
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
					{{ formData.name || '创建流程' }}
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
		<div class="main-content">
			<!-- 第一步：基本信息 -->
			<div v-if="currentStep === 0" class="step-content basic-info">
				<BasicInfo v-model="formData" :categoryList="categoryList" :userList="userList" :deptList="deptList" ref="basicInfoRef" />
			</div>

			<!-- 第二步：表单设计 -->
			<div v-if="currentStep === 1" class="step-content form-design">
				<FormDesign v-model="formData" :formList="formList" ref="formDesignRef" />
			</div>

			<!-- 第三步：流程设计 -->
			<ProcessDesign v-if="currentStep === 2" v-model="formData" ref="processDesignRef" />

			<!-- 第四步：更多设置 -->
			<div v-show="currentStep === 3" class="step-content extra-settings">
				<ExtraSettings ref="extraSettingsRef" v-model="formData" />
			</div>
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
const actionType = route.query.type
const initData = async () => {
	console.log('actionType =>', actionType)
	if (actionType === 'definition') {
		// 流程定义场景（恢复）
		const definitionId = route.params.id
		const data = await DefinitionApi.getProcessDefinition(definitionId)
		data.type = data.modelType
		delete data.modelType
		data.id = data.modelId
		delete data.modelId
		if (data.simpleModel) {
			data.simpleModel = JSON.parse(data.simpleModel)
		}
		formData.value = data
		formData.value.startUserType = formData.value.startUserIds?.length > 0 ? 1 : formData.value?.startDeptIds?.length > 0 ? 2 : 0
	} else if (['update', 'copy'].includes(actionType)) {
		// 修改/复制场景
		const modelId = route.params.id
		formData.value = await ModelApi.getModel(modelId)
		formData.value.startUserType = formData.value.startUserIds?.length > 0 ? 1 : formData.value?.startDeptIds?.length > 0 ? 2 : 0

		// 复制场景处理
		if (route.params.type === 'copy') {
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
				formList.value =
					res.data || []
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

/** 根据类型切换流程数据 */
watch(
	() => formData.value.type,
	() => {
		if (formData.value.type === BpmModelType.BPMN) {
			processData.value = formData.value.bpmnXml
		} else if (formData.value.type === BpmModelType.SIMPLE) {
			processData.value = formData.value.simpleModel
		}
		console.log('加载流程数据', processData.value)
	},
	{
		immediate: true,
	}
)

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

		if (actionType === 'definition') {
			// 恢复场景
			await ModelApi.updateModel(modelData)
			message.success('恢复成功，可点击【发布】按钮，进行发布模型')
		} else if (actionType === 'update') {
			// 修改场景
			await ModelApi.updateModel(modelData)
			message.success('修改成功，可点击【发布】按钮，进行发布模型')
		} else if (actionType === 'copy') {
			// 复制场景
			formData.value.id = await ModelApi.createModel(modelData)
			message.success('复制成功，可点击【发布】按钮，进行发布模型')
		} else {
			// 新增场景
			formData.value.id = await ModelApi.createModel(modelData)
			message.success('新建成功，可点击【发布】按钮，进行发布模型')
		}

		// 返回列表页（排除更新场景）
		if (actionType !== 'update') {
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
		await router.push({ name: 'BpmModel' })
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
// 全局容器
.process-container {
	padding: 5px;
	border: 1px solid #e1e4eb;
	border-bottom: none;
	height: calc(100vh - 110px);
	position: relative;
	margin: 0 auto; // 新增：保持容器水平居中，和原效果一致
	overflow: hidden; // 新增：防止内容溢出容器
}

// 头部导航栏
.header-bar {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 50px;
	background-color: #ffffff;
	border-bottom: 1px solid #dcdfe6;
	z-index: 10;
	display: flex;
	align-items: center;
	padding-left: 20px;
	padding-right: 20px;
	box-sizing: border-box; // 新增：确保padding不撑大容器
}

// 头部左侧
.header-left {
	width: 200px;
	display: flex;
	align-items: center;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.2s ease; // 新增： hover 过渡效果

	// 回退图标（Element Plus 图标）
	:deep(.el-icon) {
		font-size: 18px; // 图标大小
		color: #606266; // 图标默认颜色
		flex-shrink: 0; // 不被挤压
		transition: color 0.2s ease;

		&:hover {
			color: #3473ff; // hover 变色，提升体验
		}
	}

	// 标题文本
	.title-text {
		margin-left: 10px;
		font-size: 16px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		color: #303133; // 标题文字颜色
		font-weight: 500;
	}
}

// 头部中间（步骤条容器）
.header-middle {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}

// 步骤条容器
.step-container {
	width: 400px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100%;
	box-sizing: border-box;
}

// 步骤项
.step-item {
	display: flex;
	align-items: center;
	cursor: pointer;
	margin: 0 15px; // 简化间距写法
	position: relative;
	height: 100%;
	color: #c0c4cc; // 统一未激活文字颜色（和原效果一致）
	transition: color 0.2s ease;
	box-sizing: border-box;

	// 激活状态
	&.step-active {
		color: #3473ff;
		border-bottom: 2px solid #3473ff;
		border-bottom-style: solid; // 明确边框样式
	}

	// 步骤数字
	.step-number {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 8px;
		border: 2px solid #e4e7ed; // 统一未激活边框颜色
		background-color: #ffffff;
		color: #c0c4cc; // 统一未激活数字颜色
		font-size: 15px;
		transition: all 0.2s ease;
		box-sizing: border-box;

		// 数字激活状态
		&.number-active {
			background-color: #3473ff;
			color: #ffffff;
			border-color: #3473ff;
		}
	}

	// 步骤标题
	.step-title {
		font-size: 16px;
		font-weight: bold;
		white-space: nowrap;
	}
}

// 头部右侧
.header-right {
	width: 200px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8px; // 修正：从 2px 改为 8px，和原效果一致（按钮间距适中）
	box-sizing: border-box;

	// 按钮样式兼容
	:deep(.el-button) {
		padding: 8px 16px; // 统一按钮内边距
		font-size: 14px;
	}
}

// 主体内容
.main-content {
	margin-top: 50px; // 避开头部导航
	height: calc(100% - 50px); // 新增：高度自适应容器，不超出父级
	overflow-y: auto; // 新增：内容超出时纵向滚动
	box-sizing: border-box;
	padding: 10px 0; // 新增：上下内边距，优化内容显示
}

// 步骤内容通用样式
.step-content {
	margin: 0 auto;
	box-sizing: border-box;
	padding: 0 10px; // 新增：左右内边距，防止内容贴边
}

// 第一步：基本信息
.basic-info {
	width: 560px;
}

// 第二步：表单设计
.form-design {
	width: 560px;
}

// 第四步：更多设置
.extra-settings {
	width: 700px;
}

// 原有样式保留（兼容可能的引用）
.border-bottom {
	border-bottom: 1px solid #dcdfe6;
}

.text-primary {
	color: #3473ff;
}

.bg-primary {
	background-color: #3473ff;
}

.border-primary {
	border-color: #3473ff;
}
</style>