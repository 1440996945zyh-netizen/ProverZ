<template>
	<div>
		<el-row class="listOperate">
			<!-- <div style="float: left">
				<span class="leftSpan">工人配置</span>
			</div> -->
			<!-- <div style="float: right">
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
			/>
		</div>
	</div>
</template>

<script setup name="workerList">
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
		label: '工人岗位',
		prop: 'workerPost',
		editType: 'select',
		editRender: {},
		selectValue: 'dictValue',
		selectLabel: 'dictLabel',
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
	const { data } = await api.getWorkerPostList()
	tableColumns.value[0].selectData = data.WORKER_POST
}
// 下拉框选中 根据回调参数给name值赋值
const selectChange = (res, rowIndex, colLabel) => {
	if (colLabel == '工人岗位') {
		tableData.value[rowIndex].workerPostName = ''
		if (res) {
			tableData.value[rowIndex].workerPostName = res.dictLabel
		}
	}
}
// 新增事件
const add = () => {
	let newObj = {
		workerPost: '',
		workerPostName: '',
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
