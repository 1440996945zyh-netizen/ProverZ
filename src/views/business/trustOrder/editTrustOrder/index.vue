<!-- 作业指令新增编辑表单 -->
<template>
	<el-form :model="trustOrderForm" ref="ruleForm" :inline="true" label-position="top" :rules="rules">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="指令信息" name="order">
				<el-row>
					<el-col :span="6">
						<el-form-item label="通知单编号" prop="trustNo">
							<el-input v-model="trustOrderForm.trustNo" readonly :disabled="disabled" />
						</el-form-item>
					</el-col>
					<el-col :span="12" v-if="(type == 1 || type == 4) && isShipVoyage == true">
						<el-form-item
							label="船名航次"
							prop="shipvoyageItemId"
							:rules="[
								{
									required: type == '1' ? true : false,
									message: '不能为空',
								},
							]"
						>
							<RemoteSelect
                :disabled="typeDisabled"
								type="SHIPVOYAGE_ITEM_EXCLUDE_JZX_CM_TRUST"
								v-model:value="trustOrderForm.shipvoyageItemId"
								placeholder="船名_航次/SCN/航次状态/进出口/预抵时间/起运港->目的港"
								@change="changeShipVoyage"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="作业公司" prop="companyId">
							<Select
								:disabled="disabled"
								:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
								v-model:value="trustOrderForm.companyId"
								v-model:label="trustOrderForm.companyName"
								placeholder="作业公司"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6" v-if="trustOrderForm.type == '杂项'">
						<el-form-item
							label="客户"
							prop="customerId"
							:rules="[
								{
									required: trustOrderForm.type === '杂项' && trustOrderForm.isBill === '1',
									message: '计费时不能为空',
								},
							]"
						>
							<RemoteSelect
								:disabled="disabled"
								type="CUSTOMER_ALL"
								v-model:value="trustOrderForm.customerId"
								v-model:label="trustOrderForm.cargoOwnerName"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="通知单类型" prop="type">
							<Select
								:disabled="typeDisabled"
								:selectData="planTypeList"
								:selectLabel="'trustType'"
								:selectValue="'trustType'"
								v-model:value="trustOrderForm.type"
								placeholder="通知单类型"
								@change="changenotrustType"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item
							label="进出口"
							prop="impExp"
							:rules="[
								{
									required: trustOrderForm.trustType == '1' ? true : false,
									message: '不能为空',
								},
							]"
						>
							<Select
								:disabled="disabled"
								:selectData="[
									{ label: '进口', value: '进口' },
									{ label: '出口', value: '出口' },
								]"
								v-model:value="trustOrderForm.impExp"
								@change="changeImpExp"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6" v-if="isSelectProcess == 1">
						<el-form-item label="作业过程" prop="processCode">
							<Select
								v-if="!multiple"
								:disabled="disabled"
								:selectData="processList"
								v-model:value="trustOrderForm.processCode"
								v-model:label="trustOrderForm.processName"
								placeholder="作业过程"
								@change="changeProcess"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item
							label="贸别"
							prop="tradeType"
							:rules="[
								{
									required: trustOrderForm.type == '杂项' ? false : true,
									message: '不能为空',
								},
							]"
						>
							<Select
								:disabled="disabled"
								:selectData="[
									{ label: '内贸', value: '内贸' },
									{ label: '外贸', value: '外贸' },
								]"
								v-model:value="trustOrderForm.tradeType"
								v-model:label="trustOrderForm.tradeType"
							/>
						</el-form-item>
					</el-col>

					<el-col :span="6" v-if="trustOrderForm.type !== '杂项'">
						<el-form-item label="结算依据" prop="settlementBasisCode">
							<Select
								:disabled="disabled"
								:selectData="SETTLEMENT_BASIS"
								v-model:value="trustOrderForm.settlementBasisCode"
								v-model:label="trustOrderForm.settlementBasisName"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item
							label="计划开始时间"
							prop="startTime"
							:rules="[
								{
									required: trustGroupType == '2' ? true : false,
									message: '不能为空',
								},
							]"
						>
							<el-date-picker
								:disabled="disabled && postStatus !== '30' && postStatus !== '40'"
								v-model="trustOrderForm.startTime"
								value-format="YYYY-MM-DD HH:mm"
								format="YYYY-MM-DD HH:mm"
								type="datetime"
								placeholder="计划开始时间"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item
							label="计划结束时间"
							prop="endTime"
							:rules="[
								{
									required: trustGroupType == '2' ? true : false,
									message: '不能为空',
								},
							]"
						>
							<el-date-picker
								:disabled="disabled && postStatus !== '30' && postStatus !== '40'"
								v-model="trustOrderForm.endTime"
								value-format="YYYY-MM-DD HH:mm"
								format="YYYY-MM-DD HH:mm"
								type="datetime"
								placeholder="计划结束时间"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="计划件数" prop="planQuantity">
							<el-input
								v-model="trustOrderForm.planQuantity"
								placeholder="计划件数"
								@input="trustOrderForm.planQuantity = proxy.verify('number', trustOrderForm.planQuantity)"
							/>
						</el-form-item>
					</el-col>

					<el-col :span="6">
						<el-form-item
							label="计划量"
							prop="planTon"
							:rules="[
								{
									required: trustOrderForm.type == '杂项' ? true : false,
									message: '不能为空',
								},
							]"
						>
							<el-input v-model="trustOrderForm.planTon" placeholder="计划量" />
						</el-form-item>
					</el-col>
					<el-col :span="6" v-if="trustOrderForm.type == '杂项'">
						<el-form-item label="是否计费" prop="isBill">
							<el-radio-group v-model="trustOrderForm.isBill" :disabled="disabled">
								<el-radio key="1" label="1">是</el-radio>
								<el-radio key="0" label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6" v-if="isEstimateAmount == 1">
						<el-form-item label="预估金额" prop="estAmount">
							<el-input v-model="trustOrderForm.estAmount" placeholder="预估金额" readonly :disabled="disabled" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="磅单备注 " prop="poundRemark">
