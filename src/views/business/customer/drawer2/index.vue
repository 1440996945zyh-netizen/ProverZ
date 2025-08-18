<template>
	<el-form ref="ruleForm" :model="formData" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="客户信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="24">
					<el-col :span="6">
						<el-form-item label="客户类型" prop="customerTypeCode">
							<el-radio-group v-model="formData.customerTypeCode">
								<el-radio v-for="item in customerTypeList" :key="item.id" :label="item.dictValue">
									{{ item.dictLabel }}
								</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item prop="customerCode" label="客户代码">
							<el-input v-model="formData.customerCode" placeholder="请输入客户代码" disabled/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item prop="customerName" label="客户名称">
							<el-input v-model="formData.customerName" placeholder="请输入客户名称" @input="getShortCd" />
						</el-form-item>
					</el-col>
					<el-col :span="3">
						<el-form-item prop="customerShortName" label="客户简称">
							<el-input v-model="formData.customerShortName" placeholder="请输入客户简称" />
						</el-form-item>
					</el-col>
					<el-col :span="3">
						<el-form-item prop="shorthandCode" label="助记码">
							<el-input v-model="formData.shorthandCode" placeholder="请输入助记码" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="客户属性" prop="customerProperty">
							<el-checkbox-group v-model="formData.customerProperty" @change="customerProperChang">
								<el-checkbox
									v-for="(item, index) in customerProperList"
									:key="item.id"
									:label="item.dictLabel"
									:value="item"
									name="type"
								>
									{{ item.dictLabel }}
								</el-checkbox>
							</el-checkbox-group>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="发票抬头" prop="invoice">
							<el-input v-model="formData.invoice" placeholder="请输入发票抬头" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item prop="tin" label="纳税人识别号">
							<el-input v-model="formData.tin" placeholder="请输入纳税人识别号" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item prop="bank" label="开户行">
							<el-input v-model="formData.bank" placeholder="请输入开户行" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="银行账号" prop="bankAccount">
							<el-input v-model="formData.bankAccount" placeholder="请输入银行账号" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item prop="telephoneNumber" label="企业联系电话">
							<el-input v-model="formData.telephoneNumber" placeholder="请输入企业联系电话" maxlength="11" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item prop="address" label="企业地址">
							<el-input v-model="formData.address" placeholder="请输入企业地址" />
						</el-form-item>
					</el-col>
          <el-col :span="6">
						<el-form-item prop="address" label="金蝶客户代码">
							<el-input v-model="formData.customerCodeEas" placeholder="请输入金蝶客户代码" />
						</el-form-item>
					</el-col>
          <el-col :span="6">
						<el-form-item prop="address" label="金蝶客户名称">
							<el-input v-model="formData.customerNameEas" placeholder="请输入金蝶客户名称" />
						</el-form-item>
					</el-col>

					<el-col :span="6">
						<el-form-item prop="contact" label="联系人姓名">
							<el-input v-model="formData.contact" placeholder="请输入联系人姓名" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="联系人电话" prop="contactNumber">
							<el-input v-model="formData.contactNumber" placeholder="请输入联系人电话" maxlength="11" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item prop="contactAddress" label="联系人地址">
							<el-input v-model="formData.contactAddress" placeholder="请输入联系人地址" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item prop="status" label="是否停用">
                <el-switch v-model="formData.status" active-value="0" inactive-value= "1">
                </el-switch>
						</el-form-item>
					</el-col>
          <el-col :span='6'>
            <el-form-item label='发票开具' prop='taxationInvoiceCode'>
              <Select
                      :dataConfig="{ params: { type: 'DICT', dictType: 'TAX_INVOICE' } }"
                      v-model:value='formData.taxationInvoiceCode'
                      v-model:label='formData.taxationInvoice'
                      placeholder='请选择发票' />
            </el-form-item>
          </el-col>
					<el-col :span="6">
						<el-form-item prop="remark" label="备注">
							<el-input v-model="formData.remark" placeholder="请输入备注信息" />
						</el-form-item>
					</el-col>
          <!-- <el-col :span="6">
          <el-form-item prop="isStations" label="是否场站">
            <el-radio-group v-model="formData.isStations">
              <el-radio label="1">是</el-radio>
              <el-radio label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          </el-col> -->
				</el-row>
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item prop="" label="营业执照" style="line-height: 50px; display: inline">
							<upload2
								:fileTypeName="fileTypeName"
								businessType="BUSINESS_CUSTOMER_LICENSE"
								:businessId="formData.id"
								@changeFile="changeFile"
								:showRemoveBtn="false" :showUploadBtn="false"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item prop="" label="授权书" style="line-height: 50px; display: inline">
							<upload2
								:fileTypeName="fileTypeName2"
								businessType="BUSINESS_CUSTOMER_AUTHORIZATION"
								:businessId="formData.id"
								@changeFile="changeFile2"
								:showRemoveBtn="false" :showUploadBtn="false"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item prop="" label="企业开票信息" style="line-height: 50px; display: inline">
							<upload2
								:fileTypeName="fileTypeName2"
								businessType="BUSINESS_CUSTOMER_BILLING"
								:businessId="formData.id"
								@changeFile="changeFile3"
								:showRemoveBtn="false" :showUploadBtn="false"
							/>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="customerDrawer">
