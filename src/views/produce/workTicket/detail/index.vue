<template>
	<div>
		<!-- 除零工外显示 -->
		<div v-if="planType !== '4'">
			<div>
				<el-form
					:inline="true"
					:model="formInline"
					class="demo-form-inline"
					style="width: 60%; padding-top: 10px; margin-left: 10px"
				>
					<el-row>
						<el-col :span="8">
							<el-form-item>
								<Select
									style="display: inline-block"
									:selectData="dataArr"
									selectValue="id"
									selectLabel="deptName"
									v-model:value="formInline.deptId"
									v-model:label="formInline.deptName"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="作业量（件数）:">{{ formInline.quantity }}</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="作业量（重量）:">{{ formInline.ton }}</el-form-item>
						</el-col>
					</el-row>
				</el-form>
				<EditTable
					ref="editTableRef"
					:showSearchHeader="true"
					:tableColumns="tableColumns"
					:tableData="groupTableList"
					:editRules="editRules"
					:cellClickEvent="cellClickEvent"
					:tableHeight="tableHeight"
					@change="tableChange"
					@focus="tableFocus"
					@chang_date="chang_date"
					:disabledKey="'rowDisabled'"
					:auto-resize="true"
					@input="changeInput"
					:rowConfig="rowConfig"
					:hasAdd="true"
					:span-method="mergeRowMethod"
				/>
			</div>
		</div>
		<div v-else>
			<EditTable
				ref="editTableRef"
				:showSearchHeader="true"
				:tableColumns="tableColumns"
				:tableData="tableDatatop"
				:editRules="editRules"
				:cellClickEvent="cellClickEvent"
				:tableHeight="tableHeight"
				:hasAdd="true"
				@change="tableChange"
				@focus="tableFocus"
				@chang_date="chang_date"
				:disabledKey="'rowDisabled'"
			/>
		</div>
	</div>
</template>

<script setup name="Detail">
import { ref, reactive, getCurrentInstance, onMounted, nextTick, computed } from 'vue'
import EditTable from '@/components/EditTable/index.vue'
import api from '@/api/produce/workTicket/index.js'
import publicApi from '@/api/public/index'
import tableParamsStore from '@/store/modules/tableParams'
import Select from '@/components/Select'
import { ElButton } from 'element-plus'
import jsCookie from 'js-cookie'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }
const props = defineProps({
	workPlanId: {
		type: String,
		default: '',
	},
})
const formInline = ref({
	deptId: '',
	deptName: '',
	quantity: 0,
	ton: 0,
	ticketType: '',
})
const dataArr = ref([])
const date = ref({
	startTime: '',
	endTime: '',
})
const workPlanid = ref()
// 签票类型  1：调度 ； 2：库场
const signType = ref('1')
const processCode = ref('') //主作业过程
// 计算表格高度
const tableParams = tableParamsStore()
const tableHeight = computed(() => {
	return tableParams.pageTableHeight - 140
})
const editTableRef = ref()
//表格数据
const tableDatatop = ref([])
const chang_date = (row, title) => {
	if (planType.value == '4') {
		tableDatatop.value = tableDatatop.value.map((item, index) => {
			if (index == row.index && item.startTime && item.endTime) {
				item.workHour = getInervalHour(item.startTime, item.endTime)
			}
			return item
		})
	}
}
// 通用行合并函数（将相同多列数据合并为一行）
const mergeRowMethod = ({ rowIndex, columnIndex, row, column }) => {
	let list = groupTableList.value
	// 自定义合并规则
	if (columnIndex === 0) {
		// 第一列合并逻辑示例
		// 判断当前行和上一行的数据是否相同，相同则合并
		if (rowIndex > 0 && list[rowIndex - 1].trustCargoInfoId === row.trustCargoInfoId) {
			return {
				rowspan: 0,
				colspan: 0,
			}
		}
		// 计算合并的行数
		let rowspan = 1
		for (let i = rowIndex + 1; i < list.length; i++) {
			if (list[i].trustCargoInfoId == row.trustCargoInfoId) {
				rowspan++
			} else {
				break
			}
		}
		return {
			rowspan: rowspan,
			colspan: 1,
		}
	}
}
// 判断工时
const getInervalHour = (startDate, endDate) => {
	var stime = Date.parse(new Date(startDate))
	var etime = Date.parse(new Date(endDate))
	// 两个时间戳相差的毫秒数
	var usedTime = etime - stime
	// 转换为小时，向上取整
	var times = (usedTime / (1000 * 60 * 60)).toFixed(1)
	//var times = Math.ceil(usedTime / 3600000)
	return times > 0 ? times : 0
}

