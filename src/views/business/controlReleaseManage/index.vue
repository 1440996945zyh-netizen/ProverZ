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
			:loading="loading"
			:total="total"
		/>
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="drawerVisible" :title="title" size="40%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
    <!-- 新增，货物预缴 -->
    <el-drawer v-model="addPrePaymentVisible" :title="title" size="40%">
      <prePayment ref="addPrePaymentRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="addPrePaymentVisible = false">取消</el-button>
          <el-button type="primary" @click="savePrePayment">保存</el-button>
        </div>
      </template>
    </el-drawer>


    <el-dialog v-model="dialogVisible" :title=dialogTitle width="30%" >
      <el-form :model="formDataDo" ref="ruleForm" label-width="80px" :rules="rules">
        <el-form-item label="作废原因" prop="voidRemark">
          <el-input  maxlength="200"
                     show-word-limit
                     type="textarea"
                     rows="5"
                     v-model="formDataDo.voidRemark"  placeholder="请输入作废原因" />
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="voidClose">关闭</el-button>
        <el-button type="primary" @click="handelDel"> 处理 </el-button>
      </span>
      </template>
    </el-dialog>


	</div>
</template>

<script setup name="controlReleaseManage">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import prePayment from '@/views/business/controlReleaseManage/addPrepayment/index.vue'
import api from '@/api/business/controlReleaseManage'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import {ElButton, ElTag} from 'element-plus'
import moment from "moment/moment";

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const addPrePaymentRef = ref() // 明细组件ref
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
  date:[moment().startOf('M').format('YYYY-MM-DD'),moment().endOf('M').format('YYYY-MM-DD')]
})
const dialogVisible = ref(false)
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

