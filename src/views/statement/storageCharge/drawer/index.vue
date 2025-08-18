<template>
	<div>
		<div class="search_form">
			<div>{{ ticketInfoDes }}</div>
		</div>
		<el-collapse v-model="collapseActive">
			<el-collapse-item title="场存信息" name="1">
				<BaseTable
					ref="baseTableStorage"
					:tableColumns="storageColumns"
					:tableData="storageTableData"
					:total="total"
					:tableHeight="200"
				/>
			</el-collapse-item>
			<el-collapse-item title="历史结算信息" name="2">
				<BaseTable
					ref="baseTableRef"
					:tableColumns="historyColumns"
					:tableData="historyData"
					:total="total"
					:tableHeight="300"
					:cellClickEvent="cellClickEvent"
				/>
			</el-collapse-item>

			<el-collapse-item title="结算信息" name="3">
				<el-form ref="ruleForm" :model="formData" :rules="rules" :inline="true" label-position="top">
					<el-row :gutter="24">
						<el-col :span="6">
							<el-form-item label="合同" prop="contractId">
								<el-select
									v-model="formData.contractId"
									clearable
									remote
									class="others"
									placeholder="合同信息"
									@change="changeSelect"
								>
									<el-option v-for="item in contractDataList" :key="item.id" :label="item.contactNo" :value="item.id">
										编号:{{ item.contactNo }}签订日期:{{ item.signTime }} 有效期限:{{ item.startTime }}/{{
											item.endTime
										}}
										免堆存期:{{ item.freeStorageDays }} 合同描述:{{ item.remark }}
									</el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="开始时间" prop="startDate">
								<el-date-picker
									v-model="formData.startDate"
									type="date"
									placeholder="日期"
									value-format="YYYY-MM-DD"
									format="YYYY-MM-DD"
									readonly
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="结束时间" prop="endDate">
								<el-date-picker
									v-model="formData.endDate"
									type="date"
									placeholder="选择结束时间"
									value-format="YYYY-MM-DD"
									format="YYYY-MM-DD"
									@change="dateChange"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="4">
							<el-form-item label="是否最终结算" prop="isFinal">
								<el-radio-group v-model="formData.isFinal">
									<el-radio label="1">是</el-radio>
									<el-radio label="0">否</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="2">
							<el-form-item label=" ">
								<div style="padding-top: 20px">
									<el-button
										class="search_btn"
										type="primary"
										size="mini"
										v-auth="'storagefee::calculatestoragefees'"
										@click="calculateStorageFees"
										:disabled="isDisabled"
									>
										计算
									</el-button>
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="总进场量">
								<el-input v-model="formData.totalEntry" size="mini" readonly />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="总出场量">
								<el-input v-model="formData.totalAppearance" size="mini" readonly />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="剩余场存量">
								<el-input v-model="formData.balancesAmount" size="mini" readonly />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="结算金额">
								<el-input v-model="formData.amount" size="mini" readonly />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="税率" prop="taxRate">
								<el-input v-model="formData.taxRate" size="mini" readonly />
								<!-- <el-select
									size="mini"
									filterable
									clearable
									placeholder="选择税率"
									v-model="formData.taxRate"
									@change="changeTaxRate"
								>
									<el-option
										v-for="(item, index) in rateList"
										:key="item.cd"
										:label="item.nm"
										:value="item.cd"
									></el-option>
								</el-select> -->
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="税额">
								<el-input v-model="formData.taxCast" size="mini" readonly />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="税后金额">
								<el-input v-model="formData.afterTax" size="mini" readonly />
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
				<BaseTable
					ref="baseTableRate"
					:tableColumns="rieredRateColumns"
					:tableData="rieredRateData"
					:total="total"
					:tableHeight="200"
				/>
				<!-- <BaseTable :data="rieredRateData" :columns="rieredRateColumns" tableHeight="200" :pagination="false" /> -->
			</el-collapse-item>
			<el-collapse-item title="堆存费明细" name="4">
				<!-- <BaseTable :data="storageFeeDetailData" :columns="storageFeeDetailColumns" :pagination="false" :loading="loading" /> -->
				<BaseTable
					ref="baseTableFee"
					:tableColumns="storageFeeDetailColumns"
					:tableData="storageFeeDetailData"
					:total="total"
					:tableHeight="500"
				/>
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script setup name="drawer">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted } from 'vue'
import api from '@/api/statement/storageCharge/index'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()
const total = ref(0)
const ruleForm = ref(null)
const isDisabled = ref(false)
// 税率
// const rateList = ref([])
// 合同信息
const contractDataList = ref([])
// 结算信息
const formData = reactive({
	contractId: '', //合同ID
	startDate: '', //结算开始时间
	endDate: '', //结算结束时间
	totalEntry: '', //总进场量
	totalAppearance: '', //总出场量
	amount: '', //结算金额
	balancesAmount: '', //剩余场存量
	taxRate: '', //税率
	taxCast: '', //税额
	afterTax: '', //税后金额
	isFinal: 0, //是否最终结算
})
const isFinal = ref() //是否最终结算
const emit = defineEmits(['childrenEmit'])
const cargoInfoId = ref('') //票货gid
const cargoCode = ref('') //货物code
const rules = reactive({
	startDate: proxy.getRules({ required: true }),
	endDate: proxy.getRules({ required: true }),
	contractId: proxy.getRules({ required: true }),
})
const changeSelect = val => {
	contractDataList.value.filter(item => {
		if (item.id == val) {
			console.log()
			rieredRateData.value = item.rateList
		}
	})
}
const dateChange = val => {
	var startNum = parseInt(formData.startDate.replace(/-/g, ''), 10)
	var endNum = parseInt(val.replace(/-/g, ''), 10) //全部替换endDate中的"-"为空后转成十进制的数字，g是全部替换的意思，"/"是分隔符
	// console.log('选中时间', startNum, endNum)
	if (startNum >= endNum) {
		proxy.$modal.msgWarning('结束时间不能早于开始时间！')
		formData.endDate = ''
	}
	// console.log('结束时间', val)
	// if(val)
}
// 计算
const saveData = ref({})
const calculateStorageFees = async () => {
	if (await validate()) {
		let data = {
			startDate: formData.startDate, //开始时间
			endDate: formData.endDate, //结束时间
			contractId: formData.contractId, //合同gid
			cargoInfoId: cargoInfoId.value, //票货id
			cargoCode: cargoCode.value, //货物code
			historyGid: '', //历史结算gid
		}
		isFinal.value = JSON.parse(JSON.stringify(formData.isFinal))
		api.getCalculatestoragefees(data).then(res => {
			console.log('合同计算', res)
			proxy.setFormData(formData, res.data)
			formData.isFinal = isFinal.value
			saveData.value = JSON.parse(JSON.stringify(res.data))
			saveData.value.isFinal = isFinal.value
      saveData.value.rateId = res.data.rateId;
			// console.log(222, saveData.value)
			storageFeeDetailData.value = res.data.detailList //堆存费明细
		})
	}
}
// 场存信息
const baseTableStorage = ref(null)
const storageTableData = ref([])
const storageColumns = ref([
	{
		prop: 'storehouseName',
		label: '场地',
	},
	{
		prop: 'regionName',
		label: '区',
	},
	{
		prop: 'massName',
		label: '垛',
	},
	// {
	// 	prop: 'firstInDate',
	// 	label: '入场日期',
	// },
	{
		prop: 'quantity',
		label: '件数',
		align: 'right',
	},
	{
		prop: 'ton',
		label: '重量',
		align: 'right',
	},
])

