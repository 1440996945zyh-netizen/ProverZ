<template>
	<div>
		<div class="app-container">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
        :radioConfig="radioConfig"
				:cellClickEvent="cellClickEvent"
        :cellDBLClickEvent="cellDBLClickEvent"
				:total="total"
        :tableHeight="tableHeight"
			/>
		</div>
<!--  车辆动态抽屉  -->
		<el-drawer v-model="vehicleTrendsDrawer" :title="title" size="80%" :before-close="closeVehicleTrendsDrawer">
      <vehicleTrends ref="vehicleTrendsRef"/>
		</el-drawer>
	</div>
</template>

<script setup name="planEntrustVehicle">
import BaseTable from '@/components/BaseTable/index.vue'
import vehicleTrends from '@/views/produce/planEntrustVehicle/vehicleTrends/index.vue'
import api from '@/api/produce/planEntrustVehicle'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const vehicleTrendsDrawer = ref(false)
const baseTable = ref() // table的ref
const vehicleTrendsRef = ref(null) // 车辆动态组件ref
const total = ref('') // 数据总数
const title = ref('车辆动态')
const queryParams = ref({
  startPage: 1,
  pageSize : 10
})
const trustCargoId = ref()
// const radioConfig = ref({
//   reserve:true
// })
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  {
    prop: 'planNo',
    label: '计划号',
    minWidth: 120,
    align: 'center',
  },
  {
    prop: 'shipNameVoyage',
    label: '船名航次',
    minWidth: 130,
    align: 'left',
  },
  {
    prop: 'cargoName',
    label: '货名',
    minWidth: 150,
    align: 'left'
  },
  {
    prop: 'planYard',
    label: '作业位置',
    minWidth: 150,
    align: 'left'
  },
  {
    prop: 'planTime',
    label: '计划时间',
    width: 230,
    align: 'center',
  },
  {
    prop: 'planTon',
    label: '计划重量',
    minWidth: 100,
    align: 'right',
  },

  {
    prop: 'cargoOwnerName',
    label: '货主',
    minWidth: 210,
    align: 'left'
  },
  {
    prop: 'packingName',
    label: '包装',
    minWidth: 70,
    align: 'center'
  },
  {
    prop: 'quantity',
    label: '计划件数',
    minWidth: 100,
    align: 'right'
  },
  {
    prop: 'finishedTon',
    label: '已完成量',
    minWidth: 120,
    align: 'right',
  },
  {
    prop: 'surplusTon',
    minWidth: 100,
    label: '剩余量',
    align: 'right'
  },
  // {
  //   label: '是否过磅',
  //   prop: 'isWeigh',
  //   width: 'status',
  //   align: 'center',
  //   fixed: '',
  //   render: row => {
  //     let textFlag = ''
  //     textFlag = row.isWeigh == 1 ? '是' : '否'
  //     return [
  //       h(
  //         'div',
  //         {},
  //         {
  //           default: () => textFlag,
  //         }
  //       ),
  //     ]
  //   },
  // },
  {
    prop: 'orderNum',
    label: '已派车数',
    minWidth: 100,
    align: 'right',
  },
  {
    prop: 'truckStopNum',
    label: '已停止车数',
    align: 'right',
    minWidth: 120,
  },
  {
    prop: 'truckInPortNum',
    label: '在港车数',
    minWidth: 100,
    align: 'right',
  },
  {
    prop: '',
    label: '操作',
    minWidth: 120,
    align: 'center',
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              openVehicleTrends(row)
            },
            type: 'primary',
            link: true,
            icon: 'Van',
            permission: 'produce:planEntrustVehicle:vehicleTrend', // 权限
          },
          {
            default: () => '车辆动态',
          }
        ),
      ]
    },
  },
])

const selectData = reactive([
  {
    name: '计划号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'planNo', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '货名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 8, // 占位，共24
  },
	{
		name: '货主', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'cargoOwnerName', // 绑定字段
		span: 3, // 占位，共24
	},
  {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 3, // 占位，共24
  }
])
const buttonList = reactive([
])
// 点击行数据
const clickRow = ref({})
// 是否在下方表格中显示指派车队按钮
const showButtonOrNot = ref()


// 关闭车辆动态抽屉前要做的操作
const closeVehicleTrendsDrawer = e =>{
  vehicleTrendsDrawer.value = false
}


// 点击查询的事件
const getList = e => {
  queryParams.value = {
    ...queryParams.value,
    ...e
  }
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

// 打开 车辆动态 抽屉
const openVehicleTrends = row =>{
  vehicleTrendsDrawer.value = true
  const thisRow = row || clickRow.value // 拿到所编辑行的数据
  nextTick(() => {
    vehicleTrendsRef.value.init()
    vehicleTrendsRef.value.planNo = thisRow.planNo
    vehicleTrendsRef.value.getVehicleTrendsDrawer()
  })
}

// 获取点击行数据
const cellClickEvent = ({ row }) => {
  if (row.packingName  == '件'){
    showButtonOrNot.value = true
  }else showButtonOrNot.value = false
	clickRow.value = row
}

const cellDBLClickEvent =  ({ row }) => {}

getList(queryParams.value)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';


::v-deep .el-dialog{
  display: flex;
  flex-direction: column;
  margin:0 !important;
  position:absolute;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  max-height:calc(100% - 30px);
  max-width:calc(100% - 30px);
}
::v-deep  .el-dialog .el-dialog__body{
  flex:1;
  overflow: auto;
}

</style>
