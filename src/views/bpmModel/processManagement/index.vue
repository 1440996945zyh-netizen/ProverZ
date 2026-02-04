<!--
 * @Author: zhangsd
 * @Date: 2025-09-16 16:59:03
 * @LastEditTime: 2026-02-03 15:49:28
 * @LastEditors: zhangsd
 * @Description: 流程管理
 * @FilePath: \view\src\views\bpmModel\processManagement\index.vue
-->
<template>
	<div>
		<!-- 主列表流程管理显示 -->
		<div class="app-container">
			<BaseTable
				ref="processtTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="processTable"
				:loading="tableLoading"
				:showPagination="true"
				:showToolBar="false"
				:showNum="5"
				defaultWidth="50"
				:total="total"
			/>
		</div>

		<!-- 流程查看对话框 -->
		<Dialog v-model:visible="processViewVisible" :title="processViewTitle" width="65%">
			<processViewer
				:key="`designer-${processView.index}`"
				:xml="processView.xmlData"
				:finished-info="{}"
				:style="{ height: '500px', width: '100%' }"
			/>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="processViewVisible = false">关闭</el-button>
				</span>
			</template>
		</Dialog>

		<!-- 表单配置对话框 -->
		<Dialog v-model:visible="formConfigVisible" :title="formConfigTitle" width="600px" :modal="true">
			<div class="form-config-container">
				<ElForm ref="formConfigRef" :model="formConfig.form" :rules="formConfig.rules" label-width="100px" style="padding: 20px">
					<ElRow>
						<ElCol :span="24">
							<ElFormItem label="表单ID" prop="formId">
								<ElInput v-model="formConfig.form.formId" placeholder="请输入表单ID" />
							</ElFormItem>
						</ElCol>
						<ElCol :span="24">
							<ElFormItem label="表单名称" prop="formName">
								<ElInput v-model="formConfig.form.formName" placeholder="请输入表单名称" />
							</ElFormItem>
						</ElCol>
					</ElRow>
				</ElForm>
			</div>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="formConfigVisible = false">取消</el-button>
					<el-button type="primary" @click="handleSaveFormConfig">确定</el-button>
				</span>
			</template>
		</Dialog>
		<!-- 流程设计器对话框 -->
		<!-- <Dialog v-model:visible="processDesignerVisible" :title="processDesignerTitle" :showFooter="false" isFullscreen :modal="true">
			<processDesigner :editor="editor" @save="doSaveXml"></processDesigner>
		</Dialog> -->

		<!-- 表单详情 查看 -->
		<Dialog title="表单详情" v-model:visible="formDetailVisible" width="40%" class="custom-form-dialog">
			<form-create :option="formDetailPreview.option" :rule="formDetailPreview.rule" />
			<template #footer>
				<ElButton @click="formDetailVisible = false">取消</ElButton>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
defineOptions({ name: 'ProcessManagement' })
// 1. 基础依赖导入
import { ref, reactive, computed, getCurrentInstance, onMounted, h, nextTick, version } from 'vue'
import { formatDate } from '@/utils/common/date'
// 2. 组件导入
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import DropDown from '@/components/DropDown/newIndex.vue' // 补充Dropdown组件导入
import processDesigner from './details/processDesigner.vue'
import processViewer from '@/components/processViewer' // 引入流程查看组件
import TipMessage from '@/components/TipMessage/index.vue'

// 3. 状态管理与假数据导入
import tableParamsStore from '@/store/modules/tableParams'
import { processMockData } from './details/data'
import { Edit, Setting, Promotion, VideoPause, VideoPlay, Delete, Finished, Check } from '@element-plus/icons-vue'
// import { message } from 'ant-design-vue'
import { getProcessInstanceMyPage } from '@/api/system/bpm/processInstance'
import { useRoute, useRouter } from 'vue-router'
import BpmModelApi from '@/api/system/bpm/model'
import { getDetail } from '@/api/system/bpm/form'
import { setConfAndFields2 } from '@/utils/bpm/formCreate'

