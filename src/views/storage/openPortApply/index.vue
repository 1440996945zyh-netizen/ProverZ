<template>
	<div class="app-container">
		<SearchHeader
			ref="SearchHeaderRef"
			class="tab_header"
			:selectData="selectData"
			@searchClick="getList"
			:endSelect="endSelect"
			:buttonList="buttonList"
		/>
		<EditTable
			ref="baseTable"
			:showSearchHeader="true"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:checkbox-config="checkboxConfig"
			@checkbox-change="checkboxChangeEvent"
			:selectAllChangeEvent="selectAllChangeEvent"
			:tableHeight="'normalTableHeight'"
		/>
	</div>

	<importOpenPort ref="importOpenPortRef" :permission="'storage:openPortApply:addBatch'" :trustType="2" @change="instructionsChange" />
	<!-- 导入作业指令 -->
	<instructionsImport
		ref="instructionsImportRef"
		:permission="'storage:openPortApply:add'"
		:trustType="2"
		@change="instructionsChange1"
	/>

	<el-drawer v-model="openPortApplyDetail" :title="title" size="80%" @close="handleClose">
		<detail ref="detailRef" />
		<template #footer>
			<div>
				<el-button @click="openPortApplyDetail = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="openPortApply">
import EditTable from '@/components/EditTable/index.vue'
import api from '@/api/storage/openPortApply/index'
import publicApi from '@/api/public/index'
import detail from '@/views/storage/openPortApply/detail/index'
import importOpenPort from '@/views/storage/openPortApply/importOpenPort/index' //导入上班次
import instructionsImport from '@/views/storage/openPortApply/instructionsOpenPort/index.vue' //导入作业指令
import MechanicalType from '@/businessComponents/MechanicalType/mechanical.vue'
import { ref, reactive, nextTick, onMounted, h, watch, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import { ElTag } from 'element-plus'
import SearchHeader from '@/components/SearchHeader/index.vue'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const importOpenPortRef = ref(null)
const loading = ref(false) // 是否加载中
const title = ref('')

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
const buttonList = reactive([
	/*	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'storage:openPortApply:add', // 权限
	},*/
	{
		label: '保存', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => save1, // 回调函数
		permission: 'dispatch:workPlan:save', // 权限
	},
	{
		label: '导入上班次', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'DocumentAdd', // 按钮图标，支持element-Plus中所有图标
		click: () => importPreWorkPlan, // 回调函数
		permission: 'storage:openPortApply:addBatch', // 权限
	},
	{
		label: '导入作业指令', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'CirclePlus', // 按钮图标，支持element-Plus中所有图标
		click: () => importInstruction, // 回调函数
		permission: 'storage:openPortApply:save', // 权限
	},
	{
		label: '删除', // 按钮名称
		type: 'danger', // 按钮类型
		icon: 'Delete', // 按钮图标，支持element-Plus中所有图标
		click: () => handleDelete, // 回调函数
		permission: 'storage:openPortApply:delete', // 权限
	},
])
const tableData = ref([])
const save1 = async () => {
	proxy.$modal
		.confirm('确定保存？')
		.then(async res => {
			const params = JSON.parse(JSON.stringify(tableData.value))
			await api.updatePlan(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				getList(queryParams.value)
			})
		})
		.catch(err => {})
}
//导入上班次事件
const importPreWorkPlan = () => {
	//导入上班次集疏港申请
	console.log('导入上班次集疏港申请')
	importOpenPortRef.value.instructDrawerVisible = true
}
// 导入作业指令
const instructionsImportRef = ref(null) //作业指令组件抽屉
const importInstruction = () => {
	console.log('formData.value.className', queryParams.value.className)

	nextTick(() => {
		instructionsImportRef.value.instructDrawerVisible = true
		instructionsImportRef.value.formData.workDate = queryParams.value.workDate
		instructionsImportRef.value.formData.classCode = queryParams.value.classCode
		instructionsImportRef.value.formData.className = queryParams.value.className

		// instructionsImportRef.value.importDate = {}
	})
}
const processNameList = ref([])
// 导入作业指令
const instructionsChange1 = async e => {
	console.log('e', e)
	await api.insertWorkPlan(e.trustIds, e.workDate, e.classCode, e.className).then(res => {
		// console.log('点击保存', res)
		proxy.$modal.msgSuccess(res.msg)
		getList(queryParams.value)
		// tableData.value = res.data
	})
}
const instructionsChange = async e => {
	nextTick(() => {
		publicApi.getNowDate().then(res => {
			e.forEach(item => {
				console.log(item.id, 'id start ')
				item.id = ''
				item.classCode = res.data.classCode
				item.className = res.data.className
				item.workDate = res.data.workDate
				console.log(item.id, 'id end ')
			})
			//执行插入操作
			api.insertBatch(e).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
				openPortApplyDetail.value = false
			})
		})
	})
}
// 新增事件
/*const add = () => {
	openPortApplyDetail.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.MechanicalTypeRef.num = 0 //机械组件回显重置
		detailRef.value.formData.locationListSource = []
		detailRef.value.formData.locationListTarget = []
		detailRef.value.workPlanId = '' // 清空id

		publicApi.getNowDate().then(res => {
			detailRef.value.formData.classCode = res.data.classCode
			detailRef.value.formData.className = res.data.className
			detailRef.value.formData.workDate = res.data.workDate
		})
	})
}*/
const SearchHeaderRef = ref()
// 表格数据

