<template>
	<el-form :model="form" ref="ruleForm" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="基本信息" name="baseData">
				<!-- 合同数据 -->
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item label="合同类型" prop="contractType">
							<Select :selectData="CONTRACT_TYPE" v-model:value="form.contractType" @change="contractTypeChange" />
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="作业公司" prop="companyIdList">
							<Select
								:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
								v-model:value="form.companyIdList"
								v-model:label="form.companyNameList"
								:multiple="true"
								@change="changeCompany"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="客户" prop="customerId">
							<RemoteSelect type="CUSTOMER_ALL" v-model:value="form.customerId" v-model:label="form.customerName" />
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="合同编号" prop="contactNo">
							<el-input v-model="form.contactNo" placeholder="合同编号" @change="contactNoChange" />
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="录入日期" prop="signTime">
							<el-date-picker
								v-model="form.signTime"
								value-format="YYYY-MM-DD"
								format="YYYY-MM-DD"
								type="date"
								placeholder="签订日期"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="4">
						<el-form-item label="有效期(起)" prop="startTime">
							<el-date-picker
								format="YYYY-MM-DD"
								v-model="form.startTime"
								type="date"
								placeholder="开始时间"
								value-format="YYYY-MM-DD"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="4">
						<el-form-item
							label="有效期(止)"
							prop="endTime"
							:rules="[
								{
									required: form.contractType !== '1' ? true : false,
									message: '不能为空',
								},
							]"
						>
							<el-date-picker
								format="YYYY-MM-DD"
								v-model="form.endTime"
								type="date"
								placeholder="结束时间"
								value-format="YYYY-MM-DD"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8" v-if="'1' == form.contractType">
						<el-form-item label="是否作业船" prop="isShip">
							<el-radio-group v-model="form.isShip">
								<el-radio label="Y">是</el-radio>
								<el-radio label="N">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="8" v-if="'Y' == form.isShip">
						<el-form-item label="船舶航次" prop="shipvoyageId">
							<RemoteSelect type="SCN" v-model:value="form.shipvoyageId" />
						</el-form-item>
					</el-col>

					<el-col :span="8">
						<el-form-item label="结算依据(内贸进口)" prop="settlementBasisCode">
							<Select
								:selectData="SETTLEMENT_BASIS"
								v-model:value="form.settlementBasisCode"
								v-model:label="form.settlementBasisName"
							/>
						</el-form-item>
					</el-col>
          <el-col :span="8">
						<el-form-item label="结算依据(内贸出口)" prop="expSettlementBasisCode">
							<Select
								:selectData="SETTLEMENT_BASIS"
								v-model:value="form.expSettlementBasisCode"
								v-model:label="form.expSettlementBasisName"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="结算依据(外贸)" prop="outerSettlementBasisCode">
							<Select
								:selectData="SETTLEMENT_BASIS"
								v-model:value="form.outerSettlementBasisCode"
								v-model:label="form.outerSettlementBasisName"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="结算依据(陆销)" prop="luxiaoSettlementBasisCode">
							<Select
								:selectData="SETTLEMENT_BASIS"
								v-model:value="form.luxiaoSettlementBasisCode"
								v-model:label="form.luxiaoSettlementBasisName"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="付款方式" prop="payType">
							<Select :selectData="PAY_TYPE" v-model:value="form.payType" @change="payTypeChange" />
						</el-form-item>
					</el-col>
					<el-col :span="8" v-if="'10' == form.payType">
						<el-form-item label="预缴依据" prop="depositBasisCode">
							<Select
								:selectData="DEPOSIT_BASIS"
								v-model:value="form.depositBasisCode"
								v-model:label="form.depositBasisName"
                multiple
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8" v-if="'10' == form.payType">
						<el-form-item label="预缴比例" prop="depositRatio">
							<el-input v-model="form.depositRatio" placeholder="预缴比例" style="width: 100%">
								<template #append>%</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="免堆存天数" prop="freeStorageDays">
							<el-input-number
								v-model="form.freeStorageDays"
								controls-position="right"
								:min="0"
								placeholder="免堆存天数"
								style="width: 100%"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="货物" prop="cargoCodes">
							<RemoteSelect
								ref="cargoSelect"
								v-model:value="form.cargoCodes"
								v-model:label="form.cargoNames"
								placeholder="请选择货物名称"
								type="CARGO_INFO_SIGN"
								:multiple="true"
								:reserveKeyword="true"
								:selectFilter="true"
								:number="30"
								:collapseTags="false"
								@change="changeCargo"
								:disabled="formDisabled"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="合同描述" prop="remark">
							<el-input v-model="form.remark" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" placeholder="合同描述" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
          <el-col :span="8">
            <el-form-item label="合同附件">
              <Upload businessType="BUSINESS_CONTRACT_02" :businessId="form.id" @changeFile="changeFile02" />
            </el-form-item>
          </el-col>
				</el-row>
			</el-collapse-item>

			<!-- 费率标准数据-->
			<el-collapse-item title="货物费率" name="cargoRate">
				<template #title>
					<div style="width: 100%; display: flex; justify-content: space-between">
						<span>货物费率</span>
						<div style="display: flex">
              <el-button type="primary" @click.stop="getCreate" :disabled="formDisabled" style="margin: 8px 10px 0px 0px">
                生成
              </el-button>
              <el-button type="primary" @click.stop="setAllTrate" :disabled="formDisabled || !cargoRateGbCargoList.length" style="margin: 8px 10px 0px 0px">
                全选阶梯费率
              </el-button>
            </div>
					</div>
				</template>
				<EditTable
					ref="cargoRateInfoForm"
					class="tab_table"
					:tableColumns="cargoRateInfoColumns"
					:tableData="cargoRateGbCargoList"
					:cellClickEvent="rateCargoCellClickEvent"
					:tableHeight="200"
					:total="total"
				/>
			</el-collapse-item>

			<!-- 阶梯费率数据-->
			<el-collapse-item title="阶梯费率" name="rateLadder" v-if="isRateShow">
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item label="选择货物" prop="cargoCodeList">
							<Select
								ref="cargoSelect"
								v-model:value="trates.trateCargoCodes"
								v-model:label="trates.trateCargoNames"
								placeholder="请选择货物名称"
								:selectData="trateCargoList"
								:multiple="true"
								:number="30"
								@change="changeSelectCargo"
								disabled
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="内外贸" prop="trates.tradeType">
							<el-radio-group v-model="trates.tradeType" disabled>
								<el-radio label="内贸">内贸</el-radio>
								<el-radio label="外贸">外贸</el-radio>
								<el-radio label="内/外贸">内/外贸</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="进出口" prop="trates.impExp">
							<el-radio-group v-model="trates.impExp" disabled>
								<el-radio label="进口">进口</el-radio>
								<el-radio label="出口">出口</el-radio>
								<el-radio label="进/出口">进/出口</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="是否阶梯价格" prop="trates.isTieredRate">
							<el-radio-group v-model="trates.isTieredRate" disabled>
								<el-radio label="1">是</el-radio>
								<el-radio label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="原始累积量" prop="trates.originAccNumber">
							<el-input v-model="trates.originAccNumber" placeholder="原始累积量" disabled></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8" v-if="formData.trates.isTieredRate == 0">
						<el-form-item label="优惠费率" prop="trates.preferentialRate">
							<el-input v-model="trates.preferentialRate" placeholder="优惠金额" disabled>
								<template #append>元/吨</template>
							</el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-col :span="24">
					<!-- // 阶梯费率明细列表 -->
					<EditTable
						v-if="formData.trates.isTieredRate == '1'"
						:name="'阶梯费率'"
						ref="rateLadderInfoForm"
						:tableData="trateDetailList"
						:tableColumns="rateLadderInfoColumns"
						:tableHeight="200"
						:editRules="editRulesRateLadder"
						:headerCellClickEvent="rateLadderHeaderCellClickEvent"
						:headerCellClassName="headerCellClassName"
						:rowConfig="rowConfig"
					/>
				</el-col>
			</el-collapse-item>
			<el-collapse-item title="服务费率" name="serveRate">
				<EditTable
					:name="'服务费率'"
					ref="rateInfoForm"
					:tableData="rateList"
					:tableColumns="rateInfoColumns"
					:tableHeight="500"
					:cellClickEvent="rateClickEvent"
					:headerCellClickEvent="rateHeaderCellClickEvent"
					:headerCellClassName="headerCellClassName"
					:editRules="editRulesRate"
					:rowConfig="rowConfig"
					:disabledKey="'rowDisabled'"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
	<!-- 费率明细抽屉 -->
	<el-drawer v-model="rateVisible" title="费率标准" size="78%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="rateVisible = false">取消</el-button>
				<el-button type="primary" @click="save" :disabled="formDisabled">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>
