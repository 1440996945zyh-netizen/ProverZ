<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="130px" :rules="rules" style="margin: 20px 15px">
			<el-form-item label="付款方式" prop="paymentMethodCode">
				<Select
					:dataConfig="{ params: { type: 'DICT', dictType: 'BANK_PAY_METHOD' } }"
					v-model:value="formData.paymentMethodCode"
					v-model:label="formData.paymentMethodName"
					placeholder="请选择付款方式"
				/>
			</el-form-item>
			<el-form-item label="银行" prop="bankId">
				<Select
					@change="paymentMethodChange"
					:dataConfig="{ url: '/api/v1/internal/tFdBankPay/getSelectList' }"
					v-model:value="formData.bankId"
					v-model:label="formData.bankName"
					placeholder="请选择银行"
				/>
			</el-form-item>
			<el-form-item label="公司名称" prop="companyName">
				<el-input disabled v-model="formData.companyName" placeholder="请输入名称" />
			</el-form-item>
			<el-form-item label="是否默认" prop="isDefault">
				<el-radio-group v-model="formData.isDefault" class="ml-4">
					<el-radio label="1">是</el-radio>
					<el-radio label="2">否</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="付款类型" prop="paymentTypeCode">
				<div style="width: 100%">
					<Select
						:dataConfig="{ params: { type: 'DICT', dictType: 'BANK_PAYMENT_TYPE' } }"
						v-model:value="formData.paymentTypeCode"
						v-model:label="formData.paymentTypeName"
					/>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="affilliatedBankDtail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import { creatShortCd } from '@/utils/index.js'
import api from '@/api/finance/affiliatedBank/index'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const ruleForm = ref()
const formData = reactive({
	id: '',
	paymentMethodCode: '',
	paymentMethodName: '',
	companyName: '',
	isDefault: '',
	companyId: '',
	currencyCode: '',
	currencyName: '',
	paymentTypeCode: '',
	paymentTypeName: '',
	bankCode: '',
	bankId: '',
	bankName: '',
})
const rules = reactive({
	paymentMethodCode: [{ required: true, message: '选择付款方式', trigger: 'blur' }],
	bankId: [{ required: true, message: '请选择银行', trigger: 'blur' }],
})

const paymentMethodChange = val => {
	//下拉框选择事件
	api.getBankById(val.value).then(res => {
		formData.companyId = res.data.companyId
		formData.companyName = res.data.companyName
		formData.bankCode = res.data.bankCode
	})
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
