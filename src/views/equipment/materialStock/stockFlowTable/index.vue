<!-- 库存流水表格 -->
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

<script setup name="stockFlowTable">
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
		label: '操作类型',
		prop: 'operationType',
		width: 100,
		align: 'center',
		formatter: ({ cellValue }) => {
			return cellValue === 1 ? '入库' : '出库'
		},
	},
	{
		label: '入库单号',
		prop: 'warehouseInNo',
		width: 150,
		align: 'left',
	},
	{
		label: '入库单主题',
		prop: 'warehouseInTitle',
		minWidth: 180,
		align: 'left',
	},
	{
		label: '入库日期',
		prop: 'warehouseInDate',
		width: 150,
		align: 'center',
	},
	{
		label: '出库单号',
		prop: 'warehouseOutNo',
		width: 150,
		align: 'left',
	},
	{
		label: '出库单主题',
		prop: 'warehouseOutTitle',
		minWidth: 180,
		align: 'left',
	},
	{
		label: '出库日期',
		prop: 'warehouseOutDate',
		width: 150,
		align: 'center',
	},
	{
		label: '数量',
		prop: 'quantity',
		width: 120,
		align: 'right',
		isThousandth: true,
	},
	{
		label: '操作时间',
		prop: 'operationTime',
		width: 150,
		align: 'center',
	},
])

// 加载库存流水列表
const loadFlowList = (warehouseId, materialId, params) => {
	if (!warehouseId || !materialId) {
		proxy.$message.warning('参数错误')
		return
	}
	currentWarehouseId.value = warehouseId
	currentMaterialId.value = materialId

	materialStockApi.getStockFlowList(warehouseId, materialId, params || {}).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data
		} else {
			tableData.value = []
		}
	})
}

// 暴露方法给父组件
defineExpose({
	loadFlowList,
})
</script>

