<template>
	<!--出勤信息-->
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:total="total"
		/>

		<el-drawer v-model="attendanceVisible" :title="title" size="80%">
			<detail ref="detailRef" />
			<AttendanceList ref="attendanceListRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="attendanceVisible = false">取消</el-button>
					<el-button v-show="title == '新增' || title == '编辑'" type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="attendanceRoll">
import Detail from './detail/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import { getCurrentInstance, h, nextTick, reactive, ref } from 'vue'
import { ElButton } from 'element-plus'
import api from '@/api/produce/attendanceRoll/index'
import { getNowDate } from '@/utils/index'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const title = ref(null)
const baseTable = ref() // table的ref
const attendanceVisible = ref(false)
const attendanceListRef = ref() //表格ref
const detailRef = ref(null) // 明细组件ref
const total = ref(0) // 数据总数

//表格数据

const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '日期', prop: 'workDate' },
	{ label: '班次', prop: 'className' },
	{ label: '作业公司', prop: 'companyName' },
	{ label: '作业工班', prop: 'deptName' },
	{
		prop: '',
		label: '操作',
		width: 200,
		fixed: 'right',
		align: 'center',

		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'business:contract:edit', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							showData(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'business:contract:view', // 权限
					},
					{
						default: () => '查看',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'business:contract:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

const selectData = reactive([
	{
		name: '日期', //日期搜索
		type: 'date', //搜索框类型
		prop: 'workDate',
		modelValue: 'workDate', //绑定字段
		span: 8, //占位多少，总共24
	},
	{
		name: '作业公司',
		type: 'select',
		modelValue: 'companyId',
		modelLabel: 'companyName',
		span: 8,
		change: row => {
			api.getDeptByCompany(row.value).then(res => {
				proxy.setEditTableOptions(selectData, { deptCode: res.data })
			})
		},
		dataConfig: {
			params: { type: 'DEPT_LEVEL', deptLevel: '1' },
			method: 'get',
		},
	},
	{
		name: '作业工班',
		type: 'select',
		prop: 'deptCode', // 便于赋值
		modelValue: 'deptId',
		modelLabel: 'deptName',
		span: 8,
		selectLabel: 'deptName',
		selectValue: 'id',
		selectData: [],
	},
])
const queryParams = ref({
	companyId: '',
	workDate: '',
	deptId: '',
	deptCode: '',
})
const getList = e => {
	queryParams.value = e
	api.getAttendanceList(queryParams.value).then(res => {
		tableData.value = res.data
		total.value = res.data.totalNum
	})
	console.log('查询拉查询拉', e)
}
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'business:contract:add', // 权限
	},
])
//查询点击事件
const clickRow = ref({})

const add = () => {
	title.value = '新增'
	attendanceVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.formDisabled = false
		attendanceListRef.value.tableData = []
		detailRef.value.getMess()
		detailRef.value.getLoginmess()
	})
}

//删除事件
const handleDelete = row => {
	const deleteRow = row // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
			})
		})
		.catch(err => {})
}
//编辑
const edit = row => {
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	attendanceVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.selectAttendance(editRow.id).then(res => {
			const resData = JSON.parse(JSON.stringify(res.data))
			proxy.setFormData(detailRef.value.formData, resData)
			detailRef.value.getLoginmess()
			detailRef.value.formDisabled = false
		})
	})
}
//查看
const showData = row => {
	title.value = '查看'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	attendanceVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.selectAttendance(editRow.id).then(res => {
			const resData = JSON.parse(JSON.stringify(res.data))
			proxy.setFormData(detailRef.value.formData, resData)
			detailRef.value.getLoginmess()
			detailRef.value.formDisabled = true
		})
	})
}
//保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(res => {
			console.log('res1:', detailRef.value.formData)
			if (title.value == '编辑') {
				api.updateAttendance(detailRef.value.formData).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					attendanceVisible.value = false
					getList(queryParams.value)
				})
			} else if (title.value == '新增') {
				api.insertAttendance(detailRef.value.formData).then(res => {
					console.log('res1:', detailRef.value.formData)
					proxy.$modal.msgSuccess(res.msg)
					attendanceVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}

const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
// 获取默认当前时间班次
const init = async () => {
	await nextTick(() => {
		proxy.$bus.emit('setInitSearchData', { workDate: getNowDate('YYYY-MM-DD') })
		queryParams.value.workDate = getNowDate('YYYY-MM-DD')
	})
	getList(queryParams.value)
}

init()
</script>

<style lang="scss" scoped>
:deep(.el-form--inline .el-form-item) {
	margin-right: 12px;
	width: 320px !important;
}
</style>
