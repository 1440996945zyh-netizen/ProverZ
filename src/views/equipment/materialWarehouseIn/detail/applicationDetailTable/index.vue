<!-- 申报物资明细表格（用于入库时选择） -->
<template>
	<BaseTable
		ref="baseTableRef"
		:showSearchHeader="true"
		:selectData="selectData"
		:searchClick="getList"
		:tableColumns="tableColumns"
		:tableData="tableData"
		:syncResize="true"
		:total="total"
		:tableHeight="tableHeight"
		:checkbox-config="checkboxConfig"
		@checkbox-change="checkboxChange"
		@selectAllChangeEvent="selectAllChangeEvent"
	/>
</template>

<script setup name="applicationDetailTableForWarehouseIn">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import materialApplicationApi from '@/api/equipment/materialApplication/index'

//查询
const baseTableRef = ref()
const total = ref()
const tableHeight = reactive(window.innerHeight - 250)

const getList = e => {
	const params = {
		...queryParams.value,
		...e,
	}
	materialApplicationApi.getDetailListForWarehouseIn(params).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}

//顶部 搜索表单
const selectData = reactive([
	{
		name: '采购单号',
		type: 'input',
		modelValue: 'purchaseNo',
		span: 8,
	},
	{
		name: '物资名称',
		type: 'input',
		modelValue: 'materialName',
		span: 8,
	},
	{
		name: '供应商名称',
		type: 'input',
		modelValue: 'supplierName',
		span: 8,
	},
])

const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})

const tableData = ref([])
const tableColumns = reactive([
	{ label: '', type: 'checkbox', width: 50 },
	{
		prop: 'purchaseNo',
		label: '采购单号',
		minWidth: 150,
	},
	{
		prop: 'purchaseTypeName',
		label: '采购类型',
		width: 100,
	},
	{
		prop: 'fixedServiceCategoryName',
		label: '定点服务类别',
		minWidth: 130,
	},
	{
		prop: 'materialCode',
		label: '物资编码',
		minWidth: 120,
	},
	{
		prop: 'materialName',
		label: '物资名称',
		minWidth: 150,
	},
	{
		prop: 'specificationModel',
		label: '规格型号',
		minWidth: 100,
	},
	{
		prop: 'supplierName',
		label: '供应商',
		minWidth: 150,
	},

	{
		prop: 'taxIncludedUnitPrice',
		label: '单价(元)',
		width: 100,
		align: 'right',
	},
	{
		prop: 'purchaseQuantity',
		label: '采购数量',
		width: 100,
		align: 'right',
	},
	{
		prop: 'taxIncludedAmount',
		label: '金额(元)',
		width: 100,
		align: 'right',
	},
	{
		prop: 'unit',
		label: '单位',
    align: 'center',
		width: 70,
	},
	// {
	// 	prop: 'supplyTimeLimit',
	// 	label: '供货时限',
	// 	width: 120,
	// },
	// {
	// 	prop: 'flowDirection',
	// 	label: '流向设备',
	// 	minWidth: 120,
	// },
	{
		prop: 'warehouseInQuantity',
		label: '已入库',
		width: 90,
		align: 'right',
	},
	{
		prop: 'remainingQuantity',
		label: '未入库',
		width: 90,
		align: 'right',
	},
	// {
	// 	prop: 'applicationNo',
	// 	label: '申报单号',
	// 	minWidth: 220,
	// },
	// {
	// 	prop: 'applicationTitle',
	// 	label: '申报主题',
	// 	minWidth: 150,
	// },
	// {
	// 	prop: 'applicationTypeName',
	// 	label: '申报类型',
	// 	width: 120,
	// },
	{
		prop: 'applicationDeptName',
		label: '申报部门',
		minWidth: 180,
	},
])

// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 开启复选框范围选择功能
	visibleMethod: ({}) => {
		// 返回显示的单选框
		return true
	},
	checkMethod: ({}) => {
		// 返回可选的单选框
		return true
	},
}

// 复选框选中
const checkData = ref([])
const checkboxChange = res => {
	checkData.value = res
}
const selectAllChangeEvent = res => {
	checkData.value = res
}

const init = (supplierId) => {
	// 重置查询条件
	queryParams.value = {
		startPage: 1,
		pageSize: 20,
	}
	// 如果传入了供应商ID，则添加到查询条件中
	if (supplierId) {
		queryParams.value.supplierId = supplierId
	}
	// 自动加载数据
	nextTick(() => {
		getList(queryParams.value)
	})
}

defineExpose({
	getList,
	checkData,
	queryParams,
	tableData,
	init,
})
</script>

