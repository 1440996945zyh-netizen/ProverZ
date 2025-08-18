<!-- 商务指令 -->
<template>
	<div class="app-container">
		<SearchHeader
			ref="SearchHeaderRef"
			class="tab_header"
			:selectData="selectData"
			@searchClick="getList"
			:endSelect="endSelect"
			:buttonList="buttonList"
			:showMoreFlag="true"
			:defaultWidth="42"
		/>
		<el-tabs v-model="tabActiveName" type="card" class="demo-tabs" @tab-click="handleClick">
			<el-tab-pane label="船舶计划" name="1">
				<BaseTable
          :tableHeight="tableHeight"
					ref="baseTable"
					:tableColumns="tableColumns.filter(v1 => v1.prop !== 'processName')"
					:tableData="tableData"
					:total="total"
					:showMoreFlag="true"
					:searchClick="getList"
					:cellClickEvent="cellClickEvent"
				/>
			</el-tab-pane>
			<el-tab-pane label="集疏港计划" name="2">
				<BaseTable
          :tableHeight="tableHeight"
					ref="baseTable"
					:tableColumns="tableColumns.filter(v1 => v1.prop !== 'processName')"
					:tableData="tableData"
					:total="total"
					:showMoreFlag="true"
					:searchClick="getList"
          :rowStyle="rowStyle"
				/>
			</el-tab-pane>
			<el-tab-pane label="转运计划" name="3">
				<BaseTable
          :tableHeight="tableHeight"
					ref="baseTable"
					:tableColumns="tableColumns.filter(v1 => v1.prop !== 'processName')"
					:tableData="tableData"
					:showMoreFlag="true"
					:total="total"
					:searchClick="getList"
				/>
			</el-tab-pane>
			<el-tab-pane label="杂项计划" name="4">
				<BaseTable
          :tableHeight="tableHeight"
					ref="baseTable"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:showMoreFlag="true"
          :rowStyle="rowStyle2"
					:total="total"
					:searchClick="getList"
				/>
			</el-tab-pane>
		</el-tabs>
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="trustOrderDrawer" :title="title" size="90%">
			<editTrustOrder ref="trustOrderRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="trustOrderDrawer = false">取消</el-button>
					<el-button type="primary" @click="saveTrustOrder">保存</el-button>
				</div>
			</template>
		</el-drawer>
    <!--  商务回执驳回弹窗  -->
    <el-dialog title="驳回" v-model="rejectDialogVisible" width="40%">
      <el-form :model="rejectFormData" ref="rejectFormRef" label-width="80px" :rules="rejectRules">

        <el-form-item
          label="驳回原因"
          prop="rejectReason"
        >
          <el-input type="textarea" v-model="rejectFormData.rejectReason"></el-input>
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">关 闭</el-button>
          <el-button @click="submitRejectForm" type="primary" >保 存</el-button>
        </div>
      </template>
    </el-dialog>
	</div>

</template>