<script setup name="ContractDetail">
/**--------------引用------------ */
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import Upload from '@/components/upload'
import EditTable from '@/components/EditTable'
import { ElButton } from 'element-plus'
import publicApi from '@/api/public/index'
import api from '@/api/business/contract/index'
import detail from './drawer/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
/**--------------常量定义------------ */
const ContractStatusEnum = {
	sign: '10',
	takeEffect: '20',
}
const isRateShow = ref(false) //阶梯费率列表是否显示
const activeNames = ['baseData', 'cargoRate', 'serveRate', 'rateLadder']
const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }
/**--------------变量定义------------ */
const rateVisible = ref(false) // 是否显示费率详情
const detailRef = ref(null) // 明细组件ref
const ruleForm = ref()
const rateInfoForm = ref() //服务费率
const cargoRateInfoForm = ref() //货物费率
const rateLadderInfoForm = ref() //可编辑阶梯费率
const rowIndex = ref(null)
const formDisabled = ref(false) //是否可修改

// 下拉框数据源
const CONTRACT_TYPE = ref([]) // 合同类型
const SETTLEMENT_BASIS = ref([]) // 结算依据
const DEPOSIT_BASIS = ref([]) // 预缴依据
const PAY_TYPE = ref([]) // 付款方式

// 主表数据
const formData = reactive({
	form: {
		id: null,
		companyIdList: [], // 作业公司
		companyNameList: [],
		companyList: [],
		// startEndDateArr: [], // 有效起止日
		startTime: null,
		endTime: null,
		customerId: null, // 客户
		customerName: null,
		contactNo: null, // 合同编号
		signTime: null, // 签订日期
		contractType: null, // 合同类型
		isShip: null, // 是否船舶作业
		shipvoyageId: null, // 航次ID
		freeStorageDays: null, // 免堆存天数
		settlementBasisCode: null, // 结算依据(内贸)
		settlementBasisName: null, // 结算依据(内贸)
		expSettlementBasisCode: null, // 结算依据(内贸)
		expSettlementBasisName: null, // 结算依据(内贸)
		outerSettlementBasisCode: null, // 结算依据(外贸)
		outerSettlementBasisName: null, // 结算依据(外贸)
		luxiaoSettlementBasisCode: null, //结算依据(陆销)
		luxiaoSettlementBasisName: null, //结算依据(陆销)
		depositBasisCode: null, // 预缴依据
		depositBasisName: null,
		depositRatio: null, // 预缴比例
		payType: null, // 付款方式
		fileIds: [], // 文件列表
    file02Ids: [], // 文件列表
		// relevancyCustomerId: [], //关联客户id
		// relevancyCustomerName: [], //关联客户name
		customers: [], //关联客户
		remark: null, // 备注
		parentId: null, // 父id
		status: '10', // 状态，默认10 签订
	},
	rateList: [], // 服务费率列表
	trates: {
		id: null,
		rateIndex: null,
		//阶梯费率
		originAccNumber: '', //原始累积量
		tradeType: '内贸', //内外贸
		isTieredRate: '0', //是否阶梯价格
		preferentialRate: '', //优惠费率
		trateCargos: [], // 货物列表
		trateCargoCodes: [], //货物
		trateCargoNames: [], //货物
		trateDetails: [],
	},
	// 阶梯费率明细列表
	rateLadderList: [], //可编辑阶梯费率列表
	cargoRateGbCargoList: [], //货物费率列表数据
	cargoRatesList: [], //货物费率详情列表数据
	tieredRateList: [], //阶梯费率汇总列表
})
const trateDetailList = ref([]) //可编辑阶梯列表