const route = useRoute()
const router = useRouter()
// 4. 组件实例与基础配置
const { proxy } = getCurrentInstance()
const storeHight = computed(() => tableParamsStore().normalTableHeight)
const processtTableRef = ref(null)
const formConfigRef = ref(null)
const processDesignerVisible = ref(false)
const processDesignerTitle = ref('流程设计器')
const editor = ref(null)

// 5. 核心响应式数据
const data = reactive({
	// 表格数据（从假数据获取）
	tableData: [],
	// 总条数（根据假数据长度动态设置）
	total: 0,
	// 加载状态
	tableLoading: false,
})

// 6. 表单配置数据
const formConfig = reactive({
	form: {
		formId: '',
		formName: '',
	},
	rules: {
		formId: [{ required: true, message: '表单ID不能为空', trigger: 'blur' }],
		formName: [{ required: true, message: '表单名称不能为空', trigger: 'blur' }],
	},
})

// 7. 解构响应式数据
const { tableData, total, tableLoading } = toRefs(data)
const queryParams = ref({
	pageNum: 1,
	pageSize: 20,
})

// 8. 页面状态变量
const tableHeight = computed(() => storeHight.value - 15)
const rowConfig = { keyField: 'id' }

// 9. 对话框相关状态
const dialogState = reactive({
	processViewVisible: false,
	formConfigVisible: false,
	processViewTitle: '流程查看',
	formConfigTitle: '配置表单',
	processImageUrl: '',
	confirmMessage: '',
	currentAction: '',
	currentRow: null,
})
// 流程查看所需的状态
const processView = reactive({
	index: null, // deploymentId 作为唯一标识
	xmlData: '', // 存储从后端获取的 BPMN XML 内容
})
// 10. 解构对话框状态（简化调用）
const {
	processViewVisible,
	formConfigVisible,
	processViewTitle,
	formConfigTitle,
	processImageUrl,
	confirmMessage,
	currentAction,
	currentRow,
} = toRefs(dialogState)

// 11. 静态配置（从假数据获取，统一管理）
const { categoryOptions, statusOptions } = processMockData

// 12. 搜索条件配置
const selectData = reactive([
	{
		name: '流程名称',
		type: 'input',
		modelValue: 'name',
		span: 12,
	},
	// {
	// 	name: '流程标识Key',
	// 	type: 'input',
	// 	modelValue: 'processKey',
	// 	span: 6,
	// },
	// {
	// 	name: '流程分类',
	// 	type: 'select',
	// 	modelValue: 'category',
	// 	span: 6,
	// 	placeholder: '请选择流程分类',
	// 	selectData: categoryOptions,
	// 	selectLabel: 'label',
	// 	selectValue: 'value',
	// },
	{
		name: '流程状态',
		type: 'select',
		modelValue: 'status',
		span: 12,
		placeholder: '请选择流程状态',
		selectData: statusOptions,
		selectLabel: 'dictLabel',
		selectValue: 'dictValue',
	},
])

// 13. 顶部按钮配置
const buttonList = reactive([
	{
		label: '新增流程',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAddProcess,
		permission: 'bpm:process:insert',
	},
])

