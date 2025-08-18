<!-- 作业指令新增编辑表单 -->
<template>
	<el-form :model="addReceiptForm" ref="ruleForm" label-width="120px" :rules="rules">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="基本信息" name="order">
				<el-row>
					<el-col :span="6">
						<el-form-item label="作业公司" prop="companyId">
							<Select
								:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
								v-model:value="addReceiptForm.companyId"
								v-model:label="addReceiptForm.companyName"
								placeholder="作业公司"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="付款人" prop="customerId">
							<div style="width: 100%">
								<RemoteSelect
									type="CUSTOMER_CARGO_OWNER"
									v-model:value="addReceiptForm.customerId"
									v-model:label="addReceiptForm.customerName"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="税务服务发票" prop="taxationInvoiceCode">
							<Select
								:dataConfig="{ params: { type: 'DICT', dictType: 'TAX_INVOICE' } }"
								v-model:value="addReceiptForm.taxationInvoiceCode"
								v-model:label="addReceiptForm.taxationInvoice"
								placeholder="请选择税务服务发票"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="发票号码" prop="invoiceCode">
							<el-input v-model="addReceiptForm.invoiceCode" placeholder="请输入发票号码" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="6">
						<el-form-item label="借方票据类型" prop="cndnBillTypeCode">
							<Select
								:dataConfig="{ params: { type: 'DICT', dictType: 'DNBILLTYPE' } }"
								v-model:value="addReceiptForm.cndnBillTypeCode"
								v-model:label="addReceiptForm.cndnBillTypeName"
								placeholder="请选择借方票据类型"
								@change="selectChange"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="系统发票编号" prop="sysInvoiceCode">
							<el-input
								v-model="addReceiptForm.sysInvoiceCode"
								placeholder="请输入系统发票编号"
								@change="sysInvoiceCodeChange"
								:disabled="selDis"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="冲销总额" prop="eliminateAmount">
							<el-input v-model="addReceiptForm.eliminateAmount" placeholder="请输入冲销总额" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="备注" prop="remark">
							<el-input
								v-model="addReceiptForm.remark"
								:autosize="{ minRows: 2, maxRows: 4 }"
								type="textarea"
								maxlength="100"
								show-word-limit
								placeholder="请输入备注"
							/>
						</el-form-item>
						<span class="dialog-footer">
							<div>
								<el-button type="primary" v-if="(addReceiptForm.cndnBillTypeCode=='')||(addReceiptForm.cndnBillTypeCode=='1')" @click.stop="queryList">查询</el-button>
								<el-button type="primary" v-if="(addReceiptForm.cndnBillTypeCode=='2')||(addReceiptForm.cndnBillTypeCode=='3')" @click.stop="addBill">新增事项</el-button>
							</div>
						</span>
					</el-col>
				</el-row>
			</el-collapse-item>

			<el-collapse-item name="cargo" v-if="infoShowFlag" title="修改/新增贷方票据">
				<BaseTable
					ref="editTable"
					:tableHeight="300"
					:tableColumns="tableColumns2"
					:tableData="tableData"
					:cellClickEvent="cellClickEvent"
					:loading="loading"
					:auto-resize="true"
				/>
			</el-collapse-item>

			<el-collapse-item name="cccc" v-if="addinfoShowFlag" title="少收款发票">
				<BaseTable
					ref="editTable"
					:tableHeight="300"
					:tableColumns="tableColumns"
					:tableData="addReceiptForm.detailList"
					:cellClickEvent="cellClickEvent"
					:loading="loading"
					:auto-resize="true"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>

	<el-drawer v-model="drawerVisible" :title="title" size="50%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="drawerVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>

	<el-drawer v-model="drawerVisible2" :title="title" size="50%">
		<addDetail ref="addDetailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="drawerVisible2 = false">取消</el-button>
				<el-button type="primary" @click="save2">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="addReceipt">
import EditTable from '@/components/EditTable/index.vue'
import detail from './detail/index.vue'
import addDetail from './addDetail/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const emit = defineEmits(['notShow'])

import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import { ElButton, ElTag } from 'element-plus'
import publicApi from '@/api/public/index'
import api from '@/api/finance/CNDNapi/index'
import BaseTable from '@/components/BaseTable/index.vue'
import math from '@/utils/math.js'

