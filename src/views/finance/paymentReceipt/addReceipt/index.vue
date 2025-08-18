<!-- 付款收据新增表单 -->
<template>
	<el-form :model='addReceiptForm' ref='ruleForm' label-width='120px' :rules='rules'  >
		<el-collapse v-model='activeNames'>
			<el-collapse-item title='基本信息' name='order'>
				<el-row>
					<el-col :span='8'>
						<el-form-item label='作业公司' prop='companyId'>
							<Select
								:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
								v-model:value='addReceiptForm.companyId'
								v-model:label='addReceiptForm.companyName'
								placeholder='作业公司'
							/>
						</el-form-item>
					</el-col>
					<el-col :span='8'>
						<el-form-item label='付款人' prop='customerId'>
							<div style='width: 100%'>
								<RemoteSelect
									type='CUSTOMER_PASS'
									v-model:value='addReceiptForm.customerId'
									v-model:label='addReceiptForm.customerName'
								/>
							</div>
						</el-form-item>
					</el-col>
          <el-col :span='8'>
            <el-form-item label='对账类型' prop='prepaymentTypeCode'>
              <Select
                :dataConfig="{ params: { type: 'DICT', dictType: 'PREPAYMENT_TYPE' } }"
                v-model:value="addReceiptForm.prepaymentTypeCode"
                v-model:label="addReceiptForm.prepaymentTypeName"
                placeholder="对账类型"
              />
            </el-form-item>
          </el-col>
				</el-row>
				<el-row>
					<el-col :span='8'>
						<el-form-item label='开具日期' prop='debtorpaymentTime'>
							<el-date-picker
                disabled
								v-model='addReceiptForm.debtorpaymentTime'
								type='date'
								:default-value='addReceiptForm.debtorpaymentTime'
								placeholder='选择日期'>
							</el-date-picker>
						</el-form-item>
					</el-col>
          <el-col :span='8' v-if="addReceiptForm.prepaymentTypeCode == '10'">
            <el-form-item  label='票货号' prop='cargoInfoId'>
              <div style='width: 100%'>
                <RemoteSelect
                  type='CARGO_INFO_NO'
                  v-model:value='addReceiptForm.cargoInfoId'
                  v-model:label='addReceiptForm.cargoInfoNo'
                />
              </div>
            </el-form-item>
          </el-col>
					<el-col :span='8'>
						<el-form-item label='备注' prop='remark'>
							<el-input
								v-model='addReceiptForm.remark'
								:autosize='{ minRows: 2, maxRows: 4 }'
								type='textarea'
								maxlength='100'
								show-word-limit
								placeholder='请输入备注'
							/>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>

			<el-collapse-item name='cargo'>
				<template v-slot:title>
					<div style='display: flex; justify-content: space-between; width: 95%'>
						<div>未付款的交易</div>
            <div>
				<span>发票金额：{{invoiceAmountSum}}  </span>
				<span>       预缴金额：{{PrepayAmountSum}}  </span>
				<span>       退回金额：{{backAmountSum}}  </span>
              <el-button  type='primary' @click.stop='queryList'>查询</el-button>
              <el-button  type='primary' @click.stop='confirm'>确认</el-button>
            </div>
					</div>
				</template>

        <div class="content">
          <div class="in">
            <BaseTable
              ref='editTable'
              :tableHeight="'drawerHeaderPageTableHeight'"
              :tableColumns='tableColumns'
              :tableData='addReceiptForm.receiptInvoiceList'
              :cellClickEvent="cellClickEvent"
              :loading="loading"
              :auto-resize='true'
              :checkbox-config="checkboxConfig"
              @checkbox-change="checkboxInvoiceChange"
              :selectAllChangeEvent="selectAllInvoiceChangeEvent"
              :syncResize="true"
            />
          </div>
          <div class="out">
            <BaseTable
              ref='editTable'
              :tableHeight="'drawerHeaderPageTableHeight'"
              :tableColumns='tableYJColumns'
              :tableData='addReceiptForm.receiptYJList'
              :cellClickEvent="cellClickEvent"
              :loading="loading"
              :auto-resize='true'
              :checkbox-config="checkboxConfig"
              @checkbox-change="checkboxYJChange"
              :selectAllChangeEvent="selectAllYJChangeEvent"
              :syncResize="true"
            />
          </div>
        </div>
