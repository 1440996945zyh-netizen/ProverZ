<!--
 * @Author: zhangsd
 * @Date: 2026-02-24 10:29:17
 * @LastEditTime: 2026-03-25 14:39:35
 * @LastEditors: zhangsd
 * @Description: 常用审批语配置
 * @FilePath: \view\src\views\bpmModel\processLanguage\index.vue
-->
<template>
	<div class="app-container">
		<BaseTable
			ref="languageTableRef"
			:showSearchHeader="true"
			:tableColumns="tableColumns"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableData="tableData"
			:tableHeight="tableHeight"
			name="processLanguageTable"
			:loading="tableLoading"
			:showPagination="true"
			:total="total"
			v-model:pagination="queryParams"
		>
		</BaseTable>
		<!-- 常用审批语详情弹窗 -->
		<ProcessLanguageDetail ref="detailDialogRef" @success="handleDialogSuccess" @close="handleDialogClose" />
	</div>
</template>

<script setup>
defineOptions({ name: 'BpmProcessLanguage' })
// 2. 组件导入
import BaseTable from '@/components/BaseTable/index.vue'
// 3. 接口与状态管理导入
import { ProcessLanguageApi } from '@/api/system/bpm/processLanguage/index.js'
import tableParamsStore from '@/store/modules/tableParams'
import { formatDate } from '@/utils/common/date'
import ProcessLanguageDetail from './detail/index.vue'
import publicApi from '@/api/public/index.js'
import { nextTick, ref } from 'vue'
/**
 * 常用审批语常量枚举
 */
import {
	CommonStatusEnum,
	CommonStatusEnumLabel,
	BPM_PROCESS_LISTENER_TYPE,
	BPM_PROCESS_LISTENER_VALUE_TYPE,
} from '@/utils/bpm/constantEnumeration'
/**
 * 常用审批语组件实例与基础配置
 */
const { proxy } = getCurrentInstance()
const storeHeight = computed(() => tableParamsStore().normalTableHeight)

/***
 * 常用审批语核心响应式数据
 */
const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 30,
		content: undefined, // 快捷语内容（搜索）
		expressionType: undefined, // 类型（搜索）
		status: undefined, // 状态（搜索）
	},
	tableData: [],
	total: 0,
	tableLoading: false,
})
/**
 * 常用审批语表格复选框配置
 */
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
}
/**
 * 常用审批语表格复选框变化事件处理
 * @param selectedRows 选中的行数据
 */
const handleCheckboxChange = selectedRows => {
	console.log('当前选中行：', selectedRows)
}

/**
 * 常用审批语表格全选操作
 */
const handleSelectAllChange = ({ checked, records }) => {
	console.log(' 全选操作:', checked, records)
}
/**
 * 常用审批语分页查询参数
 */
const { queryParams, tableData, total, tableLoading } = toRefs(data)

const expressionTypeOptions = ref([])
/**
 * 常用审批语表格高度
 */
const tableHeight = computed(() => storeHeight.value - 15)

const detailDialogRef = ref(null)
const languageTableRef = ref(null)

/**
 * 常用审批语搜索条件配置
 */
const selectData = reactive([
	{
		name: '快捷语内容',
		type: 'input',
		modelValue: 'content',
		span: 8,
		placeholder: '请输入快捷语内容',
	},
	{
		name: '类型',
		type: 'select',
		modelValue: 'expressionType',
		span: 8,
		placeholder: '请选择类型',
		dataConfig: { params: { type: 'DICT', dictType: 'COMMON_PHRASES_TYPE' } },
	},
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		span: 8,
		placeholder: '请选择状态',
		selectData: [
			{ label: '全部', value: '' },
			{ label: '开启', value: '0' },
			{ label: '禁用', value: '1' },
		],
		selectLabel: 'label',
		selectValue: 'value',
	},
])

/**
 * 常用审批语顶部按钮配置
 */
const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => {
			openForm('create', undefined)
		},
		permission: 'bpm:processLanguage:create',
	},
])

/**
 * 常用审批语表格列配置
 */
