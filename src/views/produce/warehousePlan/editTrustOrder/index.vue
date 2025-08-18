<!-- 作业指令新增编辑表单 -->
<template>
	<el-form :model="trustOrderForm" ref="ruleForm" label-width="80px" :rules="rules">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="指令信息" name="order">
				<el-row>
					<el-col :span="8">
						<el-form-item label="通知单编号">
							<el-input v-model="trustOrderForm.trustNo" readonly />
						</el-form-item>
					</el-col>

					<el-col :span="8">
						<el-form-item label="作业公司" prop="companyId">
							<Select
								:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
								v-model:value="trustOrderForm.companyId"
								v-model:label="trustOrderForm.companyName"
								placeholder="作业公司"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="作业过程" prop="processCode">
							<Select
								:dataConfig="{ params: { type: 'MAIN_WORK_PROCESS' } }"
								v-model:value="trustOrderForm.processCode"
								v-model:label="trustOrderForm.processName"
								placeholder="作业过程"
								@change="changeProcess"
							/>
						</el-form-item>
					</el-col>
				</el-row>

				<el-row>
					<el-col :span="8">
						<el-form-item label="贸别" prop="tradeType">
							<Select
								:selectData="[
									{ label: '内贸', value: '内贸' },
									{ label: '外贸', value: '外贸' },
								]"
								v-model:value="trustOrderForm.tradeType"
								v-model:label="trustOrderForm.tradeType"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="进出口" prop="impExp">
							<Select
								:selectData="[
									{ label: '进口', value: '1' },
									{ label: '出口', value: '2' },
								]"
								v-model:value="trustOrderForm.impExp"
								v-model:label="trustOrderForm.impExp"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="结算依据" prop="settlementBasisCode">
							<Select
								:selectData="SETTLEMENT_BASIS"
								v-model:value="trustOrderForm.settlementBasisCode"
								v-model:label="trustOrderForm.settlementBasisName"
							/>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row v-if="!containCargo">
					<el-col :span="8">
						<el-form-item label="计划量" prop="settlementBasisCode">
							<el-input v-model="trustOrderForm.planTon" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="16">
						<el-form-item label="作业要求" prop="tradeType">
							<el-input
								v-model="trustOrderForm.remark"
								:autosize="{ minRows: 2, maxRows: 4 }"
								type="textarea"
								maxlength="100"
								show-word-limit
								placeholder="请输入作业要求"
							/>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>

			<el-collapse-item v-if="containShip" title="船舶信息" name="ship">
				<el-row>
					<el-col :span="8">
						<el-form-item label="船名航次" prop="shipvoyageItemId">
							<RemoteSelect
								type="VOYAGE"
								v-model:value="trustOrderForm.shipvoyageItemId"
								v-model:label="trustOrderForm.shipVoyageName"
								selectLabel="label"
								selectValue="value"
								@change="changeShipVoyage"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="货种">
							<el-input readonly v-model="trustOrderForm.shipInfo.cargoCategoryName" />
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="船代">
							<el-input readonly v-model="trustOrderForm.shipInfo.shipAgentName" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="8">
						<el-form-item label="预抵时间">
							<el-input readonly v-model="trustOrderForm.shipInfo.arrivalTimePlan" />
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="起运港">
							<el-input readonly v-model="trustOrderForm.shipInfo.startPortName" />
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="目的港">
							<el-input readonly v-model="trustOrderForm.shipInfo.endPortName" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>

			<el-collapse-item name="cargo" v-if="containCargo">
				<template v-slot:title>
					<div style="display: flex; justify-content: space-between; width: 95%">
						<div>货物信息</div>
						<div>
							<el-button type="primary" @click.stop="chooseTicketInfo">选择票货</el-button>
							<el-button v-if="addTicket" type="primary" @click.stop="addCargoInfo">添加</el-button>
						</div>
					</div>
				</template>
				<EditTable
					ref="editTable"
					:tableHeight="300"
					:tableColumns="tableColumns"
					:tableData="trustOrderForm.cargoList"
					:editRules="editRules"
					@change="editTableChange"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>

	<!--票货组件 -->
	<el-drawer v-model="ticketShow" title="票货信息" size="70%">
		<tickTable ref="tickTableRef"></tickTable>
		<template #footer>
			<div style="flex: auto">
				<el-button @click="ticketShow = false">取消</el-button>
				<el-button type="primary" @click="saveTicket">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="editTrustOrder">
import EditTable from '@/components/EditTable/index.vue'
import tickTable from './tickTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import { ElButton } from 'element-plus'
import publicApi from '@/api/public/index'
import api from '@/api/business/trustOrder/index'

const ruleForm = ref(null)
//是否包含船舶信息
const containShip = ref(true)

