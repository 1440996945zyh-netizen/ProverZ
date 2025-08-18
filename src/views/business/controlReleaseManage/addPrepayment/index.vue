<template>
	<div>
		<el-form
			:disabled="formData.editOrAdd"
			:model="formData"
			ref="ruleForm"
			label-width="130px"
			:rules="rules"
			style="margin: 20px 20px"
		>
			<el-form-item label="预缴类型" prop="prepaymentTypeCode">
				<Select
					:dataConfig="{ params: { type: 'DICT', dictType: 'PREPAYMENT_TYPE' } }"
					v-model:value="formData.prepaymentTypeCode"
					v-model:label="formData.prepaymentTypeName"
					placeholder="请选择预缴类型"
          @change="prepayTypeChange"
          disabled
				/>
			</el-form-item>
      <el-form-item label="预缴方式" prop="prepayModeCode">
				<Select
          :selectData="[{label:'大预缴',value:'10'},{label:'货物预缴',value:'20'}]"
					v-model:value="formData.prepayModeCode"
					v-model:label="formData.prepayModeName"
					placeholder="预缴方式"
          @change="modeChange"
          disabled
        />
			</el-form-item>
			<el-form-item label="作业公司" prop="companyId">
				<Select
					@change="payChange"
					:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
					v-model:value="formData.companyId"
					v-model:label="formData.companyName"
					placeholder="作业公司"
        />
			</el-form-item>
      <el-form-item label="客户名称" prop="customerId">
        <div style="width: 100%">
          <RemoteSelect type="CUSTOMER_PASS"
                        v-model:value="formData.customerId"
                        v-model:label="formData.customerName"
          @change = "customerChange"
          />
          <span  style="color: green;font-size: 13px; line-height: 17px;">{{customerStatement}}</span>
        </div>
      </el-form-item>
      <el-form-item v-if="formData.prepayModeCode == 20" label="作业通知单" prop="trustId">
        <Select
          :selectData='trustOrderList'
          v-model:value="formData.cargoInfoId"
          v-model:label="formData.trustLabel"
          :selectLabel="'label'"
          :selectValue="'cargoInfoId'"
          placeholder="通知单编号/客户"
          @change="changeSelect"
          @focus="trustOrderFocus"
        />
        <span v-show="formData.prepayModeCode == 20 && formData.id == ''" style="color: green;font-size: 13px; line-height: 17px;">{{tmpAmountInfo}}</span>
      </el-form-item>
			<el-form-item label="预缴日期" prop="prepaymentTime">
				<el-date-picker
					disabled
					v-model="formData.prepaymentTime"
					type="date"
					:default-value="formData.prepaymentTime"
					placeholder="选择日期"
				></el-date-picker>
			</el-form-item>
			<el-form-item label="预缴金额" prop="prepaymentAmount">
				<el-input
					v-model="formData.prepaymentAmount"
					placeholder="请输入预缴金额"
					@input="formData.prepaymentAmount = proxy.verify('twoPoint', formData.prepaymentAmount)"
				/>
			</el-form-item>
      <el-form-item label="预缴流水号" prop="transSequenceIdn">
        <el-input
          v-model="formData.transSequenceIdn"
          placeholder="请输入预缴流水号"
        />
      </el-form-item>
			<el-form-item label="付款方式" v-if="formData.prepayModeCode !=20" prop="paymentMethodCode">
				<Select
					@change="payChange"
					:dataConfig="{ params: { type: 'DICT', dictType: 'BANK_PAY_METHOD' } }"
					v-model:value="formData.paymentMethodCode"
					v-model:label="formData.paymentMethodName"
					placeholder="请选择付款方式"
				/>
			</el-form-item>
      <el-form-item v-if="formData.prepayModeCode == 20" clearable label="预缴编号" prop="prepaymentCode">
        <Select
          :selectData='prepaymentCodeList'
          v-model:value="formData.prePayId"
          v-model:label="formData.prePayCodeLabel"
          :selectLabel="'prePayCodeLabel'"
          :selectValue="'id'"
          placeholder="预缴编号/可用余额"
          @change="prePayChange"
        />
      </el-form-item>
      <el-form-item label="付款银行" prop="bankType" v-show="formData.bankTypeShow ">
				<el-input v-model="formData.bankType" :disabled="true" placeholder="请输入名称" />
			</el-form-item>
			<el-form-item label="备注" prop="remark">
				<el-input
					v-model="formData.remark"
					:autosize="{ minRows: 2, maxRows: 4 }"
					type="textarea"
					maxlength="200"
					show-word-limitplaceholder="请输入备注"
				/>
			</el-form-item>
      <el-form-item label="作废原因" prop="voidRemark" v-if="formData.status=='2'" >
				<el-input
					v-model="formData.voidRemark"
					:autosize="{ minRows: 2, maxRows: 4 }"
					type="textarea"
					maxlength="200"
					show-word-limitplaceholder="请输入备注"
				/>
			</el-form-item>
			<el-form-item prop="" label="附件">
				<upload :fileTypeName="fileTypeName" businessType="PAYMENT_PROOF" :businessId="formData.id" @changeFile="changeFile" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="system">
