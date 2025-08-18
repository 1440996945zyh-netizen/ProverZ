<template>
	<div class="">
		<div class="right">
			<SearchHeader
				ref="SearchHeaderRef"
				class="tab_header"
				:selectData="selectData"
				@searchClick="getList"
			/>
			<BaseTable
				ref="baseTable"
				class="tab_table"
				:tableColumns="liGangColumns"
				:tableData="tableData"
				:searchClick="getList"
				:cellClickEvent="cellClickEvent"
				:total="total"
				style="margin: 10px 0 5px 5px"
			/>
		</div>
		<el-drawer v-model="shipDetail" title="查看船舶信息" size="65%">
			<shipDynamics ref="shipDynamicsRef"  />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="shipDetailClose">取消</el-button>
				</div>
			</template>
		</el-drawer>

	</div>
</template>

<script setup name="leavePortShip">
import SearchHeader from '@/components/SearchHeader/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/dispatch/leavePortShip/index.js'
import { getCurrentInstance, h, nextTick, reactive, ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import shipDynamics from './detail/index.vue' // 船舶动态
const { proxy } = getCurrentInstance() // 相当于vue2里的this


const SearchHeaderRef = ref()
const selectData = reactive([
	{
		name: '船名',
		type: 'input',
		modelValue: 'shipName',
		span: 8,
	},
	{
		name: '航次',
		type: 'input',
		modelValue: 'voyage',
		span: 8
	},
  {
    name: '货名',
    type: 'input',
    modelValue: 'cargoCategoryName',
    span: 8,
    // isHidden:true,
  },
  {
    name: 'SCN',
    type: 'input',
    modelValue: 'scn',
    span: 3
  },
  {
    name: '离港时间',
    type: 'date', // 搜索框类型
    modelValue: 'startLeaveTime', // 绑定字段
    span: 3,
  },
  {
    name: '离港时间',
    type: 'date', // 搜索框类型
    modelValue: 'endLeaveTime', // 绑定字段
    span: 3,
  }
])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	shipStatusCode: '120',
})
// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	api.listDisShipVoyage(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

// 船舶动态--------------------------------------------------------------------------------
const shipDynamicsRef = ref(null) // 船舶动态ref
const shipDetail = ref(false)
// 获取点击行对应状态

const clickRow = ref({})


// 点击行，获取对应船状态


// table--------------------------------------------------------------------------------------------
const baseTable = ref() // table的ref
const total = ref(0) // 数据总数
// 表格数据
const tableData = ref([])

const liGangColumns = ref([
	{
		label: '船名航次',
		prop: 'shipName',
    align: 'left',
		render: row => {
			return [
				h(
					'div',
					{
						onClick: () => {
							edit(row)
						},
						style: 'color: #409eff;cursor: pointer;',
					},
					row.shipName.split("_")[0] + "_" +
          ((row.in ? row.in.voyage : '') == null ? '' : row.in ? row.in.voyage : '') +
          (row.in && row.out ? '/' : '') +
          ((row.out ? row.out.voyage : '') == null ? '' : row.out ? row.out.voyage : '')
				),
			]
		},
	},
	{ prop: 'scn', label: 'SCN',align: 'left'},
	{ prop: 'berthName', label: '泊位', align: 'left',},
	{
		prop: 'shipStatusName',
		label: '状态',
		align: 'left',
    width: 70,
		// fixed: 'right',
		render: row => {
			let type = 'info'
			if (row.shipStatusName === '预报') {
				type = ''
			} else if (row.shipStatusName === '作废') {
				type = 'danger'
			}
			return [
				h(
					ElTag,
					{
						type,
					},
					{
						default: () => row.shipStatusName,
					}
				),
			]
		},
	},
	{ prop: 'loadUnload', label: '装卸', width: 70 , align: 'left'},
	// 字段顺序：船名+航次、SCN、泊位、状态、装卸、贸别、货名、货量、预抵时间、舱口数、船代、货主、货代、来港->往港、操作
	{ prop: 'tradeType', label: '贸别', align: 'left', width: 70 },
	{
		prop: 'cargoCategoryName',
		label: '货名',
		align: 'left',
    width: 80,
		render: row => {
			return [
				h(
					'div',
					{},
					((row.in ? row.in.cargoCategoryName : '') == null ? '' : row.in ? row.in.cargoCategoryName : '') +
						(row.in && row.out ? '/' : '') +
						((row.out ? row.out.cargoCategoryName : '') == null ? '' : row.out ? row.out.cargoCategoryName : '')
				),
			]
		},
	},
	{
		prop: 'loadUnload',
		label: '货量',
    align: 'left',
    width: 70,
		render: row => {
			return [
				h(
					'div',
					{},
          Number(
            Number((row.in  ? (row.in.cargoNum  ? row.in.cargoNum  : 0) : 0)) +
                  Number((row.out ? (row.out.cargoNum ? row.out.cargoNum : 0) : 0))
          )
				),
			]
		},
	},
	{ prop: 'leavePortTime', label: '实际离港时间',align: 'left'},
	{ prop: 'hatchNum', label: '舱口数',width: 85,align: 'left'},
	{
		prop: 'chuandai',
		label: '船代',
    width: 200,
    align: 'left',
		render: row => {
			return [
				h(
					'div',
					{},
					((row.in ? row.in.customerName : '') == null ? '' : row.in ? row.in.customerName : '') +
						(row.in && row.out ? '/' : '') +
						((row.out ? row.out.customerName : '') == null ? '' : row.out ? row.out.customerName : '')
				),
			]
		},
	},
	{ prop: 'prePortName', label: '来港' ,align: 'left',width: 75,},
	{ prop: 'nextPortName', label: '往港' ,align: 'left',width: 75,},
  {
    prop: '',
    label: '操作',
    align: 'center',
    width: 210,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              handleCheck(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'dispatch:leavePortShip:check', // 权限
          },
          {
            default: () => '查看',
          }
        ),
      ]
    },
  }
])
let itemShipName = reactive(null)


