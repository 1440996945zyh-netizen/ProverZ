<template>
	<el-form
		:model="formData"
		ref="ruleForm"
		label-width="100px"
		:disabled="formData.isDisabled"
		:rules="formData.isDisabled ? '' : rules"
		:inline="true"
		label-position="top"
	>
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="船货信息" name="1">
				<!-- 船货信息 -->
				<el-row :gutter="20">
					<el-col :span="8">
						<el-form-item label="结算单号" prop="statementNo">
							<div style="width: 100%">
								<el-input v-model="formData.statementNo" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="船名" prop="shipName">
							<div style="width: 100%">
								<el-input v-model="formData.shipName" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="泊位" prop="berthName">
							<div style="width: 100%">
								<el-input v-model="formData.berthName" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="贸别" prop="tradeType">
							<div style="width: 100%">
								<el-input v-model="formData.tradeType" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="船代" prop="shipAgentName">
							<div style="width: 100%">
								<el-input v-model="formData.shipAgentName" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="净吨" prop="netWeight">
							<div style="width: 100%">
								<el-input v-model="formData.netWeight" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="停时(小时)" prop="tinggongFugongHours">
							<template #label>
								<div>
									<span style="padding-right: 10px">停时(小时)</span>
									<el-button type="primary" @click="textOnClick">查看停工记录</el-button>
								</div>
							</template>
							<div style="width: 100%">
								<el-input v-model="formData.tinggongFugongHours" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="抵锚时间" prop="arrivalAnchorageTime">
							<div style="width: 100%">
								<el-input v-model="formData.arrivalAnchorageTime" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="在锚天数" prop="anchorageDays">
							<div style="width: 100%">
								<el-input v-model="formData.anchorageDays" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="靠泊时间" prop="berthTime">
							<div style="width: 100%">
								<el-input v-model="formData.berthTime" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="离泊时间" prop="leaveBerthTime">
							<div style="width: 100%">
								<el-input v-model="formData.leaveBerthTime" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="停泊时间(天)" prop="berthDays">
							<div style="width: 100%">
								<el-input v-model="formData.berthDays" disabled />
							</div>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
			<el-collapse-item title="费用信息" name="2">
				<el-row>
					<el-col :span="8">
						<el-form-item label="作业公司" prop="companyId">
							<div style="width: 100%">
								<Select
									:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
									v-model:value="formData.companyId"
									v-model:label="formData.companyName"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="付款人" prop="customerId">
							<div style="width: 100%">
								<RemoteSelect
									type="CUSTOMER_ALL"
									v-model:value="formData.customerId"
									v-model:label="formData.customerName"
								/>
							</div>
						</el-form-item>
					</el-col>
				</el-row>

				<!-- 费用信息 -->
				<EditTable
					ref="costTableRef"
					:show-footer="true"
					:autoResize="true"
					:tableColumns="costTableColumns"
					:tableData="formData.details"
					:footerConfig="footerConfig"
					:editRules="editRules"
					@input="tableInput"
				/>
			</el-collapse-item>
      <el-collapse-item title="其他费用信息" name="3">
        <!-- 其他费用信息 -->
        <EditTable
          ref="otherCostTableRef"
          :show-footer="true"
          :autoResize="true"
          :tableColumns="otherCostTableColumns"
          :tableData="formData.otherDetails"
          :footerConfig="footerConfig"
          :editRules="editRules"
          @input="tableInput"
        />
      </el-collapse-item>
		</el-collapse>
	</el-form>

	<el-dialog title="停工记录" v-model="dialogVisible" width="60%">
		<BaseTable
			ref="BaseTableRef"
			:show-footer="false"
			:tableHeight="400"
			:autoResize="true"
			:tableColumns="tableColumns"
			:tableData="shutdownRecordList"
		/>
	</el-dialog>
</template>

<script setup name="drawer">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import { formatMoney } from '@/utils/index.js'
import EditTable from '@/components/EditTable/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import api from '@/api/statement/shipownerBilling/shippingFee.js'
import math from '@/utils/math.js'

