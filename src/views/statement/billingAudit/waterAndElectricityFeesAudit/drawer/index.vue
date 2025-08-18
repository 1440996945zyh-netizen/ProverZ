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
			<el-collapse-item title="基本信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="结算单号" prop="statementNo">
							<div style="width: 100%">
								<el-input v-model="formData.statementNo" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="船名航次" prop="shipNameVoyage">
							<div style="width: 100%">
								<el-input v-model="formData.shipNameVoyage" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="泊位" prop="berthName">
							<div style="width: 100%">
								<el-input v-model="formData.berthName" disabled />
							</div>
						</el-form-item>
					</el-col>
				</el-row>
				<BaseTable
					ref="tableRef"
					:show-footer="false"
					:tableHeight="200"
					:autoResize="true"
					:tableColumns="tableColumns"
					:tableData="formData.waterElectricityList"
				/>
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
					:tableHeight="400"
					:autoResize="true"
					:tableColumns="costTableColumns"
					:tableData="formData.details"
					:footerConfig="footerConfig"
					:editRules="editRules"
					@input="tableInput"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
	<el-dialog title="图片" v-model="dialogVisible" width="50%">
		<div scroll-container style="overflow: hidden; display: flex; flex-direction: column">
			<el-image v-for="(item, index) in url" :src="item" :key="index" loading="lazy" fit :preview-src-list="urlArr"></el-image>
		</div>
	</el-dialog>
</template>

<script setup name="drawer">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/statement/shipownerBilling/waterAndElectricityFees.js'
import publicApi from '@/api/public/index.js'
import EditTable from '@/components/EditTable/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Select from '@/components/Select/index.vue'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import math from '@/utils/math.js'
import { ElLink } from 'element-plus'
import { formatMoney } from '@/utils/index.js'

const collapseOpen = ['1', '2'] // 打开的面板
const ruleForm = ref()
const formData = ref({
	id: '',
	shipNameVoyage: '',
	berthName: '',
	customerName: '',
	customerId: '',
	statementNo: '',
	details: [],
	waterElectricityList: [],
})
const rules = ref({
	customerId: [{ required: true, message: '客户必须选择' }],
})
const validate = async () => {
	let flag = await ruleForm.value.validate((valid, fields) => {
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
}

const init = data => {}

// 可编辑表格
const tableRef = ref('')
const tableColumns = ref([
	{
		label: '作业过程',
		prop: 'processName',
	},

	{
		label: '作业量',
		prop: 'quantity',
	},
	{
		label: '作业时间',
		prop: 'startTime',
	},
	{
		label: '图片',
		prop: 'file',
		width: 80,
		render: row => {
			return [
				h(
					ElLink,
					{
						onClick: () => {
							fileShow(row)
						},
						type: 'primary',
					},
					{
						default: () => '查看',
					}
				),
			]
		},
	},
	{
		label: '创建人',
		prop: 'createByName',
	},
])
const costTableColumns = ref([
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
		// editType: 'input',
		// editRender: {},
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
	{
		label: '备注',
		prop: 'remark',
		editType: 'input',
		editRender: {},
	},
])
// 表尾合计脚函数
const footerConfig = reactive({
	columns: [{ prop: 'amount' }, { prop: 'taxAmount' }], // 哪一列使用表尾函数，是否需要格式化处理
	functions: ['总计'], // 表尾使用方法名
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

//查看附件
const dialogVisible = ref(false)
const url = ref([])
const urlArr = ref([])
const fileShow = row => {
	dialogVisible.value = true
	const rowData = JSON.parse(JSON.stringify(row))
	const fileIds = rowData.fileIds.split(',')

	url.value = []
	urlArr.value = []
	fileIds.forEach(item => {
		publicApi.down(item).then(res => {
			const blob = new Blob([res.data], {
				type: 'application/png;charset=utf-8',
			})
			const imgUrl = window.URL.createObjectURL(blob)
			url.value.push(imgUrl)
			urlArr.value.push(imgUrl)
		})
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
</style>