//form表单校验
const ruleForm = ref(null)
const tableData = ref([])
//弹出框校验
const ruleFormm = ref(null)
//弹出框
const dialogVisible = ref(false)
const editTable = ref(null)
const selDis = ref(false)
const selAmount = ref(false)
//发票详情数据
const addReceiptForm = reactive({
	id: '',
	companyName: '', //作业公司
	companyId: '', //作业公司id
	customerId: '', //付款人(客户名称code
	customerName: '', //付款人name(客户名称name
	taxationInvoiceCode: '', //税务发票类型
	taxationInvoice: '', //税务发票类型
	invoiceCode: '', //发票号码
	cndnBillTypeCode: '1', //借方票据类型
	cndnBillTypeName: '', //借方票据类型
	sysInvoiceCode: '', //系统发票号码
	eliminateAmount: '', //冲销金额
	remark: '', //备注
	detailList: [],
	cndnType: 2,
})
//表单验证
const rules = reactive({
	companyId: [{ required: true, message: '作业公司不能为空', trigger: 'blur' }],
	customerId: [{ required: true, message: '付款人不能为空', trigger: 'blur' }],
	taxationInvoiceCode: [{ required: true, message: '税务服务发票编号不能为空', trigger: 'blur' }],
	cndnBillTypeCode: [{ required: true, message: '贷方票据类型不能为空', trigger: 'blur' }],
	eliminateAmount: [{ required: true, message: '冲销金额不能为空', trigger: 'blur' }],
})
//折叠面板
const activeNames = ref(['order', 'cccc', 'cargo'])
//少收款发票
const tableColumns = reactive([
	{
		prop: 'serialNumber',
		label: '发票序号',
	},
	{
		prop: 'rateName',
		label: '发票项目概述',
	},
	{
		prop: 'mea',
		label: '数量',
    align: 'right',
	},
	{
		prop: 'unitName',
		label: '单位',
	},
	{
		prop: 'amount',
		label: '借方票据金额',
    align: 'right',
	},
	{
		prop: '',
		label: '操作',
		width: 150,
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
						permission: 'finance:paymentReceipt:check', // 权限
					},
					{
						default: () => '编辑',
					}
				),
			]
		},
	},
])
const tableColumns2 = reactive([
	{
		prop: 'serialNumber',
		label: '发票序号',
	},
	{
		prop: 'rateName',
		label: '发票项目概述',
	},
	{
		prop: 'mea',
		label: '数量',
	},
	{
		prop: 'unitName',
		label: '单位',
	},
	{
		prop: 'amount',
		label: '借方票据金额',
	},
	{
		prop: '',
		label: '操作',
		width: 150,
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit2(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'finance:paymentReceipt:check', // 权限
					},
					{
						default: () => '编辑',
					}
				),
			]
		},
	},
])
const buttonShowFlag = ref(true)
const infoShowFlag = ref(false)
const addinfoShowFlag = ref(false)
//借方票据类型改变事件
const selectChange = val => {
	addinfoShowFlag.value = false
	infoShowFlag.value = false
	if (!val) {
		buttonShowFlag.value = false
		selDis.value = false
		return
	}
	if (val.value == 1) {
		buttonShowFlag.value = true
		selDis.value = false
	}
	if (val.value == 2) {
		buttonShowFlag.value = false
		selDis.value = false
	}
	if (val.value == 3) {
		buttonShowFlag.value = false
		selDis.value = false
	}
}
const detailRef = ref() // 明细组件ref
const addDetailRef = ref() // 明细组件ref
const title = ref([])
const drawerVisible = ref(false)
const drawerVisible2 = ref(false)
//少收款发票  编辑
const edit = row => {
	title.value = '编辑'
  const editRow = row // 拿到所编辑行的数据
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
    detailRef.value.getRateList()
		proxy.setFormData(detailRef.value.formData, editRow)
	})
}
const edit2 = row => {
	title.value = '编辑'
  console.log('Edit2','edit2');

  const editRow = row // 拿到所编辑行的数据
	drawerVisible2.value = true
	nextTick(() => {
		addDetailRef.value.resetForm() // 清空事件
		addDetailRef.value.getRateList() // 清空事件
		if (editRow.invoiceDetailId == null || editRow.invoiceDetailId == '') {
			editRow.invoiceDetailId = tableData.value.length + 1
		}
		proxy.setFormData(addDetailRef.value.formData, editRow)
	})
}
// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(() => {
			let tmpRow = detailRef.value.formData
      console.log(tmpRow.numberCount2,"tmpRow.numberCount2");
      addReceiptForm.detailList.forEach(item => {
				if (item.invoiceDetailId == tmpRow.invoiceDetailId) {
					item.newRate = tmpRow.newRate
					item.oldRate = tmpRow.oldRate
					item.cargoCode = tmpRow.cargoCode
					item.amount = tmpRow.amount
					item.taxRate = tmpRow.taxRate
					item.mea = tmpRow.mea
					item.unitName = tmpRow.unitName
					item.unitCode = tmpRow.unitCode
					item.taxAmount = tmpRow.taxAmount
					item.remark = tmpRow.remark
          item.cargoCode = tmpRow.cargoCode
          item.rateId = tmpRow.rateId
          let tmpRateName= ''
          detailRef.value.rateList.forEach(tmpItem => {if(tmpItem.id= item.rateId) tmpRateName = tmpItem.rateItemName})
          item.rateName = tmpRateName?tmpRateName:tmpRow.rateName
          item.numberCount2 = tmpRow.numberCount2
        }
			})
			drawerVisible.value = false
		})
	}
}
const save2 = async () => {
	if (await addDetailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(() => {
			if (title.value == '修改/新增贷方票据') {
				tableData.value.push(JSON.parse(JSON.stringify(addDetailRef.value.formData)))
				for (let i = 0; i < tableData.value.length; i++) {
					tableData.value[i].serialNumber = i + 1
				}
			} else {
				let tmpRow = JSON.parse(JSON.stringify(addDetailRef.value.formData))
				tableData.value.forEach(item => {
					if (item.invoiceDetailId == tmpRow.invoiceDetailId) {
						item.newRate = tmpRow.newRate
						item.oldRate = tmpRow.oldRate
						item.cargoCode = tmpRow.cargoCode
						item.amount = tmpRow.amount
						item.taxRate = tmpRow.taxRate
						item.mea = tmpRow.mea
						item.unitName = tmpRow.unitName
						item.unitCode = tmpRow.unitCode
						item.taxAmount = tmpRow.taxAmount
						item.remark = tmpRow.remark
						item.cargoCode = tmpRow.cargoCode
            item.rateId = tmpRow.rateId
            item.rateName = tmpRow.rateName
            item.numberCount2 = tmpRow.numberCount2
					}
				})
			}

			drawerVisible2.value = false
		})
	}
}