const collapseOpen = ['1', '2', '3'] // 打开的面板
const ruleForm = ref()
const formData = ref({
	id: '',
	shipNameVoyage: '',
	berthName: '',
	customerName: '',
	customerId: '',
	statementNo: '',
	details: [],
  otherDetails:[],
})
const rules = ref({
	customerId: [{ required: true, message: '付款人必须选择' }],
	companyId: [{ required: true, message: '作业公司必须选择' }],
})
const editRules = ref({
	number: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
})
const validate = async () => {
	let flag = await costTableRef.value.validAllEvent()
	await ruleForm.value.validate((valid, fields) => {
		if (!valid) {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}
const resetForm = () => {
	formData.id = ''
	ruleForm.value.resetFields()
	formData.details = []
  formData.otherDetails = []
}

const init = data => {}
// 可编辑表格
const costTableRef = ref('')
const costTableColumns = ref([
	{
		label: '费目',
		prop: 'rateItemName',
	},
	{
		label: '时长',
		prop: 'number',
		alien: 'right',
		// editType: 'input',
		// editRender: {},
	},
	{
		label: '船舶净吨',
		prop: 'number2',
		alien: 'right',
	},
	{
		label: '计量单位',
		prop: 'measurementUnitName1',
		alien: 'left',
	},

	{
		label: '费率',
		prop: 'rate',
	},
	{
		label: '税率（%）',
		prop: 'taxRate',
	},
	{
		label: '税额',
		prop: 'taxAmount',
		fixed: 'right',
		isThousandth: true,
	},
	{
		label: '金额（元）',
		prop: 'amount',
		fixed: 'right',
		isThousandth: true,
	},
	{
		label: '备注',
		prop: 'remark',
		editType: 'input',
		editRender: {},
	},
])

const otherCostTableColumns = ref([
  {
    label: '费目',
    prop: 'rateItemName',
  },

  {
    label: '单价',
    prop: 'rate',
  },
  {
    label: '数量',
    prop: 'number',
    alien: 'right',
  },
  {
    label: '计量单位',
    prop: 'unitName',
    alien: 'left',
  },

  {
    label: '税率（%）',
    prop: 'taxRate',
  },
  {
    label: '税额',
    prop: 'taxAmount',
    fixed: 'right',
    isThousandth: true,
  },
  {
    label: '金额',
    prop: 'amount',
    fixed: 'right',
    isThousandth: true,
  },
])
// 表尾合计脚函数
const footerConfig = reactive({
	columns: [
		{ prop: 'amount', formatMoney: formatMoney },
		{ prop: 'taxAmount', formatMoney: formatMoney },
	], // 哪一列使用表尾函数，是否需要格式化处理
	functions: ['合计'], // 表尾使用方法名
})
// 可编辑表格 input修改回调
const tableInput = (val, rowData, title) => {
	// if (Number(val)) {
	// 	rowData.amount = ''
	// 	rowData.taxAmount = ''
	// 	// 计算金额 结算数量 * 费率 / 100
	// 	rowData.amount = math.numMulti(val, rowData.rate).toFixed(2)
	// 	// 计算税额 (结算数量 / 1+费率) * 费率
	// 	rowData.taxAmount = math.numMulti(math.numDiv(rowData.amount, 1 + rowData.taxRate), rowData.taxRate).toFixed(2)
	// }
}
// 停时(小时) 文字单击回调
const shutdownRecordList = ref([])
const tableColumns = ref([
	{
		label: '停工时间',
		prop: 'dynamicStartTime',
	},
	{
		label: '停工时长(小时)',
		prop: 'stopHours',
	},
	{
		label: '停工原因',
		prop: 'stopName',
	},
	{
		label: '停工类型',
		prop: 'stopTypeName',
	},
])
const dialogVisible = ref(false)
const textOnClick = () => {
	dialogVisible.value = true
	api.listStopRecord(formData.value.id).then(res => {
		shutdownRecordList.value = res.data
	})
}
defineExpose({
	validate,
	formData,
	resetForm,
	init,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
	width: 100%;
	padding: 0 10px 0 0;
	justify-content: space-between;
	align-items: center;
}

:deep .vxe-footer--row {
	font-weight: bold;
}
</style>