/*const tableColumns = ref([
	{ prop: 'planNo', label: '申请编号', width: 160, align: 'center' },
	{ prop: 'companyName', label: '作业公司', width: 110, align: 'left' },
	{ prop: 'deptName', label: '申请部门', width: 100, align: 'left' },
	{ prop: 'workDate', label: '日期', width: 100, align: 'center' },
	{ prop: 'className', label: '班次', width:90, align: 'center' },
	{ prop: 'processName', label: '作业过程', width: 90, align: 'left' },
	{ prop: 'cargoOwnerName', label: '货主', width: 120, align: 'center' },
	{ prop: 'cargoAgentName', label: '货代', width: 120, align: 'center' },
	{ prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{ label: '结算依据', prop: 'settlementBasisName', width: 120, align: 'center' },
	{ prop: 'equipmentNamesBack', label: '申请机械', width: 180, align: 'left' },
	{ prop: 'laborNum', label: '申请装卸队', width: 110, align: 'left' },
	{ prop: 'startTimePlan', label: '计划开工时间', width: 150, align: 'center' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 150, align: 'center' },
	{ prop: 'massNamesSource', label: '源垛位', width: 150, align: 'left' },
	{ prop: 'remark', label: '作业要求', width: 150, align: 'left' },
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
						permission: 'storage:openPortApply:update',
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
						permission: 'storage:openPortApply:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])*/
const tableColumns = ref([
	{ label: '', type: 'checkbox', width: 30, fixed: 'left' },
	{ prop: 'trustNo', label: '作业通知单号', width: 150, align: 'center' },
	{
		prop: 'shipvoyageLabel',
		label: '船名航次',
		minWidth: 110,
	},
	{
		prop: 'statusLabel',
		label: '状态',
		width: 100,
		align: 'center',
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
		prop: 'processCode',
		label: '作业过程',
		width: 140,
		align: 'left',
		modelLabel: 'processName',
		modelValue: 'processCode',
		selectData: processNameList,
		editRender: {},
		editType: 'select',
	},
	// { prop: 'shipvoyageLabel', label: '船名航次', width: 150, align: 'left' },
	// {
	// 	label: '舱口',
	// 	prop: 'hatch',
	// 	editType: 'select',
	// 	selectData: hatchNum,
	// 	modelLabel: 'hatchName',
	// 	multiple: true,
	// 	editRender: {},
	// 	width: 140,
	// },
	// { prop: 'workNum', label: '货代', width: 180, align: 'left' },
	{ label: '货主', prop: 'cargoOwnerName', width: 120, align: 'center' },
	// { label: '货代', prop: 'cargoAgentName', width: 120, align: 'center' },
	{ label: '货名', prop: 'cargoName', width: 120, align: 'center' },
	{ label: '申请部门', prop: 'deptName', width: 120, align: 'left' },
	// { prop: 'loadUnload', label: '装卸', width: 80, align: 'left' },
	// { prop: 'berthName', label: '泊位', width: 80, align: 'left' },
	{ prop: 'massNamesTarget', label: '库场区域', width: 150, align: 'left' },
	{
		prop: 'equipmentNamesFront',
		label: '前沿',
		width: 200,
		align: 'canter',
		render: row => {
			return [
				h(MechanicalType, {
					value: row.equipmentNamesFront,
					workPlanId: row.id,
					disabled: row.rowDisabled,
					workPositionCode: '01',
					onChange: data => {
						row.equmentListFront = data
						// console.log(data, 'data')
					},
					'onUpdate:value': val => {
						row.equipmentNamesFront = val
						// row.equmentListFront = val
					},
				}),
			]
		},
	},
	{
		prop: 'equipmentNamesReshipment',
		label: '转运',
		modelLabel: 'moveInBerthName',
		width: 180,
		align: 'canter',
		render: row => {
			return [
				h(MechanicalType, {
					value: row.equipmentNamesReshipment,
					workPlanId: row.id,
					disabled: row.rowDisabled,
					workPositionCode: '03',
					onChange: data => {
						row.equmentListReshipment = data
						// console.log(data, 'data')
					},
					'onUpdate:value': val => {
						row.equipmentNamesReshipment = val
					},
				}),
			]
		},
	},
	{
		prop: 'equipmentNamesBack',
		label: '后场',
		width: 180,
		align: 'canter',
		render: row => {
			return [
				h(MechanicalType, {
					value: row.equipmentNamesBack,
					workPlanId: row.id,
					disabled: row.rowDisabled,
					workPositionCode: '02',
					onChange: data => {
						row.equmentListBack = data
					},
					'onUpdate:value': val => {
						row.equipmentNamesBack = val
					},
				}),
			]
		},
	},
	{
		prop: 'equipmentNamesAssist',
		label: '辅助',
		modelLabel: 'moveInBerthName',
		width: 180,
		align: 'canter',
		render: row => {
			return [
				h(MechanicalType, {
					value: row.equipmentNamesAssist,
					workPlanId: row.id,
					disabled: row.rowDisabled,
					workPositionCode: '04',
					onChange: data => {
						row.equmentListAssist = data
						// console.log(data, 'data')
					},
					'onUpdate:value': val => {
						row.equipmentNamesAssist = val
					},
				}),
			]
		},
	},
	{
		prop: 'laborNum',
		label: '装卸队',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'backTallyByName',
		label: '理货员',
		width: 70,
		align: 'left',
		render: row => {
			let text1 = row.frontTallyByName ? row.frontTallyByName : ''
			let text2 = row.backTallyByName ? row.backTallyByName : ''
			let text = ''
			if (text1) {
				text = text1 + '/' + text2
			} else {
				text = text2
			}
			return [h('div', {}, text)]
		},
	},
	// { prop: 'dispatchByName', label: '调渡员', width: 100, align: 'left' },
	{
		prop: 'quantityPlan',
		label: '计划件数',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'tonPlan',
		label: '计划重量',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'startTimePlan',
		label: '计划开工时间',
		editType: 'datetime',
		editRender: {},
		width: 180,
		align: 'center',
	},
	{
		prop: 'endTimePlan',
		label: '计划完工时间',
		editType: 'datetime',
		editRender: {},
		width: 180,
		align: 'center',
	},
	{
		prop: 'remark',
		label: '作业要求',
		editType: 'input',
		editRender: {},
		width: 180,
		align: 'center',
	},
])

