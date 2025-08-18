<template>
  <div>
    <div class="app-container">
      <BaseTable
        ref="baseTable"
        :showSearchHeader="true"
        :showToolBar="true"
        :selectData="selectData"
        :searchClick="getList"
        :tableColumns="tableColumns"
        :tableData="tableData"
        :cellClickEvent="cellClickEvent"
        :cellDBLClickEvent="cellDBLClickEvent"
        :loading="loading"
		:name="'customerBalanceTable'"
        :total="total"
      />
    </div>
    <el-drawer v-model="detailVisible" :title="title" size="75%">
      <detail ref="detailRef" />
      <template #footer>
        <div>
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="customerBalance">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/finance/customerBalance/index.js'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import {ElButton} from "element-plus";

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const editOrAdd =ref(false) // 是否显示保存按钮
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const formDataDo = reactive({
  id:'',
  voidRemark:'',//作废说明
  status:'',
  prepaymentCode:''
})
const voidClose = () => {
  dialogVisible.value = false
  formDataDo.voidRemark=''
}
const ruleForm = ref()
const dialogVisible = ref(false)
const detailVisible = ref(false)
const searchForm = reactive({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'companyName', label: '公司名称',width:220, align: 'center'},
	{ prop: 'customerName', label: '客户名称',width:300, align: 'center'},
  { prop: 'prepaymentTypeName', label: '预缴类型',width:100, align: 'center'},
  /*{ prop: 'allPrepaymentAmount', label: '总预缴款',width:150, isThousandth:'true',align: 'right'},*/
  { prop: 'residualPreAmount', label: '剩余预缴款',width:150, isThousandth:'true',align: 'right'},
  { prop: 'residualAmount', label: '实际剩余金额',width:150, isThousandth:'true' ,align: 'right'},
  { prop: 'shipDeposit', label: '船舶押金',width:120, isThousandth:'true' ,align: 'right'},
  { prop: 'cargoDeposit', label: '货物预缴',width:120, isThousandth:'true' ,align: 'right'},
  { prop: 'invoiceAmount', label: '未做收据的发票金额',width:120, isThousandth:'true' ,align: 'right'},
  { prop: 'realResidueAmount', label: '剩余可用金额',width:120, isThousandth:'true' ,align: 'right'},
  {
    label: '操作',
    align: 'center',
    fixed: 'right',
    width:120,
    isHidden: false,
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              console.log(row)
              viewDetail(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: 'finance:customerBalance:detail', // 权限
          },
          {
            default: () => '查看明细',
          }
        ),
      ]
    },
  },
])
const selectData = reactive([
  {
    name: '公司名称',
    type: 'select',
    modelValue: 'companyId',
    span: 8,
    dataConfig: { params: {type: 'DEPT_WORK_COMPANY'} },
  },
  {
    name: '客户名称',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'customerId', //对应字段
    span: 8,
    dataType: 'CUSTOMER_PASS',
  },
  {
    name: '预缴类型',
    type: 'select',
    modelValue: 'prepaymentTypeCode',
    span: 8,
    dataConfig: { params: { type: 'DICT', dictType: 'PREPAYMENT_TYPE' } },
  },
])

const drawerVisible = ref(false)


const clickRow = ref({})

// 点击查询的事件
const getList = e => {
	// queryParams.value = Object.assign(queryParams.value, e)
	queryParams.value =e
	loading.value = true
	api.getList(queryParams.value).then(res => {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
			loading.value = false

	})
}

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
const cellDBLClickEvent =  ({ row }) => {
  clickRow.value = row
  viewDetail(row)
}
const viewDetail = row => {
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  detailVisible.value = true
  title.value = '明细'
  nextTick(() => {
    detailRef.value.hiddenColumn(row.prepaymentTypeCode);

    detailRef.value.queryParams.customerId = editRow.customerId
    detailRef.value.queryParams.prepaymentTypeCode = editRow.prepaymentTypeCode
    detailRef.value.getList()
  })
}
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