// 14. 表格列配置（修复操作列逻辑，匹配流程业务）
const tableColumns = ref([
	// {
	// 	prop: 'id',
	// 	label: '流程定义id',
	// 	align: 'center',
	// 	minWidth: 250,
	// },
	// {
	// 	prop: 'key',
	// 	label: '流程标识Key',
	// 	align: 'center',
	// 	width: 250,
	// },
	// {
	// 	prop: 'category',
	// 	label: '流程分类',
	// 	align: 'center',
	// 	width: 150,
	// 	render: row => {
	// 		const option = categoryOptions.find(item => item.value === row.category)
	// 		// 修复：给原生span添加props对象（即使为空）
	// 		return [h('span', { props: {} }, option ? option.label : row.category)]
	// 	},
	// },
	{
		prop: 'name',
		label: '流程名称',
		align: 'center',
		minWidth: 150,
		showOverFlow: true,
		render: row => {
			return [
				h(
					ElButton,
					{
						type: 'link',
						class: 'link-button',
						onClick: () => handleProcessView(row.deploymentId),
						permission: undefined, // 明确添加permission属性（避免props为null）
					},
					{ default: () => row.name },
				),
			]
		},
	},
	{
		prop: 'formName',
		label: '表单信息',
		align: 'center',
		minWidth: 150,
		showOverFlow: true,
		render: row => {
			if (row.formId) {
				return [
					h(
						ElButton,
						{
							type: 'link',
							class: 'link-button',
							onClick: () => handleForm(row.formId),
							permission: undefined,
						},
						{ default: () => row.formName },
					),
				]
			} else {
				// 修复：给原生label添加props对象
				return [h('label', { props: {} }, '暂无表单')]
			}
		},
	},
	// {
	// 	prop: 'version',
	// 	label: '流程版本',
	// 	align: 'center',
	// 	render: row => {
	// 		return [
	// 			h(
	// 				ElTag,
	// 				{
	// 					size: 'medium',
	// 					permission: undefined, // 明确添加permission属性
	// 				},
	// 				{ default: () => `v${row.version}` }
	// 			),
	// 		]
	// 	},
	// },
	// {
	// 	prop: 'suspensionState',
	// 	label: '状态',
	// 	align: 'center',
	// 	render: row => {
	// 		const statusMap = {
	// 			1: { label: '激活', type: 'success' },
	// 			2: { label: '挂起', type: 'warning' },
	// 		}
	// 		const status = statusMap[row.suspensionState] || { label: '未知', type: '' }
	// 		return [
	// 			h(
	// 				ElTag,
	// 				{
	// 					type: status.type,
	// 					permission: undefined, // 明确添加permission属性
	// 				},
	// 				{ default: () => status.label }
	// 			),
	// 		]
	// 	},
	// },
	{
		prop: '',
		label: '发布时间',
		align: 'center',
		width: 180,
		render: row => {
			// 修复：给原生span添加props对象（即使为空）
			return [h('span', { props: {} }, row.processDefinition ? formatDate(row.processDefinition.deploymentTime) : '')]
		},
		sortable: true,
	},
	{
		prop: 'version',
		label: '版本',
		align: 'center',
		width: 150, // 增加宽度以容纳两个标签
		render: row => {
			const tags = []

			if (row.processDefinition) {
				// 版本标签
				tags.push(
					h(
						ElTag,
						{
							type: 'primary',
							class: 'mr-5', // 右边距
							permission: undefined,
						},
						{ default: () => `v${row.processDefinition.version}` },
					),
				)

				// 挂起状态标签（当 suspensionState === 2 时显示）
				// if (row.processDefinition.suspensionState === 2) {
				// 	tags.push(
				// 		h(
				// 			ElTag,
				// 			{
				// 				type: 'warning',
				// 				class: 'ml-5',
				// 				permission: undefined,
				// 			},
				// 			{ default: () => '已停用' },
				// 		),
				// 	)
				// }
			} else {
				// 未部署状态
				tags.push(
					h(
						ElTag,
						{
							type: 'info',
							permission: undefined,
						},
						{ default: () => '未部署' },
					),
				)
			}

			return tags
		},
		sortable: true,
	},
	{
		prop: 'suspensionState',
		label: '状态',
		align: 'center',
		width: 150, // 增加宽度以容纳两个标签
		render: row => {
			const tags = []

			if (row.processDefinition) {
				if (row.processDefinition.suspensionState === 1) {
					tags.push(
						h(
							ElTag,
							{
								type: 'success',
								class: 'ml-5',
								permission: undefined,
							},
							{ default: () => '已激活' },
						),
					)
				}
				// 挂起状态标签（当 suspensionState === 2 时显示）
				if (row.processDefinition.suspensionState === 2) {
					tags.push(
						h(
							ElTag,
							{
								type: 'warning',
								class: 'ml-5',
								permission: undefined,
							},
							{ default: () => '已停用' },
						),
					)
				}
			} else {
				// 未部署状态
				tags.push(
					h(
						ElTag,
						{
							type: 'info',
							permission: undefined,
						},
						{ default: () => '未部署' },
					),
				)
			}

			return tags
		},
		sortable: true,
	},
	{
		label: '操作',
		align: 'center',
		width: 120, // 适当加宽以容纳图标
		fixed: 'right',
		render: row => {
			// 流程操作下拉菜单（带图标版本）
			const dropDownList = [
				{
					name: '编辑',
					command: '编辑',
					click: () => handleLoadXml(row),
					permission: 'bpm:process:update',
					icon: Edit, // 添加图标组件
				},
				{
					name: '发布',
					command: '发布',
					click: () => deployModel(row),
					permission: 'bpm:process:update',
					icon: Check, // 添加图标组件
				},
				{
					name: '版本',
					command: '版本',
					click: () => historyVersion(row),
					permission: 'bpm:process:update',
					icon: Finished, // 添加图标组件
				},
				// 仅当无表单时显示配置表单按钮
				...(row.formId === null && (row.category === 'oa' || row.category === 'cw')
					? [
							{
								name: '配置表单',
								command: '配置表单',
								click: () => handleAddForm(row),
								permission: 'bpm:process:config',
								icon: Setting, // 添加图标组件
							},
						]
					: []),
				// 仅当可发起申请时显示
				...(canSubmit(row)
					? [
							{
								name: '发起申请',
								command: '发起申请',
								click: () => SubmitApplication(row),
								permission: 'bpm:process:submit',
								icon: Promotion, // 添加图标组件
							},
						]
					: []),
				// 根据状态显示挂起/激活
				...(row.processDefinition?.suspensionState === 1
					? [
							{
								name: '停用',
								command: '停用',
								click: () => handleUpdateSuspensionState(row, 2),
								permission: 'bpm:process:state',
								icon: VideoPause, // 添加图标组件
							},
						]
					: [
							{
								name: '激活',
								command: '激活',
								click: () => handleUpdateSuspensionState(row, 1),
								permission: 'bpm:process:state',
								icon: VideoPlay, // 添加图标组件
							},
						]),
				// 清理
				{
					name: '清理',
					command: '清理',
					click: () => clean(row),
					type: 'danger',
					permission: 'bpm:process:clean',
					icon: Delete, // 添加图标组件
				},
				// 删除
				{
					name: '删除',
					command: '删除',
					click: () => handleDelete(row),
					type: 'danger',
					permission: 'bpm:process:delete',
					icon: Delete, // 添加图标组件
				},
			]

			return [
				h(
					DropDown,
					{
						dropDownList,
						isInner: true,
						props: { permission: undefined },
					},
					{
						default: () => h('span', { class: 'el-icon-more' }), // 下拉按钮显示更多图标
					},
				),
			]
		},
	},
])