/*// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	openPortApplyDetail.value = true
	title.value = '编辑'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.MechanicalTypeRef.num = 0 //机械组件回显重置
		api.getDetail(editRow.id).then(res => {
			proxy.setFormData(detailRef.value.formData, res.data)
			detailRef.value.workPlanId = editRow.id // 拿到id
			detailRef.value.formData.locationListSource = []
			detailRef.value.formData.equmentListBack = []
		})
	})
}*/
// 删除事件
const handleDelete = () => {
	if (checkboxList.value.length == 0) {
		proxy.$modal.msgError('请选择需要删除的数据')
		return
	}
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			let ids = checkboxList.value.map(item => item.id)
			console.log('点击删除', ids)
			api.reqDelete(ids).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
			})
		})
		.catch(err => {})
}
/*// 删除事件
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
}*/
// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 	开启复选框范围选择功能
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
// 全选事件
const selectAllChangeEvent = ({ checked }) => {
	// if(checked){
	//   checkboxList.value = tableData.value
	// }else{

	// }
	checkboxList.value = checked ? tableData.value : []
	console.log(checked ? '所有勾选事件' : '所有取消事件')
}
const checkboxList = ref([])
// 复选事件
const checkboxChangeEvent = data => {
	// console.log('选中数据：', data)
	checkboxList.value = data
	// console.log('选中数据：', checkboxList.value)
}
const openPortApplyDetail = ref(false)

const clickRow = reactive({})

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	workDate: '',
	classCode: '',
	className: '',
})

// 点击查询的事件
const getList = e => {
	queryParams.value = e
	loading.value = true
	if (
		queryParams.value.classCode == '' ||
		queryParams.value.workDate == '' ||
		queryParams.value.classCode == null ||
		queryParams.value.workDate == null
	) {
		proxy.$message.warning('请填写完整查询条件！')
		loading.value = false
		return
	}
	api.getList(e).then(res => {
		tableData.value = res.data
		clickRow.value = {}
		loading.value = false
	})
}

//直接获取当前时间并赋给搜索框
const getCurrentShiftClassInfo = async () => {
	await publicApi.getNowDate().then(res => {
		nextTick(() => {
			proxy.$bus.emit('setInitSearchData', { workDate: res.data.workDate, classCode: res.data.classCode })
			queryParams.value.workDate = res.data.workDate
			queryParams.value.classCode = res.data.classCode
			queryParams.value.className = res.data.className
		})
	})
	getList(queryParams.value)
}

//保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(res => {
			if (title.value == '编辑') {
				api.update(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					openPortApplyDetail.value = false
				})
			} else if (title.value == '新增') {
				api.insert(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					openPortApplyDetail.value = false
				})
			}
		})
	}
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
/*const handleClose = () => {
	detailRef.value.MechanicalTypeRef.closePopover()
}*/
const init = () => {
	//获取舱口的列表并转为字符串
	let dataList = []
	for (let i = 1; i <= 10; i++) {
		dataList.push({ label: String(i), value: String(i) })
	}
	// if (tabActiveName.value == '1') {
	//   console.log('dataList', dataList)
	proxy.setEditTableOptions(tableColumns.value, { hatch: dataList })
	// }
	api.getNormalProcess().then(res => {
		processNameList.value.splice(0, processNameList.value.length)
		for (var i = 0; i < res.data.length; i++) {
			processNameList.value.push({ label: res.data[i].label, value: res.data[i].value })
		}
	})
}
init()
getCurrentShiftClassInfo()
</script>