const { form, trates, rateList, rateLadderList, cargoRateGbCargoList, cargoRatesList, tieredRateList } = toRefs(formData)
// console.log(3333, form.value)
// 合同编号触发事件
const contactNoChange = val => {
	cargoRateGbCargoList.value = cargoRateGbCargoList.value.map(item => {
		item.isstairRate = '否' //是否阶梯费率
		item.isTieredRateLable = '' //是否阶梯价格
		item.preferentialRateLabel = '' //优惠费率
		item.originAccNumberLabel = '' //原始累积量
		return item
	})
	// console.log('合同编号触发事件')
}
// 关联客户下拉框触发事件
const changeSelect = val => {
	form.value.customers = val.map(item => {
		return { customerId: item.value, customerName: item.label }
	})
}
let trateCargoList = ref([])
// 基本信息选择货物
const changeCargo = val => {
	trateCargoList.value = val
	// console.log('选择货物', val)
}
// 阶梯费率选择货物
const changeSelectCargo = val => {
	trates.value.trateCargos = val.map(item => {
		return { cargoCode: item.value, cargoName: item.label }
	})
	console.log('trates.value.trateCargos', trates.value.trateCargos)
}
// 选择作业公司
const changeCompany = val => {
	form.value.companyList = val.map(item => {
		return { companyId: item.value, companyName: item.label }
	})
}
// 生成货物费率
const getCreate = async () => {

	const toBeDelete = cargoRatesList.value.map(v1 => v1.cargoCode).filter(v1 => form.value.cargoCodes.every(v2 => v1 !== v2))
	cargoRatesList.value = cargoRatesList.value.filter(v1 => !toBeDelete.includes(v1.cargoCode))

	const toBeInsert = form.value.cargoCodes.filter(v1 => cargoRatesList.value.every(v2 => v1 !== v2.cargoCode))
	const resData = []

	if (toBeInsert.length) {
		let data = {
			cargoCodes: toBeInsert.join(','),
			startTime: form.value.startTime === undefined || form.value.startTime === null ? '' : form.value.startTime,
		}
		resData.push(...(await api.getCargoRateList(data).then(res => res.data)))
		resData.forEach(item => {
			if (item.rateItemCode === 'MS00240') {
				item.freeStorageDays = form.value.freeStorageDays ? form.value.freeStorageDays : item.freeStorageDays
			}
		})
	}

	cargoRatesList.value.push(...resData)

	cargoRateGbCargoList.value = groupCargoRatesByCargo(cargoRatesList.value).map(item => {
		item.isstairRate = '否'
		return item
	})
}
const setAllTrate = () => {
  cargoRateGbCargoList.value.forEach(row => {
    let data = {
      contractNo: form.value.contactNo,
      customerId: form.value.customerId,
      startTime: form.value.startTime,
      endTime: form.value.endTime,
      cargoCode: row.cargoCode,
    }
    row.isstairRate = '否'
    api.getMatchTrate(data).then(res => {
      if (res.data.length == 0) {
        // proxy.$message.info('未匹配到阶梯费率')
        return
      }
      row.isstairRate = '是'
      let data = res.data[0]
      row.isTieredRateLable = data.items[0].isTieredRate == '0' ? '否' : '是' //是否阶梯价格
      row.preferentialRateLabel = data.items[0].preferentialRate == '0' ? '否' : '是' //优惠费率
      row.originAccNumberLabel = data.items[0].originAccNumber //原始累积量
      row.trates = data //费率详情
      cargoRatesList.value = cargoRatesList.value.map(item => {
        if (item.cargoCode == row.cargoCode && item.rateItemName === '港口作业包干费') {
          item.trateItemId = data.items[0].id
        }
        return item
      })
    })
  })
}
// 货物费率行点击事件
const rateCargoCellClickEvent = ({ row }) => {
	// console.log('货物费率行点击事件row', row)
	// console.log('货物费率行点击事件', row.trates.length)
	// console.log('row.trates[0] !== undefined', row.trates.length !== 0)

	if (row.isstairRate == '是' && row.trates.length !== 0) {
		isRateShow.value = true
		// console.log('row.trates.items', row.trates.items[0])
		trates.value.trateCargoNames = row.cargoName.split(',')
		trates.value.trateCargoCodes = row.cargoCode.split(',')
		trates.value.tradeType = row.trates.items[0].tradeType
		trates.value.impExp = row.trates.items[0].impExp
		trates.value.originAccNumber = row.trates.items[0].originAccNumber
		trates.value.preferentialRate = row.trates.items[0].preferentialRate
		trates.value.isTieredRate = row.trates.items[0].isTieredRate
		trateDetailList.value = row.trates.items[0].details
		// console.log('trates.value', trates.value)
	} else {
		isRateShow.value = false
		trates.value.trateCargoNames = ''
		trates.value.trateCargoCodes = ''
		trates.value.tradeType = '内贸'
		trates.value.originAccNumber = ''
		trates.value.preferentialRate = ''
		trates.value.isTieredRate = '0'
		trateDetailList.value = []
	}
}
// 费率汇总
const groupCargoRatesByCargo = cargoRates => {
	return Array.from(
		cargoRates
			.reduce((acc, curr) => {
				const keyAs = `${curr.cargoCode},${curr.cargoName}`
				if (!acc.has(keyAs)) {
					acc.set(keyAs, [])
				}
				acc.get(keyAs).push(curr)
				return acc
			}, new Map())
			.entries()
	).map(([k, v]) => {
		const baoganRates = v.filter(v1 => '港口作业包干费' === v1.rateItemName)
		const duicunRate = v.find(v1 => 'MS00240' === v1.rateItemCode)

		const baoganRateInner = baoganRates.filter(v1 => '内贸' === v1.tradeType)
		const baoganRateOuter = baoganRates.filter(v1 => '外贸' === v1.tradeType)
		const baoganRateTradeInner = baoganRateInner.map(v1 => v1.serviceContentName + ':' + v1.rate).join(',')
		const baoganRateTradeOuter = baoganRateOuter.map(v1 => v1.serviceContentName + ':' + v1.rate).join(',')

		const trates = []
		if (baoganRates[0]?.trate) {
			trates.push(baoganRates[0]?.trate)
		}

		k = k.split(',')

		return {
			cargoCode: k[0],
			cargoName: k[1],
			baoganRate: '内贸:' + baoganRateTradeInner + ' 外贸:' + baoganRateTradeOuter,
			freeStorageDays: duicunRate?.freeStorageDays,
			duicunRate: duicunRate?.rate,
			trates,
		}
	})
}
// 费率
const rateInfo = ref({
	id: null,
	contractId: null, // 合同id
	cargoCode: null, // 货物
	cargoName: null,
	rateItemCode: null, // 费目
	rateItemName: null,
	tradeType: null, // 贸别
	serviceContentId: null, // 服务内容
	serviceContentName: null,
	paymentTypeCode: null, // 账期类型
	paymentTypeName: null,
	paymentDays: null, // 账期天数
	rate: null, // 费率值
	tax: null, // 税率值
	unitCode: null, //计费单位
	unitName: null,
	rateLadderList: [],
})