<!--							<el-checkbox-->
<!--								class="checkbox"-->
<!--								v-model="trustOrderForm.isWeiqiaoPoundRemark"-->
<!--								true-label="1"-->
<!--								false-label="0"-->
<!--								label="是否魏桥"-->
<!--								size="large"-->
<!--                @change="changeIsWeiqiao"-->
<!--							/>-->
							<el-input v-model="trustOrderForm.poundRemark" placeholder="磅单备注" />
						</el-form-item>
					</el-col>
          <el-col :span="6" v-if="JSGWeiQiao && trustOrderForm.isWeiqiaoPoundRemark ==1">
            <el-form-item label="转水前船名" prop="preChangeShipName">
              <el-input v-model="trustOrderForm.preChangeShipName" placeholder="转水前船名"   />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="JSGWeiQiao && trustOrderForm.isWeiqiaoPoundRemark ==1" >
            <el-form-item label="转水前编号" prop="preChangeShipNo">
              <el-input v-model="trustOrderForm.preChangeShipNo" placeholder="转水前编号"   />
            </el-form-item>
          </el-col>
				</el-row>
				<el-row>
					<el-col :span="18">
						<el-form-item label="作业要求" prop="remark">
							<el-input
								:disabled="disabled"
								v-model="trustOrderForm.remark"
								:autosize="{ minRows: 2, maxRows: 4 }"
								type="textarea"
								maxlength="2000"
								show-word-limit
								placeholder="请输入作业要求"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="上传清单">
							<upload
								:fileTypeName="fileTypeName2"
								businessType="INVENTORY"
								:businessId="trustOrderForm.id"
								@changeFile="changeFile"
								:showRemoveBtn="trustOrderForm.status != '30' && trustOrderForm.status != '40'"
							/>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="6">
						<el-form-item label="交接清单附件预览" v-if="trustOrderForm.type == '疏港'">
							<filePreview :fileList="shipvoyageItemFileList" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
			<el-collapse-item name="cargo" v-if="isCreateCargo !== '0'">
				<template v-slot:title>
					<div style="display: flex; justify-content: space-between; width: 95%">
						<div>货物信息</div>
						<div>
							<el-button v-if="(trustOrderForm.type=='装船' || trustOrderForm.type=='疏港')" type="primary" @click.stop="chooseOrderInfo" :disabled="disabled"> 提单关联 </el-button>
							<el-button type="primary" v-if="isCreateCargo == 2" @click.stop="chooseTicketInfo" :disabled="disabled"> 选择票货 </el-button>
							<el-button v-if="isCreateCargo == 1" type="primary" @click.stop="addCargoInfo" :disabled="disabled"> 添加 </el-button>
						</div>
					</div>
				</template>
				<EditTable
					ref="editTable"
					:tableHeight="300"
					:tableColumns="tableColumns"
					:tableData="trustOrderForm.cargoList"
					:editRules="editRules"
					@input="editInputChange"
					@change="editTableChange"
					@focus="tableFocus"
          :rowStyle="rowStyle"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>

	<!--票货组件 -->
	<el-drawer v-model="ticketShow" title="票货信息" size="85%">
		<tickTable ref="tickTableRef"></tickTable>
		<template #footer>
			<div style="flex: auto">
				<el-button @click="ticketShow = false">取消</el-button>
				<el-button type="primary" @click="saveTicket">保存</el-button>
			</div>
		</template>
	</el-drawer>

	<el-drawer v-model="orderShow" title="提运单信息" size="70%">
		<orderTable ref="orderTableRef"></orderTable>
		<template #footer>
			<div style="flex: auto">
				<el-button @click="orderShow = false">取消</el-button>
				<el-button type="primary" @click="saveOrder">保存</el-button>
			</div>
		</template>
	</el-drawer>
  <el-dialog
    v-model="dialogVisible"
    width="50%"
    :before-close="handleClose"
  >
    <BaseTable
      ref="stopLogBaseTable"
      :autoResize="true"
      :tableColumns="stopLogTableColumns"
      :tableData="stopLogTableDate"
      :total="stopLogTableTotal"
      :tableHeight="600"
      :showSearchHeader="false"
    />
  </el-dialog>

  <el-dialog
    v-model="stopHandleVisible"
    :title="stopTitle"
    width="400px"
  >
    <el-form :model="stopFormData" ref="stopFormRef" label-width="80px" :rules="stopFormRules">
      <el-form-item label="备注" prop="stopRemark">
        <el-input  maxlength="200"
                   show-word-limit
                   type="textarea"
                   :rules="[{ required: true, message: '备注内容不能为空' }]"
                   v-model="stopFormData.stopRemark"  placeholder="请输入内容" />
      </el-form-item>
    </el-form>


    <template #footer>
      <el-button @click="stopHandleVisible = false">取消</el-button>
      <el-button type="primary" @click="stopHandleThen">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup name="editTrustOrder">
import filePreview from './filePreview/index.vue'
import EditTable from '@/components/EditTable/index.vue'
import tickTable from './tickTable/index.vue'
import orderTable from './orderTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import { ElButton, ElInput } from 'element-plus'
import publicApi from '@/api/public/index'
import api from '@/api/business/trustOrder/index'
import Upload from '@/components/upload/index.vue'
import math from "@/utils/math";
import BaseTable from "@/components/BaseTable/index.vue";
// 是否可编辑
const disabled = ref(false) //表单数据是否禁用
const isDisabled = ref(false) //票货信息数据列表是否可删除
const JSGWeiQiao = ref(false) //集疏港显示转水船  其他不显示
const isStop = ref(false) //集疏港显示转水船  其他不显示
const typeDisabled = ref(false) //通知单类型是否可选禁用
const isShipVoyage = ref(false) //是否疏港，不显示船舶航次

const dialogVisible = ref(false)
const stopLogTableTotal = ref(0)

// 通知单类型列表
const planTypeList = ref([])
const type = ref('1') //类型
const stopHandleVisible  =ref(false)
const stopTitle = ref('')
const stopFormRef = ref(null)
const stopFormRules =ref({
  stopRemark: [{ required: true, message: '备注不能为空' }],
})
// 获取作业通知单类型
const getTrustTypeList = () => {
	api.getListTrustType().then(res => {
		planTypeList.value = res.data.filter(item => item.trustGroupType == type.value)
		// trustGroupType
	})
}
const hatchList = ref([]) //舱口数据
const hatchShow = ref(false) //舱口字段是否显示
const weighShow = ref(false) //是否二次过磅 显示/隐藏
const isSecondShow = ref(false) //是否过磅显示
const printShow = ref(false) //集疏港打印字段是否显示
// const isPrint = ref(false) //打印次数是否生效
// const isSelectShip = ref(1) //是否选船（1：是 0：否）
const isEstimateAmount = ref(0) //是否预估金额（1：是 0：否）
const isCreateCargo = ref(0) //是否生成新票货（1：生成 2：选择 3：无）
const isSelectProcess = ref(0) //是否选择作业过程（1：是 0：否）
const isHidden = ref(true) //货物信息可编辑列表是否显示合同及预估金额
const containCargo = ref(true) //是否有货物信息
const trustGroupType = ref(0)
const isShowOutCargo=ref(true) //装船疏港显示提运单号控制
// import { hasPermission } from '@/permission/index.js'
// const orderItemPermission = ref(false)
// const hasPerms=(perms)=> {
//   // 根据权限标识和外部指示状态进行权限判断
//   console.log(111111111111111111111)
//   console.log(hasPermission(perms))
//   console.log(333333333333333333333)
//   return hasPermission(perms) //& !this.disabled
// }