const searchForm = reactive({})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '票货号', prop: 'cargoInfoNo', width: 124 },
  { label: '通知单号', prop: 'trustNos', width: 106 },
  {
    label: '船名航次',
    prop: 'shipNameVoyage',
    width: 150,
  },
  { label: '货主', prop: 'cargoOwnerName', width: 189 },
  { label: '货名', prop: 'cargoName', width: 152 },
  { label: '贸别', prop: 'tradeType', align: 'center', width: 81 },
  { label: '包装', prop: 'packingName', align: 'center', width: 93 },
  { label: '放货原因', prop: 'releaseRemark', align: 'right', width: 114 },
  { label: '完货时间', prop: 'realClearDate', align: 'right', width: 114 },
  {
    label: '是否预缴',
    prop: 'isPrePay',
    align: 'center',
    fixed: 'right',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isPrePay == '10' ? 'info' : row.isPrePay == '20' ? 'error' : row.isPrePay == '30' ? '' : '',
          },
          {
            default: () => (row.isPrePay == '30' ? '已预缴' : row.isPrePay == '20' ? '部分预缴' : '未预缴'),
          }
        ),
      ]
    },
  },
  {
    label: '是否放货',
    prop: 'isRelease',
    align: 'center',
    fixed: 'right',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isRelease == '1' ? '' : 'info',
          },
          {
            default: () => (row.isRelease == '1' ? '是' : '否'),
          }
        ),
      ]
    },
  },
  { label: '货物预缴编号', prop: 'prepaymentCode', width: 160 },
	{
		prop: '',
		label: '操作',
		width: 200,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'business:controlReleaseManage:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				// h(
				// 	ElButton,
				// 	{
				// 		onClick: () => {
        //       getPrePaymentDetail(row)
				// 		},
				// 		type: 'primary',
				// 		link: true,
				// 		icon: 'Edit',
				// 		permission: 'business:controlReleaseManage:update', // 权限
				// 	},
				// 	{
				// 		default: () => '查看预缴',
				// 	}
				// ),
			]
		},
	},
])
const selectData = reactive([
  {
    name: '票货号',
    type: 'input', //远程下拉框
    modelValue: 'cargoInfoNo', //对应字段
    span: 8,
  },
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 8, // 占位，共24
  }, {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '是否预缴',
    type: 'select',
    modelValue: 'isPrePay', //对应字段
    span: 2,
    selectData: [
      { label: '未预缴', value: '10' },
      { label: '部分预缴', value: '20' },
      { label: '已预缴', value: '30' },
    ],
  },
  {
    name: '是否放货',
    type: 'select',
    modelValue: 'isRelease', //对应字段
    span: 2,
    selectData: [
      { label: '是', value: '1' },
      { label: '否', value: '0' },
    ],
  },
  {
    name: '货主',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'cargoOwnerId', //对应字段
    span: 2,
    dataType: 'CUSTOMER_CARGO_OWNER',
  },
  {
    name: '货名',
    type: 'input', //
    modelValue: 'cargoName', //对应字段
    span: 2,
  },
  {
    name: '预缴编码', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'prepaymentCode', // 绑定字段
    span: 3, // 占位，共24
  },
  {
    // name: '起止日期',
    type: 'daterange',
    modelValue: 'date', //对应字段
    span: 6,
    shortcuts: [
      {
        text: '上周',
        value: () => {
          const currentTimestamp = Date.now()
          const currentDate = new Date(currentTimestamp)
          // 获取当前日期的星期几（0表示星期日，1表示星期一，以此类推）
          const currentDayOfWeek = currentDate.getDay()
          // 计算上周的起始日期和结束日期的时间戳
          const lastWeekStartDateTimestamp = currentTimestamp - (currentDayOfWeek + 6) * 24 * 60 * 60 * 1000
          const lastWeekEndDateTimestamp = currentTimestamp - currentDayOfWeek * 24 * 60 * 60 * 1000
          const lastWeekStartDate = new Date(lastWeekStartDateTimestamp)
          const lastWeekEndDate = new Date(lastWeekEndDateTimestamp)
          return [lastWeekStartDate, lastWeekEndDate]
        },
      },
      {
        text: '本周',
        value: () => {
          const currentDate = new Date()
          const currentDayOfWeek = currentDate.getDay()
          // 获取本周的起始日期和结束日期
          const thisWeekStartDate = new Date(currentDate)
          thisWeekStartDate.setDate(currentDate.getDate() - currentDayOfWeek + 1)
          const thisWeekEndDate = new Date(currentDate)
          thisWeekEndDate.setDate(currentDate.getDate() + (6 - currentDayOfWeek) + 1)
          return [thisWeekStartDate, thisWeekEndDate]
        },
      },
      {
        text: '下周',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          const currentDayOfWeek = currentDate.getDay()
          // 获取下周的起始日期和结束日期
          const nextWeekStartDate = new Date(currentDate)
          nextWeekStartDate.setDate(currentDate.getDate() + (8 - currentDayOfWeek))
          const nextWeekEndDate = new Date(currentDate)
          nextWeekEndDate.setDate(currentDate.getDate() + (14 - currentDayOfWeek))
          return [nextWeekStartDate, nextWeekEndDate]
        },
      },
      {
        text: '上月',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取上个月的起始日期和结束日期
          const lastMonthStartDate = new Date(currentDate)
          lastMonthStartDate.setMonth(currentDate.getMonth() - 1, 1)

          const lastMonthEndDate = new Date(currentDate)
          lastMonthEndDate.setDate(0)
          return [lastMonthStartDate, lastMonthEndDate]
        },
      },
      {
        text: '本月',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取本月的起始日期和结束日期
          const currentMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
          const currentMonthEndDate = new Date(nextMonthStartDate.getTime() - 24 * 60 * 60 * 1000)
          return [currentMonthStartDate, currentMonthEndDate]
        },
      },
      {
        text: '下月',
        value: () => {
          const currentDate = new Date()
          // 获取下月的起始日期和结束日期
          const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
          const nextMonthEndDate = new Date(nextMonthStartDate.getFullYear(), nextMonthStartDate.getMonth() + 1, 0)
          return [nextMonthStartDate, nextMonthEndDate]
        },
      },
      {
        text: '上季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取上季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const lastQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 - 3, 1)
          const lastQuarterEndDate = new Date(lastQuarterStartDate.getFullYear(), lastQuarterStartDate.getMonth() + 3, 0)
          return [lastQuarterStartDate, lastQuarterEndDate]
        },
      },
      {
        text: '本季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取本季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const currentQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3, 1)
          const nextQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 + 3, 1)
          const currentQuarterEndDate = new Date(nextQuarterStartDate.getTime() - 24 * 60 * 60 * 1000)
          return [currentQuarterStartDate, currentQuarterEndDate]
        },
      },
      {
        text: '下季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取下季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const nextQuarter = currentQuarter === 3 ? 0 : currentQuarter + 1 // 下季度
          const nextQuarterStartDate = new Date(currentDate.getFullYear(), nextQuarter * 3, 1)
          const nextQuarterEndDate = new Date(
            new Date(nextQuarterStartDate.getFullYear(), nextQuarterStartDate.getMonth() + 3, 1) - 1
          )
          return [nextQuarterStartDate, nextQuarterEndDate]
        },
      },
      {
        text: '去年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算去年的起始日期和结束日期
          const lastYearStartDate = new Date(currentDate.getFullYear() - 1, 0, 1)
          const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31)
          return [lastYearStartDate, lastYearEndDate]
        },
      },
      {
        text: '今年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算今年的起始日期和结束日期
          const currentYearStartDate = new Date(currentDate.getFullYear(), 0, 1)
          const currentYearEndDate = new Date(currentDate.getFullYear(), 11, 31)
          return [currentYearStartDate, currentYearEndDate]
        },
      },
      {
        text: '明年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算明年的起始日期和结束日期
          const nextYearStartDate = new Date(currentDate.getFullYear() + 1, 0, 1)
          const nextYearEndDate = new Date(currentDate.getFullYear() + 1, 11, 31)
          return [nextYearStartDate, nextYearEndDate]
        },
      },
    ],
  },
])
const buttonList = reactive([
	{
		label: '放货', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Finished', // 按钮图标，支持element-Plus中所有图标
		click: () => release, // 回调函数
		permission: 'business:controlReleaseManage:release', // 权限
	},
  {
    label: '撤销放货', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Delete', // 按钮图标，支持element-Plus中所有图标
    click: () => revokeRelease, // 回调函数
    permission: 'business:controlReleaseManage:revokeRelease', // 权限
  },
  {
    label: '预缴', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Position', // 按钮图标，支持element-Plus中所有图标
    click: () => addPayment, // 回调函数
    permission: 'business:controlReleaseManage:cargoPrePayment', // 权限
  },
  // {
  //   label: '撤销预缴', // 按钮名称
  //   type: 'primary', // 按钮类型
  //   icon: 'Position', // 按钮图标，支持element-Plus中所有图标
  //   click: () => handel, // 回调函数
  //   permission: 'business:controlReleaseManage:cargoPrePayment', // 权限
  // },
])
const drawerVisible = ref(false)
const addPrePaymentVisible = ref(false)