// 货物费率表头
const cargoRateInfoColumns = reactive([
	{
		label: '货名',
		prop: 'cargoName',
	},
	{
		label: '包干费',
		prop: 'baoganRate',
		vHtml: true,
	},
	{
		label: '免堆存期',
		prop: 'freeStorageDays',
		width: 100,
	},
	{
		label: '堆存费',
		prop: 'duicunRate',
		width: 100,
	},
	{
		label: '是否阶梯费率',
		prop: 'isstairRate',
		editType: 'select',
		modelLabel: 'isstairRate',
		editRender: {},
		selectData: [
			{ label: '是', value: '是' },
			{ label: '否', value: '否' },
		],
		disabled: false,
		change: (e, row) => {
			// console.log('e', e)
			// console.log('row', row)
			// console.log()
			if (e.value == '是') {
				let data = {
					contractNo: form.value.contactNo, //合同编号
					customerId: form.value.customerId, //客户id,
					startTime: form.value.startTime, //有效期起,
					endTime: form.value.endTime, //有效期止,
					cargoCode: row.cargoCode,
				}
				row.isstairRate = '否'
				api.getMatchTrate(data).then(res => {
					if (res.data.length == 0) {
						proxy.$message.info('未匹配到阶梯费率')
						return
					}
					row.isstairRate = '是'
					let data = res.data[0]
					// console.log('获取阶梯费率', data)
					row.isTieredRateLable = data.items[0].isTieredRate == '0' ? '否' : '是' //是否阶梯价格
					row.preferentialRateLabel = data.items[0].preferentialRate == '0' ? '否' : '是' //优惠费率
					row.originAccNumberLabel = data.items[0].originAccNumber //原始累积量
					row.trates = data //费率详情
					cargoRatesList.value = cargoRatesList.value.map(item => {
						if (item.cargoCode == row.cargoCode && item.rateItemName === '港口作业包干费') {
							item.trateItemId = data.items[0].id
						}
						return item
					})
					// let labels = res.data.labels
					// row.isTieredRateLable = labels.isTieredRateLabel //是否阶梯价格
					// row.preferentialRateLabel = labels.preferentialRateLabel //优惠费率
					// row.originAccNumberLabel = labels.originAccNumberLabel //原始累积量
					// row.trates = res.data.trates //费率详情
					// console.log('获取阶梯费率', res)
					// cargoRatesList.value = cargoRatesList.value.map(item => {
					// 	if (item.cargoCode == row.cargoCode && item.tradeType == '内贸') {
					// 		item.trateItemId = res.data.trateItemIdInner
					// 	}
					// 	if (item.cargoCode == row.cargoCode && item.tradeType == '外贸') {
					// 		item.trateItemId = res.data.trateItemIdOuter
					// 	}
					// 	return item
					// })
					// cargoRatesList.value = cargoRatesList.value.map(item => {
					// 	if (item.cargoCode == row.cargoCode) {
					// 		item.labels = res.data.labels
					// 	}
					// 	return item
					// })
					// console.log('cargoRatesList.value', cargoRatesList.value)
				})
			} else {
				row.isTieredRateLable = '' //是否阶梯价格
				row.preferentialRateLabel = '' //优惠费率
				row.originAccNumberLabel = '' //原始累积量
				row.trate = [] //费率详情
				cargoRatesList.value = cargoRatesList.value.map(item => {
					if (item.cargoCode == row.cargoCode) {
						item.trateItemId = ''
					}
					return item
				})
				isRateShow.value = false
			}

			// getMatchTrate
		},
	},
	{
		label: '是否阶梯价格',
		prop: 'isTieredRateLable',
	},
	{
		label: '优惠费率',
		prop: 'preferentialRateLabel',
	},
	// {
	// 	label: '原始累积量',
	// 	prop: 'originAccNumberLabel',
	// },
	// {
	// 	label: '累积量',
	// 	prop: 'accNumber',
	// },
	{
		label: '操作',
		prop: 'rateItemCode',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							rateDetail(row.cargoCode)
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
			]
		},
	},
])
// 服务费率表头
const rateInfoColumns = reactive([
	{
		label: '费率',
		prop: 'id',
		modelLabel: 'rateItemName',
		editType: 'select',
		selectValue: 'id',
		selectLabel: 'rateItemName',
		editRender: {},
		disabled: false,
		change: (e, row) => {
			// console.log('e', e)
			// console.log('row', row)
			// 根据选择费率进行处理
			// row.id = e.id
			row.processName = e.processName //作业过程
			row.tradeType = e.inteFore //内外贸
			row.rate = e.rate //费率值
			row.rateId = e.id //费率id
			row.unitCode = e.measurementUnitCode1 //计费单位
			row.unitName = e.measurementUnitName1 //计费单位
			row.tax = e.taxRate //税率
			row.freeStorageDays = e.freeStorageDays //免堆存期
			row.serviceContentId = e.serviceContentId //服务内容
			row.serviceContentName = e.serviceContentName //服务内容
			row.cargoCode = e.cargoCode //货物编码
			row.cargoName = e.cargoName //货物编码
			row.rateItemCode = e.rateItemCode // 费目编码
			row.rateItemName = e.rateItemName // 费目
		},
	},
	{
		label: '作业过程',
		prop: 'processName',
		editType: 'select',
		modelLabel: 'tradeType',
		editRender: {},
		disabled: 'rowDisabled',
	},
	{
		label: '内外贸',
		prop: 'tradeType',
		editType: 'select',
		modelLabel: 'tradeType',
		editRender: {},
		disabled: 'rowDisabled',
		selectData: [
			{ label: '内贸', value: '内贸' },
			{ label: '外贸', value: '外贸' },
		],
	},
	{ label: '费率值', prop: 'rate', editType: 'input', editRender: {}, disabled: 'rowDisabled' },
	{
		label: '计费单位',
		prop: 'unitName',
		editType: 'select',
		modelLabel: 'unitName',
		editRender: {},
		selectData: [],
		disabled: 'rowDisabled',
	},
	{
		label: '税率（%）',
		prop: 'tax',
		editType: 'input',
		editRender: {},
		disabled: 'rowDisabled',
	},
	{
		prop: '',
		label: '添加',
		width: 200,
		align: 'center',
		disabled: false,
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							deleteDataRate(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						disabled: formDisabled.value,
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

// 阶梯费率表格（汇总）
const tieredRateInfoColumns = reactive([
	{
		label: '货物名称',
		prop: 'cargoName',
	},
	{
		label: '内外贸',
		prop: 'tradeType',
	},
	{
		label: '是否阶梯价格',
		prop: 'isTieredRateLable',
	},
	{
		label: '优惠费率',
		prop: 'preferentialRate',
	},
	{
		label: '操作',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							tieredRateDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Edit',
						permission: 'business:customer:update', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const tieredRateDelete = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			// 过滤要删除的数据重新赋值
			tieredRateList.value.splice(row.index, 1)
			trateClear()
		})
		.catch(err => {})
	// console.log('阶梯费率删除', row)
}
// 阶梯费率保存
const tieredRateSave = () => {
	if (trates.value.trateCargos.length == 0) {
		proxy.$modal.msgWarning('货物不能为空')
		return
	}
	let trateData = JSON.parse(JSON.stringify(trates.value))
	if (!trateData.rateIndex) {
		console.log(222, trateData.trateCargos)
		let addData = {
			rateIndex: tieredRateList.value.length * 1 + 1,
			trateCargos: trateData.trateCargos, // 阶梯费率货物列表
			cargoName: trateData.trateCargos.map(item => item.cargoName).join(','),
			cargoCode: trateData.trateCargos.map(item => item.cargoCode).join(','),
			tradeType: trateData.tradeType, // 贸别
			preferentialRate: trateData.isTieredRate == '1' ? ' 0' : trateData.preferentialRate, // 优惠费率
			isTieredRate: trateData.isTieredRate, // 是否阶梯费率
			isTieredRateLable: trateData.isTieredRate == '1' ? '是' : '否',
			trateDetails: trateDetailList.value, // 阶梯费率明细列表
		}
		tieredRateList.value.push(addData)
	} else {
		let addData = {
			rateIndex: trateData.rateIndex,
			trateCargos: trateData.trateCargos,
			cargoName: trateData.trateCargos.map(item => item.cargoName).join(','),
			cargoCode: trateData.trateCargos.map(item => item.cargoCode).join(','),
			tradeType: trateData.tradeType,
			preferentialRate: trateData.isTieredRate == ' 1 ' ? '0' : trateData.preferentialRate, // 优惠费率
			isTieredRate: trateData.isTieredRate, // 是否阶梯费率
			isTieredRateLable: trateData.isTieredRate == '1' ? '是' : '否',
			trateDetails: trateDetailList.value, // 阶梯费率明细列表
		}
		tieredRateList.value = tieredRateList.value.map(item => {
			if (item.rateIndex == addData.rateIndex) {
				item = addData
			}
			return item
		})
	}

	trateClear()
}
// 阶梯费率数据重置清空
const trateClear = () => {
	trates.value.trateCargos = []
	trates.value.trateCargoCodes = []
	trates.value.trateCargoNames = []
	trates.value.tradeType = '内贸'
	trates.value.preferentialRate = ''
	trates.value.isTieredRate = '0'
	trates.value.rateIndex = null
	trateDetailList.value = []
}
// 可编辑阶梯费率表头
const rateLadderInfoColumns = reactive([
	{ label: '起始量（>）万吨', prop: 'beginTon' },
	{ label: '截止量（<=）万吨', prop: 'endTon' },
	{ label: '费率值', prop: 'rate' },
])
// 校验
const rules = reactive({
	companyIdList: proxy.getRules({ required: true }),
	customerId: proxy.getRules({ required: true }),
	contactNo: proxy.getRules({ required: true }),
	startTime: proxy.getRules({ required: true }),
	signTime: proxy.getRules({ required: true }),
	contractType: proxy.getRules({ required: true }),
	isShip: proxy.getRules({ required: true }),
	shipvoyageId: proxy.getRules({ required: true }),
	depositBasisCode: proxy.getRules({ required: true }),
	payType: proxy.getRules({ required: true }),
	depositRatio: proxy.getRules({
		required: true,
		numberCheck: {
			int: 3,
			dec: 0,
		},
	}),

	freeStorageDays: proxy.getRules({
		numberCheck: {
			int: 6,
			dec: 0,
		},
	}),
	cargoCodes: proxy.getRules({ required: true }), //货物
})
const editRulesRate = ref({
	id: proxy.getRules({ required: true }),
	paymentTypeCode: proxy.getRules({ required: true }),
	paymentDays: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 0,
		},
	}),
	cargoCode: proxy.getRules({ required: true }),
	rate: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
	unitCode: proxy.getRules({
		required: true,
	}),
	tax: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
})
const editRulesRateLadder = ref({
	startQuantity: proxy.getRules({
		required: true,
		numberCheck: {
			int: 7,
			dec: 4,
		},
	}),
	endQuantity: proxy.getRules({
		required: true,
		numberCheck: {
			int: 7,
			dec: 4,
		},
	}),
	rate: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 2,
		},
	}),
})

