<template>
	<el-form :model="form" ref="ruleForm" :rules="rules" :inline="true" label-position="top" :disabled="formDisabled">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="基本信息" name="baseData">
				<!-- 合同数据 -->
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item label="客户" prop="customerId">
							<RemoteSelect
								type="CUSTOMER_ALL"
								v-model:value="form.customerId"
								v-model:label="form.customerName"
								:multiple="true"
								@change="changeCustomer"
								multiple
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="合同编号" prop="contractNo">
							<!-- <el-input v-model="form.contractNo" placeholder="合同编号" /> -->
							<el-select
								v-model="form.contractNo"
								multiple
								filterable
								allow-create
								default-first-option
								:reserve-keyword="false"
								placeholder="选择或输入"
								@change="changeSelect"
							>
								<el-option v-for="item in options" :key="item.id" :label="item.contractNo" :value="item.contractNo" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="4">
						<el-form-item label="有效期(起)" prop="startTime">
							<el-date-picker
								format="YYYY-MM-DD"
								v-model="form.startTime"
								type="datetime"
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
								type="datetime"
								placeholder="结束时间"
								value-format="YYYY-MM-DD"
							/>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
			<!-- 阶梯费率数据-->
			<el-collapse-item title="阶梯费率" name="rateLadder">
				<BaseTable
					v-if="tieredRateList.length"
					ref="tieredRateInfoForm"
					:tableColumns="tieredRateInfoColumns"
					:tableData="tieredRateList"
					:cellClickEvent="rateCellClickEvent"
					:tableHeight="200"
					:total="total"
				/>
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item label="选择货物" prop="cargoCodeList">
							<RemoteSelect
								ref="cargoSelect"
								v-model:value="trates.cargoCode"
								v-model:label="trates.cargoName"
								placeholder="请选择货物名称"
								type="CARGO_INFO_SIGN"
								:reserveKeyword="true"
								:multiple="true"
								:number="30"
								@change="changeSelectCargo"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="内外贸" prop="trates.tradeType">
							<el-radio-group v-model="trates.tradeType">
								<el-radio label="内贸">内贸</el-radio>
								<el-radio label="外贸">外贸</el-radio>
								<el-radio label="内/外贸">内/外贸</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="进出口" prop="trates.impExp">
							<el-radio-group v-model="trates.impExp">
								<el-radio label="进口">进口</el-radio>
								<el-radio label="出口">出口</el-radio>
								<el-radio label="进/出口">进/出口</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="是否阶梯价格" prop="trates.isTieredRate">
							<el-radio-group v-model="trates.isTieredRate">
								<el-radio label="1">是</el-radio>
								<el-radio label="0">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="原始累积量" prop="trates.originAccNumber">
							<el-input v-model="trates.originAccNumber" placeholder="原始累积量" type="number"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8" v-if="formData.trates.isTieredRate == 0">
						<el-form-item label="优惠费率" prop="trates.preferentialRate">
							<el-input v-model="trates.preferentialRate" placeholder="优惠金额" type="number">
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
				<el-col :span="24">
					<div style="width: 100%; display: flex; justify-content: center; margin: 10px">
						<el-button @click="contractVisible = false">取消</el-button>
						<el-button type="primary" @click="tieredRateSave">保存</el-button>
            <el-button type="primary" v-if="formData.form.status === '20'" @click="updateOriginAccNumber">修改原始累积量</el-button>
					</div>
				</el-col>
			</el-collapse-item>
		</el-collapse>
	</el-form>
	<!-- 费率明细抽屉 -->
	<el-drawer v-model="rateVisible" title="费率标准" size="78%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="rateVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
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
import api from '@/api/business/contractBenefits/index'
// import detail from './drawer/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
/**--------------常量定义------------ */
const ContractStatusEnum = {
	sign: '10',
	takeEffect: '20',
}

const activeNames = ['baseData', 'cargoRate', 'serveRate', 'rateLadder']
const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }
/**--------------变量定义------------ */
const rateVisible = ref(false) // 是否显示费率详情
const detailRef = ref(null) // 明细组件ref

