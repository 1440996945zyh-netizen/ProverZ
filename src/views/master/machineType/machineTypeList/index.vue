<template>
	<el-collapse v-model="collapseOpen">
		<el-collapse-item title="机械型号" name="1">
			<EditTable
				ref="baseTable"
				:showSearchHeader="false"
				:showPagination="false"
				:showToolBarEditTable="true"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:tableHeight="'null'"
				:edit-config="tableEditConfig"
				:editRules="editRules"
				:hasAdd="true"
			/>
		</el-collapse-item>
	</el-collapse>
</template>

<script setup name="machineTypeList">
import EditTable from '@/components/EditTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import tableParamsStore from '@/store/modules/tableParams'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const collapseOpen = ref(['1'])
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '机械型号名称', prop: 'modelName', editType: 'input', editRender: {} },
	{
		prop: '',
		label: '添加',
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
	modelName: proxy.getRules({
		required: true,
	}),
})
const tableEditConfig = reactive({ trigger: 'click', mode: 'cell' })

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
	tableData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
	width: 100%;
	padding: 0 10px;
	justify-content: space-between;
	align-items: center;
}
</style>