<!--				<BaseTable
					ref='editTable'
					:tableHeight='300'
					:tableColumns='tableColumns'
					:tableData='addReceiptForm.receiptAllList'
          :cellClickEvent="cellClickEvent"
          :loading="loading"
          :auto-resize='true'
          :checkbox-config="checkboxConfig"
          @checkbox-change="checkboxChange"
          :selectAllChangeEvent="selectAllChangeEvent"
				/>-->
			</el-collapse-item>
		</el-collapse>

<!--    付款收据弹窗-->
    <el-dialog
      v-model="dialogVisible"
      title="提示"
      width="30%"
    >
      <el-form :model="addReceiptForm.formDataDo" ref="ruleFormm" label-width="100px" :rules="rules">
        <el-form-item label="付款类型" prop="debtorpayPaymentTypeCode">
          <Select
          :selectData="paymentTypeList"
          :selectLabel="'label'"
          :selectValue="'value'"
          v-model:value="addReceiptForm.formDataDo.debtorpayPaymentTypeCode"
          v-model:label="addReceiptForm.formDataDo.debtorpayPaymentTypeName"
          @change="payMethodChange"
          placeholder="请选择付款类型"/>
        </el-form-item>
        <el-form-item label="付款方式" prop="paymentMethodCode">
          <Select
            :dataConfig="{ params: { type: 'DICT', dictType: 'BANK_PAY_METHOD' } }"
            v-model:value="addReceiptForm.formDataDo.paymentMethodCode"
            v-model:label="addReceiptForm.formDataDo.paymentMethodName"
            @change="payMethodChange"
            placeholder="请选择付款方式"/>
        </el-form-item>
        <el-form-item label="付款银行" prop="paymentMethodCode" v-show="bankShow">
          <el-input v-model="addReceiptForm.formDataDo.bankType" :disabled="true" placeholder="付款银行信息" />
        </el-form-item>
        <el-form-item label="付款文件号码" prop="fileNo">
          <el-input v-model="addReceiptForm.formDataDo.fileNo"  placeholder="请输入付款文件号码" />
        </el-form-item>
        <el-form-item label='付款文件日期' prop='fileTime'>
          <el-date-picker
            v-model='addReceiptForm.formDataDo.fileTime'
            type='date'
            :default-value='addReceiptForm.formDataDo.fileTime'
            placeholder='选择日期'>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="支付金额" prop="invoicePrepayAmount">
          <el-input :disabled="addReceiptForm.formDataDo.debtorpayPaymentTypeCode!='30'"
                    v-model="addReceiptForm.repayAmount"  placeholder="请输入金额" />
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDia">关闭</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
      </template>
    </el-dialog>
	</el-form>
</template>

<script setup name='addReceipt'>
import EditTable from '@/components/EditTable/index.vue'
// import tickTable from './tickTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const emit = defineEmits(['notShow',])

import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import { ElButton, ElTag } from 'element-plus'
import publicApi from '@/api/public/index'
import api from '@/api/finance/paymentReceipt/index'
import BaseTable from '@/components/BaseTable/index.vue'
import math from '@/utils/math.js'

//form表单校验
const ruleForm = ref(null)
//弹出框校验
const ruleFormm = ref(null)
//弹出框
const dialogVisible = ref(false)

const containCargo = ref(true)

const editTable = ref(null)
//发票金额计算(type=1)
const invoiceAmountSum = ref(0)

//预缴金额计算(type=2)
const PrepayAmountSum = ref(0)

