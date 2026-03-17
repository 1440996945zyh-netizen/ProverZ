<!--
 * @Author: zhangsd
 * @Date: 2026-03-17 16:30:00
 * @LastEditTime: 2026-03-17 16:36:33
 * @LastEditors: zhangsd
 * @Description: BaseTable 深度集成示例（审批语/流程配置场景）
 * @FilePath: \view\src\views\example\tableExample\index.vue
-->
<template>
	<div class="app-container">
		<!-- 核心组件使用 -->
		<BaseTable
			ref="baseTableRef"
			name="processLanguageFullExample"
			:showSearchHeader="true"
			:showToolBar="true"
			:loading="tableLoading"
			
			
			:tableData="tableData"
			:total="total"
			v-model:pagination="queryParams"
			
			
			:tableColumns="tableColumns"
			:selectData="selectData"
			:buttonList="buttonList"
			
			
			:tableHeight="tableHeight"
			:rowConfig="{ keyField: 'id', isCurrent: true, isHover: true }"
			:allAlign="null"
			
			:checkboxConfig="checkboxConfig"
			@checkbox-change="handleCheckboxChange"
			@checkbox-all="handleSelectAllChange"
			
			
			:expand-config="{ trigger: 'default', accordion: true }"
			@toggle-row-expand="handleExpandChange"
			
			
			:tree-config="{ transform: true, rowField: 'id', parentField: 'parentId' }"
			
		
			:edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
			
		
			showFooter
			:footerConfig="footerConfig"
			
			
			:searchClick="getList"
		>
			<!-- 1. 展开行插槽：展示更多元数据 -->
			<template #expand="{ row }">
				<div class="expand-content">
					<el-descriptions title="审批语详细元数据" :column="3" border size="small">
						<el-descriptions-item label="快捷键码">{{ row.keyCode || '未设置' }}</el-descriptions-item>
						<el-descriptions-item label="使用次数">{{ row.useCount || 0 }} 次</el-descriptions-item>
						<el-descriptions-item label="最后修改人">{{ row.updateByName || '-' }}</el-descriptions-item>
						<el-descriptions-item label="适用流程范围" :span="3">
							<el-tag v-for="tag in row.scope" :key="tag" size="small" style="margin-right: 5px">
								{{ tag }}
							</el-tag>
						</el-descriptions-item>
						<el-descriptions-item label="备注说明" :span="3">
							<span class="text-gray">{{ row.remark || '暂无备注信息' }}</span>
						</el-descriptions-item>
					</el-descriptions>
				</div>
			</template>

			<!-- 2. 如果需要自定义列头或特殊Slot，可以在此扩展 -->
		</BaseTable>

	</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h, toRefs, getCurrentInstance } from 'vue'
import { ElTag, ElButton, ElInputNumber, ElMessageBox } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'

import tableParamsStore from '@/store/modules/tableParams'
import { formatDate } from '@/utils/common/date'

/**
 * 基础配置与 Store
 */
const { proxy } = getCurrentInstance()
const storeHeight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHeight.value - 20)

/**
 * 响应式状态
 */
const state = reactive({
	tableLoading: false,
	tableData: [],
	total: 0,
	queryParams: {
		startPage: 1,
		pageSize: 20,
		content: '',
		expressionType: '',
		status: ''
	}
})
const { tableLoading, tableData, total, queryParams } = toRefs(state)

const baseTableRef = ref(null)
const detailDialogRef = ref(null)

/**
 * 1. 搜索表单配置 (SelectData)
 */
const selectData = reactive([
	{
		name: '快捷语内容',
		type: 'input',
		modelValue: 'content',
		span: 6,
		placeholder: '支持模糊搜索'
	},
	{
		name: '语种类型',
		type: 'select',
		modelValue: 'expressionType',
		span: 6,
		// 模拟远程字典数据
		dataConfig: { params: { type: 'DICT', dictType: 'COMMON_PHRASES_TYPE' } }
	},
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		span: 6,
		selectData: [
			{ label: '全部', value: '' },
			{ label: '启用', value: '0' },
			{ label: '禁用', value: '1' }
		]
	}
])

/**
 * 2. 顶部工具栏按钮 (ButtonList)
 */
const buttonList = reactive([
	{
		label: '新增审批语',
		type: 'primary',
		icon: 'Plus',
		click: () => handleOpenForm('create'),
		permission: 'bpm:processLanguage:create'
	},
	{
		label: '批量删除',
		type: 'danger',
		icon: 'Delete',
		plain: true,
		click: () => handleBatchDelete()
	},
	{
		label: '重置列宽',
		type: 'info',
		icon: 'Refresh',
		plain: true,
		click: () => baseTableRef.value?.resetColumnWidths()
	}
])

/**
 * 3. 表格列配置 (TableColumns)
 * 包含：序号、复选框、树形节点、可编辑项、自定义渲染
 */