const tableColumns = ref([
	{ type: 'checkbox', width: 50, fixed: 'left', align: 'center' },

	{
		prop: '',
		label: '编号',
		align: 'center',
		width: 80,
		type: 'seq',
	},
	{
		prop: 'content',
		label: '快捷语内容',
		align: 'left',
		minWidth: 150,
	},
	{
		prop: 'expressionTypeName',
		label: '类型',
		align: 'center',
		width: 120,
	},
	{
		prop: 'status',
		label: '状态',
		align: 'center',
		width: 100,
		render: row => {
			const statusItem = CommonStatusEnumLabel.find(item => item.value == row.status)
			return h(
				ElTag,
				{
					type: statusItem?.type || 'info',
				},
				{
					default: () => statusItem?.label || '未知状态',
				}
			)
		},
	},

	{
		prop: 'createTime',
		label: '创建时间',
		align: 'center',
		width: 180,
		render: row => [h('span', {}, formatDate(row.createTime))],
	},
	{
		prop: 'createByName',
		label: '创建人',
		align: 'center',
		width: 120,
	},
	{
		label: '操作',
		align: 'center',
		width: 240,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							openForm('update', row.id)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						style: 'margin-right: 8px',
						permission: 'bpm:processLanguage:update',
					},
					{ default: () => '编辑' }
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row.id)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'bpm:processLanguage:delete',
					},
					{ default: () => '删除' }
				),
			]
		},
	},
])

/**
 * 查询常用审批语分页
 * @param e
 */
const getList = async e => {
	let pagination = languageTableRef.value?.buildQueryParams()
	console.log('查询常用审批语分页参数:', e)
	let params = {
		...e,
		...pagination,
	}
	tableLoading.value = true
	try {
		const res = await ProcessLanguageApi.getList(params)
		tableData.value = res.data.pages || []
		total.value = res.data.totalNum
	} catch (error) {
		proxy.$modal.msgError('获取列表失败')
	} finally {
		tableLoading.value = false
	}
}


/**
 * 打开常用审批语表单
 * @param type create/update
 * @param id 	常用审批语id
 */
const openForm = (type, id) => {
	console.log('打开表单 父组件:', type, id)
	if (!detailDialogRef.value) {
		proxy?.$modal?.msgError?.('表单组件未加载，请刷新页面')
		return
	}

	nextTick(() => {
		detailDialogRef.value.open({
			type,
			id: type == 'update' ? id : undefined,
		})
	})
}
/**
 * 删除常用审批语
 * @param id 常用审批语id
 */
const handleDelete = async id => {
	try {
		await proxy.$modal.confirm('确定要删除该常用审批语吗？')
		await ProcessLanguageApi.deleteProcessLanguage(id)
		proxy.$modal.msgSuccess('删除成功')
		getList()
	} catch (error) {
		if (error !== 'cancel') {
			// 排除取消确认的情况
			proxy.$modal.msgError('删除失败')
			console.log('删除失败：', error)
		} else {
			console.log('取消删除')
		}
	}
}
/**
 * 常用审批语表单提交成功回调
 * @param payload 表单提交成功返回数据
 */
const handleDialogSuccess = payload => {
	console.log('✅ 表单提交成功:', payload)
	proxy?.$modal?.msgSuccess?.(payload.action === 'add' ? '新增成功' : '修改成功')

	queryParams.value.startPage = 1
	getList()
}

/**
 * 弹窗关闭回调（可选：清理缓存等）
 */
const handleDialogClose = () => {
	console.log('弹窗已关闭')
}
/**
 * 	初始化基础数据
 */
const initBaseInfo = () => {
	publicApi.getLocalSelect({ type: 'DICT', dictType: 'COMMON_PHRASES_TYPE' }).then(res => {
		expressionTypeOptions.value = res.data || []
	})
}
/**
 * 初始化常用审批语列表
 */
onMounted(() => {
	initBaseInfo()
	getList()
	// languageTableRef.value?.query()
})
</script>

<style lang="scss" scoped>
.app-container {
	margin: 0 auto;
	height: 100% !important;
	box-sizing: border-box;
}
</style>