//退回金额
const backAmountSum = ref(0)
const paymentTypeList = ref([])

const paymentTypeListDefault  = ref([
  {
    "label": "补缴",
    "value": "20"
  },
  {
    "label": "退回",
    "value": "30"
  },
  {
    "label": "预缴",
    "value": "10"
  },
  {
    "label": "平账",
    "value": "40"
  }
])

const paymentTypeListLt0 = ref([
  {
    "label": "补缴",
    "value": "20"
  },
  {
    "label": "平账",
    "value": "40"
  }
])
const paymentTypeListRt0 = ref([
  {
    "label": "退回",
    "value": "30"
  },
  {
    "label": "预缴",
    "value": "10"
  },
])


//付款收据信息
const addReceiptForm = reactive({
	id: '',
	companyName: '', //作业公司
	companyId: '', //作业公司id
	customerId: '',//付款人(客户名称code
	customerName: '',//付款人name(客户名称name
	debtorpaymentTime: '', //开票日期
	remark: '', //备注
  cargoInfoId: '', //票货id
  cargoInfoNo: '', //票货号
  receiptAllList: [],//未付款交易明细信息
  receiptInvoiceList: [],//发票
  receiptYJList: [],//预缴
  receiptList:[],//未付款选择的数据
  prepaymentTypeCode:'',//对账类型
  prepaymentTypeName:'',//对账类型
  repayAmount:'',//临时记录金额
  //预缴，退款，生成的数据
	formDataDo:{
		id:'',
		debtorpayPaymentTypeCode:'',//付款类型code
		debtorpayPaymentTypeName:'',//付款类型name
		paymentMethodCode:'',//付款方式code
		paymentMethodName:'',//付款方式name
		fileNo:'',//付款文件号码
		fileTime:'',//付款文件时间
		invoicePrepayAmount:'',//支付金额
    bankType:'',//显示的付款银行信息
    bankName:'',//付款银行名称
    bankId:'',//付款银行ID
	}
})
const bankShow  = ref(false)

//付款方式改变事件
const payMethodChange = () =>{
  // console.log(addReceiptForm.companyId," addReceiptForm.companyId");
  // console.log(addReceiptForm.formDataDo.paymentMethodCode,"addReceiptForm.formDataDo.paymentMethodCode");
  // console.log(addReceiptForm.formDataDo.debtorpayPaymentTypeCode,"付款类型");
  if(addReceiptForm.formDataDo.paymentMethodCode ===undefined || addReceiptForm.formDataDo.paymentMethodCode == ''){
    console.log("close1");
    return
  }
  if(addReceiptForm.formDataDo.debtorpayPaymentTypeCode ===undefined || addReceiptForm.formDataDo.debtorpayPaymentTypeCode == ''){
    console.log("close12");

    return
  }
  if(addReceiptForm.companyId ===undefined || addReceiptForm.companyId == ''){
    proxy.$message.error("没有作业公司Id！")
    return;
  }
  let tmpPayTypeCode  = ''
  if(addReceiptForm.formDataDo.debtorpayPaymentTypeCode == '10'){
    tmpPayTypeCode = '1'
  }else if(addReceiptForm.formDataDo.debtorpayPaymentTypeCode == '20'){
    tmpPayTypeCode = '2'
  }else if(addReceiptForm.formDataDo.debtorpayPaymentTypeCode == '30'){
    tmpPayTypeCode = '1'
  }else{
    tmpPayTypeCode  = ''
  }
  api.getBankList({
    companyId: addReceiptForm.companyId,
    paymentMethodCode: addReceiptForm.formDataDo.paymentMethodCode,
    paymentTypeCode: tmpPayTypeCode })
    .then(res => {
      let tmpResult  = []
      tmpResult = res.data.pages
      console.log(tmpResult.length,"返回的长度");
      if(tmpResult.length > 0){

        addReceiptForm.formDataDo.bankType = tmpResult[0].bankName+ '(' + tmpResult[0].bankId + ')'
        addReceiptForm.formDataDo.bankName = tmpResult[0].bankName
        addReceiptForm.formDataDo.bankId = tmpResult[0].bankId

        bankShow.value = true
      }else {
        addReceiptForm.formDataDo.bankName = ''
        addReceiptForm.formDataDo.bankId = ''
        addReceiptForm.formDataDo.bankType = ''
        bankShow.value = false;
      }
    })
}