// 零工计划可编辑列表
const jobTableColumns = ref([
	{ prop: 'processDetailCode', label: '作业过程', modelLabel: 'processDetailName', editRender: {}, editType: 'select' },
	{
		prop: 'deptId',
		label: '操作工班',
		modelLabel: 'deptName',
		editRender: {},
		editType: 'select',
		selectLabel: 'deptName',
		selectValue: 'id',
		align: 'center',
		change: (e, row) => {
			// row.pieceWorkTeamId = e.id
		},
	},
	{
		prop: 'PieceWorkTeamId',
		label: '人员班组',
		modelLabel: 'pieceWorkTeamName',
		editRender: {},
		editType: 'select',
		selectLabel: 'deptName',
		selectValue: 'deptNo',
		change: (e, row) => {
			// console.log('人员班组数据', e)
			row.PieceWorkTeamId = e.deptNo

			row.PieceWorkTeamName = e.deptName
		},
		width: 120,
	},
	{
		prop: 'equipmentTypeCode',
		label: '机械类型',
		modelLabel: 'equipmentTypeName',
		editRender: {},
		editType: 'select',
		selectValue: 'value',
		align: 'center',
		change: (e, row) => {
			row.equipments = []
			row.equipmentId = ''
			row.equipmentNo = ''
		},
	},
	{
		prop: 'equipmentId',
		label: '机械编号',
		modelLabel: 'equipmentNo',
		editRender: {},
		editType: 'select',
		multiple: true,
		align: 'center',
		change: (e, row) => {
			row.equipments = []
			e.forEach(item => {
				// 根据选择的机械编号处理数据结构
				row.equipments.push({
					equipmentTypeCode: row.equipmentTypeCode,
					equipmentTypeName: row.equipmentTypeName,
					equipmentId: item.value,
					equipmentNo: item.label,
				})
			})
		},
	},
	{ prop: 'startTime', label: '开始时间', width: 200, editRender: {}, align: 'center', editType: 'datetime' },
	{
		prop: 'endTime',
		label: '结束时间',
		editRender: {},
		align: 'center',
		editType: 'datetime',
	},
	{
		prop: 'workHour',
		label: '工时',
		align: 'center',
	},
	{
		prop: 'ton',
		label: '作业量',
		width: 150,
		editType: 'input',
		editRender: {},
		align: 'right',
	},
	{
		prop: 'cargoInfoId',
		label: '添加',
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							tableColumnsDelete(row)
						},
						type: 'danger',
					},
					'删除'
				),
			]
		},
	},
])
//船舶、集疏港、转运可编辑列表
const isAdd = ref(false)
const isCheck = ref('')
const elseTableColumns = ref([
	// { prop: 'cargoInfoId', label: '' },
	{
		prop: 'trustCargoInfoId',
		label: '货物信息',
		editRender: {},
		editType: 'select',
		selectLabel: 'cargoLabel',
		selectValue: 'trustCargoId',
		change: (e, row) => {
			// console.log('选择指令票货e', e)
			// console.log('选择指令票货row', row)
			isAdd.value = false
			let flag = groupTableData.value.map(item => item.trustCargoInfoId).lastIndexOf(e.trustCargoId) !== -1
			// console.log('是否已选中', flag)
			if (flag) {
				isAdd.value = true
				proxy.$modal.msgWarning('不能选择相同货物信息')
				row.trustCargoInfoId = isCheck.value
				return
			}
			isAdd.value = false
			// // 根据选择的指令票货处理数据
			row.cargoCode = e.cargoCode
			row.cargoName = e.cargoName
			row.shipvoyageId = e.shipvoyageId
			row.shipvoyageItemId = e.shipvoyageItemId
			row.trustId = e.trustId
			row.processCode = e.processCode
			row.cargoInfoId = e.id
		},
		width: 200,
	},
	{ prop: 'processDetailCode', label: '作业过程', modelLabel: 'processDetailName', editRender: {}, editType: 'select', width: 120 },
	{
		prop: 'cabinNoList',
		label: '舱口',
		width: 200,
		modelLabel: 'text',
		editRender: {},
		editType: 'select',
		multiple: true,
		change: (e, row) => {},
		disabledFunc: row => disabledFunc(row, 'processDetailName'), // 判断哪一个单元格禁用
		width: 120,
	},
	{
		prop: 'deptId',
		label: '操作工班',
		modelLabel: 'deptName',
		editRender: {},
		editType: 'select',
		selectLabel: 'deptName',
		selectValue: 'id',
		change: (e, row) => {
			// row.pieceWorkTeamId = e.id
		},
		width: 120,
	},
	{
		prop: 'PieceWorkTeamId',
		label: '人员班组',
		modelLabel: 'pieceWorkTeamName',
		editRender: {},
		editType: 'select',
		selectLabel: 'deptName',
		selectValue: 'deptNo',
		change: (e, row) => {
			// console.log('人员班组数据', e)
			row.PieceWorkTeamId = e.deptNo

			row.PieceWorkTeamName = e.deptName
		},
		width: 120,
	},
	{
		prop: 'equipmentTypeCode',
		label: '机械类型',
		modelLabel: 'equipmentTypeName',
		editRender: {},
		editType: 'select',
		selectValue: 'value',
		width: 120,
		change: (e, row) => {
			row.equipments = []
			row.equipmentId = ''
			row.equipmentNo = ''
		},
	},
	{
		prop: 'equipmentId',
		label: '机械编号',
		width: 200,
		modelLabel: 'equipmentNo',
		editRender: {},
		editType: 'select',
		multiple: true,
		change: (e, row) => {
			row.equipments = []
			e.forEach(item => {
				// 根据选择的机械编号处理数据结构
				row.equipments.push({
					equipmentTypeCode: row.equipmentTypeCode,
					equipmentTypeName: row.equipmentTypeName,
					equipmentId: item.value,
					equipmentNo: item.label,
				})
			})
		},
		width: 120,
	},
	{ prop: 'quantity', label: '件数', width: 90, editRender: { autofocus: '.el-input__inner' }, editType: 'input' },
	{ prop: 'ton', label: '吨数', width: 90, editRender: { autofocus: '.el-input__inner' }, editType: 'input' },
	{
		prop: 'regionIdSource',
		label: '起点位置',
		modelLabel: 'regionNamesSource',
		editRender: {},
		editType: 'select',
		selectLabel: 'regionAndStorehouseName',
		selectValue: 'id',
		change: (e, row) => {
			if (!e) {
				row.regionNameSource = ''
				row.storehouseIdSource = ''
				row.storehouseNameSource = ''
				row.massNameSource = ''
				row.massIdSource = ''
				row.regionSourceId = '' //regionIdSource暂存
				return
			}
			// console.log('起点位置', e)
			row.regionNameSource = e.regionName
			row.storehouseIdSource = e.storehouseId
			row.storehouseNameSource = e.storehouseName
			row.massNameSource = e.massName
			row.massIdSource = e.massId
			row.regionSourceId = e.regionId //regionIdSource暂存
		},
		width: 180,
	},
	{
		prop: 'regionIdTarget',
		label: '终点位置',
		modelLabel: 'regionNamesTarget',
		editRender: {},
		editType: 'select',
		selectLabel: 'regionAndStorehouseName',
		selectValue: 'id',
		change: (e, row) => {
			// console.log('终点位置', e)
			if (!e) {
				row.regionNameTarget = ''
				row.storehouseIdTarget = ''
				row.storehouseNameTarget = ''
				row.massIdTarget = ''
				row.massNameTarget = ''
				row.regionTargetId = '' //regionIdTarget暂存
				return
			}
			row.regionNameTarget = e.regionName
			row.storehouseIdTarget = e.storehouseId
			row.storehouseNameTarget = e.storehouseName
			row.massIdTarget = e.massId
			row.massNameTarget = e.massName
			row.regionTargetId = e.regionId //regionIdTarget暂存
		},
		width: 180,
	},
	{ prop: 'startTime', label: '开始时间', width: 180, editRender: {}, align: 'center', editType: 'nativedatetime' },
	{
		prop: 'endTime',
		label: '结束时间',
		width: 180,
		editRender: {},
		align: 'center',
		editType: 'nativedatetime',
	},
	{
		// cargoInfoId
		prop: '',
		label: '添加',
		width: 180,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							tableColumnsDelete(row)
						},
						type: 'danger',
					},
					'删除'
				),
				h(
					ElButton,
					{
						onClick: () => {
							tableColumnsCopy(row)
						},
						type: 'primary',
						disabled: row.trustCargoInfoId ? false : true,
					},
					'复制'
				),
			]
		},
	},
])
// 判断单元格是否禁用
const disabledFunc = (row, name) => {
  if(row.processDetailName == '下舱'){
    return false
  }else{
    return true
  }
}
// 复制数据
const tableColumnsCopy = row => {
	// console.log('复制数据', row)
	let obj = JSON.parse(JSON.stringify(row))
	delete obj.index
	delete obj.row_id

	groupTableList.value.splice(row.index, 0, obj)
	groupTableData.value = JSON.parse(JSON.stringify(groupTableList.value))
	calculate()
	// console.log('groupTableData.value复制后的数据', groupTableData.value)
}
//机械列
const tableColumns = ref(elseTableColumns.value)
// 表格行点击事件，处理级联数据
const cellClickEvent = ({ row, columnIndex, title }) => {
	// if (planType.value != '4') {
	// 	if (columnIndex == '5') {
	// 		// 点击机械编号时，查级联数据
	// 		if (row.equipmentTypeCode) {
	// 			console.log('查询机械编号', row.equipmentTypeCode)
	// 			publicApi.getLocalSelect({ type: 'MAC', macTypeCode: row.equipmentTypeCode }).then(res => {
	// 				// console.log(res)
	// 				proxy.setEditTableOptions(tableColumns.value, { equipmentId: res.data })
	// 			})
	// 		} else {
	// 			proxy.setEditTableOptions(tableColumns.value, { equipmentId: [] })
	// 		}
	// 	}
	// } else {
	// 	if (columnIndex == '4') {
	// 		// 点击机械编号时，查级联数据
	// 		if (row.equipmentTypeCode) {
	// 			publicApi.getLocalSelect({ type: 'MAC', macTypeCode: row.equipmentTypeCode }).then(res => {
	// 				// console.log(res)
	// 				proxy.setEditTableOptions(tableColumns.value, { equipmentId: res.data })
	// 			})
	// 		} else {
	// 			proxy.setEditTableOptions(tableColumns.value, { equipmentId: [] })
	// 		}
	// 	}
	// }
}
// 装卸队
const labourColumns = ref([
	{
		prop: 'deptId',
		label: '装卸队',
		modelLabel: 'deptName',
		editRender: {},
		editType: 'select',
		selectLabel: 'deptName',
		selectValue: 'id',
	},
	{ prop: 'ton', label: '吨数', editRender: { autofocus: '.el-input__inner' }, editType: 'input' },
	{
		prop: '',
		label: '添加',
		width: 100,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							labourColumnsDelete(row)
						},
						type: 'danger',
					},
					'删除'
				),
			]
		},
	},
])

