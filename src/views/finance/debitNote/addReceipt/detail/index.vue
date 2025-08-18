<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="80px" :rules="rules" style="margin: 30px 30px">
          <el-form-item label="费率" prop="rateCode">
            <Select
              :selectData="rateList"
              :selectLabel = "'rateItemName'"
              :selectValue = "'id'"
              @change = "changeRate"
              v-model:value="formData.rateId"
              v-model:label="formData.rateName"/>
          </el-form-item>
          <el-form-item label='费率值' prop='oldRate' >
            <el-input  v-model="formData.oldRate"   disabled />
          </el-form-item>
          <el-form-item label='新费率值' prop='newRate'>
            <el-input  v-model="formData.newRate"   @change='changeNewRage'  />
          </el-form-item>
          <el-form-item label='货物名称' prop='cargoCode'>
            <div style="width: 100%">
              <Select
                :dataConfig="{ url: '/api/internal/public/getDictListByType/CARGO_CATEGORY' }"
                v-model:value="formData.cargoCode"
                placeholder="请选择货物名称"
              />
            </div>
          </el-form-item>
          <el-form-item label='票据金额' prop='amount'>
            <el-input  v-model="formData.amount"   placeholder="请输入票据金额" disabled  />
          </el-form-item>
          <el-form-item label='税率' prop='taxRate'>
            <el-input  v-model="formData.taxRate"    placeholder="请输入税率" disabled />
          </el-form-item>
          <el-form-item label="数量" prop="mea">
            <el-input type="number" v-model="formData.mea"  placeholder="请输入数量" @change='changeNewRage' />
          </el-form-item>
           <el-form-item label="数量2" prop="mea">
            <el-input type="number" v-model="formData.numberCount2"  placeholder="请输入数量2" @change='changeNewRage' />
          </el-form-item>
          <el-form-item label="单位" prop="unitCode">
            <Select
              :dataConfig="{ params: { type: 'DICT',dictType:'UNIT' } }"
              v-model:value="formData.unitCode"
              v-model:label="formData.unitName"
            />
          </el-form-item>
          <el-form-item label="税额" prop="taxAmount">
            <el-input  v-model="formData.taxAmount"  placeholder="请输入税额"  disabled/>
          </el-form-item>
          <el-form-item label='备注' prop='remark'>
            <el-input
              v-model='formData.remark'
              :autosize='{ minRows: 2, maxRows: 4 }'
              type='textarea'
              maxlength='100'
              show-word-limit
              placeholder='请输入备注'
            />
          </el-form-item>
		</el-form>
	</div>
</template>

<script setup name="system">
import api from '@/api/finance/CNDNapi/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import { creatShortCd } from '@/utils/index.js'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const ruleForm = ref()
const formData = reactive({
  rateId:'',
  rateName:'', //费率名称
  rateCode: '', //费率code
  oldRate: '', //费率值
  newRate: '', //新费率
  cargoCode: '', //货物名称
  amount: '', //票据金额
  taxRate: '', //税率
  mea: '', //数量
  unitName: '', //单位name
  unitCode: '',//单位code
  taxAmount: '', //税额
  remark: '', //备注
  invoiceDetailId:''//发票子表id
})

const rules = reactive({
  oldRate: [{ required: true, message: '费率值不能为空', trigger: 'blur' }],
  mea: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  // unitCode: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入票据金额', trigger: 'blur' }],
})
const rateList = ref([]);//费率集合
const getRateList = ()=>{
  api.getRateList().then(res=>{
    res.data.forEach(item=>{
      if(item.processName!=null){
        item.rateItemName+="("+item.processName+")"
      }

      if(item.cargoName!=null){
        item.rateItemName += "-"+item.cargoName
      }
      if(item.inteFore!=null){
        item.rateItemName += "-"+item.inteFore
      }

      if(item.serviceContentName !=null){
        item.rateItemName += "-"+item.serviceContentName
      }

      item.rateItemName += ":"+item.rate

    })
    rateList.value = res.data;
  });
}
const changeRate = rateObj =>{
  formData.oldRate = rateObj.rate;
  formData.taxRate = rateObj.taxRate;
  changeNewRage()
}

const changeNewRage = ()=>{
  //数据校验
  if(formData.oldRate==null|| formData.oldRate == ''){
    return
  }
  if(formData.taxRate==null|| formData.taxRate == ''){
    return
  }
  if(formData.mea==null|| formData.mea == ''){
    return
  }
  api.calculate(formData).then(res=>{
    formData.taxAmount = res.data.taxAmount;
    formData.amount = res.data.amount;
  });
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
const resetForm = () => {
  proxy.resetObj(formData)
  // ruleForm.value.resetFields()
	// formData.currencyName = ''
	// formData.openAccountBank = ''
	// formData.bankNameEnglish = ''
	// formData.bankTypeCode = ''
  // formData.bankTypeName = ''
  // formData.bankAccountCode = ''
  // formData.bankAccountName = ''
  // formData.bankName = ''
  // formData.companyName = ''
  // formData.bankCode = ''
  // formData.bankNumber = ''

}

onMounted(()=>{
  getRateList();
})

defineExpose({
	validate,
	resetForm,
	formData,
  getRateList,
  rateList
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