// 15. 工具函数（提取通用逻辑）
/**
 * 判断是否可发起申请
 * @param {Object} row 流程数据
 * @returns {boolean} 是否可发起
 */
const canSubmit = row => {
	return (
		(row.formId !== null && (row.category === 'oa' || row.category === 'cw')) ||
		(row.formId !== null && row.category === 'online') ||
		(row.formId === null && (row.category === 'ddxz' || row.category === 'ddcw'))
	)
}

// 16. 核心业务方法
/**
 * 获取流程列表
 * @param {Object} params 搜索参数
 */
const getList = e => {
	console.log('e =>', e)
	console.log('(queryParams.value,', queryParams.value)
	tableLoading.value = true
	const params = Object.assign(queryParams.value, e)

	BpmModelApi.getModelList(params)
		.then(res => {
			if (res.code == '0000') {
				tableData.value = res.data
				total.value = res.data.length
				tableLoading.value = false
			}
		})
		.catch(error => {
			tableLoading.value = false
			proxy.$modal.msgError('获取流程列表失败，请重试')
		})
}

/**
 * 单元格点击事件
 * @param {Object} params 行数据
 */
const cellClickEvent = ({ row }) => {
	console.log('行点击事件:', row)
}

/**
 * 查看流程详情
 * @param {string} deploymentId 部署ID
 */
const handleProcessView = async deploymentId => {
	console.log('deploymentId =>', deploymentId)
	try {
		// 模拟调用接口获取XML（实际项目中替换为真实API）
		// const res = await BpmModelApi.readFlowableXml(deploymentId)
		// if (res.code == '0000') {
		// 	processView.xmlData = res.data
		// 	// 设置流程查看状态
		// 	processView.index = deploymentId
		// 	processView.index = `${deploymentId}_${Date.now()}`
		// 	processViewVisible.value = true
		// } else {
		// 	ElMessage.error('获取流程图失败')
		// 	return
		// }
	} catch (error) {
		console.error('获取流程图失败:', error)
		ElMessage.error('获取流程图失败，请重试')
	}
}

