<!-- 作业指令新增编辑表单 -->
<template>
	<el-form :model="trustOrderForm" ref="ruleForm" :inline="true" label-position="top">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="指令信息" name="order">
				<el-row>
					<el-col :span="8">
						<el-form-item label="通知单编号" prop="trustNo">
							<el-input v-model="trustOrderForm.trustNo" readonly :disabled="true" />
						</el-form-item>
					</el-col>

					<el-col :span="8">
						<el-form-item label="作业公司" prop="companyId">
							<Select
								:disabled="true"
								:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
								v-model:value="trustOrderForm.companyId"
								v-model:label="trustOrderForm.companyName"
								placeholder="作业公司"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="通知单类型" prop="type">
							<Select
                :disabled="true"
								:selectData="planTypeList"
								:selectLabel="'trustType'"
								:selectValue="'trustType'"
								v-model:value="trustOrderForm.type"
								placeholder="通知单类型"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item
							label="进出口"
							prop="impExp"
						>
							<Select
                :disabled="true"
								:selectData="[
									{ label: '进口', value: '进口' },
									{ label: '出口', value: '出口' },
								]"
								v-model:value="trustOrderForm.impExp"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8" v-if="isSelectProcess == 1">
						<el-form-item label="作业过程" prop="processCode">
							<Select
                :disabled="true"
								:selectData="processList"
								v-model:value="trustOrderForm.processCode"
								v-model:label="trustOrderForm.processName"
								placeholder="作业过程"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item
							label="贸别"
							prop="tradeType"
						>
							<Select
                :disabled="true"
								:selectData="[
									{ label: '内贸', value: '内贸' },
									{ label: '外贸', value: '外贸' },
								]"
								v-model:value="trustOrderForm.tradeType"
								v-model:label="trustOrderForm.tradeType"
							/>
						</el-form-item>
					</el-col>

					<el-col :span="8" v-if="trustOrderForm.type !== '杂项'">
						<el-form-item label="结算依据" prop="settlementBasisCode">
							<Select
                :disabled="true"
								:selectData="SETTLEMENT_BASIS"
								v-model:value="trustOrderForm.settlementBasisCode"
								v-model:label="trustOrderForm.settlementBasisName"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item
							label="计划开始时间"
							prop="startTime"
						>
							<el-date-picker
                :disabled="true"
								v-model="trustOrderForm.startTime"
								value-format="YYYY-MM-DD HH:mm"
								format="YYYY-MM-DD HH:mm"
								type="datetime"
								placeholder="计划开始时间"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item
							label="计划结束时间"
							prop="endTime"
						>
							<el-date-picker
                :disabled="true"
								v-model="trustOrderForm.endTime"
								value-format="YYYY-MM-DD HH:mm"
								format="YYYY-MM-DD HH:mm"
								type="datetime"
								placeholder="计划结束时间"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="计划件数" prop="planQuantity">
							<el-input
                :disabled="true"
								v-model="trustOrderForm.planQuantity"
								placeholder="计划件数"
								@input="trustOrderForm.planQuantity = proxy.verify('number', trustOrderForm.planQuantity)"
							/>
						</el-form-item>
					</el-col>

					<el-col :span="8">
						<el-form-item
							label="计划量"
							prop="planTon"
						>
							<el-input v-model="trustOrderForm.planTon" placeholder="计划量" :disabled="true"/>
						</el-form-item>
					</el-col>
					<el-col :span="8" v-if="trustOrderForm.type == '杂项'">
						<el-form-item label="是否计费" prop="isBill">
							<el-radio-group v-model="trustOrderForm.isBill" :disabled="true">
								<el-radio key="1" label="1">是</el-radio>
								<el-radio key="0" label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="8" v-if="isEstimateAmount == 1">
						<el-form-item label="预估金额" prop="estAmount">
							<el-input v-model="trustOrderForm.estAmount" placeholder="预估金额" readonly :disabled="true" />
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="磅单备注" prop="poundRemark">
							<el-input v-model="trustOrderForm.poundRemark" placeholder="磅单备注" :disabled="true"/>
						</el-form-item>
					</el-col>
          <el-col :span="8">
            <el-form-item label="协议附件" prop="remark">
              <upload
                :fileTypeName="fileTypeName"
                businessType="ORDER_DELIVERY"
                :businessId="trustOrderForm.id"
                @changeFile="changeFile"
              />
            </el-form-item>
          </el-col>
				</el-row>
				<el-row>
					<el-col :span="16">
						<el-form-item label="作业要求" prop="remark">
							<el-input
                :disabled="true"
								v-model="trustOrderForm.remark"
								:autosize="{ minRows: 2, maxRows: 4 }"
								type="textarea"
								maxlength="2000"
								show-word-limit
								placeholder="请输入作业要求"
							/>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>

			<el-collapse-item v-if="isSelectShip == 1" title="船舶信息" name="ship">
				<el-form-item
					label="船名航次"
					prop="shipvoyageItemId"
				>
					<RemoteSelect
            :disabled="true"
						type="SHIPVOYAGE_ITEM"
						v-model:value="trustOrderForm.shipvoyageItemId"
						placeholder="船名_航次/SCN/航次状态/进出口/预抵时间/起运港->目的港"
					/>
				</el-form-item>
			</el-collapse-item>

			<el-collapse-item name="cargo" v-if="isCreateCargo !== '0'">
				<template v-slot:title>
					<div style="display: flex; justify-content: space-between; width: 95%">
						<div>货物信息</div>
					</div>
				</template>
				<EditTable
					ref="editTable"
					:tableHeight="300"
					:tableColumns="tableColumns"
					:tableData="trustOrderForm.cargoList"
					:editRules="editRules"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="editTrustOrder">