const labourData = ref([{ deptId: '', ton: '' }])
//表单校验
const editRules = reactive({
	workPositionCode: proxy.getRules({
		required: true,
	}),
	operatorsId: proxy.getRules({
		required: true,
	}),
	processDetailCode: proxy.getRules({
		required: true,
		// numberCheck: {
		// 	int: 7,
		// 	dec: 4,
		// },
	}),
	// ton: proxy.getRules({
	// required: true,
	// numberCheck: {
	// 	int: 7,
	// 	dec: 4,
	// },
	// }),
})

//表单校验
const validate = async () => {
	// if(formInline.value.deptId){
	// 	return proxy.$modal.msgError('请选择')
	// }
	let flag = await editTableRef.value.validAllEvent()

	return flag
	// let flag = editTableRef.value.validAllEvent()
	// console.log('flag', flag)
	// if (planType.value !== '4') {
	// 	// flag = true

	// 	if (flag) {
	// 		return flag
	// 	}
	// 	// else {
	// 	// 	proxy.$modal.warning('请完善表单信息！')
	// 	// }
	// } else {
	// 	// flag = editTableRef.value.validAllEvent()
	// }

	return flag
}
const resetPositionDate = () => {
	positionDate.value.storehouseNameSource = ''
	positionDate.value.storehouseIdTarget = ''
	positionDate.value.storehouseNameTarget = ''
	positionDate.value.storehouseIdSource = ''

	positionDate.value.regionNameSource = ''
	positionDate.value.regionNameTarget = ''
	positionDate.value.regionIdSource = ''
	positionDate.value.regionIdTarget = ''

	positionDate.value.massNameSource = ''
	positionDate.value.massIdTarget = ''
	positionDate.value.massNameTarget = ''
	positionDate.value.massIdSource = ''

	positionDate.value.regionSourceId = '' //起点位置id
	positionDate.value.regionTargetId = '' //终点位置id
}
// 清空表格
const resetTableData = () => {
	formInline.value.deptId = ''
	formInline.value.deptName = ''
	formInline.value.quantity = 0
	formInline.value.ton = 0
	groupTableList.value = []
	tableDatatop.value = []
	labourData.value = [{ deptId: '', ton: '' }]
	groupTableData.value = []
	resetPositionDate()
}
// 分组集合tabs
// const editableTabsValue = ref('')
const groupTableList = ref([])

