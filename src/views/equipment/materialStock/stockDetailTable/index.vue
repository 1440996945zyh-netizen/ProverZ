<!-- 库存明细表格 -->
<template>
	<BaseTable
		ref="baseTableRef"
		:showSearchHeader="false"
		:tableColumns="tableColumns"
		:tableData="tableData"
		:syncResize="true"
		:tableHeight="tableHeight"
	/>
</template>

<script setup name="stockDetailTable">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import materialStockApi from '@/api/equipment/materialStock/index'

//查询
const baseTableRef = ref()
const tableHeight = reactive(window.innerHeight - 285)
const tableData = ref([])
const currentWarehouseId = ref(null)
const currentMaterialId = ref(null)

const tableColumns = reactive([
	{ label: '序号', type: 'seq', width: 50, align: 'center', fixed: 'left' },
	{
		label: '物资名称',
		prop: 'materialName',
		minWidth: 200,
	},
	{
		label: '供应商',
		prop: 'supplierName',
		minWidth: 200,
	},
	{
		label: '规格型号',
		prop: 'specificationDesc',
		minWidth: 120,
	},
	{
		label: '品牌',
		prop: 'brand',
		width: 120,
	},
	{
		label: '采购数量',
		prop: 'purchaseQuantity',
		width: 100,
		align: 'right',
	},
	{
		label: '入库日期',
		prop: 'warehouseInTime',
		width: 120,
		align: 'center',
	},
	{
		label: '入库类型',
		prop: 'warehouseInTypeName',
		width: 120,
		align: 'left',
	},
	{
		label: '入库单号',
		prop: 'warehouseInNo',
		width: 150,
		align: 'left',
	},
	{
		label: '入库数量',
		prop: 'warehouseInQuantity',
		width: 100,
		align: 'right',
	},
	{
		label: '已出库数量',
		prop: 'outQuantity',
		width: 120,
		align: 'right',
	},
	{
		label: '库存数量',
		prop: 'remainingQuantity',
		width: 100,
		align: 'right',
	},
	{
		label: '单位',
		prop: 'unit',
		width: 70,
		align: 'center',
	},
	{
		label: '质保到期时间',
		prop: 'warrantyExpiryDate',
		width: 150,
		align: 'center',
	},
	{
		label: '采购员',
		prop: 'purchaserName',
		width: 100,
		align: 'left',
	},

])

// 加载库存明细列表
const loadDetailList = (warehouseId, materialId, params) => {
	if (!warehouseId || !materialId) {
		proxy.$message.warning('参数错误')
		return
	}
	currentWarehouseId.value = warehouseId
	currentMaterialId.value = materialId

	materialStockApi.getStockDetailList(warehouseId, materialId, params || {}).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data
		} else {
			tableData.value = []
		}
	})
}

// 暴露方法给父组件
defineExpose({
	loadDetailList,
})
</script>