// /**
//  * 处理自定义表单
//  * @param {string} formId 表单ID
//  */
// const handleCustomForm = formId => {
// 	proxy.$modal.msg(`打开自定义表单: ${formId}`)
// }

// /**
//  * 处理在线表单
//  * @param {string} formId 表单ID
//  * @param {string} formName 表单名称
//  */
// const handleOnlineForm = (formId, formName) => {
// 	proxy.$modal.msg(`打开在线表单: ${formName}`)
// }
/** 流程表单的详情按钮操作 */
const formDetailVisible = ref(false)
const formDetailPreview = ref({
	rule: [],
	option: {},
})
/**
 * 处理普通表单
 * @param {string} formId 表单ID
 */
const handleForm = async formId => {
	// 设置表单
	const apiResponse = await getDetail(formId)

	const formData = apiResponse.data

	setConfAndFields2(formDetailPreview, formData.conf, formData.fields)
	formDetailPreview.value.option = {
		...formDetailPreview.value.option, // 保留其他布局配置
		submitBtn: false, // 隐藏提交按钮
		resetBtn: false, // 隐藏重置按钮
		menuBtn: false, // 隐藏整个底部按钮区域（最保险）
	}
	// 弹窗打开
	formDetailVisible.value = true
}
/**
 * 加载流程XML 编辑
 * @param row 行数据
 */
const handleLoadXml = async row => {
	//打开设计器弹窗
	router.push({
		name: 'CreateProcess',
		query: {
			type: 'update',
			id: row.id,
		},
	})
}
/**
 * 保存流程XML
 * @param {Object} params 保存参数
 */
const doSaveXml = async params => {
	try {
		processDesignerVisible.value = false
		getList() // 刷新列表
	} catch (error) {
		console.error('保存流程XML失败:', error)
		ElMessage.error('保存流程XML失败，请重试')
	}
}

/**
 * 配置表单（通用）
 * @param {Object} row 流程数据
 */
const handleAddForm = row => {
	currentRow.value = row
	formConfig.form.formId = ''
	formConfig.form.formName = ''
	formConfigVisible.value = true
}

/**
 * 配置在线表单
 * @param {Object} row 流程数据
 */
const handleAddOnlineForm = row => {
	handleAddForm(row) // 复用通用配置逻辑
}

/**
 * 保存表单配置（模拟）
 */
const handleSaveFormConfig = async () => {
	try {
		await formConfigRef.value.validate()
		// 模拟保存成功
		proxy.$modal.msgSuccess('表单配置成功')
		formConfigVisible.value = false
		getList() // 刷新列表
	} catch (error) {
		if (error.name === 'ValidationError') return
		proxy.$modal.msgError('保存表单配置失败，请重试')
	}
}

/**
 * 发起申请
 * @param {Object} row 流程数据
 */
const SubmitApplication = row => {
	ElMessage.info(`发起申请: ${row.name}`)
}
/**发布流程 */
const deployModel = row => {
	BpmModelApi.deployModel(row.id).then(res => {
		if (res.code === '0000') {
			ElMessage.success('发布成功')
			getList() // 刷新列表
		} else {
			ElMessage.error('发布失败')
		}
	})
}
/**历史版本 */
const historyVersion = row => {
	router.push({
		name: 'BpmProcessDefinition',
		query: {
			key: row.key,
		},
	})
}
/**
 * 更新流程状态（挂起/激活）
 * @param {Object} row 流程数据
 * @param {number} state 目标状态
 */
const handleUpdateSuspensionState = (row, state) => {
	currentRow.value = row
	currentAction.value = 'state'
	const actionText = state === 1 ? '激活' : '挂起'
	confirmMessage.value = `确定要${actionText}流程【${row.name}】吗？`
	ElMessageBox.confirm(confirmMessage.value, '确认操作', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			handleConfirmAction()
		})
		.catch(() => {
			// 取消操作
		})
	currentRow.value.targetState = state
}

