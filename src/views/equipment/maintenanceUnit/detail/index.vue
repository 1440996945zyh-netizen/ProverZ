<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="150px" :rules="rules">
			<!-- <el-form-item label="企业/个人类型" prop="entityType">
				<el-radio-group v-model="formData.entityType">
					<el-radio label="1">企业</el-radio>
					<el-radio label="2">个人</el-radio>
				</el-radio-group>
			</el-form-item> -->

			<el-form-item :label="formData.entityType === '1' ? '企业名称' : '个人姓名'" prop="unitName">
				<el-select
					v-model="formData.externalCompanyId"
					placeholder="请选择企业名称"
					style="width: 100%"
					v-if="formData.entityType === '1'"
					@change="handleCompanyChange"
				>
					<el-option v-for="item in companyOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
				<el-input
					v-else
					v-model="formData.unitName"
					:placeholder="formData.entityType === '1' ? '请输入企业名称' : '请输入个人姓名'"
					maxlength="200"
				/>
			</el-form-item>

			<el-form-item label="" prop="outType">
				<el-radio-group v-model="formData.outType">
					<el-radio label="1">内部</el-radio>
					<el-radio label="2">外部</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item
				:label="formData.entityType === '1' ? '企业社会信用代码' : '个人身份证号'"
				prop="externalCompanyCode"
				v-if="formData.outType === '2'"
			>
				<el-input
					v-model="formData.externalCompanyCode"
					:placeholder="formData.entityType === '1' ? '请输入企业社会信用代码' : '请输入个人身份证号'"
					maxlength="50"
				/>
			</el-form-item>

			<el-form-item label="法人" prop="principal">
				<el-input v-model="formData.principal" placeholder="请输入法人姓名" maxlength="50" />
			</el-form-item>

			<el-form-item label="联系方式" prop="phone">
				<el-input v-model="formData.phone" placeholder="请输入联系方式" maxlength="50" />
			</el-form-item>

			<el-form-item label="委外合同开始期限" prop="contractDateStart" v-if="formData.outType === '2'">
				<el-date-picker
					v-model="formData.contractDateStart"
					type="date"
					placeholder="请选择开始日期"
					value-format="YYYY-MM-DD"
					style="width: 100%"
				/>
			</el-form-item>

			<el-form-item label="委外合同结束期限" prop="contractDateEnd" v-if="formData.outType === '2'">
				<el-date-picker
					v-model="formData.contractDateEnd"
					type="date"
					placeholder="请选择结束日期"
					value-format="YYYY-MM-DD"
					style="width: 100%"
				/>
			</el-form-item>

			<el-form-item label="服务单位" prop="serviceCompanies" v-if="formData.outType === '2'">
				<el-select v-model="serviceCompaniesArray" multiple placeholder="请选择服务单位" style="width: 100%">
					<el-option v-for="item in serviceUnitOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>

			<el-form-item label="维修范围" prop="repairType">
				<el-input v-model="formData.repairType" type="textarea" :rows="3" placeholder="请输入经营范围" maxlength="500" />
			</el-form-item>

			<el-form-item label="备注" prop="remark">
				<el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="500" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="maintenanceUnitDetail">
import { ref, reactive, watch, getCurrentInstance, toRefs, onMounted } from 'vue'
import { convertToMysql } from '../../../../utils/common/data'
import api from '@/api/equipment/maintenanceUnit/index'

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const serviceCompaniesArray = ref([])
const data = reactive({
	formData: {
		id: null,
		entityType: '1',
		outType: '2',
		unitName: '',
		externalCompanyCode: '',
		principal: '',
		phone: '',
		contractDateStart: null,
		contractDateEnd: null,
		serviceCompanies: '',
		repairType: '',
		remark: '',
		externalCompanyId: null,
	},
})
const { formData } = toRefs(data)

watch(serviceCompaniesArray, newVal => {
	if (newVal && Array.isArray(newVal)) {
		formData.value.serviceCompanies = newVal.join(',')
	} else {
		formData.value.serviceCompanies = ''
	}
})

watch(
	() => formData.value.outType,
	newVal => {
		if (newVal === '1') {
			formData.value.externalCompanyCode = ''
			formData.value.contractDateStart = null
			formData.value.contractDateEnd = null
			formData.value.serviceCompanies = ''
			serviceCompaniesArray.value = []
		}
	},
)

const serviceUnitOptions = ref([])
const companyOptions = ref([])
const getServiceUnit = () => {
	const params = { deptLevel: '1', inOutType: 'I' }
	api.getDeptListByLevel(params).then(res => {
		if (res.code == '0000') {
			serviceUnitOptions.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id,
			}))
		}
	})
}
const getCompanyList = () => {
	const params = { deptLevel: '1' }
	api.getDeptListByLevel(params).then(res => {
		if (res.code == '0000') {
			companyOptions.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id,
			}))
		}
	})
}

const rules = reactive({
	entityType: proxy.getRules({ required: true }),
	outType: proxy.getRules({ required: true }),
	externalCompanyId: proxy.getRules({ required: true }),
	principal: proxy.getRules({ required: true }),
	contractDateStart: proxy.getRules({ required: true }),
	contractDateEnd: proxy.getRules({ required: true }),
	externalCompanyCode: proxy.getRules({ required: true }),
	unitName: proxy.getRules({ required: true }),
	serviceCompanies: proxy.getRules({ required: true }),
	phone: proxy.getRules({ required: true, handset: {} }),
})
const handleCompanyChange = val => {
	const selectedCompany = companyOptions.value.find(item => item.value === val)
	if (selectedCompany) {
		formData.value.unitName = selectedCompany.label
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
	formData.value.id = null
	formData.value.entityType = '1'
	formData.value.outType = '2'
	formData.value.unitName = ''
	formData.value.externalCompanyId = null
	formData.value.externalCompanyCode = ''
	formData.value.principal = ''
	formData.value.phone = ''
	formData.value.contractDateStart = null
	formData.value.contractDateEnd = null
	formData.value.serviceCompanies = ''
	serviceCompaniesArray.value = []
	formData.value.repairType = ''
	formData.value.remark = ''
	ruleForm.value?.clearValidate()
}
onMounted(() => {
	getServiceUnit()
	getCompanyList()
})

defineExpose({
	validate,
	resetForm,
	formData,
	serviceCompaniesArray,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