// 历史结算信息表格数据
const baseTableRef = ref(null)
const historyData = ref([])
const historyColumns = ref([
	{
		prop: 'startDate',
		label: '开始日期',
		width: 120,
	},
	{
		prop: 'endDate',
		label: '结束日期',
		width: 120,
	},
	{
		prop: 'amount',
		label: '结算金额',
		width: 120,
	},
	{
		prop: 'totalEntry',
		label: '进',
		width: 100,
	},
	{
		prop: 'totalAppearance',
		label: '出',
		width: 100,
	},
	{
		prop: 'settlementDays',
		label: '结算天数',
		width: 100,
	},
	{
		prop: 'createByNm',
		label: '创建人',
		width: 100,
	},
	{
		prop: 'createTime',
		label: '创建时间',
		width: 120,
	},
	{
		prop: 'status',
		label: '状态',
		width: 100,
		align: 'center',
		render: row => {
			return [h('div', {}, row.status == '1' ? '已生成' : '未生成')]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 380,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							getSettlement(row)
						},
						// type: 'primary',
						type: row.status == '1' ? 'danger' : 'primary',
						link: true,
						icon: 'Edit',
						// disabled: row.status == '1',
						permission: 'business:customer:update', // 权限
					},
					{
						// default: () => '计费审核',
						default: () => (row.status == '1' ? '取消计费审核' : '计费审核'),
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							detail(row.id)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'business:customer:update', // 权限
					},
					{
						default: () => '详情',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							businessAffirm(row)
						},
						type: row.statementStatus == '31' ? 'danger' : 'primary',
						link: true,
						icon: 'Delete',
						disabled: row.status == '0',
						permission: 'business:customer:delete', // 权限
					},
					{
						default: () => (row.statementStatus == '31' ? '取消商务确认' : '商务确认'),
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						disabled: row.index !== 0 || row.status == '1',
						permission: 'business:customer:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
// 历史结算信息单条数据详情
const cellClickEvent = ({ row }) => {
	// console.log('点击行事件', row)
	detail(row.id)
}
// 历史结算查看详情
const detail = id => {
	emit('childrenEmit', 'disabled')
	isDisabled.value = true
	api.getHistoryDetail(id).then(res => {
		console.log('历史结算详情', res)
		proxy.setFormData(formData, res.data)
		storageFeeDetailData.value = res.data.detailList //堆存费明细
		// console.log('历史结算查看详情', res)
	})
}
// 历史结算删除
const handleDelete = val => {
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			let data = {
				historyGid: val.id,
				cargoInfoId: val.cargoInfoId,
			}
			api.delete(data).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				emit('childrenEmit', 'refresh')
			})
		})
		.catch(err => {})
}
// 生成结算清单
const getSettlement = val => {
	// console.log('结算清单', val)
	if (val.status == '1') {
		proxy.$modal.confirm('是否确定取消计费审核？').then(() => {
			api.cancelstatement(val.id).then(res => {
				// console.log('取消计费审核', res)
				proxy.$modal.msgSuccess(res.msg)
				emit('childrenEmit', 'refresh')
			})
		})
	} else {
		proxy.$modal.confirm('是否确定计费审核？').then(() => {
			let data = {
				historyGid: val.id,
				cargoInfoId: val.cargoInfoId,
			}
			api.generatestatement(data).then(res => {
				// console.log('结算清单', res)
				proxy.$modal.msgSuccess(res.msg)
				emit('childrenEmit', 'refresh')
			})
		})
	}
}
// 历史结算商务确认
const businessAffirm = val => {
	if (val.statementStatus == '30') {
		proxy.$modal.confirm('是否确定商务确认？').then(() => {
			api.confirm(val.id).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				emit('childrenEmit', 'refresh')
			})
		})
	} else {
		proxy.$modal.confirm('是否确定取消商务确认？').then(() => {
			api.cancelConfirm(val.id).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				emit('childrenEmit', 'refresh')
			})
		})
	}
}
//堆存费明细
const baseTableFee = ref(null)
const storageFeeDetailData = ref([])
const storageFeeDetailColumns = ref([
	{
		prop: 'storageDate',
		label: '日期',
	},
	{
		prop: 'days',
		label: '堆存天数',
	},
	{
		prop: 'fieldStockWeight',
		label: '场存量',
	},
	{
		prop: 'entryWeight',
		label: '进场量',
	},
	{
		prop: 'appearanceWeight',
		label: '出场量',
	},
	{
		prop: 'feeStorage',
		label: '是否免堆存',
		render: row => {
			return [h('div', {}, row.feeStorage == '1' ? '是' : '否')]
		},
	},
	{
		prop: 'settlementVolume',
		label: '结算堆存量',
	},
	{
		prop: 'rate',
		label: '费率',
	},
	{
		prop: 'amount',
		label: '结算金额',
	},
])
// 阶梯费率
const baseTableRate = ref(null)
const rieredRateData = ref([])
const rieredRateColumns = ref([
	{
		label: '费目',
		prop: 'rateItemName',
	},
	{
		label: '账期类型',
		prop: 'paymentTypeName',
	},
	{ label: '账期天数', prop: 'paymentDays' },
	{
		label: '服务内容',
		prop: 'serviceContentId',
	},
	{
		label: '内外贸',
		prop: 'tradeType',
		align: 'center',
		render: row => {
			return [h('div', {}, row.tradeType == '0' ? '内贸' : '外贸')]
		},
	},
	{
		label: '货物',
		prop: 'cargoName',
	},
	{ label: '费率值', prop: 'rate' },
	{
		label: '计费单位',
		prop: 'unitName',
	},
])
// 折叠面板绑定值
const collapseActive = ref(['1', '2', '3', '4'])

// 表单验证
const validate = async () => {
	// if(!storageFeeDetailData.value){
	//   proxy.$modal.msgWarning('未查到堆存费！')
	// }
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}
// 重置表单
const resetForm = () => {
	proxy.resetObj(formData)
	contractDataList.value = [] //合同信息
	storageTableData.value = [] //场存信息
	historyData.value = [] //历史结算信息
	rieredRateData.value = [] //阶梯费率
	storageFeeDetailData.value = [] //堆存费明细
	isDisabled.value = false
	// console.log('重置表单数据')
}

defineExpose({
	validate,
	resetForm,
	formData,
	storageTableData, //场存
	historyData, //历史结算
	storageFeeDetailData, //堆存费明细
	rieredRateData, //阶梯费率
	contractDataList, //合同信息
	cargoInfoId, //票货gid
	cargoCode, //货物code
	saveData,
})
</script>

<style lang="less" scoped>
@import '@/assets/styles/formData.scss';
</style>
