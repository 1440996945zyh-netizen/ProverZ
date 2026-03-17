<!--
 * @Author: limiam
 * @Date: 2025-09-16 16:59:03
 * @LastEditTime: 2026-02-10 16:13:16
 * @LastEditors: zhangsd
 * @Description: 流程定义
 * @FilePath: \view\src\views\bpmModel\processManagement\definition\index.vue
-->

<template>
	<div>
		<!-- 主列表显示 -->
		<div class="app-container">
			<BaseTable
				ref="definitionTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="definitionTable"
				:loading="tableLoading"
				:showPagination="true"
				:showToolBar="false"
				:defaultWidth="20"
				:total="total"
			/>
		</div>

		<!-- 表单详情 查看 -->
		<Dialog title="表单详情" v-model:visible="formDetailVisible" width="40%">
			<form-create :option="formDetailPreview.option" :rule="formDetailPreview.rule" />
			<template #footer>
				<ElButton @click="formDetailVisible = false">取消</ElButton>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from '@/utils/common/date'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import DropDown from '@/components/DropDown/newIndex.vue'

import BpmProcessDefinitionApi from '@/api/system/bpm/definition'
import { getDetail } from '@/api/system/bpm/form'
import { setConfAndFields2 } from '@/utils/bpm/formCreate'
import tableParamsStore from '@/store/modules/tableParams'
defineOptions({ name: 'BpmProcessDefinition' })
const storeHeight = computed(() => tableParamsStore().normalTableHeight)
// 6. 页面状态变量
const tableHeight = computed(() => storeHeight.value - 15)
// 组件实例与路由
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

// 定义常量
const DICT_TYPE = {
	BPM_MODEL_TYPE: 'bpm_model_type',
}

const BpmModelFormType = {
	NORMAL: 'normal',
	CUSTOM: 'custom',
}

// 组件引用
const definitionTableRef = ref(null)

// 响应式数据
const tableLoading = ref(true)
const total = ref(0)
const tableData = ref([])

const queryParams = ref({
	pageNum: 1,
	pageSize: 20,
	name: undefined,
})

// 表单详情弹窗显示状态
const formDetailVisible = ref(false)
// 表单详情数据
const formDetailPreview = ref({
	rule: [],
	option: {},
})

// 搜索条件配置
const selectData = reactive([
	{
		name: '流程标识Key',
		type: 'input',
		modelValue: 'key',
		span: 24,
		placeholder: '请输入流程标识Key',
	},
])

// 顶部按钮配置
const buttonList = reactive([
	{
		label: '返回流程模型',
		type: 'primary',
		icon: 'Back',
		click: () => handleBackToModel(),
		permission: 'bpm:model:query',
	},
])

// 表格列配置
const tableColumns = ref([
	{
		prop: 'id',
		label: '定义编号',
		align: 'center',
		minWidth: 200,
	},
	{
		prop: 'name',
		label: '流程名称',
		align: 'left',
		minWidth: 150,
	},
	
	
	
	{
		prop: 'formName',
		label: '表单信息',
		align: 'center',
		minWidth: 150,
		render: row => {
			if (row.formId) {
				return [
					h(
						ElButton,
						{
							type: 'link',
							class: 'link-button',
							onClick: () => handleFormDetail(row.formId),
							permission: undefined,
						},
						{ default: () => row.formName },
					),
				]
			} else {
				return [h('label', { props: {} }, '暂无表单')]
			}
		},
	},
	{
		prop: 'version',
		label: '流程版本',
		align: 'center',
		width: 100,
		render: row => [
			h(
				ElTag,
				{
					type: '',
				},
				{ default: () => `v${row.version}` },
			),
		],
	},
	{
		prop: 'deploymentTime',
		label: '部署时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, formatDate(row.deploymentTime))],
		sortable: true,
	},
	{
		label: '操作',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			const dropDownList = [
				{
					name: '恢复',
					command: '恢复',
					click: () => openModelForm(row.id),
					permission: 'bpm:model:update',
					icon: 'Refresh',
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
						default: () => h('span', { class: 'el-icon-more' }),
					},
				),
			]
		},
	},
])



// 行配置
const rowConfig = { keyField: 'id' }

// 工具函数
/**
 * 获取字段预览值
 */
const getFieldPreviewValue = item => {
	if (item.type === 'input' || item.type === 'textarea') {
		return '示例输入值'
	} else if (item.type === 'select' || item.type === 'radio') {
		return item.options?.[0]?.label || '选项一'
	} else if (item.type === 'date' || item.type === 'datetime') {
		return formatDate(new Date())
	}
	return '—'
}