import upload2 from '../../../../components/upload2/index'
import Select from '@/components/Select'
import { reactive, ref, toRefs } from 'vue'
import publicApi from '@/api/public/index' //字典
import { creatShortCd } from '@/utils/index.js'
const { proxy } = getCurrentInstance()
const ruleForm = ref()
const formData = reactive({
	id: '',
	customerTypeCode: '', //客户类型
	customerCode: '', //客户代码
	customerName: '', //客户名称
	customerShortName: '', //客户简称
	shorthandCode: '', //助记码
	customerProperty: [], //客户属性
	invoice: '', //发票抬头
	tin: '', //纳税人识别号
	bank: '', //开户行
	bankAccount: '', //银行账号
	telephoneNumber: '', //企业联系电话
	address: '', //企业地址
	contact: '', //联系人姓名
	contactNumber: '', //联系人电话
	contactAddress: '', //联系人地址
	status: '', //状态
	remark: '', //备注
	propertyList: [],
	licenseFileIds: [], //营业执照
	authorizationFileIds: [], //授权书
	billingFileIds: [], //企业开票
  customerCodeEas:'',//金蝶客户代码
  customerNameEas:'',//金蝶客户名称
  taxationInvoiceCode:'',//发票开具
  taxationInvoice:'',//发票开具
//   isStations:'0'
})
const fileTypeName = ref('.pdf, .png, .jpeg, .jpg')
const fileTypeName2 = ref('.jpeg, .png, .doc, .docx, .pdf, .jpg, .xlsx, .xls')
const customerProperList = ref([]) //客户属性数据
const customerTypeList = ref([]) //客户类型数据
const rules = reactive({
	// customerCode: proxy.getRules({ required: true, length: '0-50' }), //客户代码
	customerName: proxy.getRules({ required: true, length: '0-50' }), //客户名称
	customerTypeCode: proxy.getRules({ required: true, trigger: 'change' }), //客户类型
	customerProperty: proxy.getRules({ required: true }), //客户属性
	customerShortName: proxy.getRules({ length: '0-50' }), //客户简称
	shorthandCode: proxy.getRules({ length: '0-50' }), //助记码
	invoice: proxy.getRules({required: true , length: '0-50' }), //发票抬头
	tin: proxy.getRules({ required: true ,length: '0-50' }), //纳税人识别号
	bank: proxy.getRules({ required: true ,length: '0-50' }), //开户行
	bankAccount: proxy.getRules({required: true ,}), //银行账号bankCard: {}
	address: proxy.getRules({ length: '0-50' }), //企业地址
	telephoneNumber: proxy.getRules({ length: '0-50' }), //企业联系电话
	contact: proxy.getRules({ required: true, length: '2-5' }), // 联系人姓名
	contactNumber: proxy.getRules({ required: true }), // 联系人电话handset: true
	status: proxy.getRules({ required: true }), // 状态
	remark: proxy.getRules({ length: '0-200' }), // 备注
//   isStations: proxy.getRules({ required: true}), // 是否场站
  taxationInvoiceCode: [{ required: true, message: '发票类型不能为空', trigger: 'blur' }],//发票开具
})
const collapseOpen = ['1', '2'] // 打开的面板
// 多选框触发事件
const customerProperChang = val => {
	console.log('多选框选择', formData.customerProperty)
	formData.propertyList = []
	val.forEach(item => {
		customerProperList.value.forEach(it => {
			if (it.dictLabel == item) {
				formData.propertyList.push({ customerPropertyCode: it.dictValue, customerPropertyName: it.dictLabel })
			}
		})
	})
}
// 文件上传
const changeFile = file => {
	console.log('文件上传', file)
	formData.licenseFileIds = file
}
const changeFile2 = file => {
	formData.authorizationFileIds = file
}
const changeFile3 = file => {
	formData.billingFileIds = file
}
// 获取助记码
const getShortCd = value => {
	formData.shorthandCode = creatShortCd(value)
}
// 根据字典获取客户属性
const getcustomerProperList = () => {
	publicApi.getDictList({ types: 'CUSTOMER_PROPERTY,CUSTOMER_TYPE' }).then(response => {
		// console.log('客户属性',response);
		customerProperList.value = response.data.CUSTOMER_PROPERTY //客户属性
		customerTypeList.value = response.data.CUSTOMER_TYPE //客户类型
		console.log(customerTypeList.value)
	})
}
getcustomerProperList()
const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}
// const resetForm = () => {
// 	console.log('重置', 'ruleForm')
// 	ruleForm.value.resetFields()
// }
const resetForm = () => {
	proxy.resetObj(formData)
	// proxy.$bus.emit('resetFileList') //清空文件上传
}
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>

<style lang="less" scoped>
@import '@/assets/styles/formData.scss';
</style>