/**--------------方法------------ */
// 初始化
const init = isAdd => {
	// 获取字典数据 合同类型：CONTRACT_TYPE 结算依据：SETTLEMENT_BASIS   预缴依据：DEPOSIT_BASIS  付费方式：PAY_TYPE,账期类型：PAYMENT_TYPE 计量单位：UNIT
	publicApi.getDictList({ types: 'CONTRACT_TYPE,SETTLEMENT_BASIS,DEPOSIT_BASIS,PAY_TYPE,PAYMENT_TYPE,UNIT' }).then(res => {
		CONTRACT_TYPE.value = res.data.CONTRACT_TYPE
		SETTLEMENT_BASIS.value = res.data.SETTLEMENT_BASIS
		DEPOSIT_BASIS.value = res.data.DEPOSIT_BASIS
		PAY_TYPE.value = res.data.PAY_TYPE
		// 给编辑table下拉框设置数据源
		proxy.setEditTableOptions(rateInfoColumns, { paymentTypeCode: res.data.PAYMENT_TYPE, unitCode: res.data.UNIT })
	})

	// 本地下拉框数据源
	publicApi.getLocalSelects({ types: 'FEE_ITEM,SERVICE' }).then(res => {
		// 给编辑table下拉框设置数据源
		proxy.setEditTableOptions(rateInfoColumns, { serviceContentId: res.data.SERVICE })
	})
	api.getRateList().then(res => {
		let data = res.data.filter(item => item.dataSource !== 2)

		console.log('费率列表', data)
		proxy.setEditTableOptions(rateInfoColumns, { id: data })

		if (isAdd) {
			let arr = data.filter(item => item.rateItemCode == '02')
			// console.log('相同开头费率', arr)
			rateList.value = arr.map(item => {
				return {
					id: item.id,
					processName: item.processName, //作业过程
					tradeType: item.inteFore, //内外贸
					rate: item.rate, //费率值
					rateId: item.id, //费率id
					unitCode: item.measurementUnitCode1, //计费单位
					unitName: item.measurementUnitName1, //计费单位
					tax: item.taxRate, //税率
					freeStorageDays: item.freeStorageDays, //免堆存期
					serviceContentId: item.serviceContentId, //服务内容
					serviceContentName: item.serviceContentName, //服务内容
					cargoCode: item.cargoCode, //货物编码
					cargoName: item.cargoName, //货物编码
					rateItemCode: item.rateItemCode, // 费目编码
					rateItemName: item.rateItemName, // 费目
				}
			})
			getDate()
		}
		isAlter()
	})
}
// 可编辑列表是否可修改
const isAlter = () => {
	cargoRateInfoColumns.forEach(item => {
		if (item.label == '是否阶梯费率') {
			item.disabled = formDisabled.value == true ? true : false
		}
	})
	rateInfoColumns.forEach(item => {
		if (item.label == '费率') {
			item.disabled = formDisabled.value == true ? true : false
		}
	})
}
// 获取有效日期起止日期
const getDate = () => {
	let date = new Date()
	// 获取当前年份、月份、日期
	var year = date.getFullYear().toString() // 转换为字符串类型
	var month = (date.getMonth() + 1).toString().padStart(2, '0')
	var day = date.getDate().toString().padStart(2, '0')
	form.value.startTime = `${year}-${month}-${day}`
	form.value.endTime = `${year}-12-31`
}
// 合同类型变化
const contractTypeChange = rowData => {
	// console.log('合同类型', rowData)
	if ('1' != rowData.dictValue) {
		formData.value.isShip = null
	}
}
// 付款方式变化
const payTypeChange = rowData => {
	// console.log('付款方式', rowData.dictValue)
	if ('10' != rowData.dictValu) {
		// 清空预缴依据
		form.value.depositBasisCode = null
		form.value.depositBasisName = null
		// 清空预交比例
		// form.value.depositRatio = null
	}
	//选择预付费客户，预缴比例默认100%。
	form.value.depositRatio = rowData.dictValue == '10' ? '100' : null
}

