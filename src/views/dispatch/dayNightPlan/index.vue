<template>
	<div class="app-container">
		<el-form :inline="true" :model="searchForm" class="demo-form-inline" style="margin: 8px 0 0 5px">
			<el-form-item>
				<!-- <el-date-picker
					v-model="searchForm.planDate"
					value-format="YYYY-MM-DD"
					format="YYYY-MM-DD"
					type="date"
					placeholder="计划日期"
				></el-date-picker> -->
				<input
					v-model="searchForm.planDate"
					class="newDateStyle"
					type="Date"
					onfocus="(this.type='Date')"
					onblur="(this.type='Date')"
					max="2200-12-30"
					placeholder="计划日期"
				/>
				<span
					style="
						position: absolute;
						right: 1px;
						top: 1px;
						bottom: 1px;
						background-color: var(--el-fill-color-light);
						border-radius: 0px 4px 4px 0px;
						color: var(--el-color-info);
						padding: 0px 10px;
					"
				>
					{{ searchForm.endDate }}
				</span>
			</el-form-item>
			<el-form-item>
				<div>
					<el-button type="primary" @click="getList" icon="Search">查询</el-button>
				</div>
			</el-form-item>
			<div style="float: right">
				<el-button v-hasPermi="['dispatch:dayNightPlan:save']" type="primary" @click="save" icon="Select">保存</el-button>
				<el-button v-hasPermi="['dispatch:dayNightPlan:save']" type="primary" @click="importPlan" icon="plus">
					导入昨日计划
				</el-button>
			</div>
		</el-form>

		<EditTable
			ref="editTableRef"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:border="true"
			:rowConfig="rowConfig"
			:exportConfig="exportConfig"
			:editRules="editRules"
			:loading="false"
			:showFooter="true"
			:tableHeight="'pageTableHeight'"
			:hasAdd="true"
			@change="tableChange"
      @blur='inputChange'
      @dblclick="cellDBLClickEvent"
			:cellClickEvent="cellClickEvent"
		/>
	</div>
</template>

<script setup name="dayNightPlan">
import api from '@/api/dispatch/dayNightPlan/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'

import EditTable from '@/components/EditTable/index.vue'
import { getNowDate, uniqueArr } from '@/utils/index.js'
import { ElButton } from 'element-plus'
import publicApi from '../../../api/public'
import math from '@/utils/math'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref('')
// 表格数据
const tableData = ref([])
const editTableRef = ref() // editTable的ref
const exportConfig = {}
//表单校验
const editRules = reactive({
	berthId: proxy.getRules({
		required: true,
	}),
	shipvoyageItemId: proxy.getRules({
		required: true,
	}),
	cargoCategoryName: proxy.getRules({
		required: true,
	}),
	workNum: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 4,
		},
	}),
})