import EditTable from '@/components/EditTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import upload from '../../../../components/upload/index'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import { ElButton, ElInput } from 'element-plus'
import publicApi from '@/api/public/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const fileTypeName = ref('.png,.jpg, .jpeg,.gif,.pdf,.doc,docx,.xls,.xlsx')

// 通知单类型列表
const planTypeList = ref([])
const type = ref('1') //类型
const isSelectShip = ref(1) //是否选船（1：是 0：否）
const isEstimateAmount = ref(0) //是否预估金额（1：是 0：否）
const isCreateCargo = ref(0) //是否生成新票货（1：生成 2：选择 3：无）
const isSelectProcess = ref(0) //是否选择作业过程（1：是 0：否）
const isHidden = ref(true) //货物信息可编辑列表是否显示合同及预估金额
const containCargo = ref(true) //是否有货物信息
const trustGroupType = ref(0)
const ruleForm = ref(null)
const processList = ref([]) //作业过程列表
const typeDisabled = ref(true);
//结算依据 字典值
const SETTLEMENT_BASIS = ref(null)
const editRules = ref({
	//consignerId: [{ required: true, message: '委托人必须填写' }],
})
const editTable = ref(null)
// 上传文件
const changeFile = file => {
  trustOrderForm.value.fileIds = file
}
//作业指令表单数据
const trustOrderForm = ref({
	id: null,
	planQuantity: '', //计划件数
	planTon: '', //计划量
	companyId: '1677242790846795776', //作业公司id
	type: '', //通知单类型
	companyName: '潍坊港区散货码头有限公司', //作业公司名称
	shipvoyageItemId: '',
	trustNo: '', //指令编号
	tradeType: '', //内外贸
	remark: '', //作业要求
	settlementBasisCode: '', //结算依据
	settlementBasisName: '', //结算依据
	shipvoyageId: '', //航次ID
	shipName: '', //船名
	fileIds: [], //上传文件
	processName: '', //作业过程名称
	processCode: '', //作业过程code
	sourceCode: '', //源类型
	status: '', //状态
	estAmount: '', //预估金额
	startTime: '', //计划开始时间
	endTime: '', //计划结束时间
	impExp: '', //进出口
	cargoList: [], //货物信息
	isBill: '0', //是否计费
	customerId: '', //客户
	poundRemark: '', //磅单备注
})

