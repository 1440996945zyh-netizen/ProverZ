<!--转运申请 20231204在用 -->
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
			:cellClickEvent="cellClickEvent"
			:tableHeight="'normalTableHeight'"
		/>
	</div>
	<el-drawer v-model="transportApplyDetail" :title="title" size="80%" @close="handleClose">
		<detail ref="detailRef" />
		<template #footer>
			<div>
				<el-button @click="transportApplyDetail = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="transportPlan">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from '@/views/storage/transportApply/detail/index'
import api from '@/api/storage/transportApply/index'
import publicApi from '@/api/public/index'
import { ref, reactive, nextTick, onMounted, h, watch, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import { ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const title = ref('')

const tableData = ref([])
const selectData = reactive([
	{
		name: '日期',
		type: 'date',
		modelValue: 'workDate', //对应字段
		span: 12,
	},
	{
		name: '班次',
		type: 'select',
		modelValue: 'classCode',
		span: 12,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
  queryType: 'oddQuery',
})
const clickRow = reactive({})

//获取当前时间和工班
const getCurrentShiftClassInfo = async () => {
	await publicApi.getNowDate().then(res => {
		nextTick(() => {
			proxy.$bus.emit('setInitSearchData', { workDate: res.data.workDate, classCode: res.data.classCode })
			queryParams.value.workDate = res.data.workDate
			queryParams.value.classCode = res.data.classCode
		})
	})
	getList(queryParams.value)
}

// 查询事件
const getList = e => {
  console.log("转运申请")

	queryParams.value = e
	if (
		queryParams.value.classCode == '' ||
		queryParams.value.workDate == '' ||
		queryParams.value.classCode == null ||
		queryParams.value.workDate == null
	) {
		proxy.$message.warning('请填写完整查询条件！')
		return
	}
	if(e.queryType==null || e.queryType == ''){
	  e.queryType = 'oddQuery';
  }
	api.getList(e).then(res => {
		tableData.value = res.data
		clickRow.value = {}
	})
}

const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'storage:transportApply:add', // 权限
	},
])
const processNameList = ref([])
const tableColumns = ref([
	{ prop: 'planNo', label: '编号', width: 160, align: 'center' },
	{ prop: 'companyName', label: '作业公司', width: 110, align: 'left' },
	{ prop: 'deptName', label: '申请部门', width: 90, align: 'left' },
	{ prop: 'workDate', label: '日期', width: 100, align: 'center' },
	{ prop: 'className', label: '班次', width: 90, align: 'center' },
	{ prop: 'processName', label: '作业过程', width: 90, align: 'left' },
	{ prop: 'equipmentNamesBack', label: '申请机械', width: 180, align: 'left' },
	{ prop: 'laborNum', label: '申请装卸队', width: 110, align: 'left' },
	{ prop: 'startTimePlan', label: '计划开工时间', width: 150, align: 'center' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 150, align: 'center' },
	{ prop: 'massNamesSource', label: '源垛位', width: 150, align: 'left' },
	{ prop: 'massNamesTarget', label: '目标垛位', width: 150, align: 'left' },
	{ prop: 'remark', label: '作业要求', width: 150, align: 'left' },
	{
		label: '状态',
		prop: 'status',
		fixed: 'right',
		width: 'status',
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
	{
		prop: '',
		label: '操作',
		width: 'operate',
		fixed: 'right',
		align: 'center',
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
						permission: 'storage:transportApply:update',
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
						permission: 'storage:transportApply:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

const transportApplyDetail = ref(false)

// 新增事件
const add = () => {
	transportApplyDetail.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.MechanicalTypeRef.num = 0 //机械组件回显重置
		publicApi.getNowDate().then(res => {
			detailRef.value.formData.classCode = res.data.classCode
			detailRef.value.formData.className = res.data.className
			detailRef.value.formData.workDate = res.data.workDate
		})
	})
}

// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	transportApplyDetail.value = true
	title.value = '编辑'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.MechanicalTypeRef.num = 0 //机械组件回显重置
		api.getDetail(editRow.id).then(res => {
      console.log(res.data)
			proxy.setFormData(detailRef.value.formData, res.data)
			detailRef.value.workPlanId = editRow.id // 拿到id
			detailRef.value.formData.tonPlan = res.data.tonPlan
			detailRef.value.formData.quantityPlan = res.data.quantityPlan
			detailRef.value.formData.locationListSource = []
			detailRef.value.formData.equmentListBack = []
      detailRef.value.formData.cargoInfoNo = res.data.cargoInfoNo
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
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
//保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(res => {
			if (title.value == '编辑') {
				/*if (detailRef.value.formData.reshipmentTypeCode == 1) {
					detailRef.value.formData.busCargoInfoId = ''
				} else {
					detailRef.value.formData.trustId = ''
					detailRef.value.formData.trustNo = ''
          // detailRef.value.formData.processName = ''
          // detailRef.value.formData.processCode = ''
				}*/
				api.update(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					transportApplyDetail.value = false
				})
			} else if (title.value == '新增') {
				/*if (detailRef.value.formData.reshipmentTypeCode == 1) {
					detailRef.value.formData.busCargoInfoId = ''
				} else {
					detailRef.value.formData.trustId = ''
					detailRef.value.formData.trustNo = ''
				}*/
				api.insert(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					transportApplyDetail.value = false
				})
			}
		})
	}
}

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
const handleClose = () => {
	detailRef.value.MechanicalTypeRef.closePopover()
}

getCurrentShiftClassInfo()
</script>