<script setup name="trustOrder">
import BaseTable from '@/components/BaseTable/index.vue'
import SearchHeader from '@/components/SearchHeader/index.vue'
import { ref, reactive, nextTick, onMounted, h } from 'vue'
import editTrustOrder from './editTrustOrder/index.vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/business/trustOrder/index'
import tableParamsStore from '@/store/modules/tableParams'
import * as publicApi from '@/utils'
const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight + 130
const { proxy } = getCurrentInstance()
const SearchHeaderRef = ref()
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	trustType: '1',
})
//数据总条数
const total = ref(0)
// tab
const tabActiveName = ref('1')
const rejectDialogVisible = ref(false)
const rejectFormData = reactive({
  id:'',
  rejectReason:'',
})
const rejectRules = ref({
  rejectReason: [{ required: true, message: '驳回原因不能为空' }],
})
// 驳回
const handleReject = row => {
  const rejectRow = row || clickRow.value
  rejectDialogVisible.value = true

  //清除回执驳回表单的数据
  rejectFormData.id = rejectRow.id
  rejectFormData.rejectReason=''
}
//驳回保存事件
const submitRejectForm = ()=>{
  if(rejectFormData.id == null || rejectFormData.id == ''){
    proxy.$message.error('未找到要驳回杂项计划')
    return
  }
  if (rejectFormData.rejectReason == null || rejectFormData.rejectReason == '') {
    proxy.$message.error('驳回原因不能为空')
    return
  }
  proxy.$modal.confirm('是否确定驳回？').then(() => {
    api.reject(rejectFormData).then(res => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess('驳回成功')
    })
    rejectDialogVisible.value = false;
  })
}
const handleClick = tab => {
	// console.log('tab', tab.index)
	if (tab.index === '0') {
		queryParams.value.trustType = '1'
	} else if (tab.index === '1') {
		buttonList[1].disabled = true
		queryParams.value.trustType = '2'
	} else if (tab.index === '2') {
		buttonList[1].disabled = true
		queryParams.value.trustType = '3'
	} else if (tab.index === '3') {
		buttonList[1].disabled = true
		queryParams.value.trustType = '4'
	}
	getList(queryParams.value)
}
const trustOrderRef = ref(null)
//控制作业指令编辑抽屉
const trustOrderDrawer = ref(false)
const title = ref('新增作业指令')
//顶部 搜索表单
const selectData = reactive([
	{
		name: '货主',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'cargoOwnerId', //对应字段
		span: 8,
		dataType: 'CUSTOMER_CARGO_OWNER',
	},

	{
		name: '通知单编号',
		type: 'input', //远程下拉框
		modelValue: 'trustNo', //对应字段
		span: 8,
	},
	{
		// name: '起止日期',
		type: 'daterange',
		modelValue: 'date', //对应字段
		span: 8,
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

	{
		name: '作业公司',
		type: 'select', //远程下拉框
		modelValue: 'companyId', //对应字段
		span: 2,
		dataConfig: {
			params: {
				type: 'DEPT_WORK_COMPANY',
			},
		},
	},
	{
		name: '货物名称',
		type: 'input', //
		modelValue: 'cargoName', //对应字段
		span: 2,
	},
  {
    name: '计划号',
    type: 'input', //
    modelValue: 'businessNo', //对应字段
    span: 2,
  },
	{
		name: '指令状态',
		type: 'select', //下拉框
		modelValue: 'status', //对应字段
		span: 2,
		dataConfig: {
			params: {
				type: 'CONSTANT',
				types: 'BUS_TRUST_STATUS',
			},
		},
	},
	{
		name: '票货号',
		type: 'input', //远程下拉框
		modelValue: 'cargoInfoNo', //对应字段
		span: 2,
	},
  {
    name: '合同号',
    type: 'input',
    modelValue: 'contractCode',
    span: 2,
  },
	{
		name: '船名_航次/SCN/航次状态/进出口/预抵时间/起运港->目的港',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'shipvoyageItemId', //对应字段
		span: 8,
		dataType: 'SHIPVOYAGE_ITEM',
	},

])

//顶部 右侧按钮
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => addTrustOrder, // 回调函数
		permission: 'business:trustOrder:add', // 权限
	},
	{
		label: '疏港', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Document', // 按钮图标，支持element-Plus中所有图标
		click: () => handleAdd, // 回调函数
		disabled: true,
		permission: 'business:trustOrder:clearOut', // 权限
	},
])
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '通知单编号', prop: 'trustNo', width: 120, align: 'center' },
	{ label: '船名航次', prop: 'shipNameVoyage', width: 150 },
	{ label: 'SCN', prop: 'scn', width: 150 },
	{ label: '货主', prop: 'cargoOwnerName', width: 150 },
	// { label: '货代', prop: 'cargoAgentName', width: 150 },
	{ label: '货名', prop: 'cargoName', width: 150 },
	{ label: '内外贸', prop: 'tradeType', align: 'center', width: 100 },
	{ label: '通知单类型', prop: 'type', width: 120, align: 'center' },
	{ label: '作业过程', prop: 'processName', width: 100, align: 'center' },
	{ label: '计划件数', prop: 'planQuantity', align: 'right', width: 100 },
	{ label: '计划重量', prop: 'planTon', align: 'right', width: 100 },
	{ label: '预估金额', prop: 'estAmount', align: 'right', width: 100 },
	{ label: '作业公司', prop: 'companyName', width: 180 },
	{ label: '下发人', prop: 'createByName', width: 100 },
	{ label: '下发时间', prop: 'createTime', width: 150, align: 'center' },
  { label: '驳回人', prop: 'rejectByName', width: 100 },
  { label: '驳回时间', prop: 'rejectDate', width: 120 },
  { label: '驳回原因', prop: 'rejectReason', width: 280 },
	{
		label: '状态',
		prop: 'statusLabel',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			let type
			if (row.statusLabel === '待发布') {
				type = 'info'
			} else if (row.statusLabel === '已发布') {
				type = 'success'
			} else if (row.statusLabel === '作业中') {
				type = 'primary'
			} else if (row.statusLabel === '核销') {
				type = 'warning'
			} else if (row.statusLabel === '已过期') {
				type = 'warning'
			} else {
				type = 'info'
			}
			return [
				h(
					ElTag,
					{
						type,
					},
					{
						default: () => row.statusLabel,
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 290,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleUpdate(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'business:trustOrder:update', // 权限
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
						disabled: row.status !== '10',
						permission: 'business:trustOrder:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handlePublish(row)
						},
						// type: 'primary',
						type: row.status == '10' ? 'primary' : 'danger',
						link: true,
						icon: 'Edit',
						width: 100,
						disabled: row.type !== '杂项' ? (row.status == '40' || row.status == '50') : row.status == '50',
						permission: 'business:trustOrder:deliver', // 权限
					},
					{
						default: () => (row.status == '10' ? '发布' : '撤销发布'),
					}
				),
        h(
          ElButton,
          {
            onClick: () => {
              handleReject(row)
            },
            type: 'primary',
            link: true,
            icon: 'Edit',
            permission: row.source == 2 && row.status == '10' && row.isReject != 1 ? 'business:trustOrder:update':' ', // 权限
          },
          {
            default: () => '驳回',
          }
        ),
			]
		},
	},
])
//查询
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	queryParams.value.beginDate = queryParams.value.date ? queryParams.value.date[0] : ''
	queryParams.value.endDate = queryParams.value.date ? queryParams.value.date[1] : ''
	// delete queryParams.value.date
	// console.log('queryParams.value', queryParams.value)
	api.getList(queryParams.value).then(res => {
		// console.log('作业通知单', res)
		tableData.value = res.data.pages
		// console.log('列表数据', tableData.value)
		total.value = res.data.totalNum
		// console.log('total.value', total.value)
	})
}
//新增作业指令抽屉
const addTrustOrder = () => {
	trustOrderDrawer.value = true
	title.value = '新增作业指令'
	nextTick(() => {
		trustOrderRef.value.resetForm()
		trustOrderRef.value.getTrustTypeList()
    trustOrderRef.value.multiple = true
		trustOrderRef.value.disabled = false
		trustOrderRef.value.typeDisabled = false
		trustOrderRef.value.isDisabled = false
		trustOrderRef.value.type = queryParams.value.trustType
		trustOrderRef.value.isShipVoyage = true
		trustOrderRef.value.hatchShow = queryParams.value.trustType == 1 ? false : true
		trustOrderRef.value.weighShow = queryParams.value.trustType == 1 ? false : true

		trustOrderRef.value.isSecondShow = queryParams.value.trustType == 3 ? false : true //是否过磅

    trustOrderRef.value.JSGWeiQiao = queryParams.value.trustType == 2 ? true : false //是否显示
		trustOrderRef.value.printShow = queryParams.value.trustType == 2 ? false : true
		trustOrderRef.value.trustOrderForm.isWeiqiaoPoundRemark = '0' //磅单备注是否魏桥
		trustOrderRef.value.init(false, false)
    if(queryParams.value.trustType == '1' && clickRow.value.id !=null){
      api.getDetailAdd(clickRow.value.id).then(res => {
        if (res.code === '0000') {
          console.log('作业通知单新增单条数据', res.data)
          // trustOrderRef.value.disabled = res.data.status == '30' || res.data.status == '40' ? true : false
          /*        trustOrderRef.value.disabled =
                    (res.data.status == '30' && res.data.type == '装船') || (res.data.status == '40' && res.data.type == '装船')
                      ? false
                      : (res.data.status == '30' && res.data.type !== '装船') || (res.data.status == '40' && res.data.type !== '装船')
                        ? true
                        : false*/
          /*        trustOrderRef.value.typeDisabled = res.data.status == '30' || res.data.status == '40' ? true : false //通知单类型是否可选择
                  trustOrderRef.value.isDisabled = res.data.status == '10' ? false : true //货物信息列表是否可删除*/
          trustOrderRef.value.trustOrderForm = {
            ...res.data,
            cargoList : []
            /*shipInfo: {
              cargoCategoryName: res.data.shipInfo ? res.data.shipInfo.cargoCategoryName : '',
              shipAgentName: res.data.shipInfo ? res.data.shipInfo.shipAgentName : '',
              arrivalTimePlan: res.data.shipInfo ? res.data.shipInfo.arrivalTimePlan : '',
              startPortName: res.data.shipInfo ? res.data.shipInfo.startPortName : '',
              endPortName: res.data.shipInfo ? res.data.shipInfo.endPortName : '',
            },*/
          }
          // trustOrderRef.value.trustOrderForm.trustId = clickRow.value.id
          trustOrderRef.value.trustOrderForm.isWeiqiaoPoundRemark =
            res.data.isWeiqiaoPoundRemark == null ? '0' : res.data.isWeiqiaoPoundRemark
          // trustOrderRef.value.init(res.data.status, true)
          // trustOrderRef.value.isSource(res.data.status)

          /*        let data = {
                    type: 'MAIN_WORK_PROCESS',
                    planTypeCode: res.data.trustType,
                  }
                  trustOrderRef.value.getLocalSelect(data)*/
          trustOrderRef.value.init(false, false)
          trustOrderRef.value.getShipvoyageItemFile(clickRow.value.id)
          trustOrderRef.value.aaa()

        }
      })

    }

	})
}
//提交作业指令信息
const saveTrustOrder = async () => {
	// console.log('状态是什么', trustOrderRef.value.trustOrderForm.status)
	// console.log('111', trustOrderRef.value.Data)
	if (trustOrderRef.value.Data > 0 && trustOrderRef.value.trustOrderForm.cargoList.length <= 0) {
		proxy.$modal.msgSuccess('存在货物信息，请填写货物信息')
		return
	}
	if (await trustOrderRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(() => {
			const params = JSON.parse(JSON.stringify(trustOrderRef.value.trustOrderForm))
			if (
				trustOrderRef.value.trustOrderForm.id === undefined ||
				trustOrderRef.value.trustOrderForm.id === null ||
				trustOrderRef.value.trustOrderForm.id === ''
			) {
				// delete params.processName
				// delete params.processCode
				// console.log('作业通知单数据保存', params)
				api.addTrustOrder(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('新增成功')
						trustOrderDrawer.value = false
						getList(queryParams.value)
					}
				})
			} else {
				if (params.status == '30' || params.status == '40') {
					console.log('作业通知单已发布、发布中数据修改', params)
					let arr = []
					if ((params.status == '30' && params.type == '装船') || (params.status == '40' && params.type == '装船'))
						arr = params.cargoList.filter(item => {
							if (item.id == null) {
								return item
							}
						})
					// console.log('新增数据', arr)
					let data = {
						id: params.id,
						planQuantity: params.planQuantity, //计划件数
						planTon: params.planTon, //计划重量
						startTime: params.startTime, //计划开始时间
						endTime: params.endTime, //计划结束时间
						isWeiqiaoPoundRemark: params.isWeiqiaoPoundRemark, //是否魏桥磅单备注
						poundRemark: params.poundRemark, //磅单备注
						fileIds: params.fileIds, //附件
            preChangeShipName:params.preChangeShipName,
            preChangeShipNo:params.preChangeShipNo,
            estAmount:params.estAmount,
						updates: params.cargoList.filter(item => {
							if (item.id) {
								return {
									id: item.id,
									quantity: item.quantity,
									ton: item.ton,
								}
							}
						}),
						inserts: JSON.parse(JSON.stringify(arr)),
					}
					// console.log('已发布保存数据', data)
					api.updateAfterRelease(data).then(res => {
						if (res.code === '0000') {
							proxy.$modal.msgSuccess('修改成功')
							trustOrderDrawer.value = false
							getList(queryParams.value)
						}
					})
				} else {
					// console.log('作业通知单数据修改', params)
					api.update(params).then(res => {
						if (res.code === '0000') {
							proxy.$modal.msgSuccess('修改成功')
							trustOrderDrawer.value = false
							getList(queryParams.value)
						}
					})
				}
			}
		})
	}
}
//
const handleDelete = row => {
	proxy.$modal.confirm('确定删除？').then(() => {
		if (row.status !== '10') {
			proxy.$modal.msgSuccess('已发布的指令不允许删除')
			return
		}
		api.delete(row.id).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('删除成功')
				getList(queryParams.value)
			}
		})
	})
}
//发布作业指令
const handlePublish = async row => {
	// console.log('是否发布', row.status)
	if (row.status == '10') {
    await proxy.$modal.confirm('是否确定发布？').then(() => {
			 api.release(row.id).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess('发布成功')
					getList(queryParams.value)
          api.getDetail(row.id).then(res=>{
            for(let index in res.data.cargoList){
              let item = res.data.cargoList[index]
              if(item.shipvoyageItemId == null ||item.shipvoyageItemId == undefined || item.shipvoyageItemId == ""){
                item.shipvoyageItemId = row.shipvoyageItemId
              }
            }
            api.addDispatchRelease(res.data.cargoList)
          })
				}
			})
		})
	} else {
		proxy.$modal.confirm('是否确定撤销发布？').then(() => {
      api.getDetail(row.id).then(res=>{
        for(let index in res.data.cargoList){
          res.data.cargoList[index].shipvoyageItemId = res.data.shipvoyageItemId
        }
        api.deleteDispatchRelease(res.data.cargoList)
        api.cancelRelease(row.id,row.type).then(res => {
          if (res.code === '0000') {
            proxy.$modal.msgSuccess(res.msg)
            getList(queryParams.value)
          }
        })
      })
		})
	}
}