//新增事项
const addBill = () => {
	if (addReceiptForm.customerId == '' || addReceiptForm.companyId == '' || addReceiptForm.eliminateAmount == '') {
		proxy.$message.warning('请选择作业公司、付款人和冲销金额！')
	} else {
		title.value = '修改/新增贷方票据'
		selAmount.value = true
		drawerVisible2.value = true
		addinfoShowFlag.value = false
		infoShowFlag.value = true
    addReceiptForm.detailList = []
    tableData.value = []
		nextTick(() => {
			addDetailRef.value.resetForm() // 清空事件
		})
	}
}

//查询
const queryList = () => {
	if (addReceiptForm.customerId == '' || addReceiptForm.sysInvoiceCode == '') {
		proxy.$message.warning('请选择系统发票号码和付款人！')
	} else {
		selAmount.value = true
		addinfoShowFlag.value = true
		infoShowFlag.value = false
		api.queryList({
			customerId: addReceiptForm.customerId,
			sysInvoiceCode: addReceiptForm.sysInvoiceCode,
			cndnType: addReceiptForm.cndnType,
      cndnBillTypeCode: addReceiptForm.cndnBillTypeCode
    }).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('查询成功')
				addReceiptForm.detailList = res.data
			}
		})
	}
}
const sysInvoiceCodeChange = () => {
  if(addReceiptForm.sysInvoiceCode==''){
    return;
  }
  let params= {
    sysInvoiceCode: addReceiptForm.sysInvoiceCode,
    cndnType: addReceiptForm.cndnType ,
    cndnBillTypeCode:addReceiptForm.cndnBillTypeCode
  }
	api.queryList(params).then(res => {
		if (res.code === '0000') {
			const resData = res.data
			resData.forEach(item => {
				addReceiptForm.companyName = item.companyName
				addReceiptForm.companyId = item.companyId
				addReceiptForm.customerId = item.customerId
				addReceiptForm.customerName = item.customerName
				addReceiptForm.eliminateAmount = item.eliminateAmount
			})
		}
	})
}

const initData = () => {}

// 重置表单
const resetForm = () => {
  addReceiptForm.id = ''
  addReceiptForm.companyName= '', //作业公司
  addReceiptForm.companyId= '', //作业公司id
  addReceiptForm.customerId= '', //付款人(客户名称code
  addReceiptForm.customerName= '', //付款人name(客户名称name
  addReceiptForm.taxationInvoiceCode= '', //税务发票类型
  addReceiptForm.taxationInvoice= '', //税务发票类型
  addReceiptForm.invoiceCode= '', //发票号码
  addReceiptForm.cndnBillTypeCode= '1', //贷方票据类型
  addReceiptForm.cndnBillTypeName= '', //贷方票据类型
  addReceiptForm.sysInvoiceCode= '', //系统发票号码
  addReceiptForm.eliminateAmount= '', //冲销金额
  addReceiptForm.remark= '', //备注
  addReceiptForm.detailList= [],
  addReceiptForm.cndnType= 2,
  tableData.value = []
	// formData.id = ''
	ruleForm.value.resetFields()
}

// 清空校验
const validate = async () => {
	let flag = false
	let flag1 = true
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

//初始化下拉列表数据
initData()

defineExpose({
	validate,
	resetForm,
	addReceiptForm,
	tableData,
	addinfoShowFlag,
	infoShowFlag,
	selAmount,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
