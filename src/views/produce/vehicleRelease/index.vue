<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumnsMain"
			:tableData="tableDataMain"
      :tableHeight="300"
			:cellClickEvent="cellClickEvent"
			:loading="loading"
			:total="total"
		/>
    <BaseTable
      ref="detailTable"
      :showSearchHeader="false"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :tableHeight="'drawerHeaderPageTableHeight'"
      :cellClickEvent="cellClickEventSub"
      :loading="loading"
      :total="total"
    />
	</div>
</template>

<script setup name="vehicleRelease">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/vehicleRelease'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import {ElButton, ElTag} from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})

const queryParamsSub = ref({
  startPage: 1,
  pageSize: 100,
  subPlanNo:''
})
const searchForm = reactive({})
// 表格数据
const tableDataMain = ref([])
const tableColumnsMain = ref([
  {  prop: 'planNo', label: '计划号',width:140},
  {  prop: 'subPlanNo', label: '子计划号',width:160},
  {  prop: 'consignorName', label: '货主',width:180},
  {  prop: 'cargoName', label: '货名',width:140},
  {  prop: 'portName', label: '作业区',width:100},
  {  prop: 'yardCode', label: '作业位置'},
  {  prop: 'planStartTime', label: '计划时间',width:180},
  // {  prop: 'planEndTime', label: '计划结束时间',width:150},
  {  prop: 'signCount', label: '签到车数',width:100},
])
const tableData = ref([])
const tableColumns = ref([
	{ prop: 'vehicleNo', label: '车号',width:120 },
	{ prop: 'driverNameOne', label: '司机',width:120 },
	{ prop: 'driverPhoneOne', label: '电话',width:120 },
  // {  prop: 'planNo', label: '计划号',width:140},
  /*{  prop: 'consignorName', label: '货主',width:180},
  {  prop: 'cargoName', label: '货名',width:140},*/
  {  prop: 'yardCode', label: '作业位置'},
  {  prop: 'hasInPort', label: '进港状态',width:150},
  // {  prop: 'planEndTime', label: '计划结束时间',width:150},
  {  prop: 'signTime', label: '签到时间',width:150},
  {
    prop: 'status',
    label: '状态',
    fixed: 'right',
    width:90,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '0' ? 'info' : row.status == '1' ? 'success' : 'warning',
          },
          {
            default: () => (row.status == '0' ? '签到' : row.status == '1' ? '放行' : '失效'),
          }
        ),
      ]
    },
  },
	{
		prop: '',
		label: '操作',
    width:150,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
              auditStatus(row)
						},
						type: 'primary',
						link: true,
						icon: 'View',
						permission: 'produce:vehicleRelease:auditStatus', // 权限
					},
					{
						default: () => '放行',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
              auditRevokeStatus(row)
						},
						type: 'primary',
						link: true,
						icon: 'Refresh',
						permission: 'produce:vehicleRelease:auditRevokeStatus', // 权限
					},
					{
						default: () => '撤销',
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
    name: '车号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'vehicleNo', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '货主', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'consignorName', // 绑定字段
    span: 8, // 占位，共24
  },
])
const buttonList = reactive([
])
const drawerVisible = ref(false)

const clickRow = ref({})

const clickRowSub = ref({})

// 点击查询的事件
const getList = e => {
	// queryParams.value = Object.assign(queryParams.value, e)
	queryParams.value = e
	loading.value = true
	api.getList(queryParams.value).then(res => {
    tableDataMain.value = res.data.pages
		total.value = res.data.totalNum
		loading.value = false
	})
}

// 点击查询的事件
const getSubList = e => {
  queryParamsSub.value = e
  loading.value = true
  api.getSubList(queryParamsSub.value).then(res => {
    tableData.value = res.data.pages
    loading.value = false
  })
}

// 放行事件
const auditStatus = row => {
	const deleteRow = row || clickRowSub.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定放行？')
		.then(() => {
			api.auditStatus(deleteRow.id).then(res => {
        queryParamsSub.value.subPlanNo = clickRow.value.subPlanNo
        getSubList(queryParamsSub.value)
				proxy.$modal.msgSuccess('放行成功')
			})
		})
		.catch(() => {})
}
// 撤销放行
const auditRevokeStatus = row => {
  const deleteRow = row || clickRowSub.value // 拿到所删除行的数据
  proxy.$modal
    .confirm('确定撤回放行？')
    .then(() => {
      api.auditRevokeStatus(deleteRow.id).then(res => {
        queryParamsSub.value.subPlanNo = clickRow.value.subPlanNo
        getSubList(queryParamsSub.value)
        proxy.$modal.msgSuccess('撤回放行成功')
      })
    })
    .catch(() => {})
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
  if(row.subPlanNo ==null || row.subPlanNo == '') return
  queryParamsSub.value.subPlanNo = row.subPlanNo
  getSubList(queryParamsSub.value)
}

const cellClickEventSub = ({ row }) => {
  clickRowSub.value = row
}

const init = () => {
}
init()

getList(queryParams.value)
</script>
<style lang="scss" scoped>
.box {
	display: flex;
	justify-content: space-between;

	.left {
		width: 254px;
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
			background-color: #f5f7fa;
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
