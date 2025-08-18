<template>
	<div>
		<div class="p10">
			<BaseTable
				ref="baseTable"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:total="total"
				:syncResize="true"
				:loading="loading"
				:tableHeight="'drawerPageTableHeight'"
			/>
		</div>
		<el-drawer v-model="drawerVisible" :title="title" size="50%">
			<detail ref="detailRef" :dynamicType="dynamicType" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="shipDynamics">
import detail from './detail/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/dispatch/boatingDispatch/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
const emit = defineEmits(['deleteDynamics'])
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const cargoVisible = ref(false)
const detailRef = ref(null) // 明细组件ref
const total = ref(0) // 数据总数
const dynamicType = ref('') // 动态代码
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	cargoCategoryCode: '',
})
const drawerVisible = ref(false)
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ prop: 'shipName', label: '船名', width: 100 },
	{ prop: 'dynamicTypeName', label: '动态类型', width: 100 },
	{ prop: 'loadUnload', label: '装卸', width: 70 },
	{ prop: 'dynamicStartTime', label: '动态时间', width: 130 },
	{ prop: 'berthName', label: '泊位', width: 70 },
	{ prop: 'berthTypeLabel', label: '舷靠', width: 90 },
	{ prop: 'bollardNoStart', label: '首缆编号', width: 110 },
	{ prop: 'bollardNoEnd', label: '尾缆编号', width: 110 },
	{ prop: 'stopTypeName', label: '停时类型名称', width: 110},
	{ prop: 'stopName', label: '停工原因', width: 110 },
	{ prop: 'remark', label: '备注', width: 90 },
	{ prop: 'createByName', label: '操作人', width: 90 },
	{
		prop: '',
		label: '操作',
		width: 150,
    fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						disabled: false,
					},
					{
						default: () => '删除',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
					},
					{
						default: () => '编辑',
					}
				),
			]
		},
	},
])

const clickRow = ref({})
// 删除事件
const handleDelete = async row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal.confirm('是否删除？').then(() => {
    api.reqDeleteShipDynamic({ id: deleteRow.id }).then(res => {
				proxy.$modal.msgSuccess(res.msg)
        getList2(row)
		})
  }).catch(() => {})
}

const title = ref(null) // 抽屉标题
const edit = row => {
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
  dynamicType.value = row.dynamicTypeCode
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getDynamic(editRow.id).then(res => {
			let msg = JSON.parse(JSON.stringify(res.data))
			proxy.setFormData(detailRef.value.formData, msg)
      detailRef.value.tableData = res.data.tugs;
		})
	})
}
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
    params["tugs"] = JSON.parse(JSON.stringify(detailRef.value.tableData))
		proxy.$modal.confirm('是否保存？').then(() => {
			api.updateDynamic(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				drawerVisible.value = false
				getList2(params)
			})
		})
	}
}
const getList2 = async e => {
	console.log('e', e)
	const paramss = { shipvoyageId: e.shipvoyageId }
	await api.reqGetBoatStatus(paramss).then(res => {
    tableData.value = [];
		tableData.value = res.data
    tableData.value.forEach(x=>x.shipName = clickRow.value.shipName)
	})
}

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
defineExpose({
	queryParams,
	tableData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