//表单验证
const rules = reactive({
	companyId: [{ required: true, message: '作业公司不能为空', trigger: 'blur' }],
	customerId: [{ required: true, message: '付款人不能为空', trigger: 'blur' }],
	invoiceTypeCode: [{ required: true, message: '发票类型不能为空', trigger: 'blur' }],
	invoiceCode: [{ required: true, message: '发票类型不能为空', trigger: 'blur' }],
	taxationInvoiceCode: [{ required: true, message: '税务服务发票编号不能为空', trigger: 'blur' }],
	debtorpaymentTime: [{ required: true, message: '开票日期不能为空', trigger: 'blur' }],
	taxationInvoice: [{ required: true, message: '作业依据不能为空', trigger: 'blur' }]
})
//折叠面板
const activeNames = ref(['order', 'ship', 'cargo'])

const tableColumns = reactive([
  { label: '', type: 'checkbox', width: 50,fixed: "left" },
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
		prop: 'sysInvoicePrepayNo',
		label: '系统编号',
    width: 130
  },
	{
		prop: 'invoicePrepayNo',
		label: '编号',
    width: 150
  },
  {
    prop: 'cargoInfoNo',
    label: '票货号',
    width: 150
  },
	{
		prop: 'invoicePrepayTime',
		label: '开具日期',
    width: 150
  },
	{
		prop: 'customerName',
		label: '客户名称',
    width: 180
  },
	{
		prop: 'invoicePrepayAmount',
		label: '支付金额',
    isThousandth:'true',
    width: 150,
    fixed:"right",
  },
  {
		prop: 'hasNotReceiptAmount',
		label: '未作付款收据金额',
    isThousandth:'true',
    width: 150,
    fixed:"right",
  },
	{
		prop: 'remark',
		label: '备注',
    width: 150
  },
])
const tableYJColumns = reactive([
  { label: '', type: 'checkbox', width: 50,fixed: "left" },
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
		prop: 'sysInvoicePrepayNo',
		label: '系统编号',
    width: 130
  },
	{
		prop: 'cargoInfoNo',
		label: '票货号',
    width: 150
  },
	{
		prop: 'invoicePrepayTime',
		label: '开具日期',
    width: 150
  },
	{
		prop: 'customerName',
		label: '客户名称',
    width: 180
  },
	{
		prop: 'invoicePrepayAmount',
		label: '支付金额',
    isThousandth:'true',
    width: 150,
    fixed:"right",

  },
	{
		prop: 'remark',
		label: '备注',
    width: 150
  },
])
//选择作业公司付款人 队长类型之后的查询
const queryList = () => {
  invoiceAmountSum.value = 0 ;
  PrepayAmountSum.value = 0;
  backAmountSum.value = 0;
  checkData.value = [] ;

  addReceiptForm.formDataDo.invoicePrepayAmount=''//支付金额
  if(addReceiptForm.prepaymentTypeCode == '10'){
    if(addReceiptForm.companyId=='' || addReceiptForm.customerId=='' || addReceiptForm.debtorpaymentTime=='' || addReceiptForm.prepaymentTypeCode==''  ){
      proxy.$message.warning('请选择作业公司、付款人、对账类型和开具日期！')
    }else{
      api.queryList({companyId:addReceiptForm.companyId,customerId:addReceiptForm.customerId,prepaymentTypeCode:addReceiptForm.prepaymentTypeCode,cargoInfoId:addReceiptForm.cargoInfoId }).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('查询成功')
          addReceiptForm.receiptInvoiceList=res.data.filter(x=>x.type =='1' || x.type == '4')
          addReceiptForm.receiptYJList=res.data.filter(x=>x.type =='2' || x.type == '3')
        }
      })
    }
  }else{
    if(addReceiptForm.companyId=='' || addReceiptForm.customerId=='' || addReceiptForm.debtorpaymentTime=='' || addReceiptForm.prepaymentTypeCode=='' ){
      proxy.$message.warning('请选择作业公司、付款人、对账类型和开具日期！')
    }else{
      api.queryList({companyId:addReceiptForm.companyId,customerId:addReceiptForm.customerId,prepaymentTypeCode:addReceiptForm.prepaymentTypeCode }).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('查询成功')
          addReceiptForm.receiptInvoiceList=res.data.filter(x=>x.type =='1' || x.type == '4')
          addReceiptForm.receiptYJList=res.data.filter(x=>x.type =='2' || x.type == '3')
        }
      })
    }
  }
}
// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 	开启复选框范围选择功能
	visibleMethod: ({}) => {
		// 返回显示的单选框
		return true
	},
	checkMethod: ({}) => {
		// 返回可选的单选框
		return true
	},
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}