import {ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch} from 'vue'
import Select from '@/components/Select'
import {creatShortCd} from '@/utils/index.js'
import Upload from '@/components/upload'
import api from '@/api/finance/customerPrepayment/index.js'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import RemoteSelectTable from '@/components/RemoteSelectTable/index.vue'

const tableItem = ref(null)
const {proxy} = getCurrentInstance() // 相当于vue2里的this
const fileTypeName = ref('.pdf, .png, .jpeg')
const ruleForm = ref()
const bankTypeShow = ref(false)
const editOrAdd = ref(false) // 是否显示保存按钮
const tmpAmountInfo = ref("")
const customerStatement = ref("")

const trustOrderList = ref([])
const prepaymentCodeList = ref([])

//作业通知单选择事件
const changeSelect = e => {
  // formData.prepaymentAmount =''
  formData.busTrustId = ''
  formData.prepaymentCode = ''
  formData.cargoInfoId = ''
  formData.busTrustId = e.trustId
  formData.trustNo = e.trustNo
  formData.cargoInfoId = e.cargoInfoId
  //获取预缴编号
  nextTick(() => {
    if (formData.prepaymentTypeCode == '') {
      proxy.$message.error("请先选择预缴类型")
      return;
    }
    api.getPrepaymentCodeList({
      customerId: formData.customerId,
      prepaymentTypeCode: formData.prepaymentTypeCode
    }).then(res => {
      prepaymentCodeList.value = res.data
    })
  })
  nextTick(() => {
    api.getAmountInfo({
      busTrustId: formData.busTrustId,
      companyId: formData.companyId,
      customerId: formData.customerId,
      cargoInfoId: formData.cargoInfoId
    }).then(res => {
      console.log(res, "res");
      tmpAmountInfo.value = res.data.resString
      if (res.data.amount > 0) {
        formData.prepaymentAmount = res.data.amount
      } else {
        formData.prepaymentAmount = '0'
      }
    })
  })
}
const getAmount=()=>{
  api.getAmountInfo({
    busTrustId: formData.busTrustId,
    companyId: formData.companyId,
    customerId: formData.customerId,
    cargoInfoId: formData.cargoInfoId
  }).then(res => {
    tmpAmountInfo.value = res.data.resString
    if (res.data.amount > 0) {
      formData.prepaymentAmount = res.data.amount
    } else {
      formData.prepaymentAmount = '0'
    }
  })
  api.getPrepaymentCodeList({
    customerId: formData.customerId,
    prepaymentTypeCode: formData.prepaymentTypeCode
  }).then(res => {
    prepaymentCodeList.value = res.data
  })
}