const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'row_id' }
//edit表格数据
const tableColumns = reactive([
	{
		prop: 'berthId',
		label: '泊位',
		editType: 'select',
		modelLabel: 'berthName',
		editRender: {},
		width: 80,
		align: 'center',
		selectData: [],
	},
	{
		label: '航次',
		prop: 'shipvoyageItemId',
		selectLabel: 'label',
		selectValue: 'value',
		modelLabel: 'shipVoyageLabel',
		editType: 'select',
		editRender: {},
		width: 130,
    align: 'center'
	},
	{ prop: 'scn', label: 'SCN', width: 80, align: 'center' },
	{
		prop: 'loadUnload',
		label: '装/卸',
		width: 80,
		align: 'center',
	},
	{
		prop: 'cargoCategoryName',
		label: '货物种类',
		width: 100,
		editType: 'input',
		align: 'center',
	},
	{ prop: 'loadNum', label: '载货量', width: 80, align: 'center' },
	{
		prop: 'nightWorkNum',
		label: '夜班作业量',
		width: 105,
		editType: 'input',
		editRender: {},
		align: 'center',
	},
	{
		prop: 'mornWorkNum',
		label: '白班作业量',
		width: 105,
		editType: 'input',
		editRender: {},
		align: 'center',
	},
	{
		prop: 'residueNum',
		label: '结余量',
		editType: 'input',
		editRender: {},
		width: 80,
		align: 'center',
	},
	{
		prop: 'berthingTimePlan',
		label: '计划靠泊时间',
		width: 150,
		editType: 'nativedatetime',
		editRender: {},
		align: 'center',
	},
	{ prop: 'starttimePlan', label: '计划开工时间', editType: 'nativedatetime', width: 150, editRender: {}, align: 'center' },
	{ prop: 'endtimePlan', label: '计划完工时间', editType: 'nativedatetime', width: 150, editRender: {}, align: 'center' },
	{ prop: 'leaveBerthTimePlan', label: '计划离泊时间', width: 150, editType: 'nativedatetime', editRender: {}, align: 'center' },
	{ prop: 'moveBerthTimePlan', label: '计划移泊时间', editType: 'nativedatetime', width: 150, editRender: {}, align: 'center' },
	{
		prop: 'moveInBerthId',
		label: '移入泊位',
		editType: 'select',
		editRender: {},
		selectValue: 'value',
		selectLabel: 'label',
		modelLabel: 'moveInBerthName',
		width: 90,
		align: 'center',
		selectData: [],
	},
	{
		prop: 'delete',
		label: '添加',
		width: 100,
		fixed: 'right',
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
//查询条件
const searchForm = reactive({
	planDate: '',
	endDate: '',
})

const clickRow = ref({})
// 点击查询的事件
const getList = () => {
	loading.value = true
	api.getList(searchForm.planDate).then(res => {
		tableData.value = res.data
	})
}
/** 删除按钮操作 */
const handleDelete = row => {
	tableData.value.forEach((item, index) => {
		// 根据表格自动生成的唯一标识删除，字段名在rowConfig中指定
		if (item.row_id == row.row_id) {
			tableData.value.splice(index, 1)
			return
		}
	})
}

const cargoItemCode = ref([])
const cargoItemCodeStr = ref('')

// 保存事件
const save = async () => {
	if (await editTableRef.value.validAllEvent()) {
		let flag = false
    let shipName = ''
		tableData.value.forEach(item => {
      console.log(item)
			//作业量不能大于结余量
			if (math.numSub(math.numAdd(item.mornWorkNum, item.nightWorkNum), item.residueNum) > 0) {
				flag = true
        shipName = item.shipVoyageLabel
				return
			}
		})
		if (flag) {
			proxy.$modal.msgError(shipName + '作业量不能大于结余量~')
			return
		}
		proxy.$modal.confirm('确定保存？').then(function () {
			const list = tableData.value
			//前端处理code和name的list转为String传给后端
			/*let flag = true
			list.forEach((item, index) => {
				//计划移泊时间和移入泊位要么都填要么都不填
				/!*let rowIndex = index + 1
				if (item.moveBerthTimePlan != null && item.moveInBerthId == '') {
					proxy.$modal.msgWarning('第' + rowIndex + '行泊位暂未填写')
					flag = false
					return
				}
				if (item.moveBerthTimePlan != null && item.moveInBerthId == null) {
					proxy.$modal.msgWarning('第' + rowIndex + '行泊位暂未填写')
					flag = false
					return
				}
				if (item.moveInBerthId != null && item.moveBerthTimePlan == '') {
					proxy.$modal.msgWarning('第' + rowIndex + '行计划移泊时间暂未填写')
					flag = false
					return
				}
				if (item.moveInBerthId != null && item.moveBerthTimePlan == null) {
					proxy.$modal.msgWarning('第' + rowIndex + '行计划移泊时间暂未填写')
					flag = false
					return
				}*!/
				cargoItemCode.value = item.cargoCategoryCode
				if (typeof item.cargoCategoryCode == 'string') {
					item.cargoCategoryCode = item.cargoCategoryCode
				} else {
					cargoItemCodeStr.value = cargoItemCode.value.join(',')
					list[index].cargoCategoryCode = cargoItemCodeStr.value
					cargoItemCodeStr.value = ''
					cargoItemCode.value = []
				}
			})
			if (flag == false) {
				return
			}*/
			api.listSave(list, searchForm.planDate).then(response => {
				getList()
				loading.value = false
				proxy.$modal.msgSuccess(response.msg)
			})
		})
	}
}
const importPlan = async () => {
	if (await editTableRef.value.validAllEvent()) {
		let list1 = tableData.value
		if (list1.length > 0) {
			proxy.$modal.msgWarning('今日有计划，不能导入昨日计划')
			return
		} else {
			/*      let a =new Date(searchForm.planDate)
      let b = new Date(a-24*60*60*1000)
      let c =b.toLocaleDateString()*/
			proxy.$modal.confirm('确定导入嘛？').then(function () {
				api.importPlan(searchForm.planDate).then(res => {
					if (res.data.length == 0) {
						proxy.$modal.msgWarning('昨日无计划')
						return
					} else {
						tableData.value = res.data
						loading.value = false
						proxy.$modal.msgSuccess(res.msg)
					}
				})
			})
		}
	}
}
// 行点击事件
const cellClickEvent = ({ row, column }) => {
	//获取货种的列表并转为字符串
	if (typeof row.cargoCategoryName != 'string') {
		row.cargoCategoryName = row.cargoCategoryName.join(',')
	}
}

//临时数据
const codeList = ref([])
const nameList = ref([])
const cargoCategoryList = ref([])
const tempList = ref([])

//下拉框改变事件
const tableChange = (val, rowData, title) => {
	console.log("==================", val)
	if (title == '航次') {
		if (val.berthId != null && (val.shipvoyageItemId == '' || val.shipvoyageItemId == null)) {
			return
		}
    tempList.value = []
		if (val.shipvoyageItemId != null || val.shipvoyageItemId != '') {
			//将收到的货种名和货种code拆分成数组
			console.log(rowData.cargoCategoryName)
			if (val.cargoCategoryName != null) {
				nameList.value = val.cargoCategoryName.split(',')
				//循环赋值到货种下拉框
				nameList.value.forEach((item, index) => {
					tempList.value.push({
						cargoCategoryName: nameList.value[index],
					})
				})
				console.log('tempList.value', JSON.parse(JSON.stringify(tempList.value)))
				rowData.cargoCategoryName = JSON.parse(JSON.stringify(tempList.value))[0].cargoCategoryName
			}
			rowData.scn = val.scn
			rowData.loadUnload = val.loadUnload
			rowData.cargoNum = val.loadNum
			rowData.shipvoyageId = val.shipvoyageId
      rowData.loadNum = val.cargoNum
			//res:作业量总和
			api.getWorkNum(searchForm.planDate, val.value).then(res => {
				rowData.residueNum = math.numSub(val.loadNum, res.data)
				//当前的载货量减去作业量得到初始的结余量
				rowData.orgResidueNum = math.numSub(val.loadNum, res.data)
			})
		}
		if (typeof rowData.cargoCategoryName != 'string') {
			rowData.cargoCategoryName = val.cargoCategoryName.join(',')
		}
	}
}

const inputChange = (e, row, table) =>{
  console.log(e)
  console.log(row)
  if(table=='夜班作业量'){
    if(math.numSub(math.numAdd(row.mornWorkNum, row.nightWorkNum), row.residueNum) > 0){
      proxy.$message.warning('夜班加白班作业量不能大于结余量！')
      row.nightWorkNum = ''
    }
  }
  if(table=='白班作业量'){
    if(math.numSub(math.numAdd(row.mornWorkNum, row.nightWorkNum), row.residueNum) > 0){
      proxy.$message.warning('夜班作业量加白班作业量不能大于结余量！')
      row.mornWorkNum = ''
    }
  }
  if(table=='结余量'){
    if(math.numSub(math.numAdd(row.mornWorkNum, row.nightWorkNum), row.residueNum) > 0){
      proxy.$message.warning('夜班作业量加白班作业量不能大于结余量！')
      row.residueNum=''
    }
  }
}
//输入框改变事件
/*const inputChange = (e, row) => {
	if (isNaN(Number(e))) {
		row.workNum = null
		return
	}
	// 通过临时变量改变当前行结余量
	row.residueNum = math.numSub(row.orgResidueNum, e)
}*/
//初始化函数
const init = () => {
	searchForm.planDate = getNowDate('YYYY-MM-DD')
	getList()
	publicApi.getLocalSelects({ types: 'BERTH' }).then(res => {
		// 给编辑table下拉框设置数据源
		proxy.setEditTableOptions(tableColumns, { berthId: res.data.BERTH, moveInBerthId: res.data.BERTH })
	})
	api.getPlanDate(searchForm.planDate).then(res => {
		searchForm.endDate = res.data
	})
	api.getShipVoyage().then(res => {
		proxy.setEditTableOptions(tableColumns, { shipvoyageItemId: res.data })
	})
}
const cellDBLClickEvent =  ({ row }) => {
  clickRow.value = row
  tableData.value.push({})
}
init()
</script>
<style lang="scss" scoped>
:deep(.el-form--inline .el-form-item) {
	margin-right: 12px;
	width: 320px !important;
}
.newDateStyle {
	width: 100%;
	height: 32px;
	line-height: 28px;
	padding-left: 10px;
	border-radius: 4px;
	border: 1px solid #dcdfe6;
	box-shadow: none;
	font-size: 13px;
	color: #606266;
	font-family: Arial;
	display: inline-block;
	padding-right: 52%;
}
.newDateStyle:focus {
	outline: none;
	border: 1px solid #1890ff;
}
</style>