// 复选框选中
const checkData = ref([]) //预缴
const checkInvoiceData = ref([]) //发票
//多选框改变事件
const checkboxYJChange = res => {
	checkData.value = res
  PrepayAmountSum.value = 0;
	backAmountSum.value = 0;
  const data = JSON.parse(JSON.stringify(checkData.value))
  if(data.length != 0){
    data.forEach(item=>{
      if(item.type =='2' ){
        PrepayAmountSum.value = math.numAdd(PrepayAmountSum.value, item.invoicePrepayAmount).toFixed(2)
        item.flag=1
      }
      if (item.type =='3'){
        PrepayAmountSum.value = math.numAdd(PrepayAmountSum.value, item.invoicePrepayAmount).toFixed(2)
      }
      backAmountSum.value = math.numSub( PrepayAmountSum.value,invoiceAmountSum.value).toFixed(2)
    })
  }else{
    backAmountSum.value = math.numSub( PrepayAmountSum.value,invoiceAmountSum.value).toFixed(2)
  }
	if(backAmountSum.value<0){
		addReceiptForm.formDataDo.invoicePrepayAmount = backAmountSum.value.replace("-",'')
	}else {
		addReceiptForm.formDataDo.invoicePrepayAmount = backAmountSum.value
	}
}

//全选事件
const selectAllYJChangeEvent = res => {
  checkData.value = res.records
  PrepayAmountSum.value = 0;
  backAmountSum.value = 0;
  const data = JSON.parse(JSON.stringify(checkData.value))
  if(data.length != 0){
    data.forEach(item=>{
      if(item.type =='2' ){
        PrepayAmountSum.value = math.numAdd(PrepayAmountSum.value, item.invoicePrepayAmount).toFixed(2)
        item.flag=1
      }
      if (item.type =='3'){
        PrepayAmountSum.value = math.numAdd(PrepayAmountSum.value, item.invoicePrepayAmount).toFixed(2)
      }
      backAmountSum.value = math.numSub( PrepayAmountSum.value,invoiceAmountSum.value).toFixed(2)
    })
  }else{
    backAmountSum.value = math.numSub( PrepayAmountSum.value,invoiceAmountSum.value).toFixed(2)
  }
  if(backAmountSum.value<0){
    addReceiptForm.formDataDo.invoicePrepayAmount = backAmountSum.value.replace("-",'')

  }else {
    addReceiptForm.formDataDo.invoicePrepayAmount = backAmountSum.value
  }
}