// 通知单类型下拉框事件
const changenotrustType = val => {
  if(val.trustType == '装船'||val.trustType == '疏港'){
    isShowOutCargo.value = false
  }else{
    if(val.trustType=='卸船'){
        tableColumns.forEach(item => {
          if (item.label == '货名' || item.label == '包装' || item.label == '货主' ) {
            item.disabled = true
          }
        })
    }
    isShowOutCargo.value = true

  }
	if (val.trustType == '集港' || val.trustType == '拆箱集港' || val.trustType == '装船') {
		trustOrderForm.value.impExp = '出口'
	}
	if (val.trustType == '疏港' || val.trustType == '卸船') {
		trustOrderForm.value.impExp = '进口'
	}
	tableColumns.forEach(item => {
		if (item.label == '货名' || item.label == '包装' || item.label == '货主' || item.label == '是否放行') {
			item.disabled = val.isCreateCargo == 2 ? true : false
		}
	})
	shipClear()
	trustOrderForm.value.processCode = ''
	trustOrderForm.value.processName = ''
	isSelectProcess.value = val.isSelectProcess
	// isSelectShip.value = val.isSelectShip
	isEstimateAmount.value = val.isEstimateAmount
	isCreateCargo.value = val.isCreateCargo //是否生成新的票货
	// isDisabled.value = val.isCreateCargo == 2 ? true : false
	isHidden.value = val.isEstimateAmount == 1 ? false : true
	containCargo.value = val.isCreateCargo == 0 ? false : true
  console.log(val.trustType)
	trustGroupType.value = val.trustGroupType
	if (val.trustType == '杂项') {
		let data = {
			type: 'MAIN_WORK_PROCESS',
			planTypeCode: 4,
		}
		// 获取作业过程
		getLocalSelect(data)
	}
	// trustOrderForm.value.startTime = '2024-01-04 16:27:28'
	// trustOrderForm.value.endTime = '2024-01-26 12:00:00'
	if (val.trustGroupType == '2') {
		dateChange()
	} else {
	}
}
getTrustTypeList()
const ruleForm = ref(null)
const processList = ref([]) //作业过程列表

//结算依据 字典值
const SETTLEMENT_BASIS = ref(null)
const editRules = ref({
	cargoCode: [{ required: true, message: '货名必须填写' }],
	packingCode: [{ required: true, message: '包装不能为空' }],
	cargoOwnerId: [{ required: true, message: '货主必须填写' }],
	// cargoAgentId: [{ required: true, message: '货代必须填写' }],
	ton: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 3,
		},
	}),
	quantity: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 0,
		},
	}),
})
const changeIsWeiqiao = val => {
  trustOrderForm.value.preChangeShipName = ''
  trustOrderForm.value.preChangeShipNo = ''
}