//折叠面板
const activeNames = ref(['order', 'ship', 'cargo'])
const tableColumns = reactive([
	{
		prop: 'cargoInfoNo',
		label: '票货号',
    width: 120,
    align:'center'
	},
	{
		prop: 'businessNo',
		label: '计划号',
    width: 120,
    align:'center'
	},
	{
		prop: 'cargoCode',
		label: '货名',
		modelLabel: 'cargoName',
		selectLabel: 'label',
		selectValue: 'value',
		editType: 'remoteSelect',
		type: 'CARGO_INFO_SIGN',
		disabled: true,
    width: 140,
    align:'center'
	},
	{
		prop: 'packingCode',
		label: '包装',
		modelLabel: 'packingName',
    width: 80,
    align:'center'
	},
	{
		prop: 'cargoOwnerId',
		label: '货主',
		modelLabel: 'cargoOwnerName',
		selectLabel: 'label',
		selectValue: 'value',
		editType: 'remoteSelect',
		type: 'CUSTOMER_CARGO_OWNER',
    width: 200,
		disabled: true,
    align:'center'
	},
  {
    prop: 'consignerId',
    label: '委托人',
    width: 200,
    modelLabel: 'consignerName',
    selectLabel: 'label',
    selectValue: 'value',
    editRender: {},
    editType: 'remoteSelect',
    type: 'CUSTOMER_CARGO_OWNER',
    align:'center'
  },
	{
		prop: 'quantity',
		label: '件数',
		// width: 120,
		editType: 'input',
		disabled: typeDisabled,
    editRender: {},
    width: 100,
    align:'right'
	},
	{
		prop: 'ton',
		label: '重量',
		editType: 'input',
		disabled: typeDisabled,
    editRender: {},
    width: 150,
    align:'right'
	},
	{
		prop: 'hatchArr',
		label: '舱口',
		modelLabel: 'hatchArr',
		multiple: true,
		editType: 'select',
		disabled: true,
    width: 100,
    align:'center'
	},
	{
		prop: 'contractName',
		label: '合同',
		modelValue: 'contractId',
		modelLabel: 'contractName',
		selectLabel: 'contractName',
		selectValue: 'contractId',
		editType: 'select',
		disable: true,
		disabled: true,
    width: 200,
    align:'center'
	},
	{
		prop: 'rateLabel',
		label: '单价',
		width: 100,
		modelLabel: 'rateLabel',
		modelValue: 'rate',
		editType: 'select',
		selectLabel: 'label',
		selectValue: 'contractRateId',
    disabled: true,
    align:'right'
	},
	{
		prop: 'estAmount',
		label: '预估金额',
    width: 150,
    align:'right'
	},
	{
		label: '是否二次过磅',
		prop: 'isSecondWeigh',
		editType: 'select',
		modelValue: 'isSecondWeigh',
		disabled: true,
    width: 150,
    align:'center',
		selectData: [
			{ label: '否', value: '0' },
			{ label: '是', value: '1' },
		],
	},
	{
		label: '打印次数是否有效',
		prop: 'printPoundId',
		editType: 'select',
		modelValue: 'printPoundId',
		disabled: true,
    width: 200,
    align:'center',
		selectData: [
			{ label: '否', value: '0' },
			{ label: '是', value: '1' },
		],
	},
	{
		label: '打印次数',
		prop: 'printPoundNum',
		modelValue: 'printPoundNum',
		width: 120,
		disabled: true,
    align:'center',
	},
])

const initData = () => {
	// 获取字典数据 合同类型：CONTRACT_TYPE 结算依据：SETTLEMENT_BASIS   预缴依据：DEPOSIT_BASIS  付费方式：PAY_TYPE,账期类型：PAYMENT_TYPE 计量单位：UNIT
	publicApi.getDictList({ types: 'SETTLEMENT_BASIS,PACKAGE_TYPE' }).then(res => {
		SETTLEMENT_BASIS.value = res.data.SETTLEMENT_BASIS
		// 给编辑table下拉框设置数据源
		proxy.setEditTableOptions(tableColumns, { packingCode: res.data.PACKAGE_TYPE })
	})
}

// 重置表单
const resetForm = () => {
	ruleForm.value.resetFields()
	trustOrderForm.value.cargoList = [] //货物信息
	trustOrderForm.value.id = ''
	proxy.$bus.emit('resetFileList') //清空文件上传
}

//初始化下拉列表数据
initData()
// 清空校验
const validate = async () => {
  return await editTable.value.validAllEvent()
}
defineExpose({
  validate,
	resetForm,
	trustOrderForm,
	type,
	tableColumns,
  typeDisabled
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