//发票多选框改变事件
const checkboxInvoiceChange = res => {
  checkInvoiceData.value = res
  invoiceAmountSum.value = 0 ;
	backAmountSum.value = 0;
  const data = JSON.parse(JSON.stringify(checkInvoiceData.value))
  if(data.length != 0){
    data.forEach(item=>{
      if (item.type =='1'){
        invoiceAmountSum.value = math.numAdd(invoiceAmountSum.value, item.hasNotReceiptAmount).toFixed(2)
      }
      if (item.type =='4'){
        invoiceAmountSum.value = math.numAdd(invoiceAmountSum.value, item.hasNotReceiptAmount).toFixed(2)
      }
      backAmountSum.value = math.numSub( PrepayAmountSum.value,invoiceAmountSum.value).toFixed(2)
    })
  }else{
    backAmountSum.value = math.numSub( PrepayAmountSum.value,invoiceAmountSum.value).toFixed(2)
  }
	if(backAmountSum.value<0){
		addReceiptForm.formDataDo.invoicePrepayAmount = backAmountSum.value.replace("-",'')
	}else {
		addReceiptForm.formDataDo.invoicePrepayAmount = backAmountSum.value
	}
}

//发票全选事件
const selectAllInvoiceChangeEvent = res => {
  checkInvoiceData.value = res.records
	invoiceAmountSum.value = 0 ;
	backAmountSum.value = 0;
	const data = JSON.parse(JSON.stringify(checkInvoiceData.value))
  if(data.length != 0){
    data.forEach(item=>{
      if (item.type =='1'){
        invoiceAmountSum.value = math.numAdd(invoiceAmountSum.value, item.hasNotReceiptAmount).toFixed(2)
      }
      if (item.type =='4'){
        invoiceAmountSum.value = math.numAdd(invoiceAmountSum.value, item.hasNotReceiptAmount).toFixed(2)
      }
      backAmountSum.value = math.numSub( PrepayAmountSum.value,invoiceAmountSum.value).toFixed(2)
    })
  }else{
    backAmountSum.value = math.numSub( PrepayAmountSum.value,invoiceAmountSum.value).toFixed(2)
  }
	if(backAmountSum.value<0){
		addReceiptForm.formDataDo.invoicePrepayAmount = backAmountSum.value.replace("-",'')

	}else {
		addReceiptForm.formDataDo.invoicePrepayAmount = backAmountSum.value
	}
}

