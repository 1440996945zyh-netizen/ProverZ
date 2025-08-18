<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="130px" :rules="rules" style="margin: 20px 20px">
      <el-form-item label="作业公司" prop="companyId">
        <Select
          :dataConfig="{ params: {type: 'DEPT_WORK_COMPANY'} }"
          v-model:value="formData.companyId"
          v-model:label="formData.companyName"
          placeholder="作业公司"/>
      </el-form-item>
      <el-form-item label="开户行" prop="openAccountBank">
        <el-input v-model="formData.openAccountBank"  placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="银行中文名称" prop="bankName">
        <el-input v-model.lazy="formData.bankName" @change='bankNameChange' placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="银行账户号码" prop="bankNumber">
        <el-input v-model="formData.bankNumber"  placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="银行代码" prop="bankCode">
        <el-input v-model="formData.bankCode"  placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="银行英文名称" prop="bankNameEnglish">
        <el-input v-model="formData.bankNameEnglish"  placeholder="请输入名称" />
      </el-form-item>
			<el-form-item label="货币代码" prop="currencyCode">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictListByType/CURRENCY' }"
						v-model:value="formData.currencyCode"
						v-model:label="formData.currencyName"
					/>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="system">
import api from '@/api/finance/payBank/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import { creatShortCd } from '@/utils/index.js'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const bankNameChange = e =>{
  console.log(e)
  api.getList({bankName:e,companyId:formData.companyId}).then(res => {
    if(res.data.pages.length){
      proxy.$message.error("公司已有此银行！！")
      formData.bankName=''
      return
    }
  })
}
const ruleForm = ref()
const formData = reactive({
	id:'',
  currencyName: '',
  openAccountBank: '',
  bankNameEnglish: '',
  bankTypeCode:'',
  bankNumber:'',
  bankTypeName:'',
  bankAccountCode:'',
  bankAccountName:'',
  bankName:'',
  bankCode:'',
  companyName:'',
})

  const rules = reactive({
    openAccountBank: [{ required: true, message: '请输入开户行', trigger: 'blur' }],
    bankName: [{ required: true, message: '请输入银行中文名称', trigger: 'blur' }],
    bankNumber: [{ required: true, message: '请输入银行账户号码', trigger: 'blur', },
      { validator: validateBankNumber, trigger: 'blur' },],
  })
function validateBankNumber(rule, value, callback) {
  const pattern = /^\d+$/
  if (!pattern.test(value)) {
    callback(new Error('只能输入数字'))
  } else {
    callback()
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
const resetForm = () => {
	ruleForm.value.resetFields()
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
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