// 操作工班
const deptList = ref([])
//下拉框初始化
const selectInit = () => {
	// 给编辑table下拉框设置数据源
	publicApi.getDictList({ types: 'MACHINE_LOCATION' }).then(res => {
		proxy.setEditTableOptions(tableColumns.value, { workPositionCode: res.data.MACHINE_LOCATION })
	})
	publicApi.getLocalSelect({ type: 'MAC_TYPE' }).then(res => {
		proxy.setEditTableOptions(tableColumns.value, { equipmentTypeCode: res.data })
	})
	api.getDepts({ type: 1 }).then(res => {
		console.log('操作工班数据', res)
		proxy.setEditTableOptions(tableColumns.value, { deptId: res.data })
	})
	api.getDepts({ type: 2 }).then(res => {
		// console.log('人员工班数据', res)
		proxy.setEditTableOptions(tableColumns.value, { PieceWorkTeamId: res.data })
	})
	publicApi.getLocalSelect({ type: 'MAC' }).then(res => {
		proxy.setEditTableOptions(tableColumns.value, { equipmentId: res.data })
	})
	api.getDeptsTally().then(res => {
		dataArr.value = res.data
	})
	let dataCabin = [
		{ label: '1', value: '1' },
		{ label: '2', value: '2' },
		{ label: '3', value: '3' },
		{ label: '4', value: '4' },
		{ label: '5', value: '5' },
		{ label: '6', value: '6' },
		{ label: '7', value: '7' },
		{ label: '8', value: '8' },
		{ label: '9', value: '9' },
		{ label: '10', value: '10' },
	]
	proxy.setEditTableOptions(tableColumns.value, { cabinNoList: dataCabin })
}