/**
 * 清理流程
 * @param {Object} row 流程数据
 */
const clean = row => {
	currentRow.value = row
	currentAction.value = 'clean'
	confirmMessage.value = `确定要清理流程【${row.name}】吗？`

	ElMessageBox.confirm(confirmMessage.value, '确认操作', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			handleConfirmAction()
		})
		.catch(() => {
			// 取消操作
		})
}

/**
 * 删除流程
 * @param {Object} row 流程数据
 */
const handleDelete = row => {
	currentRow.value = row
	currentAction.value = 'delete'
	confirmMessage.value = `确定要删除流程【${row.name}】吗？此操作不可恢复！`

	ElMessageBox.confirm(confirmMessage.value, '确认操作', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			handleConfirmAction()
		})
		.catch(() => {
			// 取消操作
		})
}

/**
 * 新增流程
 */
const handleAddProcess = () => {
	// proxy.$modal.msg('跳转到新增流程页面')
	// processDesignerVisible.value = true
	// editor.value = null
	router.push({
		name: 'CreateProcess',
		query: {
			type: 'create',
		},
	})
}

/**
 * 确认操作（状态更新/删除）
 */
const handleConfirmAction = () => {
	if (currentAction.value === 'state') {
		console.log('currentRow.value =>', currentRow.value)
		BpmModelApi.updateModelState({
			id: currentRow.value.id,
			state: currentRow.value.targetState,
		}).then(res => {
			if (res.code == '0000') {
				proxy.$modal.msgSuccess(`流程${currentRow.value.targetState === 1 ? '激活' : '挂起'}成功`)
				getList()
			} else {
				ElMessage.error('更新流程状态失败')
			}
		})
	} else if (currentAction.value === 'delete') {
		BpmModelApi.deleteModel(currentRow.value.id).then(res => {
			if (res.code == '0000') {
				proxy.$modal.msgSuccess('流程删除成功')
				getList()
			} else {
				ElMessage.error('删除流程失败')
			}
		})
	} else if (currentAction.value === 'clean') {
		BpmModelApi.cleanModel(currentRow.value.id).then(res => {
			if (res.code == '0000') {
				proxy.$modal.msgSuccess('流程清理成功')
				getList()
			} else {
				ElMessage.error('清理流程失败')
			}
		})
	}
}

// 17. 页面初始化
onMounted(() => {
	getList()
})
</script>

<style lang="scss" scoped>
/* 根容器：占满视口高度，避免内容撑开页面 */
.app-container {
	margin: 0 auto;
	// padding: 20px 24px;  //微调内边距，适配滚动
	font-family: 'Microsoft YaHei', Arial, sans-serif;
	color: #333;
	height: 100% !important;
	box-sizing: border-box; /* 避免padding导致页面溢出 */
}
// 流程查看弹窗样式
.process-view-container {
	// padding: 10px;

	.process-image {
		text-align: center;
		// padding: 20px 0;

		.process-diagram {
			max-width: 100%;
			max-height: 500px;
			border-radius: 4px;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		}
	}

	.no-process-image {
		text-align: center;
		padding: 50px 0;
		color: #999;
		font-size: 14px;
	}
}

// 表单配置弹窗样式
.form-config-container {
	padding: 10px;
}

:deep(.el-dialog .dialog-body) {
	height: 100% !important;
	padding: 0px !important;
}
:deep(.link-button) {
	background: transparent !important;
	border: none !important;
	color: #409eff !important; // 保持Element的主题蓝色
	padding: 0 8px !important;
	height: auto !important;
	line-height: normal !important;

	//  hover/focus/active状态都移除背景和边框
	&:hover,
	&:focus,
	&:active {
		background: transparent !important;
		border-color: transparent !important;
		box-shadow: none !important;
	}
}
:deep(.custom-form-dialog) {
	.el-dialog__body {
		padding: 15px 20px !important;
		max-height: 70vh;
		overflow-y: auto;
	}

	/* 调整表单元素间距 */
	.form-create .form-group {
		margin-bottom: 18px !important;
	}

	/* 标题样式 */
	.form-create .form-title {
		font-size: 16px !important;
		color: #333 !important;
		margin-bottom: 15px !important;
	}
}
</style>
