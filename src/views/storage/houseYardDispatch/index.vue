<template>
	<div class="app-container">
		<SearchHeader ref="SearchHeaderRef" class="tab_header" :selectData="selectData" @searchClick="getList" :buttonList="buttonList" />
		<el-tabs v-model="tabActiveName" type="card" class="demo-tabs" @tab-click="handleClick" style="padding-left: 5px">
			<el-tab-pane label="船舶计划" name="1">
				<BaseTable
					ref="shipEditTableRef"
					class="tab_table"
					:tableColumns="shipTableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'pageTableHeight'"
					:cellClickEvent="cellClickEvent"
				/>
			</el-tab-pane>
			<el-tab-pane label="零工计划" name="4">
				<BaseTable
					ref="jobTableRef"
					class="tab_table"
					:tableColumns="jobTableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'pageTableHeight'"
					:cellClickEvent="cellClickEvent"
				/>
			</el-tab-pane>
			<el-tab-pane label="集疏港计划" name="2">
				<BaseTable
					ref="harborTableRef"
					class="tab_table"
					:tableColumns="harborableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'pageTableHeight'"
					:cellClickEvent="cellClickEvent"
				/>
			</el-tab-pane>
			<el-tab-pane label="转运计划" name="3">
				<BaseTable
					ref="transferTableRef"
					class="tab_table"
					:tableColumns="transferTableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'pageTableHeight'"
					:cellClickEvent="cellClickEvent"
				/>
			</el-tab-pane>
		</el-tabs>
	</div>

	<el-drawer v-model="massDrawer" :title="'场地安排'" size="40%">
		<massDetail ref="massDetailRef" />
		<template #footer>
			<div>
				<el-button @click="massDrawer = false">取消</el-button>
				<el-button type="primary" @click="saveMass">保存</el-button>
			</div>
		</template>
	</el-drawer>

	<el-drawer v-model="tallyDrawer" :title="'理货员派工'" size="40%">
		<tallyDetail ref="tallyDetailRef" />
		<template #footer>
			<div>
				<el-button @click="tallyDrawer = false">取消</el-button>
				<el-button type="primary" @click="saveTally">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="houseYardDispatch">
import SearchHeader from '@/components/SearchHeader/index.vue'
import api from '@/api/storage/houseYardDispatch/index.js'
import publicApi from '@/api/public/index'
import { ElTag } from 'element-plus'
import massDetail from '@/views/storage/houseYardDispatch/massDetail/index'
import tallyDetail from '@/views/storage/houseYardDispatch/tallyDetail/index'
import { reactive, ref, toRaw } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'

const tempId = ref()

const selectData = reactive([
	{
		type: 'date', // 搜索框类型
		modelValue: 'workDate', // 绑定字段
		span: 12, // 占位，共24
		name: '选择日期',
	},
	{
		name: '班次',
		type: 'select',
		modelValue: 'classCode',
		span: 12,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
])

//单行点击事件
const cellClickEvent = ({ row }) => {
	nextTick(() => {
		tempId.value = row.id
	})
}

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	planType: '2',
	workDate: '',
	classCode: '',
})

const massDetailRef = ref(null) // 场地组件ref
const tallyDetailRef = ref(null) // 派工组件ref
// header按钮参数
const buttonList = reactive([
	{
		label: '理货员派工', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => updateTally, // 回调函数
		permission: 'storage:houseYardDispatch:userDispatch', // 权限
	},
	{
		label: '场地安排', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
		click: () => updateMass, // 回调函数
		permission: 'storage:houseYardDispatch:yardDispatch', // 权限
	},
])

const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 表格数据
const tableData = ref([])
const shipEditTableRef = ref() //船舶
const jobTableRef = ref() //零工
const harborTableRef = ref() //集疏港
const transferTableRef = ref() //转运
const formData = ref({
	updateType: '0',
	id: '',
	frontTallyBy: '',
	frontTallyByName: '',
	backTallyBy: '',
	backTallyByName: '',
	massIdsSource: '',
	massIdsTarget: '',
	locationListSource: [],
	locationListTarget: [],
})
const massDrawer = ref(false)
const tallyDrawer = ref(false)
const SearchHeaderRef = ref()
const loading = ref(false) // 是否加载中