const positionDate = ref({
	regionIdSource: '', //区
	regionNameSource: '',
	regionNameTarget: '',
	regionIdTarget: '',
	massIdSource: '',
	massNameSource: '',
	massIdTarget: '',
	massNameTarget: '',
	storehouseIdSource: '', //起点位置
	storehouseNameSource: '',
	storehouseIdTarget: '', //终点位置
	storehouseNameTarget: '',

	regionSourceId: '', //id
	regionTargetId: '', //终点id
})
const ticketInfo = ref([])
const hasWork = ref(false) // 是否签票
const trustCargoList = ref([])
const deptData = ref({
	deptId: '',
	deptName: '',
})
// 获取指令票货、起始位置终点位置、装卸队、查询签票信息
const processList = ref([])
const getTrustCargo = async (workPlanId, type, cargoCode, processCode) => {
	console.log('processCode', processCode)
	formInline.value.ticketType = type
	workPlanid.value = workPlanId
	let data = {
		workPlanId: workPlanId,
		type: type,
		cargoCode: cargoCode,
		processCode: processCode,
	}
	api.getTicketInfo(data).then(res => {
		ticketInfo.value = res.data
		console.log('可编辑表格新增数据', ticketInfo.value)
	})
	api.listTrustCargo(workPlanId).then(res => {
		// console.log('选择指令票货', res.data)
		trustCargoList.value = res.data
		proxy.setEditTableOptions(tableColumns.value, { trustCargoInfoId: res.data })
	})
	api.listWorkPlanLocation(workPlanId).then(res => {
		console.log('起始位置数据', res)
		res.data.forEach(item => {
			item.regionAndStorehouseName = `${item.storehouseName}/ ${item.regionName}${item.massName == null ? '' : '/' + item.massName}`
		})
		let regionData
		let targetData
		// 筛选起始和终点下拉框数据源
		/*if (processCode == '1025' || processCode == '1026') {
			let map = new Map()
			for (let item of res.data) {
				if (!map.has(item.massId)) {
					map.set(item.massId, item)
				}
			}
			let newArr = [...map.values()]
			processList.value = newArr
			// console.log('newArr', newArr)
			proxy.setEditTableOptions(tableColumns.value, {
				regionIdSource: newArr,
				regionIdTarget: newArr,
			})
			regionData = newArr
			targetData = newArr
		} else {*/
			processList.value = res.data
			proxy.setEditTableOptions(tableColumns.value, {
				regionIdSource: res.data.filter(v1 => v1.direction === '1'), //起始位
				regionIdTarget: res.data.filter(v1 => v1.direction === '2'), //终点位
			})
			regionData = res.data.filter(v1 => v1.direction == '1') //起始
			targetData = res.data.filter(v1 => v1.direction == '2') //终点
		// }
		if (regionData.length > 0) {
			positionDate.value.regionNameSource = regionData[0].regionName
			positionDate.value.regionIdSource = regionData[0].regionId
			positionDate.value.massIdSource = regionData[0].massId
			positionDate.value.massNameSource = regionData[0].massName
			positionDate.value.storehouseIdSource = regionData[0].storehouseId
			positionDate.value.storehouseNameSource = regionData[0].storehouseName
			positionDate.value.regionSourceId = regionData[0].id
		}
		if (targetData.length > 0) {
			positionDate.value.regionNameTarget = targetData[0].regionName
			positionDate.value.regionIdTarget = targetData[0].regionId
			positionDate.value.massIdTarget = targetData[0].massId
			positionDate.value.massNameTarget = targetData[0].massName
			positionDate.value.storehouseIdTarget = targetData[0].storehouseId
			positionDate.value.storehouseNameTarget = targetData[0].storehouseName
			positionDate.value.regionTargetId = targetData[0].id
		}
		console.log('有数据吗', positionDate.value)
	})
	api.listLabor(workPlanId).then(res => {
		proxy.setEditTableOptions(labourColumns.value, { deptId: res.data })
	})
	let obj = {
		workPlanId: workPlanId,
		ticketType: type,
	}
	api.getWorkTicket(obj).then(res => {
		// console.log('指令票货回显？', res)
		// console.log('位置数据', processList.value)
		if (!res.data) {
			hasWork.value = false
			return
		}
		hasWork.value = true // 如果有数据则将是否签票状态改为true，并且回显数据
		deptData.value = {
			deptId: res.data.deptId,
			deptName: res.data.deptName,
		}

		if (res.data.type == '4') {
			tableDatatop.value = res.data.details.map(item => {
				// item.hatch = item.hatch && item.hatch.length >= 1 ? item.hatch.split(',') : []
				// 处理机械类型的数据结构回显
				item.equipmentTypeCode = item.equipments.length > 0 ? item.equipments[0].equipmentTypeCode : ''
				item.equipmentTypeName = item.equipments.length > 0 ? item.equipments[0].equipmentTypeName : ''
				// 处理机械编号数据回显
				item.equipmentId = []
				item.equipmentNo = []
				item.equipments.forEach(i => {
					item.equipmentId.push(i.equipmentId)
					item.equipmentNo.push(i.equipmentNo)
				})

				return item
			})
		} else {
			// formInline.value.deptId = res.data.deptId
			// formInline.value.deptName = res.data.deptName
			formInline.value.ton = res.data.ton
			formInline.value.quantity = res.data.quantity
			if (res.data.details.length > 0) {
				// editableTabsValue.value = res.data.tableList[0].groupId
				res.data.details.forEach(item => {
					if (item.cabinNo) {
						item.cabinNoList = item.cabinNo.split(',')
					} else {
						item.cabinNoList = []
					}
					// item.name = item.groupId
					// item.details.forEach(data => {
					item.equipmentTypeCode = item.equipments.length > 0 ? item.equipments[0].equipmentTypeCode : ''
					item.equipmentTypeName = item.equipments.length > 0 ? item.equipments[0].equipmentTypeName : ''
					// 处理机械编号数据回显
					item.equipmentId = []
					item.equipmentNo = []
					item.equipments.forEach(i => {
						item.equipmentId.push(i.equipmentId)
						item.equipmentNo.push(i.equipmentNo)
					})
					item.regionSourceId = item.regionIdSource //regionIdSource暂存
					item.regionTargetId = item.regionIdTarget
					// 通过位置数据中唯一值massId。进行位置数据回显
					processList.value.forEach(it => {
						if (item.massIdSource == it.massId) {
							item.regionIdSource = it.id
						}
						if (item.massIdTarget == it.massId) {
							item.regionIdTarget = it.id
						}
					})
					// })
					groupTableList.value = JSON.parse(JSON.stringify(res.data.details))
					groupTableData.value = JSON.parse(JSON.stringify(res.data.details))
				})
			}
		}

		labourData.value = res.data.labors.map(item => {
			const obj = {
				...item,
				regionNamesSource: `${item.storehouseNameSource} \ ${item.regionNameSource}`,
				regionNamesTarget: `${item.storehouseNameTarget} \ ${item.regionNameTarget}`,
			}
			return obj
		})
	})
}
const processIsTallyList = ref()
// 获取子作业过程
const getProcess = async (processCode, cargoCode, workPlanId) => {
	// console.log('processCode', processCode)
	publicApi.getLocalSelect({ type: 'SUB_WORK_PROCESS', parent: processCode }).then(res => {
		proxy.setEditTableOptions(tableColumns.value, { processDetailCode: res.data })
	})

	let data = {
		processCode: processCode,
		type: formInline.value.ticketType,
		cargoCode: cargoCode,
		workPlanId: workPlanId,
	}
	api.getProcessType(data).then(res => {
		processIsTallyList.value = res.data
	})
}