const clickRow = ref({})

// 点击查询的事件
const getList = e => {
	// queryParams.value = Object.assign(queryParams.value, e)
	queryParams.value = e
	loading.value = true
  queryParams.value.startDate = null;
  queryParams.value.endDate = null;
  if(queryParams.value.date){
    queryParams.value.startDate = queryParams.value.date[0]
    queryParams.value.endDate = queryParams.value.date[1]
  }

	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
		loading.value = false
	})
}

/**
 * 增加货物预缴
 */
const addPayment = () => {
  if (!clickRow.value || !clickRow.value.id) {
    proxy.$modal.msgError('请选择一条数据')
    return
  }
  title.value = '预缴'
  addPrePaymentVisible.value = true;
  nextTick(() => {
    addPrePaymentRef.value.resetForm() // 清空事件
    addPrePaymentRef.value.formData.id = ''  // 新建清空id
    addPrePaymentRef.value.formData.editOrAdd = false  // 新建清空id
    addPrePaymentRef.value.formData.companyId = clickRow.value.companyId  // 新建清空id
    addPrePaymentRef.value.formData.companyName = clickRow.value.companyName  // 新建清空id
    addPrePaymentRef.value.formData.customerId = clickRow.value.cargoOwnerId  // 新建清空id
    addPrePaymentRef.value.formData.customerName = clickRow.value.cargoOwnerName  // 新建清空id
    addPrePaymentRef.value.getTrustOrderList(clickRow.value.companyId,clickRow.value.cargoOwnerId,clickRow.value.cargoInfoNo);
    proxy.$bus.emit('resetFileList')
  })
}
const deletePayment = () => {
  if (!clickRow.value || !clickRow.value.id) {
    proxy.$modal.msgError('请选择一条数据')
    return
  }
  title.value = '预缴'
  addPrePaymentVisible.value = true;
  nextTick(() => {
    addPrePaymentRef.value.resetForm() // 清空事件
    addPrePaymentRef.value.formData.id = ''  // 新建清空id
    addPrePaymentRef.value.formData.editOrAdd = false  // 新建清空id
    addPrePaymentRef.value.formData.companyId = clickRow.value.companyId  // 新建清空id
    addPrePaymentRef.value.formData.companyName = clickRow.value.companyName  // 新建清空id
    addPrePaymentRef.value.formData.customerId = clickRow.value.cargoOwnerId  // 新建清空id
    addPrePaymentRef.value.formData.customerName = clickRow.value.cargoOwnerName  // 新建清空id
    proxy.$bus.emit('resetFileList')
  })
}

const handel = row => {
  if(clickRow.value.prepaymentStatus==2){
    proxy.$message.error("已作废！！")
    return
  }
  dialogVisible.value=true
  formDataDo.id=clickRow.value.tfbcpId
  formDataDo.prepaymentCode = clickRow.value.prepaymentCode
}

