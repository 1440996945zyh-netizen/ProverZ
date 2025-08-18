<!-- 查看付款收据表单 -->
<template>
	<el-form :model='trustOrderForm' ref='ruleForm' label-width='120px' :rules='rules'  >
		<el-collapse v-model='activeNames'>
			<el-collapse-item title='付款收据详情' name='order'>
				<el-row>
					<el-col :span='8'>
			  <el-form-item label='作业公司' prop='companyId' >
				  <Select
					  :dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
					  v-model:value='trustOrderForm.companyId'
					  v-model:label='trustOrderForm.companyName'
					  placeholder='作业公司'
            disabled
				  />
			  </el-form-item>
					</el-col>
					<el-col :span='8'>
			      <el-form-item label='付款人名称' prop='customerId'>
              <div style='width: 100%'>
                <RemoteSelect
                  type='CUSTOMER_CARGO_OWNER'
                  v-model:value='trustOrderForm.customerId'
                  v-model:label='trustOrderForm.customerName'
                  disabled
                />
              </div>
			      </el-form-item>
					</el-col>
					<el-col :span='8'>
            <el-form-item label='系统票据编号' prop='cndnCode'>
              <el-input  v-model="trustOrderForm.cndnCode"  disabled />
            </el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span='8'>
			  <el-form-item label='票据号码' prop='invoiceCode'>
				  <el-input  v-model="trustOrderForm.invoiceCode" disabled />
			  </el-form-item>
					</el-col>
					<el-col :span='8'>
            <el-form-item label='总额' prop='eliminateAmount'>
              <el-input  v-model="trustOrderForm.eliminateAmount" disabled />
            </el-form-item>
					</el-col>
          <el-col :span='8'>
            <el-form-item label='关联发票编号' prop='sysInvoiceCode'>
              <el-input  v-model="trustOrderForm.sysInvoiceCode" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span='8'>
            <el-form-item label='创建人' prop='createByName'>
              <el-input  v-model="trustOrderForm.createByName"  disabled/>
            </el-form-item>
          </el-col>
          <el-col :span='8'>
            <el-form-item label='开具日期' prop='cndnTime'>
              <el-input  v-model="trustOrderForm.cndnTime"  disabled/>
            </el-form-item>
          </el-col>
					<el-col :span='8'>
						<el-form-item label='备注' prop='remark'>
							<el-input
								v-model='trustOrderForm.remark'
								:autosize='{ minRows: 2, maxRows: 4 }'
								type='textarea'
								maxlength='100'
								show-word-limit
								placeholder='请输入备注'
                disabled
							/>
						</el-form-item>
					</el-col>
				</el-row>
				<BaseTable
					ref='editTable'
					:tableHeight='300'
					:tableColumns='tableColumns'
					:tableData='trustOrderForm.detailList'
					:editRules='editRules'
          :auto-resize='true'
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>


</template>

<script setup name='editTrustOrder'>
import EditTable from '@/components/EditTable/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import { ElButton, ElTag } from 'element-plus'

import api from '@/api/finance/CNDNapi/index'

const ruleForm = ref(null)

const containCargo = ref(true)

const editTable = ref(null)


//发票详情数据
const trustOrderForm = ref({
	id: '',
	debtorpaymentNo: '',//付款收据编号
	customerId: '',//付款人(客户名称code
	customerName: '',//付款人name(客户名称name
	fileTime: '', //付款文件日期
	status: '', //状态
	createByName: '', //付款收据创建人
	remark: '', //备注
	cndnCode: '',//系统票据编号
	cndnTime: '',//开具日期
	sysInvoiceCode: '',//关联发票编号
  eliminateAmount: '',//总额
	invoiceCode: '',//票据号码
  detailList:[],
})

//折叠面板
const activeNames = ref(['order',])

const tableColumns = reactive([
	{
		prop: 'rateName',
		label: '费率名称',
	},
	{
		prop: 'oldRate',
		label: '费率值',

	},
	{
		prop: 'newRate',
		label: '新费率',
	},
  {
    prop: 'cargoName',
    label: '货物名称',
  },
  {
    prop: 'mea',
    label: '数量1',
    align: 'right',
  },
  {
    prop: 'numberCount2',
    label: '数量2',
    align: 'right',
  },
  {
    prop: 'unitName',
    label: '单位1',
  },
  {
    prop: 'amount',
    label: '贷方票据金额',
    align: 'right',
  },
  {
    prop: 'taxRate',
    label: '税率(*100)',
    align: 'right',
  },
  {
    prop: 'taxAmount',
    label: '税额',
    align: 'right',
  }
])

const initData = () => {

}


// 重置表单
const resetForm = () => {
	ruleForm.value.resetFields()
	trustOrderForm.value = {
		id: '',
		sysInvoiceCode: '',//系统发票编号（发票编号）
		invoiceCode: '', //税务发票编号
		companyName: '', //作业公司
		companyId: '', //作业公司id
		customerId: '',//付款人(客户名称code
		customerName: '',//付款人name(客户名称name
		invoiceTypeCode: '', //发票类型code
		invoiceTypeName: '', //发票类型name
		taxationInvoice: '', //税务服务发票（字典TAX_INVOICE
		taxationInvoiceCode: '', //税务服务发票编号
		invoiceTime: '', //开票日期
		remark: '', //备注
		fileIds: [],//上传
		receiptList: [] //结算单明细信息
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


//初始化下拉列表数据
initData()

defineExpose({
	validate,
	resetForm,
	trustOrderForm,
})
</script>

<style lang='scss' scoped>
@import '@/assets/styles/formData.scss';
</style>