const stopLogTableDate = ref()
const stopLogTableColumns = ref([
  { label: '序号', type: 'seq', width: 100,align: 'center' },
  {
    label: '操作人',
    align: 'center',
    prop: 'createByName',
    width: 160,
  },
  {
    label: '操作时间',
    align: 'center',
    prop: 'createTime',
    width: 160,
  },
  {
    label: '信息',
    align: 'center',
    prop: 'remark',
    width: 200,
  },
  {
    label: '启停备注',
    align: 'center',
    prop: 'stopRemark',
    width: 200,
  },
])
const editTable = ref(null)
//作业指令表单数据
const SAN_HUO_MA_TOU_ID = ref('1677242790846795776')
const SAN_HUO_MA_TOU_NAME = ref('潍坊港区散货码头有限公司')
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
	// processes: [],
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
	isWeiqiaoPoundRemark: '0', //是否魏桥
  preChangeShipName:'',//转水前船名
  preChangeShipNo:'',//转水前编号
  trustId:'',//通知单id
  isStopOperationName:'',//操作人
  isStopOperationTime:'',//操作时间
})
// 清空船舶信息,货物信息
const shipClear = () => {
	trustOrderForm.value.shipvoyageItemId = ''
	trustOrderForm.value.shipvoyageId = ''
	trustOrderForm.value.shipName = ''
	trustOrderForm.value.voyage = ''

	trustOrderForm.value.cargoList = [] //货物信息
	trustOrderForm.value.planQuantity = ''
	trustOrderForm.value.planTon = ''
}
//表单验证
const rules = reactive({
	companyId: [{ required: true, message: '作业公司不能为空', trigger: 'blur' }],
	impExp: [{ required: false, message: '进出口不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '通知单类型不能为空', trigger: 'blur' }],
	planTon: [{ required: false, message: '计划量不能为空', trigger: 'blur' }],
	settlementBasisCode: [{ required: true, message: '作业依据不能为空', trigger: 'blur' }],
  preChangeShipName: [{ required: true, message: '转水前船名不能为空', trigger: 'blur' }],
  preChangeShipNo: [{ required: true, message: '转水前编号不能为空', trigger: 'blur' }],

})
//折叠面板
const activeNames = ref(['order', 'ship', 'cargo'])
const isHiddenBusinessNo = computed(() => {
	return ['卸船', '装船'].includes(trustOrderForm.value.type)
})
const tableColumns = reactive([
	{
		prop: 'cargoInfoNo',
		label: '票货号',
    width: 120,
	},
  // {
  //   label: '提运单号',
  //   prop: 'deliveryNumbers',
  //   editType: 'input',
  //   isHidden: isShowOutCargo,
  //   editRender: {},
  //   width: 100,
  // },
  {
    label: '提运单号',
    prop: 'billNo',
    editType: 'input',
    isHidden: isShowOutCargo,
    editRender: {},
    width: 120,
  },
  {
    prop: 'permitThrough',
    label: '是否放行',
    width: 100,
  },
  {
		prop: 'businessNo',
		label: '计划号',
		isHidden: isHiddenBusinessNo,
    width: 110,
	},
	{
		prop: 'cargoCode',
		label: '货名',
    width: 100,
		modelLabel: 'cargoName',
		selectLabel: 'label',
		selectValue: 'value',
		editRender: {},
		editType: 'remoteSelect',
		type: 'CARGO_INFO_SIGN',
		disabled: false,
	},
	{
		prop: 'packingCode',
		label: '包装',
		modelLabel: 'packingName',
    width: 70,
	},
	{
		prop: 'cargoOwnerId',
		label: '货主',
    width: 200,
		modelLabel: 'cargoOwnerName',
		selectLabel: 'label',
		selectValue: 'value',
		editRender: {},
		editType: 'remoteSelect',
		type: 'CUSTOMER_CARGO_OWNER',
		disabled: false,
	},
	{
		prop: 'quantity',
		label: '件数',
    width: 70,
		// width: 120,
		editRender: {},
		editType: 'input',
		disabled: false,
	},
	{
		prop: 'ton',
		label: '重量',
    width: 70,
		editRender: {},
		editType: 'input',
		disabled: false,
	},
	{
		prop: 'hatchArr',
		label: '舱口',
    width: 70,
		modelLabel: 'hatchArr',
		editRender: {},
		multiple: true,
		editType: 'select',
		isHidden: hatchShow,
		disabled: false,
	},
	{
		prop: 'contractName',
		label: '合同',
    width: 230,
		isHidden: isHidden,
		modelValue: 'contractId',
		modelLabel: 'contractName',
		selectLabel: 'contractName',
		selectValue: 'contractId',
		editRender: {},
		editType: 'select',
		disable: true,
		disabled: false,
		change: (e, row) => {
			if (e == undefined) {
				row.contractId = ''
				row.rate = ''
				row.rateLabel = ''
				proxy.setEditTableOptions(tableColumns, { rateLabel: [] })
				row.estAmount = row.rate && e ? (row.rate * 1 * e * 1).toFixed(2) : null
				return
			}
			row.contractId = e.contractId
		},
	},
	{
		prop: 'rateLabel',
		label: '原单价',
		width: 100,
		isHidden: isHidden,
		modelLabel: 'rateLabel',
		modelValue: 'rate',
		editRender: {},
		editType: 'select',
		selectLabel: 'label',
		selectValue: 'contractRateId',
    disabled: false,
		change: async (e, row) => {
			if (e) {
				row.contractRateId = e.contractRateId
				row.rate = e.rate
			}
      row.estAmount = await getEstAmount(row.ton,e.rate,row)
			// row.estAmount = row.ton && e ? (row.ton * (e.rate * 1)).toFixed(2) : null
			comput()
		},
	},
  {
    prop: 'disRate',
    label: '优惠单价',
    width: 100,
    editType: 'input',
    disabled: true,
    isHidden: isHidden,
  },
	{
		prop: 'estAmount',
		label: '预估金额',
		isHidden: isHidden,
    width: 100,
	},

	{
		label: '是否二次过磅',
		prop: 'isSecondWeigh',
    width: 120,
		editType: 'select',
		modelValue: 'isSecondWeigh',
		editRender: {},
		isHidden: weighShow,
		disabled: false,
		selectData: [
			{ label: '否', value: '0' },
			{ label: '是', value: '1' },
		],
	},
	{
		label: '是否过磅',
		prop: 'isSecondWeigh',
    width: 120,
		editType: 'select',
		modelValue: 'isSecondWeigh',
		editRender: {},
		isHidden: isSecondShow,
		disabled: false,
		selectData: [
			{ label: '否', value: '0' },
			{ label: '是', value: '1' },
		],
	},
	{
		label: '是否打印磅单',
		prop: 'printPoundId',
    width: 120,
		editType: 'select',
		modelValue: 'printPoundId',
		editRender: {},
		isHidden: printShow,
		disabled: false,
		selectData: [
			{ label: '否', value: '0' },
			{ label: '是', value: '1' },
		],
		change: (e, row) => {
			if (e.label == '否') {
				row.printPoundNum = ''
				// isPrint.value = true
			} else {
				// isPrint.value = false
				row.printPoundNum = 1
			}
		},
	},
	{
		label: '打印份数',
		prop: 'printPoundNum',
		editType: 'input',
		modelValue: 'printPoundNum',
		editRender: {},
		width: 100,
		isHidden: printShow,
		disabled: false,
		render: row => {
			return [
				h(ElInput, {
					value: row.printPoundNum,
					// workPlanId: row.id,
					disabled: row.printPoundId == 0,
					workPositionCode: '02',
					onChange: data => {
						// row.equmentListBack = data
					},
					// 'onUpdate:value': val => {
					// 	row.equipmentNamesBack = val
					// },
				}),
			]
		},
	},
  {
    prop: 'isStopOperationName',
    label: '操作人',
    width: 100,
  },
  {
    prop: 'isStopOperationTime',
    label: '操作时间',
    width: 160,
  },
	{
		label: '操作',
		width: 260,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							deleteCargoInfo(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						disabled: isDisabled.value,
					},
					{
						default: () => '删除',
					}
				),
        h(
					ElButton,
					{
						onClick: () => {
              exportFeeEvent(row)
						},
						type: 'primary',
						link: true,
						icon: 'Download',
            permission: (row.trustType=='卸船'||row.trustType=='集港') ? "bus:trust:trustDownFee":"null:will:showNone",
					},
					{
						default: () => '查看费用明细',
					}
				),
        h(
          ElButton,
          {
            onClick: () => {
              isStopStatus(row)
            },
            type: row.isStop == '10' ? 'danger' : 'primary',
            link: true,
            icon: row.isStop == '10' ? 'video-pause' : 'video-play',
            permission: (isStop.value==true) ? "business:trustOrder:stop":" ",
          },
          {
            default: () => (row.isStop == '10' ? '停用' : '开启'),
          }
        ),
        h(
          ElButton,
          {
            onClick: () => {
              dialogVisible.value = true
              console.log(row)
              api.getStopLogList(row.id).then(res=>{
                stopLogTableDate.value = res.data.pages
                stopLogTableTotal.value = res.data.totalNum
              })

            },
            type: 'primary',
            icon: 'Document',
            link: true,
            permission: (isStop.value==true) ? "business:trustOrder:stopLog":" "
          },
          {
            default: () => "启停日志",
          }
        ),
			]
		},
	},
])
// //是否优惠，0否1是
// const isPreferential = ref(0);
// //是否阶梯费率，0否1是
// const isTieredRate = ref(0);
// //阶梯累计量
// const stepAccumulation = ref(0);
// //阶梯优惠费率
// const tieredRate = ref([])
// //非阶梯优惠费率
// const preferentialRate = ref(0)
const getPreferentialRate= async (contractName,row)=>{
  row.isPreferential = null;
  row.isTieredRate = null;
  row.stepAccumulation = null;
  row.tieredRate = null;
  row.preferentialRate = null;
  await api.getPreferentialRate({contractId:row.contractId,contractName:contractName,cargoCode:row.cargoCode}).then(res=>{
    let data = res.data;
    if(data){
      // isTieredRate.value = data.isTieredRate;
      // isPreferential.value = data.isPreferential;
      // stepAccumulation.value = data.stepAccumulation.number;
      // tieredRate.value = data.tieredRate;
      // preferentialRate.value = data.preferentialRate;
      row.isTieredRate = data.isTieredRate;
      row.isPreferential = data.isPreferential;
      row.stepAccumulation = data.stepAccumulation?data.stepAccumulation.number:0;
      row.tieredRate = data.tieredRate;
      row.preferentialRate = data.preferentialRate?data.preferentialRate.preferentialRate:0;
      return row;
    }
  })
}
// 可编辑列表下拉框聚焦事件 回调
const contractRateId = ref(null);//记录当前合同id