const handelDel =async  () => {
  //进行保存
  nextTick(() => {
    api.updateStatus(formDataDo)
      .then(res => {
        nextTick(() => {
          dialogVisible.value =false
          getList(queryParams.value)
          proxy.$modal.msgSuccess(res.msg)
          formDataDo.voidRemark=''
        })
      })
  })
}

// 新增事件
const release = () => {
  if (!clickRow.value || !clickRow.value.id) {
    proxy.$modal.msgError('请选择一条数据')
    return
  }
	title.value = '放货'
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
    detailRef.value.formData.id = clickRow.value.id
	})
}
const revokeRelease = () => {
  if (!clickRow.value || !clickRow.value.id) {
    proxy.$modal.msgError('请选择一条数据')
    return
  }
  if (clickRow.value.isRelease == '0') {
    proxy.$modal.msgError('没有放货 无法撤销放货')
    return
  }
  proxy.$modal
      .confirm('确认撤销放货吗？')
      .then(() => {
        api.revokeRelease(clickRow.value.id).then(res => {
          proxy.$modal.msgSuccess('撤销放货成功')
          getList(queryParams.value)
        })
      })
      .catch(() => {})
}

// 编辑事件
const edit = row => {
	title.value = '编辑'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getReleaseById(editRow.id).then(res => {
			const resData = JSON.parse(JSON.stringify(res.data))
			proxy.setFormData(detailRef.value.formData, resData)
		})
	})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = {
			...detailRef.value.formData,
		}
    console.log(params)
		proxy.$modal.confirm('确定保存？').then(() => {
				api.release(params).then(res => {
					proxy.$modal.msgSuccess('放货成功')
					drawerVisible.value = false
					getList(queryParams.value)
				})
		})
	}
}
const editOrAdd =ref(false) // 是否显示保存按钮
// 添加货物预缴
const savePrePayment = async () => {
  if (await addPrePaymentRef.value.validate()) {
    const params = {
      ...addPrePaymentRef.value.formData,
    }
    if(params.prepayModeCode == '20' && (params.busTrustId ==''||params.busTrustId ==null||params.busTrustId===undefined)){
      proxy.$message.error("请选择通知单！")
      return;
    }
    if(params.prepayModeCode == '20' && (params.prePayCode ==''||params.prePayCode ==null||params.prePayCode===undefined)){
      proxy.$message.error("请选择预缴编号！")
      return;
    }
    if(params.prepayModeCode == '10' && (params.paymentMethodCode ==''||params.paymentMethodCode ==null||params.paymentMethodCode===undefined)){
      proxy.$message.error("请选择付款方式！")
      return;
    }
    proxy.$modal.confirm('确定保存？').then(() => {
      api.insertPrePayment(params).then(res => {
        proxy.$modal.msgSuccess('新增成功')
        addPrePaymentRef.value = false
        getList(queryParams.value)
        editOrAdd.value = false;
        addPrePaymentVisible.value = false
      })
    })
  }
}
// 编辑事件
const getPrePaymentDetail = row => {
  title.value = '预缴'
  editOrAdd.value = false;
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  addPrePaymentVisible.value = true
  nextTick(() => {
    addPrePaymentRef.value.resetForm() // 清空事件
    api.getDetail(editRow.tfbcpId).then(res => {
      const resData = JSON.parse(JSON.stringify(res.data))
      proxy.setFormData(addPrePaymentRef.value.formData, resData)
      addPrePaymentRef.value.formData.prePayId = resData.sourcePrepayCode
      addPrePaymentRef.value.formData.trustNo = resData.trustLabel
      if(resData.bankName!=null&&resData.bankName!=''){
        addPrePaymentRef.value.formData.bankType = resData.bankName+"("+resData.bankId+")";
        addPrePaymentRef.value.formData.bankTypeShow = true;
      }else {
        addPrePaymentRef.value.formData.bankTypeShow = false;
      }
    })
    addPrePaymentRef.value.formData.editOrAdd = true  // 新建清空id
  })
}

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

const init = async () => {
  await nextTick(() => {
    let startTime = moment().startOf('M').subtract(3,'M').format('YYYY-MM-DD');
    let endTime = moment().endOf('M').format('YYYY-MM-DD');
    baseTable.value.SearchHeaderRef.searchData.isRelease = '0'
    baseTable.value.SearchHeaderRef.searchData.date = [startTime, endTime]
    queryParams.value.isRelease = '0'
    queryParams.value.date = [startTime, endTime]
    getList(queryParams.value)
  })

}
init()

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