// 更新理货员派工
const updateTally = async () => {
	if (tempId.value == undefined || tempId.value == '') {
		proxy.$message.warning('请选择一条数据！')
		return
	}
	tallyDrawer.value = true
	nextTick(() => {
		tallyDetailRef.value.formData.id = tempId.value
		tallyDetailRef.value.formData.updateType = '1'
		;(tallyDetailRef.value.formData.frontTallyBy = ''),
			(tallyDetailRef.value.formData.frontTallyByName = ''),
			(tallyDetailRef.value.formData.backTallyBy = ''),
			(tallyDetailRef.value.formData.backTallyByName = '')
		api.getDetail(tallyDetailRef.value.formData.id).then(res => {
			// proxy.setFormData(tallyDetailRef.value.formData, res.data),
			tallyDetailRef.value.formData.frontTallyBy = res.data.frontTallyBy ? res.data.frontTallyBy.split(',') : []
			tallyDetailRef.value.formData.frontTallyByName = res.data.frontTallyByName ? res.data.frontTallyByName.split(',') : []
			tallyDetailRef.value.formData.backTallyBy = res.data.backTallyBy ? res.data.backTallyBy.split(',') : []
			tallyDetailRef.value.formData.backTallyByName = res.data.backTallyByName ? res.data.backTallyByName.split(',') : []
		})
	})
}

const saveTally = async () => {
	if (tallyDetailRef.value.formData.id == undefined || tallyDetailRef.value.formData.id == '') {
		proxy.$message.warning('请选择一条数据！')
		return
	}
	tallyDetailRef.value.formData.updateType = '1'
	proxy.$modal.confirm('确定保存？').then(res => {
		let frontTallyBy = tallyDetailRef.value.formData.frontTallyBy
		let frontTallyByName = tallyDetailRef.value.formData.frontTallyByName
		let backTallyBy = tallyDetailRef.value.formData.backTallyBy
		let backTallyByName = tallyDetailRef.value.formData.backTallyByName

		const params = {
			id: tallyDetailRef.value.formData.id,
			updateType: tallyDetailRef.value.formData.updateType,
			frontTallyBy: frontTallyBy ? frontTallyBy.join(',') : '',
			frontTallyByName: frontTallyByName ? frontTallyByName.join(',') : '',
			backTallyBy: backTallyBy ? backTallyBy.join(',') : '',
			backTallyByName: backTallyByName ? backTallyByName.join(',') : '',
		}
		api.updateTally(params).then(res => {
			proxy.$message.success(res.msg)
			getList(queryParams.value)
			tallyDrawer.value = false
			tallyDetailRef.value.formData.id = ''
			tempId.value = ''
		})
	})
}

// 更新场地派工
const updateMass = row => {
	if (tempId.value == undefined || tempId.value == '') {
		proxy.$message.warning('请选择一条数据！')
		return
	}
	massDrawer.value = true
	nextTick(() => {
		massDetailRef.value.formData.id = tempId.value
		massDetailRef.value.formData.locationListSource = []
		massDetailRef.value.formData.locationListTarget = []
		api.getDetail(tempId.value).then(res => {
			proxy.setFormData(massDetailRef.value.formData, res.data)
			massDetailRef.value.formData.regionIdsSource = res.data.regionIdsSource
			massDetailRef.value.formData.regionIdsTarget = res.data.regionIdsTarget
		})
	})
}

const saveMass = async () => {
	if (massDetailRef.value.formData.id == undefined || massDetailRef.value.formData.id == '') {
		proxy.$message.warning('请选择一条数据！')
		return
	}
	massDetailRef.value.formData.updateType = '2'
	proxy.$modal.confirm('确定保存？').then(res => {
		const params = {
			id: massDetailRef.value.formData.id,
			updateType: massDetailRef.value.formData.updateType,
			locationListSource: massDetailRef.value.formData.locationListSource,
			locationListTarget: massDetailRef.value.formData.locationListTarget,
		}
		api.updateMass(params).then(res => {
			proxy.$message.success(res.msg)
			getList(queryParams.value)
			massDrawer.value = false
			massDetailRef.value.formData.id = ''
			tempId.value = ''
		})
	})
}