const containCargo = ref(true)
//新增票货
const addTicket = ref(true)
//结算依据 字典值
const SETTLEMENT_BASIS = ref(null)
const editRules = ref({
	cargoCode: [{ required: true, message: '货名必须填写' }],
	packingCode: [{ required: true, message: '包装必须填写' }],
	cargoOwnerId: [{ required: true, message: '货主必须填写' }],
	// cargoAgentId: [{ required: true, message: '货代必须填写' }],
	ton: proxy.getRules({
		required: true,
		numberCheck: {
			int: 8,
			dec: 2,
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
const editTable = ref(null)
//作业指令表单数据
const trustOrderForm = ref({
	planTon: '', //计划重量
	companyId: '', //作业公司id
	trustType: '', //指令类型
	companyName: '', //作业公司名称
	shipVoyageName: '',
	shipvoyageItemId: '',
	trustNo: '', //指令编号
	tradeType: '', //内外贸
	remark: '', //作业要求
	settlementBasisCode: '', //结算依据
	settlementBasisName: '', //结算依据
	shipvoyageId: '', //航次ID
	shipName: '', //船名
	processName: '', //作业过程名称
	processCode: '', //作业过程code
	shipInfo: {
		cargoCategoryName: '', //货种
		shipAgentName: '', //船代
		arrivalTimePlan: '', //预抵时间
		startPortName: '', //起运港
		endPortName: '', //目的港
	},
	cargoList: [], //货物信息
})
//表单验证
const rules = reactive({
	companyId: [{ required: true, message: '作业公司不能为空', trigger: 'blur' }],
	processCode: [{ required: true, message: '作业过程不能为空', trigger: 'blur' }],
	tradeType: [{ required: true, message: '内外贸不能为空', trigger: 'blur' }],
	settlementBasisCode: [{ required: true, message: '作业依据不能为空', trigger: 'blur' }],
})
//折叠面板
const activeNames = ref(['order', 'ship', 'cargo'])

const tableColumns = reactive([
	{
		prop: 'cargoCode',
		label: '货名',
		modelLabel: 'cargoName',
		selectLabel: 'label',
		selectValue: 'value',
		width: 150,
		editRender: {},
		editType: 'remoteSelect',
		type: 'CARGO_INFO',
		disable: true,
	},
	{
		prop: 'packingCode',
		label: '包装',
		modelLabel: 'packingName',
		editRender: {},
		width: 150,
		editType: 'select',
		selectData: [],
		disable: true,
	},
	{
		prop: 'cargoOwnerId',
		label: '货主',
		modelLabel: 'cargoOwnerName',
		selectLabel: 'label',
		selectValue: 'value',
		minWidth: 200,
		editRender: {},
		editType: 'remoteSelect',
		type: 'CUSTOMER_CARGO_OWNER',
		disable: true,
	},
	// {
	// 	prop: 'cargoAgentId',
	// 	label: '货代',
	// 	modelLabel: 'cargoAgentName',
	// 	selectLabel: 'label',
	// 	selectValue: 'value',
	// 	minWidth: 200,
	// 	editRender: {},
	// 	editType: 'remoteSelect',
	// 	type: 'CUSTOMER_CARGO_AGENT',
	// 	disable: true,
	// },
	{
		prop: 'quantity',
		label: '件数',
		width: 150,
		editRender: {},
		editType: 'input',
	},
	{
		prop: 'ton',
		label: '重量',
		width: 150,
		editRender: {},
		editType: 'input',
	},
	{
		label: '操作',
		width: 120,
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
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

//船舶航次change事件
const changeShipVoyage = params => {
	trustOrderForm.value.shipInfo = JSON.parse(JSON.stringify(params))
	trustOrderForm.value.shipvoyageId = trustOrderForm.value.shipInfo.shipvoyageId
	trustOrderForm.value.shipName = trustOrderForm.value.shipInfo.shipName
}

//新增一行货物信息
const addCargoInfo = () => {
	if (trustOrderForm.value.cargoList === undefined || trustOrderForm.value.cargoList === null) {
		trustOrderForm.value.cargoList = new Array()
	}

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
	})
}
// 货物列表 列回调
const editTableChange = (row, changData, title) => {
	if (title == '货名' && changData.workType) {
		const flag = trustOrderForm.value.cargoList.some(item => {
			return item.workType == '2' ? true : false
		})
		if (flag && changData.workType == '2') {
			row.cargoCode = ''
			row.cargoName = ''
			row.workType = ''
			proxy.$message.warning('只能存在一条散杂货物！')
			return
		} else {
			row.workType = changData.workType
		}
	}
}
// 货物列表删除按钮回调
const deleteCargoInfo = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			trustOrderForm.value.cargoList.splice(row.index, 1)
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
const isSource = res => {
	api.getWorkProcess().then(res => {
		const rowData = res.data.filter(item => {
			if (item.value == trustOrderForm.value.processCode) return item
		})

		if (rowData[0].sourceCode === '01' || rowData[0].targetCode === '01' || rowData[0].processTypeCd === '0002') {
			containShip.value = true
		} else {
			containShip.value = false
		}

		if (rowData[0].sourceCode === '05') {
			addTicket.value = false
		} else {
			addTicket.value = true
		}

		if (rowData[0].processTypeCd === '0002') {
			containCargo.value = false
		} else {
			containCargo.value = true
		}
	})
}
// 作业过程选中回调
const changeProcess = process => {
	trustOrderForm.value.trustType = process.planTypeCd
	trustOrderForm.value.cargoList = []
	if (process.sourceCode === '05') {
		addTicket.value = false
	} else {
		addTicket.value = true
	}
	if (process.sourceCode === '01' || process.targetCode === '01' || process.processTypeCd === '0002') {
		containShip.value = true
	} else {
		containShip.value = false
		//清空船舶相关数据
		trustOrderForm.value.shipName = ''
		trustOrderForm.value.shipVoyageName = ''
		trustOrderForm.value.shipvoyageId = ''
		trustOrderForm.value.shipvoyageItemId = ''
		trustOrderForm.value.shipInfo = {
			cargoCategoryName: '', //货种
			shipAgentName: '', //船代
			arrivalTimePlan: '', //预抵时间
			startPortName: '', //起运港
			endPortName: '', //目的港
		}
	}

	if (process.processTypeCd === '0002') {
		containCargo.value = false
	} else {
		containCargo.value = true
	}
}
// 重置表单
const resetForm = () => {
	ruleForm.value.resetFields()
	addTicket.value = true
	trustOrderForm.value = {
		companyId: '', //作业公司id
		trustType: '',
		shipVoyageName: '',
		companyName: '', //作业公司名称
		trustNo: '', //指令编号
		tradeType: '', //内外贸
		remark: '', //作业要求
		settlementBasisCode: '', //结算依据
		settlementBasisName: '', //结算依据
		shipvoyageId: '', //航次ID
		shipName: '', //船名
		processName: '', //作业过程名称
		processCode: '', //作业过程code
		shipInfo: {
			cargoCategoryName: '', //货种
			shipAgentName: '', //船代
			arrivalTimePlan: '', //预抵时间
			startPortName: '', //起运港
			endPortName: '', //目的港
		},
		cargoList: [], //货物信息
	}
}

// 清空校验
const validate = async () => {
	let flag = false
	let flag1 = true
	if (containCargo.value) {
		flag1 = await editTable.value.validAllEvent()
	}
	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag1) {
			flag = true
		} else if (!valid) {
			flag = false
			proxy.$message.warning('请完善表单信息！')
		} else {
			flag = false
		}
	})

	return flag
}

//选择票货信息
const ticketShow = ref(false)
const tickTableRef = ref()
// 添加票货按钮 点击回调
const chooseTicketInfo = () => {
	if (trustOrderForm.value.companyId && trustOrderForm.value.tradeType) {
		ticketShow.value = true
		nextTick(() => {
			tickTableRef.value.queryParams.companyId = trustOrderForm.value.companyId
			tickTableRef.value.queryParams.tradeType = trustOrderForm.value.tradeType
			tickTableRef.value.getList(tickTableRef.value.queryParams)
		})
	} else {
		proxy.$message.warning('请选择作业公司和贸别！')
		return
	}
}
// 保存选中的票货
const saveTicket = () => {
	// 判断是否选择票货
	if (tickTableRef.value.checkData.length < 1) {
		proxy.$message.warning('请选择票货！')
		return
	}
	// 筛选选中数据中 货物作业模式为散杂
	const changFilterData = tickTableRef.value.checkData.filter(item => {
		if (item.workType == '2') {
			return item
		}
	})
	// 筛选货物信息表格数据中 货物作业模式为散杂
	const listFilterData = trustOrderForm.value.cargoList.filter(item => {
		if (item.workType == '2') {
			return item
		}
	})
	console.log(trustOrderForm.value.cargoList, 'trustOrderForm.value.cargoList')

	// 判断选中数据中 是否有多条数据为散杂
	if (changFilterData.length > 1) {
		proxy.$message.warning('只能存在一条散杂货物！')
		return
	}
	// 判断选中数据和货物表格数据中 是否有多条数据为散杂
	if (changFilterData.length >= 1 && listFilterData.length >= 1) {
		proxy.$message.warning('只能存在一条散杂货物！')
		return
	}
	// 处理选中数据
	const changeData = tickTableRef.value.checkData.map(item => {
		const obj = {
			...item,
			isDisable: true,
		}
		return obj
	})
	// 筛选货物列表中有哪些数据是手动新增的
	const listData = trustOrderForm.value.cargoList.filter(item => {
		if (!item.isDisable) {
			return item
		}
	})

	trustOrderForm.value.cargoList = [...listData, ...changeData]
	ticketShow.value = false
}
//初始化下拉列表数据
initData()

defineExpose({
	validate,
	resetForm,
	isSource,
	trustOrderForm,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