const showStopLog = (row)=>{

}
const handleClose = ()=>{
  dialogVisible.value = false
}

const tableFocus = (row, val, title) => {
  if (title == '合同') {
		// 查询对应场地下的垛位
		let data = {
			cargoOwnerId: row.cargoOwnerId,
			cargoCode: row.cargoCode,
			tradeType: trustOrderForm.value.tradeType,
		}
		if (!data.cargoOwnerId || !data.cargoCode || !data.tradeType) {
			proxy.$message.info('请先选择贸别、货名、货主')
			return
		}
		api.getListContract(data).then(res => {
     // let data;
      if(res.data && res.data.length>0){
        let data  = res.data[0]
        getPreferentialRate(data.contractName,row);
      }
			proxy.setEditTableOptions(tableColumns, { contractName: res.data })
		})
	}
	if (title == '原单价') {
    proxy.setEditTableOptions(tableColumns, { rateLabel: [] })
    if (!row.contractId || !row.contractName) {
			proxy.$message.info('请先选择合同')
			return
		}
		// 查询对应场地下的垛位
		let data = {
			cargoOwnerId: row.cargoOwnerId,
			cargoCode: row.cargoCode,
			tradeType: trustOrderForm.value.tradeType,
		}

		api.getListContract(data).then(res => {
			let data = []
			res.data.forEach(item => {
				if (item.contractId == row.contractId) {
					data = item.contractRates
				}
			})
			proxy.setEditTableOptions(tableColumns, { rateLabel: data })
		})
	}
}
const editTableChange = (e, row, title) => {
	if (title == '货名' && e) {
		let arr = trustOrderForm.value.cargoList
			.filter(item => {
				if (item.workType && item.workType !== '') {
					return item
				}
			})
			.map(it => it.workType)
		if (arr.length > 0 && !arr.includes(e.workType)) {
			row.cargoCode = ''
			row.cargoName = ''
			row.workType = ''
			proxy.$message.warning('只能选择相同票货！')
			return
		}
		row.workType = e.workType
		row.packingCode = e.workType == '1' ? '02' : '01'
		row.packingName = e.workType == '1' ? '件' : '散'
	}
}

/**
 * 根据单价、重量、阶梯累计量、优惠费率计算预估金额
 * @param ton
 * @param price
 */
const getEstAmount = async (ton,price,row)=>{
  if(row.isPreferential == null && row.isTieredRate == null){
    await getPreferentialRate(row.contractName,row);
  }
  let isPreferential = row.isPreferential;
  let isTieredRate = row.isTieredRate;
  let stepAccumulation = Number(row.stepAccumulation);
  let tieredRate = row.tieredRate;
  let preferentialRate = row.preferentialRate;
  let number = 0;
  if(isPreferential==1){//存在优惠
    if(isTieredRate==1 && tieredRate){//阶梯费率
      number = Number(ton) + Number(stepAccumulation);
      let stepAmount = 0;
      let sumAmount = 0;
      for(let index in tieredRate){
        let item = tieredRate[index]
        let beginTon = Number(item.beginTon*10000)
        let endTon = Number(item.endTon*10000)
        if(Number(stepAccumulation)!=0){
          if(Number(stepAccumulation) > endTon && index < (tieredRate.length-1)){
            stepAmount = Number(stepAmount) + Number((endTon-beginTon)*(price-item.rate))
            row.disRate = price-item.rate
          } else if(Number(stepAccumulation)>= beginTon && Number(stepAccumulation)<=endTon || (Number(stepAccumulation)>=endTon && index == (tieredRate.length-1))){//
            stepAmount = Number(stepAmount) + Number((stepAccumulation-beginTon)*(price-item.rate))
            row.disRate = price-item.rate
          }
        }
        if(Number(number)!=0){
          if(Number(number) > endTon && index < (tieredRate.length-1)){
            sumAmount = Number(sumAmount) + Number((endTon-beginTon)*(price-item.rate))
            row.disRate = price-item.rate
          } else if(Number(number)>=beginTon && Number(number)<=endTon || (Number(number)>=endTon && index == (tieredRate.length-1))){//
            sumAmount = Number(sumAmount) + Number((number-beginTon)*(price-item.rate))
            row.disRate = price-item.rate
          }
        }
      }
      return Number(sumAmount-stepAmount);
    }else if(isTieredRate==0 && preferentialRate){//非阶梯费率
      row.disRate = price-preferentialRate
      return ((price-preferentialRate) * 1 * ton * 1).toFixed(2)
    }else{
      row.disRate = price
      return (price * 1 * ton * 1).toFixed(2)
    }
  }else{
    row.disRate = price
    return (price * 1 * ton * 1).toFixed(2)
  }
}