// 删除费率
const deleteDataRate = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			// 过滤要删除的数据重新赋值
			rateList.value = rateList.value.filter(item => {
				return item.row_id != row.row_id
			})
			rowIndex.value = null
			rateLadderList.value = []
		})
		.catch(err => {})
}
// 新增费率
const rateHeaderCellClickEvent = even => {
	if (formDisabled.value == true) {
		return
	}
	// console.log('新增货物费率66')
	if (even.column.field == '') {
		rateList.value.push(JSON.parse(JSON.stringify(rateInfo.value)))
	}
}
const headerCellClassName = even => {
	if (even.column.field == '') {
		return 'add'
	}
}

// 删除阶梯费率
const deleteDataRateLadder = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			for (let temp of rateList.value) {
				// 选中的费率标准
				if (temp.row_id == rowIndex.value) {
					// 删除选中的阶梯费率
					temp.rateLadderList = rateLadderList.value.filter(item => {
						return item.row_id != row.row_id
					})
					// 显示的阶梯费率
					rateLadderList.value = temp.rateLadderList
				}
			}
		})
		.catch(err => {})
}
// 服务费率标准点击事件
const rateClickEvent = () => {
	console.log()
}
// 阶梯费率标准表格行点击事件
const rateCellClickEvent = ({ row }) => {
	// console.log('费率标准', row)
	let data = JSON.parse(JSON.stringify(row))
	proxy.setFormData(trates.value, data)
	console.log('data.cargoCode', data.cargoCode)
	trates.value.trateCargoCodes = data.cargoCode.split(',')
	trates.value.trateCargoNames = data.cargoName.split(',')
	trateDetailList.value = data.trateDetails ? data.trateDetails : []
	// console.log('修改', trates.value)
	// 记录选中行的唯一标志
	// rowIndex.value = even.row.row_id
	// // 显示的阶梯费率
	// for (let temp of rateList.value) {
	// 	// 选中的费率标准
	// 	if (temp.row_id == rowIndex.value) {
	// 		// 显示的阶梯费率
	// 		rateLadderList.value = temp.rateLadderList
	// 	}
	// }
}
// 新增阶梯费率
const rateLadderHeaderCellClickEvent = even => {
	if (even.column.field == '') {
		let data = trateDetailList.value
		trateDetailList.value.push({
			// 起始量
			beginTon: data[data.length - 1] ? data[data.length - 1].endTon : null,
			// 截止量
			endTon: null,
			// 费率值
			rate: null,
		})
	}
}
// 编辑时货物费率数据处理
const editCargoRate = data => {
	let datas = groupCargoRatesByCargo(data)
	cargoRateGbCargoList.value = datas.map(item => {
		if (item.trates.length > 0) {
			let trate = item.trates[0].items[0]
			item.isstairRate = '是'
			item.isTieredRateLable = trate.isTieredRate == '0' ? '否' : '是' //是否阶梯价格
			item.preferentialRateLabel = trate.preferentialRate == '0' ? '否' : '是' //优惠费率
			item.originAccNumberLabel = trate.originAccNumber
			item.trates = item.trates[0]
		} else {
			item.isstairRate = '否'
		}
		return item
	})
	// console.log('编辑时货物费率数据', cargoRateGbCargoList.value)
}
// 上传文件
const changeFile = files => {
	// console.log('删除附件', files)
	form.value.fileIds = files
}// 上传文件
const changeFile02 = files => {
	// console.log('删除附件', files)
	form.value.file02Ids = files
}