const ruleForm = ref()
const rateInfoForm = ref() //服务费率
const cargoRateInfoForm = ref() //货物费率
const rateLadderInfoForm = ref() //可编辑阶梯费率
const tieredRateInfoForm = ref() //阶梯费率
const rowIndex = ref(null)
const formDisabled = ref(false)
const cargoRateList = ref() //货物服务费率
// 下拉框数据源
const CONTRACT_TYPE = ref([]) // 合同类型
const SETTLEMENT_BASIS = ref([]) // 结算依据
const DEPOSIT_BASIS = ref([]) // 预缴依据
const PAY_TYPE = ref([]) // 付款方式
const options = ref([]) //合同编号数据源
// 主表数据
const formData = reactive({
	form: {
		id: null,
		startTime: null,
		endTime: null,
		customerId: null, // 客户
		customerName: null,
		contractNo: null, // 合同编号
		customers: [], //客户
		contracts: [], //合同
	},
	// rateList: [], // 服务费率列表
	trates: {
		id: null,
		rateIndex: null,
		//阶梯费率
		tradeType: '内贸', //内外贸
		isTieredRate: '0', //是否阶梯价格
		preferentialRate: '', //优惠费率
		cargos: [], // 货物列表
		cargoCode: [], //货物
		cargoName: [], //货物
		details: [],
		impExp: '进口', //进出口
	},
	// 阶梯费率明细列表
	rateLadderList: [], //可编辑阶梯费率列表
	// cargoRateGbCargoList: [], //货物费率列表数据
	// cargoRatesList: [], //货物费率详情列表数据
	tieredRateList: [], //阶梯费率汇总列表
})
const trateDetailList = ref([]) //可编辑阶梯列表
const { form, trates, rateList, rateLadderList, cargoRateGbCargoList, cargoRatesList, tieredRateList } = toRefs(formData)
console.log(3333, form.value)
// 客户下拉框触发事件
const changeCustomer = val => {
	form.value.customers = val.map(item => {
		return { customerId: item.value, customerName: item.label }
	})
	let customerIds = val.map(item => item.value).join(',')
	let data = {
		customerIds: customerIds,
	}
	console.log(data)
	api.getLocalSelect(data).then(res => {
		// console.log('合同编号列表', res)
		options.value = res.data
	})
}
// 合同下拉框事件
const changeSelect = val => {
	console.log('选择合同编号', val)
	let arr = []
	val.forEach(item => {
		// if ((item.value = val)) {
		arr.push({ contractNo: item })
		// }
	})
	form.value.contracts = JSON.parse(JSON.stringify(arr))
	console.log('form.value.contracts', form.value.contracts)
}
// 阶梯费率选择货物
const changeSelectCargo = val => {
	trates.value.cargos = val.map(item => {
		return { cargoCode: item.value, cargoName: item.label }
	})
	console.log('trates.value.cargos', trates.value.cargos)
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
		const baoganRateTradeInner = v
			.filter(v1 => '港口作业包干费' === v1.rateItemName && '内贸' === v1.tradeType)
			.map(v1 => v1.serviceContentName + ':' + v1.rate)
			.join(',')
		const baoganRateTradeOuter = v
			.filter(v1 => '港口作业包干费' === v1.rateItemName && '外贸' === v1.tradeType)
			.map(v1 => v1.serviceContentName + ':' + v1.rate)
			.join(',')
		const duicunRate = v.find(v1 => 'MS00240' === v1.rateItemCode)

		k = k.split(',')
		return {
			cargoCode: k[0],
			cargoName: k[1],
			baoganRate: '内贸:' + baoganRateTradeInner + '<br/>外贸:' + baoganRateTradeOuter,
			freeStorageDays: duicunRate?.freeStorageDays,
			duicunRate: duicunRate?.rate,
		}
	})
}
// 服务费率表头
const rateInfoColumns = reactive([
	{
		label: '费率',
		prop: 'rateItemCode',
		modelLabel: 'rateItemName',
		editType: 'select',
		selectValue: 'rateItemCode',
		selectLabel: 'rateItemName',
		editRender: {},
		change: (e, row) => {
			// console.log('e', e)
			// console.log('row', row)
			// 根据选择费率进行处理
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
		label: '进出口',
		prop: 'impExp',
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
		label: '原始累积量',
		prop: 'originAccNumber',
	},
	{
		label: '计费量',
		prop: 'statementNumber',
	},
	{
		label: '累积量',
		prop: 'accNumber',
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
			// 过滤要删除的数据重新赋值 tieredRateList
			tieredRateList.value.splice(row.index, 1)
			trateClear()
		})
		.catch(err => {})
	// console.log('阶梯费率删除', row)
}
// 阶梯费率保存
const tieredRateSave = () => {
	if (trates.value.cargos.length == 0) {
		proxy.$modal.msgWarning('货物不能为空')
		return
	}
	let trateData = JSON.parse(JSON.stringify(trates.value))
	console.log('trateData', trateData)
	console.log('trateData,rateIndex', trateData.rateIndex)
	if (!trateData.rateIndex) {
		console.log(222, trateData.cargos)
		let addData = {
			rateIndex: tieredRateList.value.length * 1 + 1,
			cargos: trateData.cargos, // 阶梯费率货物列表
			cargoName: trateData.cargos.map(item => item.cargoName).join(','),
			cargoCode: trateData.cargos.map(item => item.cargoCode).join(','),
			tradeType: trateData.tradeType, // 贸别
			impExp: trateData.impExp, //进出口
			preferentialRate: trateData.isTieredRate == '1' ? ' 0' : trateData.preferentialRate, // 优惠费率
			isTieredRate: trateData.isTieredRate, // 是否阶梯费率
			isTieredRateLable: trateData.isTieredRate == '1' ? '是' : '否',
			details: trateDetailList.value, // 阶梯费率明细列表
			originAccNumber: trateData.originAccNumber, //原始累积量
		}
		tieredRateList.value.push(addData)
	} else {
		let addData = {
			rateIndex: trateData.rateIndex,
			cargos: trateData.cargos,
			cargoName: trateData.cargos.map(item => item.cargoName).join(','),
			cargoCode: trateData.cargos.map(item => item.cargoCode).join(','),
			tradeType: trateData.tradeType,
			impExp: trateData.impExp, //进出口
			preferentialRate: trateData.isTieredRate == '1' ? '0' : trateData.preferentialRate, // 优惠费率
			isTieredRate: trateData.isTieredRate, // 是否阶梯费率
			isTieredRateLable: trateData.isTieredRate == '1' ? '是' : '否',
			preferentialRate: trateData.isTieredRate == ' 1 ' ? '0' : trateData.preferentialRate, // 优惠费率
			isTieredRate: trateData.isTieredRate, // 是否阶梯费率
			isTieredRateLable: trateData.isTieredRate == '1' ? '是' : '否',
			details: trateDetailList.value, // 阶梯费率明细列表
			originAccNumber: trateData.originAccNumber, //原始累积量
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
// 修改原始累积量
const updateOriginAccNumber = () => {
  api.updateOriginAccNumber(formData.trates.id, formData.trates.originAccNumber).then(res => {
    proxy.$modal.msgSuccess(res.msg)
  })
}
// 阶梯费率数据重置清空
const trateClear = () => {
	trates.value.cargos = []
	trates.value.cargoCode = []
	trates.value.cargoName = []
	trates.value.tradeType = '内贸'
	trates.value.impExp = '进口'
	trates.value.preferentialRate = ''
	trates.value.originAccNumber = ''
	trates.value.isTieredRate = '0'
	trates.value.rateIndex = null
	trateDetailList.value = []
}
// 可编辑阶梯费率表头
const rateLadderInfoColumns = reactive([
	{ label: '起始量（>）万吨', prop: 'beginTon', editType: 'input', editRender: {} },
	{ label: '截止量（<=）万吨', prop: 'endTon', editType: 'input', editRender: {} },
	{ label: '费率值', prop: 'rate', editType: 'input', editRender: {} },
	{
		prop: '',
		label: '添加',
		width: 200,
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							deleteDataRateLadder(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
// 校验
const rules = reactive({
	customerId: proxy.getRules({ required: true }),
	contractNo: proxy.getRules({ required: true }),
	startTime: proxy.getRules({ required: true }),
	endTime: proxy.getRules({ required: true }),
})
/**--------------方法------------ */
// 初始化
const init = () => {
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
		// proxy.setEditTableOptions(rateInfoColumns, { rateItemCode: res.data.FEE_ITEM, serviceContentId: res.data.SERVICE })
		proxy.setEditTableOptions(rateInfoColumns, { serviceContentId: res.data.SERVICE })
	})
	api.getRateList().then(res => {
		// console.log('费率列表', res)
		let data = res.data.filter(item => item.rateItemCode !== '02')
		proxy.setEditTableOptions(rateInfoColumns, { rateItemCode: data })
	})
}
init()

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
      trateDetailList.value.forEach((item, index) => {
        // 根据表格自动生成的唯一标识删除，字段名在rowConfig中指定
        if (item.row_id == row.row_id) {
          trateDetailList.value.splice(index, 1)
          return
        }
      })
		})
}

// 阶梯费率标准表格行点击事件
const rateCellClickEvent = ({ row }) => {
	// console.log('费率标准', row)
	let data = JSON.parse(JSON.stringify(row))
	proxy.setFormData(trates.value, data)
	// console.log('data.cargoCode', data.cargoCode)
	trates.value.cargoCode = data.cargoCode.split(',')
	trates.value.cargoName = data.cargoName.split(',')
	trates.value.originAccNumber = data.originAccNumber
	trateDetailList.value = data.details ? data.details : []
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

// 重置表单
const resetForm = () => {
	// proxy.resetObj(formData)
	ruleForm.value.resetFields()
	form.value.id = null
	rateLadderList.value = [] //可编辑阶梯费率列表
	trates.value.cargos = [] // 货物列表
	trateDetailList.value = [] // 阶梯费率明细列表，
	trates.value.cargoCode = []
	trates.value.cargoName = []
	tieredRateList.value = [] //阶梯费率汇总列表
}
// 校验
const validate = async () => {
	let flag = false

	await ruleForm.value.validate((valid, fields) => {
		console.log('valid', valid)
		flag = valid
	})
	return flag
}

// 货物费率详情
const rateDetail = cargoCode => {
	let detailDatas = cargoRatesList.value.filter(item => item.cargoCode == cargoCode)
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
		// console.log('保存所有数据', toRaw(detailRef.value.rateList))
		// console.log('保存前的数据', cargoRatesList.value)
		cargoRatesList.value = cargoRatesList.value.map(item => {
			detailRef.value.rateList.forEach(it => {
				if (item.cargoCode == it.cargoCode && item.rateId == it.rateId) {
					item = it
				}
			})
			return item
		})
		const cargoRatesGbCargo = groupCargoRatesByCargo(cargoRatesList.value)
		cargoRateGbCargoList.value = cargoRatesGbCargo.map(item => {
			item.baoganRate = item.baoganRate.replace(';', `<br/>`)
			return item
		})
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
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
