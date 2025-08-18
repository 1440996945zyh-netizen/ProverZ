<template>
	<div>
		<div class="app-container">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="false"
				:selectData="selectData"
				:searchClick="getList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:total="total"
			/>
		</div>

	</div>
</template>

<script setup name="ship">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/master/ship/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import { ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref

const total = ref('') // 数据总数

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const updateInfos = ref()

// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'info', label: '修改内容', },
])
const selectData = reactive([
	{
		name: '中文船名', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'shipName', // 绑定字段
		span: 12, // 占位，共24
	},
	{
		name: '状态', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'status', // 绑定字段
		span: 12, // 占位，共24
		selectData: [
			{
				value: '0',
				label: '停用',
			},
			{
				value: '1',
				label: '待审核',
			},
			{
				value: '9',
				label: '驳回',
			},
			{
				value: '10',
				label: '审批通过',
			},
		],
	},
])

const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
  console.log(clickRow.value)
  if (row.status == '1') {
    buttonList[1].disabled = false
    buttonList[1].label = '审核'
  }
  // if (row.status == '10') {
  //   buttonList[1].disabled = false
  //   buttonList[1].label = '销审'
  // }
  if (row.status == '0') {
    buttonList[1].disabled = true
  }
}
const cellDBLClickEvent =  ({ row }) => {
  clickRow.value = row
  edit(row)
}
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

defineExpose({
  updateInfos,
  tableData
})

// getList(queryParams.value)
</script>