const getMeasure = data => {
	// console.log('接收到没', data)
	let params = {
		workPlanId: data.workPlanId,
		cargoInfoId: data.cargoInfoId,
		cargoCode: data.cargoCode,
		processDetailCode: data.processDetailCode,
	}
  console.log(12)
  console.log(params)
	if (!params.workPlanId || !params.cargoInfoId || !params.cargoCode || !params.processDetailCode) {
		return
	}
	api.getWorkMeasure(params).then(res => {
		// console.log('获取件数吨数', res)
		groupTableList.value = groupTableList.value.map(item => {
			if (
				item.cargoInfoId == params.cargoInfoId &&
				item.cargoCode == params.cargoCode &&
				item.processDetailCode == params.processDetailCode
			) {
				item.ton = res.data ? res.data.ton : ''
				item.quantity = res.data ? res.data.quantity : ''
			}

			return item
		})
		calculate()
		groupTableData.value = JSON.parse(JSON.stringify(groupTableList.value))
	})
}
// 表格选中事件 回调
const groupTableData = ref([])
const tableChange = (val, rowData, title) => {
	if (title == '机械类型') {
		// console.log('机械类型', val)
		if (val) {
			publicApi.getLocalSelect({ type: 'MAC', macTypeCode: val.value }).then(res => {
				// console.log(res)
				proxy.setEditTableOptions(tableColumns.value, { equipmentId: res.data })
			})
		} else {
			proxy.setEditTableOptions(tableColumns.value, { equipmentId: [] })
		}
	}
	if (title == '货物信息') {
		// val.processDetailCode = ''
		// val.processDetailName = ''
		nextTick(() => {
			// console.log('rowData', rowData)
			// console.log('val', val)
			// console.log('isCheck.value', isCheck.value)
			// console.log('isAdd.value', isAdd.value)

			if (!isAdd.value) {

				// console.log('ticketInfo.value', ticketInfo.value)
				if (!isCheck.value) {
					// console.log('数据新增groupTableData.value', groupTableData.value)
					// console.log('数据新增groupTableList', groupTableList.value)
					// console.log('新增', ticketInfo.value.length)
					if (ticketInfo.value.length == 0) {
						let data = {
							processCode: processCode.value,
							type: signType.value,
						}
						api.getProcess(data).then(res => {
							// console.log('没有数据提示', res)
							proxy.$modal.msgWarning(res.data)
						})
					}
					ticketInfo.value.forEach(item => {

						item.trustCargoInfoId = val.trustCargoId
						item.trustId = val.trustId
						item.cargoCode = val.cargoCode
						item.cargoName = val.cargoName
						item.shipvoyageId = val.shipvoyageId
						item.shipvoyageItemId = val.shipvoyageItemId
						item.processCode = val.processCode
						item.cargoInfoId = val.id
						item.startTime = date.value.startTime
						item.endTime = date.value.endTime
						item.pieceWorkTeamId = item.pieceWorkTeamId
						item.pieceWorkTeamName = item.pieceWorkTeamName

						item.storehouseIdSource = positionDate.value.storehouseIdSource
						item.storehouseNameSource = positionDate.value.storehouseNameSource
						item.storehouseIdTarget = positionDate.value.storehouseIdTarget
						item.storehouseNameTarget = positionDate.value.storehouseNameTarget

						item.regionNameSource = positionDate.value.regionNameSource
						item.regionNameTarget = positionDate.value.regionNameTarget
						item.regionIdSource = positionDate.value.regionSourceId //用于回显
						item.regionIdTarget = positionDate.value.regionTargetId
						item.regionSourceId = positionDate.value.regionIdSource //regionIdSource暂存
						item.regionTargetId = positionDate.value.regionIdTarget //regionIdTarget暂存

						item.massNameTarget = positionDate.value.massNameTarget
						item.massIdTarget = positionDate.value.massIdTarget
						item.massNameSource = positionDate.value.massNameSource
						item.massIdSource = positionDate.value.massIdSource

						item.equipments = [
							{
								equipmentTypeCode: item.equipmentTypeCode,
								equipmentTypeName: item.equipmentTypeName,
								equipmentId: item.equipmentId,
								equipmentNo: item.equipmentNo,
							},
						]
						console.log('数据新增', item)
            if(typeof item.equipmentId === 'string'){
              item.equipmentId = item.equipmentId.split(',')
            }
						groupTableData.value.push(JSON.parse(JSON.stringify(item)))
            let params = {
              workPlanId: workPlanid.value,
              cargoInfoId: rowData.cargoInfoId,
              cargoCode: rowData.cargoCode,
              processDetailCode: groupTableData.value[rowData.index].processDetailCode,
            }
            // console.log('选择指令票货', params)
            getMeasure(params)
					})

					// updata.value = JSON.parse(JSON.stringify(groupTableData.value))
				} else {
					updata.value = JSON.parse(JSON.stringify(groupTableData.value))
					// console.log('groupTableData.value修改', groupTableData.value)
					// console.log('updata.value修改', updata.value)
					let data = updata.value.filter(item => {
						if (item.trustCargoInfoId == isCheck.value) {
							item.trustCargoInfoId = val.trustCargoId
							item.cargoCode = val.cargoCode
							item.cargoName = val.cargoName
							item.shipvoyageId = val.shipvoyageId
							item.shipvoyageItemId = val.shipvoyageItemId
							item.trustId = val.trustId
							item.processCode = val.processCode
							item.cargoInfoId = val.id
						}
						return item
					})
					groupTableData.value = JSON.parse(JSON.stringify(data))
					// console.log('修改后的数据', groupTableData.value)
          let params = {
            workPlanId: workPlanid.value,
            cargoInfoId: rowData.cargoInfoId,
            cargoCode: rowData.cargoCode,
            processDetailCode: groupTableData.value[rowData.index].processDetailCode,
          }
          getMeasure(params)
				}
				groupTableList.value = JSON.parse(JSON.stringify(groupTableData.value))
			}

		})
	}
	if (title == '作业过程') {
		// console.log('选择作业过程', val)
		let params = {
			workPlanId: workPlanid.value,
			cargoInfoId: rowData.cargoInfoId,
			cargoCode: rowData.cargoCode,
			processDetailCode: val.value,
		}
		rowData.cabinNoList = []
		getMeasure(params)
	}
	if (title == '起始区域') {
		val.storehouseIdSource = ''
		val.storehouseNameSource = ''
		val.massNameSource = ''
		val.massIdSource = ''
	}
	if (title == '终点区域') {
		val.storehouseIdTarget = ''
		val.storehouseNameTarget = ''
		val.massNameTarget = ''
		val.massIdTarget = ''
	}
	if (title == '操作工班') {
		//rowData.pieceworkTeamId = val.deptId
		// console.log('操作工班选择', val)
		// val.storehouseIdTarget = ''
		// val.storehouseNameTarget = ''
		// val.massNameTarget = ''
		// val.massIdTarget = ''
	}
	calculate()
}
// 修改输入框
const changeInput = (val, row, title) => {
	// console.log('修改数据框数据', row)
	if (title == '件数' && !row.trustCargoInfoId) {
		proxy.$modal.msgWarning('请先选择货物信息！')
		row.quantity = ''
		return
	}
	if (title == '吨数' && !row.trustCargoInfoId) {
		proxy.$modal.msgWarning('请先选择货物信息！')
		row.ton = ''
		return
	}
	groupTableData.value = JSON.parse(JSON.stringify(groupTableList.value))
	if (planType.value != '4') {
		// console.log(processIsTallyList.value[0])
		// let ton = 0
		// let quantity = 0
		// groupTableList.value.forEach(item => {
		// 	// console.log(item.processDetailCode)
		// 	if (item.ton) {
		// 		if (item.processDetailCode == processIsTallyList.value[0]) {
		// 			ton += Number(item.ton)
		// 		}
		// 	}
		// 	if (item.quantity) {
		// 		if (item.processDetailCode == processIsTallyList.value[0]) {
		// 			quantity += Number(item.quantity)
		// 		}
		// 	}
		// })
		// formInline.value.ton = ton
		// formInline.value.quantity = quantity
		calculate()
	}
}