// 可编辑列表输入框触发事件
const editInputChange = async (e, row, title) => {
	if (title == '重量') {
	  // row.estAmount = row.rate && e ? (row.rate * 1 * e * 1).toFixed(2) : null
    if(row.rate && e){
      row.contractRateId = e.contractRateId
      row.estAmount = await getEstAmount(e,row.rate,row);
    }
	}
  if(title=='提运单号'){
    console.log(row.deliveryNumbers);
    let regex = /，/
    if(regex.test(row.deliveryNumbers)){
        proxy.$message.error("不允许输入中文逗号");

        row.deliveryNumbers = row.deliveryNumbers.slice(0,row.deliveryNumbers.indexOf('，'))
    }
  }
	comput()
}
const fileTypeName2 = ref('.jpeg, .doc, .docx, .pdf, .jpg, .xlsx, .xls')
const changeFile = file => {
	trustOrderForm.value.fileIds = file
}
// 获取作业过程列表数据
const getLocalSelect = data => {
  console.log("获取作业过程开始")
	publicApi.getLocalSelect(data).then(res => {
		processList.value = res.data.filter(v1 => !['记账', '调账'].includes(v1.label))
    console.log("获取作业过程结束 返回值:",res)
	})
}
// 默认时间
const dateChange = () => {
	// 创建一个新的Date对象
	var currentDateTime = new Date()
	// 获取年份、月份、日期、小时和分钟
	var year = currentDateTime.getFullYear().toString() // 转换为字符串类型
	var month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0') // 月份从0开始计数，所以需要加1；同时考虑到月份只有两位数，如果不足则添加前导零
	var day = currentDateTime.getDate().toString().padStart(2, '0') // 同样处理天数只有两位数的情况
	var hours = currentDateTime.getHours().toString().padStart(2, '0') // 同样处理小时只有两位数的情况
	var minutes = currentDateTime.getMinutes().toString().padStart(2, '0') // 同样处理分钟只有两位数的情况
	var formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`
	// 创建一个新的日期对象
	var date = new Date()
	// 设置月份为12（表示下一年）并将日期设置为0（表示上一个月的最后一天）
	date.setMonth(12)
	date.setDate(0)

	// 格式化输出结果
	var yearLastDay = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
		2,
		'0'
	)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

	trustOrderForm.value.startTime = formattedDateTime
	// trustOrderForm.value.endTime = yearLastDay
	trustOrderForm.value.endTime = new Date(new Date().getTime() + 60_000 * 60 * 8 + 86_400_000 * 30)
		.toISOString()
		.slice(0, 16)
		.replace('T', ' ')
}

//船舶航次change事件
const changeShipVoyage = params => {
  if(params==undefined || params ==null){
    return
  }
  if (type.value == 1) {
		trustOrderForm.value.impExp = params.impExpLabel?params.impExpLabel:''//进出口
		trustOrderForm.value.tradeType = params.tradeType?params.tradeType:'' //内外贸
		trustOrderForm.value.type = params.impExpLabel == '进口' ? '卸船' : '装船' //内外贸
		isCreateCargo.value = trustOrderForm.value.type == '卸船' ? 2 : 2   //新流程变更卸船不再生成票货
		isHidden.value = trustOrderForm.value.type == '卸船' ? false : true
	}
  if(trustOrderForm.value.type == '卸船'){
    tableColumns.forEach(item => {
      if (item.label == '货名' || item.label == '包装' || item.label == '货主') {
        item.disabled = true
      }
    })
  }
  if(trustOrderForm.value.type=='装船'){
    isShowOutCargo.value= false
  }else{
    isShowOutCargo.value = true
  }

	hatchList.value = params.hatchArr.map(item => {
		return { label: String(item), value: String(item) }
	})
	proxy.setEditTableOptions(tableColumns, { hatchArr: hatchList.value })
	trustOrderForm.value.shipvoyageId = params.shipvoyageId
	trustOrderForm.value.shipName = params.shipName
	trustOrderForm.value.voyage = params.voyage
}

//新增一行货物信息
const addCargoInfo = () => {
	if (trustOrderForm.value.cargoList === undefined || trustOrderForm.value.cargoList === null) {
		trustOrderForm.value.cargoList = new Array()
	}
  let tmpCargoList = []
  tmpCargoList =JSON.parse(JSON.stringify(trustOrderForm.value.cargoList))

	trustOrderForm.value.cargoList.push({
		cargoCode: '',
		cargoName: '',
		packingCode: '',
		packingName: '',
		cargoOwnerId: '',
		cargoOwnerName: '',
		// cargoAgentId: '',
		// cargoAgentName: '',
		quantity: '',
		ton: '',
		workType: '',
		contractId: '', //合同
		contractName: '',
		rate: '', //费率
		rateLabel: '',
		disRate: '',
		estAmount: '', //预交金额
		isSecondWeigh: '0', //是否二次过磅
		printPoundId: '0', //是否打印磅单
		printPoundNum: '', //打印份数
	})

  //校验一个通知单一个散货
  let jianSanFlag = false
  trustOrderForm.value.cargoList.forEach(item=>{
      if(item.packingName=='散'){
        jianSanFlag = true
      }
  })

  if(jianSanFlag && trustOrderForm.value.cargoList.length>1){
    trustOrderForm.value.cargoList = []
    trustOrderForm.value.cargoList = tmpCargoList
    proxy.$message.error("通知单中只允许存在一个散货票货");
    return;
  }
	// isPrint.value = true
}
// 计划件数，计划量汇总
const comput = () => {
	let cargoList = trustOrderForm.value.cargoList
	// 计算件数
	trustOrderForm.value.planQuantity =
		cargoList.length > 0 ? cargoList.reduce((sum, item) => sum + item.quantity * 1, 0) : trustOrderForm.value.planQuantity

	// 货物列表计算重量
	trustOrderForm.value.planTon =
		cargoList.length > 0 && containCargo.value ? cargoList.reduce((sum, item) => sum + item.ton * 1, 0) : trustOrderForm.value.planTon
	// 预估金额汇总
	trustOrderForm.value.estAmount =
		cargoList.length > 0 && containCargo.value
			? cargoList.reduce((sum, item) => sum + (item.estAmount ? item.estAmount : 0) * 1, 0).toFixed(2)
			: trustOrderForm.value.estAmount
}

// 货物列表删除按钮回调
const deleteCargoInfo = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			trustOrderForm.value.cargoList.splice(row.index, 1)
			comput()
		})
		.catch(err => {})
}

const initData = () => {
	// 获取字典数据 合同类型：CONTRACT_TYPE 结算依据：SETTLEMENT_BASIS   预缴依据：DEPOSIT_BASIS  付费方式：PAY_TYPE,账期类型：PAYMENT_TYPE 计量单位：UNIT
	publicApi.getDictList({ types: 'SETTLEMENT_BASIS,PACKAGE_TYPE' }).then(res => {
		SETTLEMENT_BASIS.value = res.data.SETTLEMENT_BASIS
		// 给编辑table下拉框设置数据源
		proxy.setEditTableOptions(tableColumns, { packingCode: res.data.PACKAGE_TYPE })
	})
}

// 编辑表单是 作业过程判断源
const isSource = status => {
  console.log('getListTrustType 开始')
	api.getListTrustType().then(res => {
    console.log('getListTrustType 返回值',res)
		res.data.forEach(item => {
			if (item.trustType == trustOrderForm.value.type) {
				isSelectProcess.value = item.isSelectProcess
				// isSelectShip.value = item.isSelectShip
				isEstimateAmount.value = item.isEstimateAmount
				isCreateCargo.value = item.isCreateCargo
				isHidden.value = item.isEstimateAmount == 1 ? false : true
				containCargo.value = item.isCreateCargo == 0 ? false : true
				if (status !== '30' && status !== '40') {
					tableColumns.forEach(item => {
						if (item.label == '货名' || item.label == '包装' || item.label == '货主') {
							item.disabled = isCreateCargo.value == 2 ? true : false
						}
					})
				}
			}
		})
	})
	// comput()
}
// 作业过程选中回调
const changeProcess = process => {
	// if (!trustOrderForm.value.id) {
	// 	trustOrderForm.value.processes = [{ processName: process.label, processCode: process.value }]
	// }
}
// 重置表单
const resetForm = () => {
	ruleForm.value.resetFields()
  trustOrderForm.value.companyId = SAN_HUO_MA_TOU_ID.value
  trustOrderForm.value.companyName = SAN_HUO_MA_TOU_NAME.value
	trustOrderForm.value.cargoList = [] //货物信息
	trustOrderForm.value.id = ''
	proxy.$bus.emit('resetFileList') //清空文件上传
	isSelectProcess.value = '0' //是否选作业过程
	trustOrderForm.value.processCode = ''
	trustOrderForm.value.processName = ''
}
// 清空校验
const validate = async () => {
	let flag = false
	let flag1 = true
	let flag2 = true
	if (containCargo.value) {
		// 可编辑表格验证
		flag1 = await editTable.value.validAllEvent()
		// 货物信息列表不能为空
		flag2 = type.value == 4 ? true : trustOrderForm.value.cargoList.length == 0 ? false : true
	}
	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag1 && flag2) {
			flag = true
		} else if (!valid) {
			flag = false
			proxy.$message.warning('请完善表单信息！')
		} else if (!flag2) {
			proxy.$message.warning('货物信息不能为空！')
			flag = false
		} else {
			flag = false
		}
	})

	return flag
}

//选择票货信息
const ticketShow = ref(false)
const tickTableRef = ref()
const Data = ref([null])
// 添加票货按钮 点击回调
const chooseTicketInfo = () => {
	if (trustOrderForm.value.companyId) {
    //卸船计划强制先选船名航次
    if((type.value == '1' && trustOrderForm.value.type == '卸船')|| (type.value == null|| type.value=='')){
      if(trustOrderForm.value.shipvoyageItemId==null || trustOrderForm.value.shipvoyageItemId== ''){
        proxy.$message.error("请先选择船名航次")
        return
      }
    }
    ticketShow.value = true
		nextTick(() => {
      tickTableRef.value.queryParams.isLuxiao = trustOrderForm.value.type == '陆销' ? 1 : ''
			tickTableRef.value.queryParams.isShugang = trustOrderForm.value.type == '疏港' ? 1 : ''
			tickTableRef.value.queryParams.companyId = trustOrderForm.value.companyId
			tickTableRef.value.queryParams.tradeType = trustOrderForm.value.tradeType
			tickTableRef.value.queryParams.trustType = trustOrderForm.value.type == '卸船' ? '10':''
      tickTableRef.value.queryParams.shipvoyageItemId  = trustOrderForm.value.type == '卸船'?trustOrderForm.value.shipvoyageItemId:''
      //卸船通知单的时候回显新抽屉设置搜索框的船名航次信息
      if (trustOrderForm.value.type == '卸船') {
        let initDate = {
          shipvoyageItemId  : trustOrderForm.value.shipvoyageItemId
        }
        tickTableRef.value.init(initDate)
        tickTableRef.value.shipDisabled= true
      }else{
        let initDate = {
          shipvoyageItemId  : null
        }
        tickTableRef.value.init(initDate)

        tickTableRef.value.shipDisabled= false
      }
			tickTableRef.value.getList(tickTableRef.value.queryParams)
			Data.value = tickTableRef.value.tableData
		})
	} else {
		proxy.$message.warning('请选择作业公司！')
		return
	}
}

//选择票货信息
const orderShow = ref(false)
const orderTableRef = ref()
const orderData = ref([null])
// 添加票货按钮 点击回调
const chooseOrderInfo = () => {
  if (trustOrderForm.value.companyId) {
    //卸船计划强制先选船名航次
    if(trustOrderForm.value.type == '装船'){
      if(trustOrderForm.value.shipvoyageItemId==null || trustOrderForm.value.shipvoyageItemId== ''){
        proxy.$message.error("请先选择船名航次")
        return
      }
    }
    orderShow.value = true
    nextTick(() => {
      orderTableRef.value.queryParams.shipvoyageItemId  = trustOrderForm.value.type == '装船'?trustOrderForm.value.shipvoyageItemId:''
      //卸船通知单的时候回显新抽屉设置搜索框的船名航次信息
      if (trustOrderForm.value.type == '装船') {
        let initDate = { shipvoyageItemId  : trustOrderForm.value.shipvoyageItemId }
        orderTableRef.value.init(initDate)
        orderTableRef.value.shipDisabled= true
      }else{
        let initDate = { shipvoyageItemId  : null }
        orderTableRef.value.init(initDate)
        orderTableRef.value.shipDisabled= false
      }
      orderTableRef.value.getList(orderTableRef.value.queryParams)
      Data.value = orderTableRef.value.tableData
    })
  } else {
    proxy.$message.warning('请选择作业公司！')
    return
  }
}


//导出费用明细
const exportFeeEvent = row =>{
  if(row.id==null||row.id==''){
    return;
  }
  proxy.$modal
    .confirm('确认导出？')
    .then(() => {
      api.exportFeeEvent(row.id).then(res=>{
        downLoadBlob(res, '付款声明')
      })
    })
}
const stopFormData = ref({})
const stopHandleThen = async ()=>{
  if(await stopFormRef.value.validate()){
    api.isStopStatus({ id:stopFormData.value.id,
      isStop:stopFormData.value.isStop ,
      cargoInfoId:stopFormData.value.cargoInfoId ,
      stopRemark:stopFormData.value.stopRemark
    }).then(res => {
      api.getTrustCargoById(trustOrderForm.value.trustId).then(res => {
        trustOrderForm.value = {
          ...res.data,
          shipInfo: {
            cargoCategoryName: res.data.shipInfo ? res.data.shipInfo.cargoCategoryName : '',
            shipAgentName: res.data.shipInfo ? res.data.shipInfo.shipAgentName : '',
            arrivalTimePlan: res.data.shipInfo ? res.data.shipInfo.arrivalTimePlan : '',
            startPortName: res.data.shipInfo ? res.data.shipInfo.startPortName : '',
            endPortName: res.data.shipInfo ? res.data.shipInfo.endPortName : '',
          },
          trustId:trustOrderForm.value.trustId
        }
        proxy.$modal.msgSuccess((stopFormData.value.isStop == '10' ?'开启' :'停用')+ '成功')
      })

      stopFormData.value = {}
      stopHandleVisible.value =false
    })
  }

}

const isStopStatus = row =>{
  if(row.id==null||row.id==''){
    return;
  }
  stopFormData.value = {}

  let text = row.isStop == '10' ? '停用' : '开启'
  stopTitle.value = '确定' + text + '吗?'
  stopHandleVisible.value = true
  stopFormData.value.id=row.id
  stopFormData.value.isStop =row.isStop=='10'? '20':'10'

  stopFormData.value.cargoInfoId = row.cargoInfoId

  // proxy.$modal.confirm('确定"' + text + '"吗?').then(() => {
  //   api.isStopStatus({ id:row.id, isStop:row.isStop == '10' ? '20' : '10' ,cargoInfoId:row.cargoInfoId }).then(res => {
  //     api.getTrustCargoById(trustOrderForm.value.trustId).then(res => {
  //       trustOrderForm.value = {
  //         ...res.data,
  //         shipInfo: {
  //           cargoCategoryName: res.data.shipInfo ? res.data.shipInfo.cargoCategoryName : '',
  //           shipAgentName: res.data.shipInfo ? res.data.shipInfo.shipAgentName : '',
  //           arrivalTimePlan: res.data.shipInfo ? res.data.shipInfo.arrivalTimePlan : '',
  //           startPortName: res.data.shipInfo ? res.data.shipInfo.startPortName : '',
  //           endPortName: res.data.shipInfo ? res.data.shipInfo.endPortName : '',
  //         },
  //         trustId:trustOrderForm.value.trustId
  //       }
  //       proxy.$modal.msgSuccess(text + '成功')
  //     })
  //   })
  // })


}
//下载excel事件
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

// 保存选中的票货
const saveTicket = () => {
	// 判断是否选择票货
	if (tickTableRef.value.checkData.length < 1) {
		proxy.$message.warning('请选择票货！')
		return
	}
	const isWorkTypes = tickTableRef.value.checkData.map(item => item.workType)

	if (isWorkTypes.includes('2') && isWorkTypes.includes('1')) {
		proxy.$message.warning('不能同时选中件货和散货！')
		return
	}
  let tmpFlag =false
  tickTableRef.value.checkData.forEach(item=>{
    // if(trustOrderForm.value.type=='装船'||trustOrderForm.value.type=='疏港'||trustOrderForm.value.type=='陆销'){
    //   if(item.isRelease !='1' && item.isPrePay !='30'){
    //     proxy.$message.warning(item.cargoInfoNo+'货物未预缴！')
    //     tmpFlag= true
    //     return;
    //   }
    // }
  })
  if(tmpFlag){
    return;
  }
	// 处理选中数据
  let tmpList = [];
  tmpList = JSON.parse(JSON.stringify(trustOrderForm.value.cargoList))
  console.log(tmpList);
  // for (let valueKey in trustOrderForm.value.cargoList) {
  //   tmpList.push(trustOrderForm.value.cargoList[valueKey])
  // }
  console.log(tmpList)
	trustOrderForm.value.cargoList.push(
		...tickTableRef.value.checkData.filter(v1 => !trustOrderForm.value.cargoList.some(v2 => v1.cargoInfoId === v2.cargoInfoId))
	)
	trustOrderForm.value.cargoList = trustOrderForm.value.cargoList.map(item => {
		item.isSecondWeigh = '0'
		item.printPoundId = '0'
		item.printPoundNum = ''
    item.hatchArr = item.hatchNums?item.hatchNums.split(','):[]
		return item
	})
  //校验  一个通知单只能存在一个散货 件散分离
  let jianSanFlag = false
  trustOrderForm.value.cargoList.forEach(item=>{
    if(item.packingName == '散'){
      jianSanFlag =true
    }
  })

  if(jianSanFlag===true && trustOrderForm.value.cargoList.length>1 ){
    //还原票货数据
    trustOrderForm.value.cargoList = []
    trustOrderForm.value.cargoList = tmpList
    proxy.$message.error("一个通知单只允许选择一个散货票货");

    return;
  }
	// isPrint.value = true
	ticketShow.value = false
	comput()
}

const saveOrder = () => {
	// 判断是否选择票货
	if (orderTableRef.value.checkData.length < 1) {
		proxy.$message.warning('请选择票货！')
		return
	}
	// 处理选中数据
  let tmpList = [];
  tmpList = JSON.parse(JSON.stringify(trustOrderForm.value.cargoList))
  trustOrderForm.value.cargoList.push(
    ...orderTableRef.value.checkData.filter(v1 => !trustOrderForm.value.cargoList.some(v2 => v1.cargoInfoId === v2.cargoInfoId))
  )
  let jianSanFlag = false
  let count = 0;
  trustOrderForm.value.cargoList.forEach(item=>{
    if(item.packingName == '散'){
      jianSanFlag =true
    }
    item.isSecondWeigh = '0'
    item.printPoundId = '0'
    item.printPoundNum = ''
    item.hatchArr = item.hatchNums?item.hatchNums.split(','):[]
  })
  //如果散货控制需多个
  if(jianSanFlag && trustOrderForm.value.cargoList.length > 1){
    trustOrderForm.value.cargoList = []
    trustOrderForm.value.cargoList = tmpList
  }
  isSecondShow.value = true
  orderShow.value = false
	comput()
}
// 编辑时货物信息是否禁用
const postStatus = ref(30)
const init = (val, e) => {
  console.log("初始化val:",val,"    +e:",e)
  postStatus.value = val
	if (e) {
		tableColumns.forEach(item => {
			item.disabled = false
			if (item.label == '货名' || item.label == '包装' || item.label == '货主' || item.label == '舱口' || item.label == '合同' || item.label == '单价') {
				item.disabled = val == '30' || val == '40' ? true : false
			}
			// if (item.label == '是否打印磅单' || item.label == '打印份数') {
			// 	item.disabled = val == '40' ? true : false
			// }
		})
		if (val == '50') {
			tableColumns.forEach(item => {
				item.disabled = true
			})
		}
	} else {
		tableColumns.forEach(item => {
			item.disabled = false
		})
	}
}
// 获取交接清单
const shipvoyageItemFileList = ref()
const getShipvoyageItemFile = id => {
  console.log("获取船舶数据")
	api.getShipvoyageItemFile(id).then(res => {
		shipvoyageItemFileList.value = res.data
	})
}
const rowStyle = e => {
  if (e.row.isStop == '20' ||e.row.tonFlag == '1') {
    return 'color:red'
  }
  return null
}


const aaa = val =>{
  tableColumns.forEach(item => {
    if (item.label == '货名' || item.label == '包装' || item.label == '货主' || item.label == '是否放行') {
      item.disabled =  true
    }
  })
}
//初始化下拉列表数据
initData()

defineExpose({
	validate,
	resetForm,
	isSource,
	getLocalSelect,
	trustOrderForm,
	Data,
	disabled,
	typeDisabled,
	type,
	getTrustTypeList,
	tableColumns,
	dateChange,
	hatchShow,
	weighShow,
	printShow,
	isSecondShow,
	init,
	getShipvoyageItemFile,
	isShipVoyage,
	isDisabled,
  JSGWeiQiao,
  isStop,
  isShowOutCargo,
  aaa
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.el-form-item {
	position: relative;
}
.el-checkbox {
	position: absolute;
	top: -39px;
	left: 70px;
}
</style>