// 重置表单
const resetForm = () => {
	// proxy.resetObj(formData)
	ruleForm.value.resetFields()
	proxy.$bus.emit('resetFileList') //清空文件上传
	form.value.id = null
	form.value.companyNameList = []
	form.value.companyList = []
	form.value.customerName = ''
	form.value.customers = []
	form.value.depositBasisCode = ''
	form.value.depositBasisName = ''
	form.value.depositRatio = ''
	form.value.shipvoyageId = ''
	form.value.relevancyCustomerName = []
	form.value.settlementBasisName = ''
	rateLadderList.value = [] //可编辑阶梯费率列表
	cargoRateGbCargoList.value = [] //货物费率列表数据
	cargoRatesList.value = [] //货物费率详情列表数据
	rateList.value = [] //服务费率
	// trates.value.trateCargos = [] // 货物列表
	trateDetailList.value = [] // 阶梯费率明细列表，
	// trates.value.trateCargos = []
	// trates.value.trateCargoCodes = []
	// trates.value.trateCargoNames = []
	tieredRateList.value = [] //阶梯费率汇总列表
	isRateShow.value = false
	trateClear()
}
// 校验
const validate = async () => {
	let flag = false
	// let flag1 = tieredRateList.value.length == 0 ? false : true
	let flag2 = await rateInfoForm.value.validAllEvent()
	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag2) {
			flag = true
		} else if (!valid) {
			proxy.$message.warning('请完善表单信息！')
			flag = false
			return
		} else if (!flag2) {
			proxy.$message.warning('请完善表单信息！')
			flag = false
			return
		} else {
			flag = false
		}
	})
	return flag
}

