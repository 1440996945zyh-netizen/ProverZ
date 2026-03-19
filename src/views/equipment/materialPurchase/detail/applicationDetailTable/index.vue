<!-- 申报物资明细表格 -->
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
		:showNum="5"
		defaultWidth="70"
	/>
</template>

<script setup name="applicationDetailTable">
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
	materialApplicationApi.getDetailListForPurchase(params).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}

//顶部 搜索表单
const selectData = reactive([
	{
		name: '申请单号',
		type: 'input',
		modelValue: 'applicationNo',
		span: 6,
	},
	{
		name: '物资名称',
		type: 'input',
		modelValue: 'materialName',
		span: 6,
	},
	{
		name: '申请开始时间',
		type: 'date',
		modelValue: 'startDate',
		span: 6,
	},
	{
		name: '申请结束时间',
		type: 'date',
		modelValue: 'endDate',
		span: 6,
	},
	// {
	// 	name: '采购状态',
	// 	type: 'select',
	// 	modelValue: 'purchaseStatus',
	// 	span: 4,
	// 	selectData: [
	// 		{ value: '0', label: '待采购' },
	// 		{ value: '1', label: '已采购' },
	// 	],
	// },
])

const queryParams = ref({
	startPage: 1,
	pageSize: 20,
	startDate: '',
	endDate: '',
	purchaseStatus: '0', // 默认待采购
})

const tableData = ref([])
const tableColumns = reactive([
	{ label: '', type: 'checkbox', width: 50 },
	{
		prop: 'applicationNo',
		label: '申请单号',
		minWidth: 150,
	},
	{
		prop: 'materialName',
		label: '物资名称',
		minWidth: 150,
	},
	// {
	// 	prop: 'categoryName',
	// 	label: '物资类别',
	// 	minWidth: 200,
	// },
	{
		prop: 'specificationModel',
		label: '规格型号',
		width: 120,
	},
	{
		prop: 'suggestedBrand',
		label: '建议品牌',
		width: 150,
	},
	{
		prop: 'flowDirection',
		label: '流向',
		width: 120,
	},
	{
		prop: 'supplyTimeLimit',
		label: '供货时限',
		align: 'center',
		width: 120,
	},
	{
		prop: 'unit',
		align: 'center',
		label: '单位',
		width: 70,
	},
	{
		prop: 'applicationQuantity',
		label: '申报数量',
		width: 100,
		align: 'right',
	},
	{
		prop: 'estimatedPrice',
		label: '估价',
		width: 120,
		align: 'right',
	},
	{
		prop: 'amount',
		label: '金额',
		width: 120,
		align: 'right',
	},
	{
		prop: 'createByName',
		label: '申请人',
		width: 100,
		align: 'center',
	},
	{
		prop: 'createTime',
		label: '申请时间',
		width: 150,
		align: 'center',
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

const init = (purchaseTypeCode, fixedServiceCategoryCode) => {
	// 重置所有查询条件为默认值
	queryParams.value = {
		startPage: 1,
		pageSize: 20,
		startDate: '',
		endDate: '',
		purchaseStatus: '0', // 默认待采购
		applicationNo: '', // 清空申请单号
		materialName: '', // 清空物资名称
	}
	// 传递采购类型和定点服务类别到查询条件中
	if (purchaseTypeCode) {
		queryParams.value.purchaseTypeCode = purchaseTypeCode
	}
	if (fixedServiceCategoryCode) {
		queryParams.value.fixedServiceCategoryCode = fixedServiceCategoryCode
	}
	// 通过事件总线设置 SearchHeader 的默认值
	nextTick(() => {
		proxy.$bus.emit('setInitSearchData', {
			startDate: '',
			endDate: '',
			purchaseStatus: '0',
			applicationNo: '',
			materialName: '',
		})
		// 自动加载数据
		getList(queryParams.value)
	})
}

// 组件挂载时设置默认日期区间和采购状态
onMounted(() => {
	queryParams.value.startDate = ''
	queryParams.value.endDate = ''
	queryParams.value.purchaseStatus = '0' // 默认待采购
	nextTick(() => {
		proxy.$bus.emit('setInitSearchData', {
			startDate: '',
			endDate: '',
			purchaseStatus: '0',
		})
	})
})

defineExpose({
	getList,
	checkData,
	queryParams,
	tableData,
	init,
})
</script>