const cellClickEvent =  (row ) => {
  clickRow.value = row

}

const handleCheck = row =>{
  shipDetail.value = true;
	const editRow = row || clickRow.value // 拿到所编辑行的数据
  itemShipName = row.shipName
	nextTick(()=>{
    shipDynamicsRef.value.resetForm();
    proxy.setFormData(shipDynamicsRef.value.formData, editRow)
    proxy.setFormData(shipDynamicsRef.value.inFormData, editRow.in)
    proxy.setFormData(shipDynamicsRef.value.outFormData, editRow.out)
	  shipDynamicsRef.value.initData()
	  if(shipDynamicsRef.value.inFormData.customerId!=null&&shipDynamicsRef.value.inFormData.customerId!=undefined&&shipDynamicsRef.value.inFormData.customerId!=''){
		shipDynamicsRef.value.inCustomerChange(shipDynamicsRef.value.inFormData.customerId)
	  }
	  if(shipDynamicsRef.value.outFormData.customerId!=null&&shipDynamicsRef.value.outFormData.customerId!=undefined&&shipDynamicsRef.value.outFormData.customerId!=''){
		shipDynamicsRef.value.outCustomerChange(shipDynamicsRef.value.outFormData.customerId)
	  }
	  shipDynamicsRef.value.initData()
    const params = { shipvoyageId: editRow.id }
    console.log(itemShipName)
     api.reqGetBoatStatus(params).then(res => {
       shipDynamicsRef.value.tableData = res.data
       for(let index in shipDynamicsRef.value.tableData){
         shipDynamicsRef.value.tableData[index]["shipName"] = itemShipName
       }
       api.getCostShipList(params).then(res => {
         shipDynamicsRef.value.costTableData = res.data
       })
     }) // 获取船动态
  })
}
const downShipWorkReport = row =>{
  api.downShipWorkReport({shipVoyageId:row.id}).then(res => {
    downLoadBlob(res, '单船作业报告')
  })
}
const downLoadBlob = (file, filename) => {
  let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  let url = URL.createObjectURL(blob)
  let a = document.createElement('a')
  a.href = url
  a.style.display = 'none'
  document.body.appendChild(a)
  a.setAttribute('download', filename)
  a.click()
  document.body.removeChild(a)
}
const shipDetailClose =()=>{
  shipDetail.value = false
  getList(queryParams.value)
}

getList(queryParams.value)
</script>
<style lang="scss" scoped>
.box {
	display: flex;
	//justify-content: space-between;

	.left {
		width: 260px;
		height: calc(100vh - 85px);
		display: inline-block;
		white-space: nowrap;
		position: relative;
		transition: all 0.3s;

		&.close {
			width: 0px;

			.content {
				display: none;
			}
		}

		.content {
			overflow-x: hidden;
			height: 100%;

			.left-top {
				height: 40px;
				line-height: 40px;
				padding-left: 10px;
				font-size: 14px;
			}

			.shipData {
				width: 100%;
				height: 150px;
				margin-top: 10px;
			}

			.panel {
				width: 100%;
				height: 200px;
			}

			.step {
				height: calc(100vh - 557px);
				padding: 20px;
				box-sizing: border-box;
				margin-top: 14px;

				:deep(.el-timeline-item) {
					left: 50px;

					:deep(.el-timeline-item__wrapper) {
						height: 43px;
					}
				}

				:deep(.el-timeline-item__content) {
					position: relative;
					top: -1px;
					left: -160px;
					text-align: center;
				}

				:deep(.el-timeline-item__timestamp) {
					position: relative;
					top: -25px;
					left: 0px;
				}
			}
		}

		.fold-wrap {
			position: absolute;
			top: 0;
			right: -16px;
			width: 16px;
			height: 100%;
			display: inline-block;
		}

		.btn-fold {
			font-size: 12px;
			width: 16px;
			padding: 15px 0;
			position: absolute;
			top: 50%;
			right: 0px;
			transform: translateY(-50%);
			cursor: pointer;
			overflow: hidden;
			opacity: 0.8;
		}

		.btn-fold:hover {
			opacity: 1;
			// transform:scale(1.2);//设置缩放比例
			// transform: translateX(10%);
		}
	}

	.right {
		width: calc(100% - 270px);
		height: 100%;
	}

	.close + .right {
		width: calc(100% - 20px);
	}
}
:deep(.el-tabs__header) {
	margin: 0 0 0;
}
</style>