const tableColumns = ref([
	{ type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
	{ type: 'seq', label: '序号', width: 70, align: 'center' },
	
	{
		prop: 'content',
		label: '审批语内容',
		align: 'left',
		minWidth: 250,
		treeNode: true, // 开启树形节点标识
		// 可编辑配置
		editRender: { name: 'input', attrs: { placeholder: '点击编辑内容' } }
	},
	{
		prop: 'sort',
		label: '排序值',
		width: 120,
		align: 'center',
		// 使用数字输入框编辑
		editRender: { name: 'ElInputNumber', props: { min: 0, max: 999 } }
	},
	{
		prop: 'useCount',
		label: '引用次数',
		width: 120,
		align: 'right',
		isThousandth: true // 使用千分位格式化
	},
	{
		prop: 'status',
		label: '状态',
		width: 100,
		align: 'center',
		render: (row) => {
			const isEnable = row.status === '0'
			return h(ElTag, { type: isEnable ? 'success' : 'danger' }, () => isEnable ? '启用' : '禁用')
		}
	},
	{
		prop: 'createTime',
		label: '创建时间',
		width: 180,
		align: 'center',
		render: (row) => h('span', formatDate(row.createTime))
	},
	{
		label: '操作',
		width: 180,
		fixed: 'right',
		align: 'center',
		render: (row) => [
			h(ElButton, {
				link: true,
				type: 'primary',
				icon: 'Edit',
				onClick: () => handleOpenForm('update', row.id)
			}, () => '编辑'),
			h(ElButton, {
				link: true,
				type: 'danger',
				icon: 'Delete',
				onClick: () => handleDelete(row.id)
			}, () => '删除')
		]
	}
])

/**
 * 4. 复选框配置
 */
const checkboxConfig = {
	highlight: true,
	reserve: true, // 翻页保留选中
	range: true    // 开启 Shift 范围选择
}

/**
 * 5. 表尾合计配置
 */
const footerConfig = {
	columns: [
		{ prop: 'useCount', formatter: (val) => `总引用: ${val}` },
		{ prop: 'sort', formatter: (val) => `平均权重: ${(val / 10).toFixed(1)}` }
	],
	functions: ['合计', '平均值']
}

/**
 * 业务逻辑方法
 */

// 获取列表数据
const getList = async (params = {}) => {
	state.tableLoading = true
	try {
		// 合并搜索栏参数、分页参数
		const finalParams = {
			...state.queryParams,
			...params,
			// 如果有高级查询，buildQueryParams 会自动处理
			...baseTableRef.value?.buildQueryParams()
		}
		
		console.log('请求后端参数:', finalParams)
		
		// 模拟接口调用
		// const res = await ProcessLanguageApi.getList(finalParams)
		// state.tableData = res.data.pages
		// state.total = res.data.totalNum
		
		// 模拟数据生成
		mockData()
		
	} catch (error) {
		proxy.$modal.msgError('获取数据失败')
	} finally {
		state.tableLoading = false
	}
}

// 模拟数据填充
const mockData = () => {
	state.tableData = [
		{ 
			id: 1, parentId: null, content: '通用审批语', sort: 1, useCount: 5280, 
			status: '0', createTime: new Date(), description: '适用于所有流程',
			scope: ['请假流程', '报销流程'], remark: '这是顶级分类'
		},
		{ 
			id: 11, parentId: 1, content: '同意，请知悉。', sort: 10, useCount: 1200, 
			status: '0', createTime: new Date(), description: '标准同意语'
		},
		{ 
			id: 12, parentId: 1, content: '情况属实，予以批准。', sort: 20, useCount: 850, 
			status: '0', createTime: new Date(), description: '正式同意语'
		},
		{ 
			id: 2, parentId: null, content: '驳回专用', sort: 2, useCount: 3100, 
			status: '0', createTime: new Date(), description: '驳回时强制要求填写'
		},
		{ 
			id: 21, parentId: 2, content: '附件不全，请重新上传。', sort: 5, useCount: 450, 
			status: '1', createTime: new Date(), description: '资料缺失驳回'
		}
	]
	state.total = 5
}

// 处理表单打开
const handleOpenForm = (type, id) => {
	detailDialogRef.value?.open({ type, id })
}

// 处理删除
const handleDelete = async (id) => {
	await proxy.$modal.confirm('确定删除该记录吗？')
	proxy.$modal.msgSuccess('删除成功')
	getList()
}

// 批量删除
const handleBatchDelete = () => {
	const selectRecords = baseTableRef.value?.getSelectEvent()
	if (!selectRecords?.length) return proxy.$modal.msgWarning('请至少选择一条记录')
	
	proxy.$modal.confirm(`确定要批量删除选中的 ${selectRecords.length} 条记录吗？`).then(() => {
		proxy.$modal.msgSuccess('批量删除成功')
		getList()
	})
}

// 事件监听：复选框
const handleCheckboxChange = (records) => {
	console.log('选中项变化:', records)
}

const handleSelectAllChange = ({ checked, records }) => {
	console.log('全选状态:', checked, '选中数据:', records, '当前页选中数:', records.length)
}

// 事件监听：行展开
const handleExpandChange = ({ row, expanded }) => {
    console.log('row, expanded  =>', row, expanded );
	if (expanded) {
		console.log('正在查看详情:', row.content)
	}
}

/**
 * 初始化
 */
onMounted(() => {
	getList()
})
</script>

<style lang="scss" scoped>


.expand-content {
	padding: 15px 40px;
	background-color: #fcfcfc;
}

.text-gray {
	color: #909399;
	font-size: 13px;
}

/* 深度选择器微调表格样式 */
:deep(.vxe-table) {
	.vxe-body--row.row--current {
		background-color: #f5f7fa;
	}
}
</style>