const formData = reactive({
  id: '',
  prePayId: '',//回显预缴编号
  prePayCode: '',
  companyId: '',
  companyName: '',
  prepaymentTypeCode: '10',
  prepaymentTypeName: '',
  customerName: '', //客户名称
  customerId: '', //客户code
  prepaymentTime: new Date(),
  prepaymentAmount: '',
  paymentMethodCode: '', //付款方式code
  paymentMethodName: '', //付款方式name
  remark: '',
  bankCode: '', //付款银行代码
  bankName: '', //付款银行
  bankType: '', //付款银行传后端
  status: '',
  prepaymentCode: '',
  fileIds: [], // 付款凭证
  editOrAdd: '',
  bankTypeShow: '',
  busTrustId: '',
  busTrustCargoId: '',
  trustNo: '',
  voidRemark: '',
  prepayModeCode: '20',//预缴方式
  prepayModeName: '货物预缴',//预缴方式名称
  trustLabel: '',
  prePayCodeLabel: '',
  transSequenceIdn: '', //流水号
  cargoInfoId: ''

  //   公司名称、预缴类型、客户名称、预缴日期(默认不可更改) 、预缴金额、付款方式付款银行、备注、
  // 付款凭证
})
const customerChange = val => {
  console.log(val, 'val');
  // nextTick(()=>{
  //   prepaymentCodeList.value = []
  //   api.getTrustOrderList(formData.companyId,val.value?val.value:'').then(res=>{
  //     trustOrderList.value = res.data;
  //   })
  // })

}
const trustOrderFocus = val => {
  trustOrderList.value = []
  if (formData.companyId == null || formData.companyId == '') {
    proxy.$message.error("请先选择作业公司");
    return
  }
  if (formData.customerId == null || formData.customerId == '') {
    proxy.$message.error("请先选择客户信息");
    return
  }
  nextTick(() => {
    prepaymentCodeList.value = []
    api.getTrustOrderList(formData.companyId, formData.customerId).then(res => {
      trustOrderList.value = res.data;
    })
  })
}
//监听器  获取作业通知单的下拉框数据
watch(
  () => formData.prepayModeCode,
  newVal => {
    if (formData.prepayModeCode == '20') {
      //显示预缴编号
      if (!formData.editOrAdd) {
        if (formData.trustNo != null && formData.trustNo != '') {
          api.getPrepaymentCodeList().then(res => {
            prepaymentCodeList.value = res.data
          })
        }
      }
      return;
    } else if (formData.prepayModeCode == '10') {
      formData.trustLabel = ''
      formData.trustId = ''
      formData.busTrustId = ''
      return;
    }
    if (formData.companyId === undefined || formData.companyId == null || formData.companyId == '') {

      return;
    }
    api.getTrustOrderList(formData.companyId, formData.customerId ? formData.customerId : '').then(res => {
      trustOrderList.value = res.data;
    })
  },
)
watch(
  () => formData.companyId,
  newVal => {
    if (formData.prepayModeCode != '20') {
      return;
    }
    if (formData.companyId === undefined || formData.companyId == null || formData.companyId == '') {
      return;
    }
    // api.getTrustOrderList(formData.companyId,formData.customerId?formData.customerId:'').then(res=>{
    //   trustOrderList.value = res.data;
    // })
  },
)
const modeChange = e => {
  console.log(formData.prePayCode, "formData.prePayCode");
  console.log(formData.prePayId, "formData.prePayId");
  formData.customerId = '' //客户code
  // formData.prepaymentAmount= ''
  formData.paymentMethodCode = '' //付款方式code
  formData.paymentMethodName = '' //付款方式name
  formData.bankCode = '' //付款银行代码
  formData.bankName = ''//付款银行
  formData.bankType = '' //付款银行传后端
  formData.prepaymentCode = ''
  formData.prePayId = ''
  formData.prePayCode = ''
  formData.trustLabel = ''
  formData.trustNo = ''
  formData.trustId = ''
  formData.prePayCodeLabel = ''
  formData.cargoInfoId = ''
  formData.bankTypeShow = false
  tmpAmountInfo.value = ''

  proxy.setFormData(formData, {paymentMethodCode: ''})
  if (e.value == '20' && (formData.companyId != '')) {
    api.getTrustOrderList(formData.companyId).then(res => {
      trustOrderList.value = res.data;
    })
  }
}