//付款收据确认 退还事件
const confirm = () => {
	const changeData = JSON.parse(JSON.stringify(checkData.value))
	addReceiptForm.receiptList = changeData
	addReceiptForm.receiptList.push(...checkInvoiceData.value)
  console.log(addReceiptForm.receiptList.length)
	if(addReceiptForm.receiptList == null || addReceiptForm.receiptList.length == 0  ){
		proxy.$message.error("请选择未付款的交易！！")
		return
	}

  //清空弹出框值
  addReceiptForm.formDataDo.id=''
  addReceiptForm.formDataDo.debtorpayPaymentTypeCode=''//付款类型code
  addReceiptForm.formDataDo.debtorpayPaymentTypeName=''//付款类型name
  addReceiptForm.formDataDo.paymentMethodCode=''//付款方式code
  addReceiptForm.formDataDo.paymentMethodName=''//付款方式name
  addReceiptForm.formDataDo.fileNo=''//付款文件号码
  addReceiptForm.formDataDo.fileTime=''//付款文件时间

  addReceiptForm.formDataDo.bankType=''//显示的付款银行信息
  addReceiptForm.formDataDo.bankName=''//付款银行名称
  addReceiptForm.formDataDo.bankId=''//付款银行ID
  bankShow.value = false;

  //设置付款收据做退还得时候得金额
  addReceiptForm.repayAmount = addReceiptForm.formDataDo.invoicePrepayAmount
  //收据类型下拉框数据处理+赋默认值
  if(backAmountSum.value > 0){
    paymentTypeList.value = paymentTypeListRt0.value
    addReceiptForm.formDataDo.debtorpayPaymentTypeCode='10'//付款类型code
    addReceiptForm.formDataDo.debtorpayPaymentTypeName='预缴'//付款类型name
    dialogVisible.value=true
  }else if(backAmountSum.value < 0){
    console.log("checkInvoiceData.value.length",checkInvoiceData.value.length)
    if(checkInvoiceData.value.length>1){
      proxy.$message.error("收据金额小于零,发票只能选择一个")
      return;
    }
    dialogVisible.value=true
    paymentTypeList.value = paymentTypeListLt0.value
    addReceiptForm.formDataDo.debtorpayPaymentTypeCode='40'//付款类型code
    addReceiptForm.formDataDo.debtorpayPaymentTypeName='平账'//付款类型name
  }else if(backAmountSum.value ==0){
    save( true )
  }else{
    proxy.$message.error("获取平账金额失败")
    return;
  }
}
//弹出框保存
const save =async  (flag) => {
  if(flag){
    //进行保存
    nextTick(() => {
      api.add(addReceiptForm)
        .then(res => {
          nextTick(() => {
            emit('notShow',)
            dialogVisible.value =false
            proxy.$modal.msgSuccess(res.msg)
          })
        })
        .catch(err => {
        })
      addReceiptForm.formDataDo.id=''
      addReceiptForm.formDataDo.debtorpayPaymentTypeCode=''
      addReceiptForm.formDataDo.debtorpayPaymentTypeName=''
      addReceiptForm.formDataDo.paymentMethodCode=''
      addReceiptForm.formDataDo.paymentMethodName=''
      addReceiptForm.formDataDo.fileNo=''
      addReceiptForm.formDataDo.fileTime=''
    })
  }else{
    if (await ruleFormm.value.validate()) {
      //进行保存
      nextTick(() => {
        api.add(addReceiptForm)
          .then(res => {
            nextTick(() => {
              emit('notShow',)
              dialogVisible.value =false
              proxy.$modal.msgSuccess(res.msg)
            })
          })
          .catch(err => {
          })
        addReceiptForm.formDataDo.id=''
        addReceiptForm.formDataDo.debtorpayPaymentTypeCode=''
        addReceiptForm.formDataDo.debtorpayPaymentTypeName=''
        addReceiptForm.formDataDo.paymentMethodCode=''
        addReceiptForm.formDataDo.paymentMethodName=''
        addReceiptForm.formDataDo.fileNo=''
        addReceiptForm.formDataDo.fileTime=''
      })

    }
  }

}

const initData = () => {
  addReceiptForm.debtorpaymentTime = new Date()
}
const closeDia = () => {
  dialogVisible.value =false
  addReceiptForm.formDataDo.id=''
  addReceiptForm.formDataDo.debtorpayPaymentTypeCode=''
  addReceiptForm.formDataDo.debtorpayPaymentTypeName=''
  addReceiptForm.formDataDo.paymentMethodCode=''
  addReceiptForm.formDataDo.paymentMethodName=''
  addReceiptForm.formDataDo.fileNo=''
  addReceiptForm.formDataDo.fileTime=''

}


// 重置表单
const resetForm = () => {
	ruleForm.value.resetFields()
  addReceiptForm.receiptAllList=[]
  addReceiptForm.receiptYJList=[]
  addReceiptForm.receiptInvoiceList=[]
  //addReceiptForm.receiptList=[]
   invoiceAmountSum.value = 0
    PrepayAmountSum.value = 0
	backAmountSum.value = 0


  addReceiptForm.formDataDo.bankName = ''
  addReceiptForm.formDataDo.bankId = ''
  addReceiptForm.formDataDo.bankType = ''



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
  addReceiptForm,

})
</script>

<style lang='scss' scoped>
@import '@/assets/styles/formData.scss';

.content {
  display: flex;
  .in,
  .out {
    width: 50%;
    font-size: 13px;
  }
}
</style>
