<template>
	<div>
		<el-row class="listOperate">
			<!-- <div style="float: left">
				<span class="leftSpan">工具属配置</span>
			</div>
			<div style="float: right">
				<el-button type="primary" icon="Plus" @click="add">新建</el-button>
			</div> -->
		</el-row>
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

<script setup name="workWarList">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/master/technology/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import tableParamsStore from '@/store/modules/tableParams'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight
const baseTable = ref() // table的ref
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{
		label: '工具属类型',
		prop: 'typeCode',
		editType: 'select',
		selectValue: 'workwareTypeCode',
		selectLabel: 'workwareTypeName',
		editRender: {},
		selectData: [],
	},
	{
		label: '工具属型号',
		prop: 'modelCode',
		editType: 'select',
		selectValue: 'modelCode',
		selectLabel: 'modelName',
		formatLabel: 'modelName',
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
	const { data } = await api.getWorkWareType()
	tableColumns.value[0].selectData = data
}
// 下拉框选中 根据回调参数给name值赋值
const selectChange = (res, rowIndex, colLabel) => {
	if (colLabel == '工具属类型') {
		tableData.value[rowIndex].typeName = ''
		tableData.value[rowIndex].modelName = ''
		if (res) {
			tableData.value[rowIndex].typeName = res.workwareTypeName
		}
	}
	if (colLabel == '工具属型号') {
		tableData.value[rowIndex].modelName = ''
		if (res) {
			tableData.value[rowIndex].modelName = res.modelName
		}
	}
}
// 下拉框聚焦时 根据机械类型code获取机械型号下拉框数据
const selectFocus = async (res, rowIndex, colLabel) => {
	if (colLabel == '工具属型号') {
		const typeCode = tableData.value[rowIndex].typeCode
		if (typeCode) {
			const { data } = await api.getWorkWareModel(typeCode)
			tableColumns.value[1].selectData = data
		}
	}
}
// 新增事件
const add = () => {
	let newObj = {
		modelName: '',
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