//船舶表格数据
const shipTableColumns = ref([
	{ prop: 'planNo', label: '编号', width: 160, align: 'center' },
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
	{ prop: 'processName', label: '作业过程', width: 200 },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 200 },
	{ prop: 'cargoOwnerName', label: '货主', align: 'center', width: 160 },
	{ prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{ label: '舱口', prop: 'hatch', width: 100 },
	{ prop: 'loadUnload', label: '装卸', width: 200 },
	{ prop: 'berthName', label: '泊位', width: 100 },
	{ prop: 'massNames', label: '货垛', width: 200 },
	{ prop: 'equipmentNamesFront', label: '前沿', width: 180, align: 'center' },
	{ prop: 'equipmentNamesReshipment', label: '转运', width: 180, align: 'center' },
	{ prop: 'equipmentNamesBack', label: '后场', width: 180, align: 'center' },
	{ prop: 'equipmentNamesAssist', label: '辅助', width: 180, align: 'center' },
	{ prop: 'laborNum', label: '装卸队', width: 110, align: 'center' },
	{ prop: 'frontTallyByName', label: '前沿理货员', width: 100, align: 'center' },
	{ prop: 'backTallyByName', label: '后场理货员', width: 100, align: 'center' },
	{ prop: 'dispatchByName', label: '调度员', width: 70, align: 'left' },
	{ prop: 'quantityPlan', label: '计划件数', width: 100, align: 'center' },
	{ prop: 'tonPlan', label: '计划重量', width: 100, align: 'center' },

	{ prop: 'startTimePlan', label: '计划开工时间', width: 150, align: 'center' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 150, align: 'center' },
	{
		prop: 'remark',
		label: '作业要求',
		width: 200,
	},
])

// 零工计划表格
const jobTableColumns = ref([
	// { prop: 'companyName', label: '作业公司', width: 105, align: 'left' },
	// { prop: 'className', label: '班次', align: 'left', width: 90 },
	{ prop: 'planNo', label: '计划编号', width: 150, align: 'center' },
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
	{ prop: 'processName', label: '作业过程', align: 'left', width: 100 },
	{ label: '货主', prop: 'cargoOwnerName', width: 120, align: 'center' },
	{ label: '货名', prop: 'cargoName', width: 120, align: 'center' },
	{ prop: 'workContent', label: '作业内容', width: 100, align: 'left' },
	{ prop: 'equipmentNamesFront', label: '前沿', width: 180, align: 'center' },
	{ prop: 'equipmentNamesReshipment', label: '转运', width: 180, align: 'center' },
	{ prop: 'equipmentNamesBack', label: '后场', width: 180, align: 'center' },
	{ prop: 'equipmentNamesAssist', label: '辅助', width: 180, align: 'center' },
	{ prop: 'laborNum', label: '装卸队', width: 110, align: 'center' },
	{ label: '申请部门', prop: 'deptName', width: 120, align: 'left' },
	{ prop: 'remark', label: '备注', width: 150, align: 'center' },
])