// 件数吨数汇总
const calculate = () => {
	// console.log('签票类型signType', signType.value)
	// 库场签票
	if (signType.value == '2') {
		let tonCollect = computed(() => {
			let ton = 0

			groupTableList.value.forEach(item => {
				if (item.ton) {
					if (processIsTallyList.value.some(existingItem => existingItem === item.processDetailCode)) {
						ton += Number(item.ton)
					}
					// if (item.processDetailCode == processIsTallyList.value[0]) {
					//   ton += Number(item.ton)
					// }
				}
			})
			return ton
		})
		formInline.value.ton = tonCollect.value * 1
		let quantityCollect = computed(() => {
			let quantity = 0
			groupTableList.value.forEach(item => {
				// console.log(item)
				if (item.quantity) {
					// if (item.processDetailCode == processIsTallyList.value[0]) {
					// 	quantity += Number(item.quantity)
					// }
					if (processIsTallyList.value.some(existingItem => existingItem === item.processDetailCode)) {
						quantity += Number(item.quantity)
					}
				}
			})
			return quantity
		})
		formInline.value.quantity = quantityCollect.value * 1
	}
	// 调度签票
	if (signType.value == '1') {
		let tonCollect = computed(() => {
			let ton = 0
			groupTableList.value.forEach(item => {
				if (item.ton) {
					if (processIsTallyList.value.some(existingItem => existingItem === item.processDetailCode)) {
						if (item.equipmentTypeCode == '0007') {
							ton += Number(item.ton)
						}
					}
					// if (item.processDetailCode == processIsTallyList.value[0] && item.equipmentTypeCode == '0007') {
					// 	ton += Number(item.ton)
					// }
				}
			})
			return ton
		})
		formInline.value.ton = tonCollect.value * 1
		let quantityCollect = computed(() => {
			let quantity = 0
			groupTableList.value.forEach(item => {
				// console.log('机械类型', item.equipmentTypeCode, item.equipmentTypeName)
				if (item.quantity) {
					if (processIsTallyList.value.some(existingItem => existingItem === item.processDetailCode)) {
						if (item.equipmentTypeCode == '0007') {
							quantity += Number(item.quantity)
						}
					}
					// if (item.processDetailCode == processIsTallyList.value[0] && item.equipmentTypeCode == '0007') {
					// 	quantity += Number(item.quantity)
					// }
				}
			})
			return quantity
		})
		formInline.value.quantity = quantityCollect.value * 1
	}
}
const planType = ref('1')
const updata = ref([])
// const groupFlag = ref('')
// 表格下拉框聚焦事件 回调
const tableFocus = (val, rowData, title, Check) => {
	if (title == '货物信息') {
		// console.log('已选过数据', Check)
		isCheck.value = Check
	}

	if (title == '作业过程' && planType.value !== '4') {
		// if (groupFlag.value == '') {
		// 	if (val.processCode) {
		// getProcess(val.processCode)
		// } else {
		// 	proxy.setEditTableOptions(tableColumns.value, { processDetailCode: [] })
		// }
		// }
	}
	if (title == '起始垛位') {
		// 查询对应场地下的垛位
		if (val.regionIdSource) {
			api.listMass(val.regionIdSource).then(res => {
				proxy.setEditTableOptions(tableColumns.value, { massNameSource: res.data })
			})
		} else {
			proxy.setEditTableOptions(tableColumns.value, { massNameSource: [] })
		}
	}
	if (title == '终点垛位') {
		// 查询对应场地下的垛位
		if (val.regionIdTarget) {
			api.listMass(val.regionIdTarget).then(res => {
				proxy.setEditTableOptions(tableColumns.value, { massNameTarget: res.data })
			})
		} else {
			proxy.setEditTableOptions(tableColumns.value, { massNameTarget: [] })
		}
	}
	// if (title == '机械编号') {
	// 	查询对应场地下的垛位
	// 	if (val.regionIdSource) {
	// 		api.listMass(val.regionIdSource).then(res => {
	// 			proxy.setEditTableOptions(tableColumns.value, { massNameSource: res.data })
	// 		})
	// 	} else {
	// 		proxy.setEditTableOptions(tableColumns.value, { massNameSource: [] })
	// 	}
	// }
}
// 获取舱口下拉框数据
const getHatchData = async hatchNum => {
	let arr = []
	for (let i = 1; i <= hatchNum; i++) {
		arr.push({ label: i, value: i })
	}
	proxy.setEditTableOptions(tableColumns.value, { hatch: arr })
}
// 列表删除
const tableColumnsDelete = row => {
	// console.log('列表删除', row.trustCargoInfoId)
	// console.log('所有列表数据', groupTableList.value)
	proxy.$modal.confirm('确定删除？').then(() => {
		// groupTableList.value = groupTableList.value.filter(item => {
		groupTableList.value.splice(row.index, 1)
		// if (item.trustCargoInfoId !== row.trustCargoInfoId) {
		// 	return item
		// }
		// })
		groupTableData.value = JSON.parse(JSON.stringify(groupTableList.value))
		calculate()
	})
}
const labourColumnsDelete = row => {
	proxy.$modal.confirm('确定删除？').then(() => {
		labourData.value.splice(row.index, 1)
	})
}
// 获取登录人信息、
const getLoginUser = () => {
	publicApi.getLoginMess().then(res => {
		console.log('登录人信息', res)
		formInline.value.deptId = hasWork.value ? deptData.value.deptId : res.data.classId
		formInline.value.deptName = hasWork.value ? deptData.value.deptName : res.data.className
	})
}

//初始化
selectInit()
defineExpose({
	validate,
	resetTableData,
	getTrustCargo,
	groupTableList,
	labourData,
	getProcess,
	getHatchData,
	selectInit,
	hasWork,
	tableColumns,
	elseTableColumns,
	jobTableColumns,
	planType,
	// addGroupData,
	// groupFlag,
	tableDatatop,
	date,
	formInline,
	getLoginUser,
	signType,
	processCode,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
