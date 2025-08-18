<template>
	<div>
		<div class="p10">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="false"
				:showPagination="false"
				:showToolBar="true"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:tableHeight="200"
				:edit-config="tableEditConfig"
				:editRules="editRules"
				@rowSelectChange="selectChange"
				@rowSelectFocus="selectFocus"
			/>
		</div>
	</div>
</template>

<script setup name="machineList">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/master/technology/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import tableParamsStore from '@/store/modules/tableParams'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const tableParams = tableParamsStore()
const baseTable = ref() // table的ref

// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{
		label: '机械类型',
		prop: 'machineTypeCode',
		editType: 'select',
		selectValue: 'macTypeCode',
		selectLabel: 'macTypeName',
		editRender: {},
		selectData: [],
	},
	{
		label: '机械型号',
		prop: 'machineModelCode',
		editType: 'select',
		selectValue: 'modelCode',
		selectLabel: 'modelName',
		formatLabel: 'machineModelName',
		editRender: {},
		selectData: [],
	},
	{
		label: '数量',
		prop: 'num',
		editType: 'input',
		editRender: {},
	},
	{
		prop: '',
		label: '操作',
		width: 200,
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const editRules = ref({
	num: [{ required: false, message: '请输入0-8位的数字', type: 'number' }],
})
const tableEditConfig = reactive({ trigger: 'click', mode: 'cell' })
// 获取下拉框数据
const getSelect = async () => {
	const { data } = await api.getMacTypeList()
	tableColumns.value[0].selectData = data
}
// 下拉框选中 根据回调参数给name值赋值
const selectChange = (res, rowIndex, colLabel) => {
	if (colLabel == '机械类型') {
		tableData.value[rowIndex].machineModelName = ''
		tableData.value[rowIndex].machineTypeName = ''
		if (res) {
			tableData.value[rowIndex].machineTypeName = res.macTypeName
		}
	}
	if (colLabel == '机械型号') {
		tableData.value[rowIndex].machineModelName = ''
		if (res) {
			tableData.value[rowIndex].machineModelName = res.modelName
		}
	}
}
// 下拉框聚焦时 根据机械类型code获取机械型号下拉框数据
const selectFocus = async (res, rowIndex, colLabel) => {
	if (colLabel == '机械型号') {
		const machineTypeCode = tableData.value[rowIndex].machineTypeCode
		if (machineTypeCode) {
			const { data } = await api.getMacModelList(machineTypeCode)
			tableColumns.value[1].selectData = data
		}
	}
}
// 新增事件
const add = () => {
	let newObj = {
		machineTypeCode: '',
		machineTypeName: '',
		machineModelName: '',
		machineModelCode: '',
		num: '',
	}
	tableData.value.push(newObj)
}
// 删除事件
const handleDelete = row => {
	console.log(tableData)
	let rowIndex = ''
	tableData.value.forEach((item, index) => {
		if (item._X_ROW_KEY == row._X_ROW_KEY) {
			rowIndex = index
		}
	})
	tableData.value.splice(rowIndex, 1)
}
const validate = async () => {
	const flag = await baseTable.value.validAllEvent()
	return flag
}
defineExpose({
	validate,
	add,
	tableData,
})
getSelect()
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