// 货物费率详情
const rateDetail = cargoCode => {
	let detailDatas = cargoRatesList.value.filter(item => item.cargoCode == cargoCode)
	// console.log('货物费率详情', detailDatas)
	// console.log('货物费率详情cargoRatesList.value', cargoRatesList.value)
	rateVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.rateList = JSON.parse(JSON.stringify(detailDatas))
		// console.log('费率明细', detailRef.value.rateList)
	})
}
// 费率详情保存
const save = async () => {
	proxy.$modal.confirm('确定保存?').then(res => {
		// console.log('保存前的数据', cargoRatesList.value)
		let data = JSON.parse(JSON.stringify(detailRef.value.rateList))
		let cargoCode = Array.from(new Set(data.map(item => item.cargoCode)))[0]
		let arr1 = []
		let arr2 = []
		cargoRatesList.value.forEach(item => {
			if (item.cargoCode == cargoCode) {
				arr1.push(item)
			} else {
				arr2.push(item)
			}
		})
		cargoRatesList.value = [...data, ...arr2]
		editCargoRate(cargoRatesList.value)
		// cargoRateGbCargoList.value = cargoRatesGbCargo.map(item => {
		// 	item.baoganRate = item.baoganRate.replace(';', `  `)
		// 	return item
		// })
		rateVisible.value = false
		// console.log('费率数据保存后', cargoRatesList.value)
	})
}
defineExpose({
	validate,
	resetForm,
	formData,
	formDisabled,
	cargoRatesList, //货物费率详情列表
	cargoRateGbCargoList, //货物费率列表
	editCargoRate, //货物费率回显
	// isAdd, //是否新增
	init,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
