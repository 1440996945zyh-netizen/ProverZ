<template>
	<div>
		<!-- 除零工外显示 -->
		<div v-if="planType !== '4'">
			<div style="margin: 20px 20px">
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
import api from '@/api/produce/personnelAllotment/index.js'
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
})
const date = ref({
	startTime: '',
	endTime: '',
})
const workPlanid = ref()

const processCode = ref('') //主作业过程
// 计算表格高度
const tableParams = tableParamsStore()
const tableHeight = computed(() => {
	return tableParams.pageTableHeight - 140
})
const editTableRef = ref()
//货物信息下拉框
const tmpCargoInfosForSelect = ref([])
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
  if (columnIndex === 0 || columnIndex === 5) {
    // 第一列合并逻辑示例
    // 判断当前行和上一行的数据是否相同，相同则合并
    if (rowIndex > 0 && list[rowIndex - 1].processDetailCode === row.processDetailCode) {
      return {
        rowspan: 0,
        colspan: 0,
      }
    }
    // 计算合并的行数
    let rowspan = 1
    for (let i = rowIndex + 1; i < list.length; i++) {
      if (list[i].processDetailCode == row.processDetailCode) {
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
    prop: 'workPositionCode',
    label: '位置',
    editType: 'select',
    editRender: {},
    modelLabel: 'workPositionName',
    modelvalue: 'workPositionCode',
    align: 'center',
    selectData: [],
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
		prop: '',
		label: '操作',
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
const elseTableColumns = ref([
	/*{ prop: 'cargoInfoName',
    label: '货物信息',
    editType: 'select',
    selectLabel: 'cargoInfoName',
    selectValue: 'trustCargoInfoId',
    modelLabel: 'cargoInfoName',
    width: 400,
    selectData: tmpCargoInfosForSelect,
    disabledFunc: row => disabledFunc2(row, 'disabled'), // 判断哪一个单元格禁用
    change: (e, row) => {
      isAdd.value = false
      let flag = groupTableData.value.map(item => item.cargoInfoNo).lastIndexOf(e.cargoInfoNo) !== -1
      if (flag) {
        isAdd.value = true
        proxy.$modal.msgWarning('不能选择相同货物信息')
        row.cargoInfoName = ''
        return
      }
      isAdd.value = false
    },
  },*/
	{ prop: 'processDetailCode', label: '作业过程', modelLabel: 'processDetailName',editType: 'select', width: 120 },
	{
		prop: 'deptId',
		label: '操作工班',
		modelLabel: 'deptName',
		editType: 'select',
		selectLabel: 'deptName',
		selectValue: 'id',
		change: (e, row) => {
			// row.pieceWorkTeamId = e.id
		},
		width: 120,
	},
  {
    prop: 'workPositionCode',
    label: '位置',
    editType: 'select',
    modelLabel: 'workPositionName',
    modelvalue: 'workPositionCode',
    align: 'center',
    width: 80,
    selectData: [],
  },
  {
		prop: 'laborNumber',
		label: '派工人数',
		modelLabel: 'deptName',
		width: 80,
	},
	/*{
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
	},*/
	{ prop: 'ton', label: '吨数', width: 90, editRender: { autofocus: '.el-input__inner' }, editType: 'input' },
	{ prop: 'tmpTon', label: '理货确认数', width: 100,  },
	/*{
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
						disabled: row.cargoInfoName ? false : true,
					},
					'复制'
				),
			]
		},
	},*/
])
// 判断单元格是否禁用
const disabledFunc = (row, name) => {
  if(row.processName == '下舱'){
    return false
  }else{
    return true
  }
}
const disabledFunc2 = (row, name) => {
  if(row.disabled == '1'){
    return true
  }else{
    return false
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
	// workPositionCode: proxy.getRules({
	// 	required: true,
	// }),
	operatorsId: proxy.getRules({
		required: true,
	}),
  processDetailCode: proxy.getRules({
		required: true,
	}),
  deptId: proxy.getRules({
		required: true,
	}),
  trustCargoId: proxy.getRules({
		required: true,
	}),

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
	api.getDepts('3').then(res => {
		proxy.setEditTableOptions(tableColumns.value, { deptId: res.data })
	})

	publicApi.getLocalSelect({ type: 'MAC' }).then(res => {
		proxy.setEditTableOptions(tableColumns.value, { equipmentId: res.data })
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
const ticketInfoForAdd = ref([])
const hasWork = ref(false) // 是否签票
const trustCargoList = ref([])
const deptData = ref({
	deptId: '',
	deptName: '',
})
// 获取人员分配数据  type 2是机械分配，3是人员分配
const processList = ref([])
//获取分配详情数据
const getTrustCargo = async (workPlanId, type, cargoCode, processCode,id) => {
	workPlanid.value = workPlanId
	let data = {
    id:id,
		workPlanId: workPlanId,
    allotType: type,
		cargoCode: cargoCode,
		processCode: processCode,
	}
  nextTick(()=>{
	api.getTicketInfo(data).then(res => {
        res.data.forEach(item => {
        if (item.cabinNo) {
          item.cabinNoList = item.cabinNo.split(',')
        } else {
          item.cabinNoList = []
        }
        // 处理机械编号数据回显 将字符串转换回数组
        item.equipmentId = item.equipmentId ? item.equipmentId.split(',') : ''
        item.equipmentNo = item.equipmentNo ? item.equipmentNo.split(',') : ''
      })
    //用来存新增的数据
      groupTableData.value = JSON.parse(JSON.stringify(res.data))
    //用来存所有的
      groupTableList.value = res.data
    if(groupTableList.value.length > 0) {
      inputChange(null,groupTableList.value[0],'吨数')
    }
  })
	api.listLabor(workPlanId).then(res => {
		proxy.setEditTableOptions(labourColumns.value, { deptId: res.data })
	})

  })

}
const processIsTallyList = ref()
// 获取子作业过程
const getProcess = async (processCode, cargoCode, workPlanId) => {
	// console.log('processCode', processCode)
	publicApi.getLocalSelect({ type: 'SUB_WORK_PROCESS_NEW', parent: processCode }).then(res => {
		proxy.setEditTableOptions(tableColumns.value, { processDetailCode: res.data })
	})

	let data = {
		processCode: processCode,
		cargoCode: cargoCode,
		workPlanId: workPlanId,
	}
	api.getProcessType(data).then(res => {
		processIsTallyList.value = res.data
	})
}

const isAdd = ref(false)
// 表格选中事件 回调
const groupTableData = ref([])
const tableChange = (val, rowData, title) => {
	if (title == '机械类型') {
		if (val) {
			publicApi.getLocalSelect({ type: 'MAC', macTypeCode: val.value }).then(res => {
				proxy.setEditTableOptions(tableColumns.value, { equipmentId: res.data })
			})
		} else {
			proxy.setEditTableOptions(tableColumns.value, { equipmentId: [] })
		}
	}
  if (title == '货物信息') {
    nextTick(() => {
      if (!isAdd.value) {
          ticketInfoForAdd.value.forEach(item => {
            if (item.cargoInfoNo == val.cargoInfoNo) {
              item.cargoInfoName = val.cargoInfoName
              item.trustCargoInfoId = val.trustCargoInfoId
              item.trustId = val.trustId
              item.cargoCode = val.cargoCode
              item.cargoName = val.cargoName
              item.shipvoyageId = val.shipvoyageId
              item.shipvoyageItemId = val.shipvoyageItemId
              item.processDetailCode = val.processDetailCode
              item.processDetailName = val.processDetailName
              item.cargoInfoId = val.cargoInfoId
              item.equipments = [
                {
                  equipmentTypeCode: item.equipmentTypeCode,
                  equipmentTypeName: item.equipmentTypeName,
                  equipmentId: item.equipmentId,
                  equipmentNo: item.equipmentNo,
                },
              ]
              console.log('数据新增', item)
              if (typeof item.equipmentId === 'string') {
                item.equipmentId = item.equipmentId.split(',')
              }
              groupTableData.value.push(JSON.parse(JSON.stringify(item)))
            }
          })
        groupTableList.value = JSON.parse(JSON.stringify(groupTableData.value))
      }
    })

  }
}
const inputChange = (e, row, labe) =>{

  if(labe=='件数'){
    if(isNaN(row.quantity)){
      proxy.$message.warning('件数需为数字！')
      row.quantity=''
    }
  }
  if(labe=='吨数'){
    if(isNaN(row.ton)){
      proxy.$message.warning('吨数需为数字！')
      row.ton=''
    }
    var map = new Map();
    if(groupTableList.value.length>0) {
      groupTableList.value.forEach(item => {

        if (map.has(item.processDetailCode + "_" + (item.workPositionCode?item.workPositionCode:''))) {
            map.set(item.processDetailCode + "_" + (item.workPositionCode?item.workPositionCode:''),
              map.get(item.processDetailCode + "_" +(item.workPositionCode?item.workPositionCode:'')).concat(item.ton))
        } else {
          map.set(item.processDetailCode + "_" + (item.workPositionCode?item.workPositionCode:''), new Array(item.ton))
        }
      })
      groupTableList.value.forEach(item=>{
        if(map.has(item.processDetailCode + "_" +(item.workPositionCode?item.workPositionCode:''))) {
          item.tmpTon = map.get(item.processDetailCode + "_" + (item.workPositionCode?item.workPositionCode:'')).reduce( (acc,cur)=>{
            return Math.round((Number(acc)+Number(cur))*1000)/1000;
          },0)
        }
      })
    }
  }
}
const planType = ref('1')
// const groupFlag = ref('')
// 表格下拉框聚焦事件 回调
const tableFocus = (val, rowData, title, Check) => {
	if (title == '货物信息') {
	}
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
	proxy.$modal.confirm('确定删除？').then(() => {
		groupTableList.value.splice(row.index, 1)
		groupTableData.value = JSON.parse(JSON.stringify(groupTableList.value))
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
	processCode,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
