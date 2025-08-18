<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:tableHeight="'normalTableHeight'"
		/>
	</div>
	<el-drawer v-model="detailVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div>
				<el-button @click="detailVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="oddJobs">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/produce/oddJobs/index.js'
import publicApi from '@/api/public/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailVisible = ref(false) // 新建货种抽屉
const detailRef = ref(null) // 明细组件ref

// header检索参数
const selectData = reactive([
	{
		name: '日期', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'workDate', //绑定字段
		span: 12, //占位多少，总共24
	},
	{
		name: '班次',
		type: 'select',
		modelValue: 'classCode',
		span: 12,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
])
const queryParams = ref({}) //其他查询条件

// 点击查询的事件
const getList = e => {
	queryParams.value = e
	if (queryParams.value.classCode == '' || queryParams.value.workDate == '') {
		proxy.$modal.msgWarning('请填写完整查询条件！')
		return
	}
	// 增加查询类型为，零工查询，以区分 库场派工查询和二次派工查询
	e.queryType = 'oddQuery';
	api.getList(e).then(res => {
		tableData.value = res.data
	})
}
// header按钮参数
const buttonList = reactive([
	{
		label: '零工申请', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => add, // 回调函数
		permission: 'produce:oddJobs:add', // 权限
	},
])
const title = ref('')
// 新增事件
const add = () => {
	title.value = '新增'
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.MechanicalTypeRef.num = 0

		publicApi.getNowDate().then(res => {
			detailRef.value.formData.classCode = res.data.classCode
			detailRef.value.formData.className = res.data.className
			detailRef.value.formData.workDate = res.data.workDate
		})
	})
}
// 表格数据
const tableData = ref([])
// 表格表头参数
const tableColumns = reactive([
	{ prop: 'companyName', label: '作业公司', align: 'left' },
	{ prop: 'className', label: '班次', align: 'left', width: 90 },
	{
		label: '状态',
		prop: 'status',
		width: 'status',
		align: 'center',
		fixed: 'right',
		render: row => {
			let typeFlag = ''
			typeFlag =
				row.status == 10
					? 'info'
					: row.status == 20
					? 'success'
					: row.status == 30
					? 'primary'
					: row.status == 40
					? 'danger'
					: 'success'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => row.statusLabel,
					}
				),
			]
		},
	},
	{ prop: 'processName', label: '作业过程', width: 90, align: 'left' },
	{ prop: 'remark', label: '作业内容', align: 'left' },
	{ prop: 'equipmentNamesBack', label: '申请机械', align: 'left' },
	{ prop: 'laborNum', label: '申请装卸队', align: 'left' },
	{ prop: 'shipvoyageLabel', label: '船名航次', align: 'left' },
	{ prop: 'cargoCategoryName', label: '货种', align: 'left' },
	{ prop: 'workDate', label: '申请时间', align: 'center' },
	{ prop: 'deptName', label: '申请部门', align: 'left' },
	{ prop: 'createByName', label: '申请人', align: 'left' },
	{
		label: '操作',
		width: 'operate',
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'produce:oddJobs:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
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
						permission: 'produce:oddJobs:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

// 编辑事件
const edit = row => {
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.MechanicalTypeRef.num = 0 //机械组件回显重置
		api.getWorkPlanById(editRow.id).then(res => {
			//通过id查询抽屉需要的数据
			proxy.setFormData(detailRef.value.formData, res.data)
			console.log(detailRef.value.formData)
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.deleteWorkPlan(deleteRow.id)
		})
		.then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess(res.msg)
		})
		.catch(() => {})
	console.log('delete', deleteRow)
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData)) // 取到子组件的formData
		console.log('保存', params)
		proxy.$modal.confirm('确定保存？').then(() => {
			if (params.id == '' || params.id == null) {
				api.insertWorkPlan(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.updateWorkPlan(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
//获取日期、工班默认值
const GetCurrentShiftClassInfo = async () => {
	await publicApi.getNowDate().then(res => {
		nextTick(() => {
			proxy.$bus.emit('setInitSearchData', { workDate: res.data.workDate, classCode: res.data.classCode })
			queryParams.value.workDate = res.data.workDate
			queryParams.value.classCode = res.data.classCode
		})
	})
	getList(queryParams.value) //通过默认值查询
}

// 默认查询
GetCurrentShiftClassInfo()
</script>