const handleUpdate = row => {
  title.value = '编辑作业指令'
  trustOrderDrawer.value = true
  nextTick(() => {
    if(row.type=='装船'||row.type=='疏港'){
      trustOrderRef.value.isShowOutCargo = false
    }else{
      trustOrderRef.value.isShowOutCargo = true

    }
    trustOrderRef.value.resetForm()
    trustOrderRef.value.type = queryParams.value.trustType
    trustOrderRef.value.isShipVoyage = true
    trustOrderRef.value.hatchShow = queryParams.value.trustType == 1 ? false : true
    trustOrderRef.value.weighShow = queryParams.value.trustType == 1 ? false : true //是否二次过磅

    trustOrderRef.value.isSecondShow = queryParams.value.trustType == 3 ? false : true //是否过磅
    trustOrderRef.value.printShow = queryParams.value.trustType == 2 ? false : true
    // console.log('通知单类型父', trustOrderRef.value.type)
    trustOrderRef.value.getTrustTypeList()
    trustOrderRef.value.multiple = false

    trustOrderRef.value.JSGWeiQiao = queryParams.value.trustType == 2 ? true : false //是否显示

    trustOrderRef.value.isStop = queryParams.value.trustType == 2 ? true : false //是否显示

    api.getDetail(row.id).then(res => {
      if (res.code === '0000') {
        console.log('作业通知单编辑单条数据', res.data)
        // trustOrderRef.value.disabled = res.data.status == '30' || res.data.status == '40' ? true : false
        trustOrderRef.value.disabled =
          (res.data.status == '30' && res.data.type == '装船') || (res.data.status == '40' && res.data.type == '装船')
            ? false
            : (res.data.status == '30' && res.data.type !== '装船') || (res.data.status == '40' && res.data.type !== '装船')
              ? true
              : false
        trustOrderRef.value.typeDisabled = res.data.status == '30' || res.data.status == '40' ? true : false //通知单类型是否可选择
        trustOrderRef.value.isDisabled = res.data.status == '10' ? false : true //货物信息列表是否可删除
        trustOrderRef.value.trustOrderForm = {
          ...res.data,
          shipInfo: {
            cargoCategoryName: res.data.shipInfo ? res.data.shipInfo.cargoCategoryName : '',
            shipAgentName: res.data.shipInfo ? res.data.shipInfo.shipAgentName : '',
            arrivalTimePlan: res.data.shipInfo ? res.data.shipInfo.arrivalTimePlan : '',
            startPortName: res.data.shipInfo ? res.data.shipInfo.startPortName : '',
            endPortName: res.data.shipInfo ? res.data.shipInfo.endPortName : '',
          },
        }
        trustOrderRef.value.trustOrderForm.trustId = row.id
        trustOrderRef.value.trustOrderForm.isWeiqiaoPoundRemark =
          res.data.isWeiqiaoPoundRemark == null ? '0' : res.data.isWeiqiaoPoundRemark
        trustOrderRef.value.init(res.data.status, true)
        trustOrderRef.value.isSource(res.data.status)

        let data = {
          type: 'MAIN_WORK_PROCESS',
          planTypeCode: res.data.trustType,
        }
        trustOrderRef.value.getLocalSelect(data)
        trustOrderRef.value.getShipvoyageItemFile(res.data.id)
      }
    })
  })
}
const clickRow = ref()
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	if (clickRow.value.type == '卸船') {
		buttonList[1].disabled = false
	} else {
		buttonList[1].disabled = true
	}
}
const handleAdd = () => {
	if (!clickRow.value) {
		return proxy.$modal.msgError('请选择一条数据')
	}
	title.value = '疏港通知单'
	trustOrderDrawer.value = true
	nextTick(() => {
		trustOrderRef.value.resetForm()
		trustOrderRef.value.multiple = false
		trustOrderRef.value.isShipVoyage = false
		trustOrderRef.value.weighShow = true //是否二次过磅 不显示
		trustOrderRef.value.hatchShow = false //舱口
		trustOrderRef.value.isSecondShow = false //是否过磅
		trustOrderRef.value.printShow = false //是否打印磅单
		api.getDetail(clickRow.value.id).then(res => {
			if (res.code === '0000') {
				console.log('疏港数据详情', res)
				if (res.data.cargoList.length > 0) {
					res.data.cargoList.forEach(item => {
						item.businessNo = ''
						delete item.isSecondWeigh //是否二次过磅
					})
				}
				trustOrderRef.value.disabled = false
				trustOrderRef.value.typeDisabled = true
				// let trustOrderData=JSON.parse(JSON.stringify(res.data))

				trustOrderRef.value.trustOrderForm = {
					...res.data,
					shipInfo: {
						cargoCategoryName: res.data.shipInfo ? res.data.shipInfo.cargoCategoryName : '',
						shipAgentName: res.data.shipInfo ? res.data.shipInfo.shipAgentName : '',
						arrivalTimePlan: res.data.shipInfo ? res.data.shipInfo.arrivalTimePlan : '',
						startPortName: res.data.shipInfo ? res.data.shipInfo.startPortName : '',
						endPortName: res.data.shipInfo ? res.data.shipInfo.endPortName : '',
					},
				}
				trustOrderRef.value.isSource()
				trustOrderRef.value.trustOrderForm.id = null
				trustOrderRef.value.trustOrderForm.trustNo = ''
				trustOrderRef.value.trustOrderForm.poundRemark = ''
        trustOrderRef.value.trustOrderForm.isWeiqiaoPoundRemark= ''
				trustOrderRef.value.trustOrderForm.remark = ''
				trustOrderRef.value.trustOrderForm.type = '疏港'
				let data = {
					type: 'MAIN_WORK_PROCESS',
					planTypeCode: res.data.trustType,
				}
        trustOrderRef.value.JSGWeiQiao = trustOrderRef.value.trustOrderForm.type == '疏港' ? true : false //魏桥是否显示
				trustOrderRef.value.getLocalSelect(data)
				trustOrderRef.value.dateChange()
			}
		})
	})
}
const rowStyle2 = i => {
  if (i.row.status == '10' && i.row.isReject && i.row.isReject == '1') {
    return 'color:red'
  }
  return null
}
// 获取默认当前时间班次
const init = async () => {
	await api.getCurrentShift().then(res => {
		console.log('默认时间日期', res)
		nextTick(() => {
			proxy.$bus.emit('setInitSearchData', {
				// beginDate: res.data.workDate.slice(0, -2).concat('01'),
				// endDate: res.data.workDate,
				date: [res.data.workDate.slice(0, -2).concat('01'), res.data.workDate],
			})
      queryParams.value.date = [res.data.workDate.slice(0, -2).concat('01'), res.data.workDate]

			getList(queryParams.value)
		})
	})
}
const rowStyle = e => {
  if (e.row.tonFlag == '1') {
    return 'color:red'
  }
  return null
}

init()
</script>

<style scoped></style>