// 集疏港表格数据
const harborableColumns = ref([
	{ prop: 'trustNo', label: '作业通知单号', width: 150, align: 'center' },
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
	{ prop: 'processName', label: '作业过程', align: 'left', width: 100 },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 150, align: 'left' },
	{ label: '货主', prop: 'cargoOwnerName', width: 120, align: 'center' },
	// { label: '货代', prop: 'cargoAgentName', width: 120, align: 'center' },
	{ label: '货名', prop: 'cargoName', width: 120, align: 'center' },
	{ label: '申请部门', prop: 'deptName', width: 120, align: 'left' },
	{ prop: 'massNames', label: '货垛', width: 150, align: 'left' },
	{ prop: 'equipmentNamesFront', label: '前沿', width: 180, align: 'center' },
	{ prop: 'equipmentNamesReshipment', label: '转运', width: 180, align: 'center' },
	{ prop: 'equipmentNamesBack', label: '后场', width: 180, align: 'center' },
	{ prop: 'equipmentNamesAssist', label: '辅助', width: 180, align: 'center' },
	{ prop: 'laborNum', label: '申请装卸队量', width: 110, align: 'center' },
	{ prop: 'frontTallyByName', label: '前沿理货员', width: 100, align: 'center' },
	{ prop: 'backTallyByName', label: '后场理货员', width: 100, align: 'center' },
	{ prop: 'quantityPlan', label: '计划量', width: 100, align: 'center' },
	{ prop: 'tonPlan', label: '计划重量', width: 100, align: 'center' },
	{ prop: 'startTimePlan', label: '计划开工时间', width: 150, align: 'center' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 150, align: 'center' },
	{ prop: 'remark', label: '作业要求', width: 150, align: 'center' },
])

// 转运计划表格数据
const transferTableColumns = ref([
	{ prop: 'planNo', label: '编号', width: 130, align: 'center' },
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
	{ prop: 'processName', label: '作业过程', align: 'left', width: 100 },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 100, align: 'left' },
	{ label: '货主', prop: 'cargoOwnerName', width: 120, align: 'center' },
	{ label: '货名', prop: 'cargoName', width: 120, align: 'center' },
	{ label: '舱口', prop: 'hatch', width: 100 },
	// { label: '货代', prop: 'cargoAgentName', width: 120, align: 'center' },
	{ prop: 'loadUnload', label: '装卸', width: 150 },
	{ prop: 'berthName', label: '泊位', width: 100 },

	{ prop: 'massNames', label: '货垛', width: 150, align: 'left' },
	{ prop: 'equipmentNamesFront', label: '前沿', width: 180, align: 'center' },
	{ prop: 'equipmentNamesReshipment', label: '转运', width: 180, align: 'center' },
	{ prop: 'equipmentNamesBack', label: '后场', width: 180, align: 'center' },
	{ prop: 'equipmentNamesAssist', label: '辅助', width: 180, align: 'center' },
	{ prop: 'laborNum', label: '申请装卸队量', width: 110, align: 'center' },
	{ prop: 'frontTallyByName', label: '前沿理货员', width: 100, align: 'center' },
	{ prop: 'backTallyByName', label: '后场理货员', width: 100, align: 'center' },
	{ prop: 'quantityPlan', label: '计划量', width: 100, align: 'center' },
	{ prop: 'tonPlan', label: '计划重量', width: 100, align: 'center' },
	{ prop: 'startTimePlan', label: '计划开工时间', width: 150, align: 'center' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 150, align: 'center' },
	{ prop: 'remark', label: '作业要求', width: 150, align: 'center' },
])

// tab页签更变
const tabActiveName = ref('2') //默认一进来显示'集疏港'

// 页签更变
const handleClick = tab => {
	tempId.value = ''
	console.log('tab', tab.index)
	if (tab.index === '0') {
		queryParams.value.planType = '1'
		tempId.value = ''
	} else if (tab.index === '1') {
		queryParams.value.planType = '4'
		tempId.value = ''
	} else if (tab.index === '2') {
		queryParams.value.planType = '2'
		tempId.value = ''
	} else if (tab.index === '3') {
		queryParams.value.planType = '3'
		tempId.value = ''
	}
	getList(queryParams.value)
}

// 获取默认当前时间班次
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

// 列表数据
const getList = async e => {
	loading.value = true
	queryParams.value = Object.assign(queryParams.value, e)
	if (queryParams.value.classCode == '' || queryParams.value.workDate == '') {
		proxy.$message.warning('请填写完整查询条件！')
		loading.value = false
		return
	}
	await api.getList(queryParams.value).then(res => {
		console.log('表格数据', res)
		tableData.value = res.data
	})
}

getCurrentShiftClassInfo()
</script>

<style lang="scss" scoped></style>
