<template>
	<div class="detail-list-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:total="total"
      		:tableHeight="tableHeight"
		/>
	</div>
</template>

<script setup name="materialStockCheckDetailList">
import { ref, reactive, onMounted, h, getCurrentInstance } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import { ElTag } from 'element-plus'
import materialStockCheckApi from '@/api/equipment/materialStockCheck/index'
const tableHeight = reactive(window.innerHeight - 210)
const { proxy } = getCurrentInstance()

const props = defineProps({
	checkId: {
		type: Number,
		required: true,
	},
})

const baseTable = ref(null)
const tableData = ref([])
const total = ref(0)

// 查询条件配置
const selectData = reactive([
	{
		name: '盘点状态',
		type: 'select',
		modelValue: 'checkStatus',
		span: 8,
		selectData: [
			{ label: '待盘点', value: '0' },
			{ label: '待确认', value: 1 },
			{ label: '已完成', value: 2 },
		],
	},
	{
		name: '差异类型',
		type: 'select',
		modelValue: 'differenceType',
		span: 8,
		selectData: [
			{ label: '无差异', value: '0' },
			{ label: '盘盈', value: 1 },
			{ label: '盘亏', value: 2 },
		],
	},
	{ name: '物资名称', type: 'input', modelValue: 'materialName', span: 8 },
	{ name: '规格型号', type: 'input', modelValue: 'specificationModel', span: 3 },
	{ name: '入库单号', type: 'input', modelValue: 'warehouseInNo', span: 3 },
	{ name: '供应商', type: 'input', modelValue: 'supplierName', span: 3 },
])

// 查询参数
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})

// 加载明细数据
const getList = (e) => {
	queryParams.value = e || queryParams.value
	if (!props.checkId) {
		return
	}
	const params = {
		checkId: props.checkId,
		...queryParams.value,
	}
	materialStockCheckApi.getDetailListWithInInfo(params).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data.pages || []
			total.value = res.data.totalNum || 0
		}
	})
}

// 获取差异类型标签类型
const getDifferenceTagType = (differenceType) => {
	if (differenceType === 1) {
		return 'success' // 盘盈
	} else if (differenceType === 2) {
		return 'danger' // 盘亏
	}
	return 'info' // 无差异
}

// 获取验收状态标签类型
const getAcceptanceStatusType = (acceptanceStatus) => {
	if (acceptanceStatus === 1) {
		return 'success' // 通过
	} else if (acceptanceStatus === 2) {
		return 'danger' // 不通过
	}
	return 'info' // 待验收
}

// 获取盘点状态标签
const getCheckStatusLabel = (status) => {
	const statusMap = {
		0: '待盘点',
		1: '待确认',
		2: '已完成',
	}
	return statusMap[status] || '未知'
}

// 获取盘点状态标签类型
const getCheckStatusTagType = (checkStatus) => {
	if (checkStatus === null || checkStatus === undefined) {
		return 'info' // 待盘点 - 灰色
	}
	if (checkStatus === 0) {
		return 'info' // 待盘点 - 灰色
	} else if (checkStatus === 1) {
		return 'warning' // 待确认 - 橙色
	} else if (checkStatus === 2) {
		return 'success' // 已完成 - 绿色
	}
	return 'info' // 待盘点 - 灰色
}

// 格式化数字
const formatNumber = (value) => {
	if (value === null || value === undefined) {
		return '-'
	}
	return Number(value).toLocaleString('zh-CN', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

// 格式化日期
const formatDate = (value) => {
	if (!value) {
		return '-'
	}
	if (typeof value === 'string') {
		return value.substring(0, 10)
	}
	const date = new Date(value)
	return date.toISOString().substring(0, 10)
}

// 获取差异颜色
const getDifferenceColor = (differenceType) => {
	if (differenceType === 1) {
		return '#67C23A' // 盘盈-绿色
	} else if (differenceType === 2) {
		return '#F56C6C' // 盘亏-红色
	}
	return '#909399' // 无差异-灰色
}

// 表格列配置
const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '物资名称', prop: 'materialName', align: 'left', minWidth: 150 },
	{ label: '规格型号', prop: 'specificationModel', align: 'left', minWidth: 150 },
	{ label: '计量单位', prop: 'unitName', align: 'center', width: 100 },
	{
		label: '账面数量',
		prop: 'bookQuantity',
		align: 'right',
		width: 120,
	},
	{
		label: '盘点数量',
		prop: 'checkQuantity',
		align: 'right',
		width: 120,
	},
	{
		label: '差异数量',
		prop: 'differenceQuantity',
		align: 'right',
		width: 120,
		render: row => {
			const value = row.differenceQuantity
			if (value === null || value === undefined) {
				return ['-']
			}
			const formattedValue = formatNumber(value)
			const color = getDifferenceColor(row.differenceType)
			return [h('span', { style: { color } }, formattedValue)]
		},
	},
	{
		label: '差异类型',
		prop: 'differenceTypeName',
		align: 'center',
		width: 100,
		render: row => {
			if (!row.differenceTypeName) {
				return '-'
			}
			return [
				h(
					ElTag,
					{ type: getDifferenceTagType(row.differenceType) },
					{ default: () => row.differenceTypeName }
				),
			]
		},
	},
	{
		label: '盘点状态',
		prop: 'checkStatus',
		align: 'center',
		width: 100,
		render: row => {
			if (row.checkStatus === null || row.checkStatus === undefined) {
				return [h(ElTag, { type: 'info' }, { default: () => '待盘点' })]
			}
			return [
				h(
					ElTag,
					{ type: getCheckStatusTagType(row.checkStatus) },
					{ default: () => getCheckStatusLabel(row.checkStatus) }
				),
			]
		},
	},
	{ label: '盘点备注', prop: 'remark', align: 'left', minWidth: 150 },
	{ label: '入库单号', prop: 'warehouseInNo', align: 'left', minWidth: 150 },
	{ label: '入库主题', prop: 'warehouseInTitle', align: 'left', minWidth: 200 },
	{ label: '入库类型', prop: 'warehouseInTypeName', align: 'left', minWidth: 120 },
	{
		label: '入库日期',
		prop: 'warehouseInDate',
		align: 'center',
		width: 150,
	},
	{
		label: '入库数量',
		prop: 'warehouseInQuantity',
		align: 'right',
		width: 120,
	},
	{
		label: '剩余数量',
		prop: 'remainingQuantity',
		align: 'right',
		width: 120,
	},
	{ label: '供应商', prop: 'supplierName', align: 'left', minWidth: 220 },
	{ label: '部门', prop: 'deptName', align: 'left', minWidth: 220 },
])

onMounted(() => {
	getList(null)
})

// 暴露方法供父组件调用
defineExpose({
	loadDetailList: getList,
})
</script>

<style lang="scss" scoped>
.detail-list-container {
	padding: 20px;
}
</style>