const prePayChange = e => {
  formData.prePayId = ''
  formData.prePayCode = ''
  formData.prePayCodeLabel = ''


  formData.prePayId = e.id
  formData.prePayCode = e.prepaymentCode

}
const rules = reactive({
  companyId: [{required: true, message: '请输入公司名称', trigger: 'blur'}],
  prepaymentTypeCode: [{required: true, message: '请输入预缴类型', trigger: 'blur'}],
  prepaymentTime: [{required: true, message: '请输入预缴日期', trigger: 'blur'}],
  prepaymentAmount: [{required: true, message: '请输入预缴金额', trigger: 'blur'}],
})
const changeFile = file => {
  formData.fileIds = file
}
const prepayTypeChange = () => {
  formData.customerName = '', //客户名称
    formData.customerId = '', //客户code
    formData.paymentMethodCode = '', //付款方式code
    formData.paymentMethodName = '', //付款方式name
    formData.remark = '',
    formData.bankCode = '', //付款银行代码
    formData.bankName = '', //付款银行
    formData.bankType = '', //付款银行传后端
    formData.status = '',
    formData.prepaymentCode = '',
    formData.bankTypeShow = false,
    formData.busTrustId = '',
    formData.busTrustCargoId = '',
    formData.trustNo = '',
    formData.voidRemark = '',
    formData.prepayModeCode = '20',//预缴方式
    formData.prepayModeName = '货物预缴',//预缴方式名称
    formData.trustLabel = '',
    formData.trustId = '',
    formData.prePayId = '',
    formData.prePayCode = ''
  formData.cargoInfoId = ''
  formData.prepaymentTime = new Date()
}
//拼接显示付款银行信息
const payChange = e => {
  if (formData.companyId != null && formData.companyId != '' && formData.paymentMethodCode != null && formData.paymentMethodCode != '') {
    api.getList1({companyId: formData.companyId, paymentMethodCode: formData.paymentMethodCode}).then(res => {
      let a = res.data.pages
      if (a != null && a.length != 0) {
        formData.bankType = a[0].bankName + '(' + a[0].bankId + ')'
        formData.bankName = a[0].bankName
        formData.bankId = a[0].bankId
        formData.bankTypeShow = true
      } else {
        formData.bankName = ''
        formData.bankId = ''
        formData.bankType = ''
        formData.bankTypeShow = false
      }
      //  2023/11/27 前端会报错
      //loading.value = false
    })
  }
}
const validate = async () => {
  let flag = false
  await ruleForm.value.validate((valid, fields) => {
    if (valid) {
      flag = true
    } else {
      flag = false
      proxy.$message.warning('请完善表单信息！')
    }
  })

  return flag
}
// <span v-show="formData.prepayModeCode == 20 && formData.id == ''"
//       style="color: green;font-size: 13px; line-height: 17px;">{{tmpAmountInfo}}</span>
const resetForm = () => {
  formData.id = '',
    formData.cargoInfoId = '',
    formData.companyId = '',
    formData.companyName = '',
    formData.prepaymentTypeCode = '10',
    formData.prepaymentTypeName = '货方',
    formData.customerName = '', //客户名称
    formData.customerId = '', //客户code
    formData.prepaymentTime = '',
    formData.prepaymentAmount = '',
    formData.paymentMethodCode = '', //付款方式code
    formData.paymentMethodName = '', //付款方式name
    formData.remark = '',
    formData.bankCode = '', //付款银行代码
    formData.bankName = '', //付款银行
    formData.bankType = '', //付款银行传后端
    formData.status = '',
    formData.prepaymentCode = '',
    formData.fileIds = [], // 付款凭证
    formData.editOrAdd = '',
    formData.bankTypeShow = '',
    formData.busTrustId = '',
    formData.busTrustCargoId = '',
    formData.trustNo = '',
    formData.voidRemark = '',
    formData.prepayModeCode = '20',//预缴方式
    formData.prepayModeName = '货物预缴',//预缴方式名称
    formData.trustLabel = '',
    formData.trustId = '',
    formData.prePayId = '',
    formData.prePayCode = '',
    bankTypeShow.value = false,
    formData.transSequenceIdn = ''
    formData.prepaymentTime = new Date()
    tmpAmountInfo.value = ''
}
const init = () => {
  formData.prepaymentTime = new Date()
}
init()
const getTrustOrderList=(companyId,customerId,cargoInfoNo)=>{
  api.getTrustOrderList(formData.companyId, formData.customerId).then(res => {
    trustOrderList.value = res.data;
    for(let index in trustOrderList.value){
      let item = trustOrderList.value[index]
      if(item.label.includes(cargoInfoNo)){
        formData.cargoInfoId = item.cargoInfoId
        formData.trustLabel = item.label
        formData.busTrustId = item.trustId
        formData.trustNo = item.trustNo
        getAmount();
      }
    }
  })
}


defineExpose({
  validate,
  resetForm,
  getTrustOrderList,
  prepaymentCodeList,
  trustOrderFocus,
  editOrAdd,
  formData,
  bankTypeShow,
  customerStatement
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