// 核心业务方法
/**
 * 获取流程定义列表
 */
const getList = async (e) => {
	tableLoading.value = true
	try {
		let params = {
			...e,
		}
		const res = await BpmProcessDefinitionApi.getProcessDefinitionPage(params)
		tableData.value = res.data.pages || []
		total.value = res.data.totalNum || 0

		// // 模拟数据
		// tableData.value = [
		// 	{
		// 		id: '1',
		// 		name: '请假流程',
		// 		icon: '',
		// 		startUsers: [],
		// 		categoryName: '业务流',
		// 		formType: BpmModelFormType.NORMAL,
		// 		formName: '请假申请单',
		// 		version: 1,

		// 		deploymentTime: new Date(),
		// 	},
		// 	{
		// 		id: '2',
		// 		name: '报销流程',
		// 		icon: '',
		// 		startUsers: [{ nickname: '张三' }, { nickname: '李四' }],
		// 		categoryName: '审批流',
		// 		formType: BpmModelFormType.CUSTOM,
		// 		formCustomCreatePath: '/custom-form',
		// 		version: 2,
		// 		deploymentTime: new Date(),
		// 	},
		// ]
		// total.value = 2
	} catch (error) {
		console.error('获取流程定义列表失败:', error)
		proxy.$modal.msgError('获取流程定义列表失败，请重试')
	} finally {
		tableLoading.value = false
	}
}

/**
 * 单元格点击事件
 */
const cellClickEvent = ({ row }) => {
	console.log('行点击事件:', row)
}

/**
 * 处理普通表单详情
 */
const handleFormDetail = async formId => {
	if (formId) {
		try {
			// 设置表单
			const apiResponse = await getDetail(formId)

			const formData = apiResponse.data

			setConfAndFields2(formDetailPreview, formData.conf, formData.fields)
			// 弹窗打开
			formDetailVisible.value = true
		} catch (error) {
			console.error('获取表单详情失败:', error)
			proxy.$modal.msgError('获取表单详情失败')
		}
	}
}

// /**
//  * 处理自定义表单
//  */
// const handleCustomForm = async row => {
// 	if (row.formType == BpmModelFormType.CUSTOM && row.formCustomCreatePath) {
// 		await router.push({
// 			path: row.formCustomCreatePath,
// 		})
// 	}
// }

/**
 * 恢复流程模型
 */
const openModelForm = async id => {
	router.push({
		name: 'CreateProcess',
		query: {
			type: 'definition',
			id: id,
		},
	})
}

/**
 * 返回流程模型
 */
const handleBackToModel = () => {
	router.push({ name: 'BpmModel' })
}

// 页面初始化
onMounted(() => {
	queryParams.value.key = route.query.key || undefined
	getList(definitionTableRef.value?.buildQueryParams())
	// 监听路由参数变化
	watch(
		() => route.query.key,
		newKey => {
			queryParams.value.key = newKey || undefined
			queryParams.value.pageNum = 1
			getList(definitionTableRef.value?.buildQueryParams())
		},
	)
})
</script>

<style lang="scss" scoped>
/* 根容器：占满视口高度 */
.app-container {
	margin: 0 auto;
	font-family: 'Microsoft YaHei', Arial, sans-serif;
	color: #333;
	height: 100% !important;
	box-sizing: border-box;
}

/* 表单详情弹窗样式 */
.form-detail-container {
	padding: 20px;

	.form-preview-header {
		margin-bottom: 20px;
		padding-bottom: 10px;
		border-bottom: 1px solid #ebeef5;
		text-align: center;
	}

	.form-preview-content {
		:deep(.el-descriptions) {
			margin-top: 10px;

			.el-descriptions-item__label {
				width: 120px;
				font-weight: 500;
			}
		}
	}

	.empty-form {
		padding: 60px 0;
		text-align: center;
	}
}

/* 链接按钮样式 */
:deep(.link-button) {
	background: transparent !important;
	border: none !important;
	color: #409eff !important;
	padding: 0 8px !important;
	height: auto !important;
	line-height: normal !important;

	&:hover,
	&:focus,
	&:active {
		background: transparent !important;
		border-color: transparent !important;
		box-shadow: none !important;
	}
}

/* 图片样式 */
:deep(img) {
	max-width: 100%;
	height: auto;
}
</style>
