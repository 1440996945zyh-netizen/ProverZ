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
        show-footer
        :footerConfig="footerConfig"
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
import BaseTable from '@/components/BaseTable/index.vue'
import { formatMoney } from '@/utils/index.js'
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
	{ prop: 'equipmentNo', label: '门机编号',width: 120  },
	{ prop: 'cabinNo', label: '舱口' ,width: 90 },
	{ prop: 'startTime', label: '开始时间', width: 'time' },
	{ prop: 'endTime', label: '结束时间', width: 'time' },
	{ prop: 'cnsc', label: '时长',width: 90},
	{ prop: 'workload', label: '工作量',width: 100 },
  { label: '创建人', prop: 'createByName', width: 100 },
  { label: '创建时间', prop: 'createTime', width: 200, align: 'center' },
	{ prop: 'remark', label: '备注', width: 90 },
])
// 表尾合计脚函数
const footerConfig = reactive({
  columns: [
    { prop: 'cnsc', formatter: formatMoney },
    { prop: 'workload', formatter: formatMoney },
  ], // 哪一列使用表尾函数，是否需要格式化处理
  functions: ['合计'], // 表尾使用方法名
})

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
