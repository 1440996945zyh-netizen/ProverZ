<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="150px" :rules="rules">
			<el-form-item label="企业/个人类型" prop="type">
				<el-radio-group v-model="formData.type">
					<el-radio label="1">企业</el-radio>
					<el-radio label="2">个人</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item :label="formData.type === '1' ? '企业名称' : '个人姓名'" prop="unitName">
				<el-input
					v-model="formData.unitName"
					:placeholder="formData.type === '1' ? '请输入企业名称' : '请输入个人姓名'"
					maxlength="200"
				/>
			</el-form-item>

			<el-form-item :label="formData.type === '1' ? '企业社会信用代码' : '个人身份证号'" prop="externalCompanyCode">
				<el-input
					v-model="formData.externalCompanyCode"
					:placeholder="formData.type === '1' ? '请输入企业社会信用代码' : '请输入个人身份证号'"
					maxlength="50"
				/>
			</el-form-item>

			<el-form-item label="负责人" prop="principal">
				<el-input v-model="formData.principal" placeholder="请输入法人姓名" maxlength="50" />
			</el-form-item>

			<el-form-item label="联系方式" prop="phone">
				<el-input v-model="formData.phone" placeholder="请输入联系方式" maxlength="50" />
			</el-form-item>

			<el-form-item label="委外合同开始期限" prop="contractDateStart">
				<el-date-picker
					v-model="formData.contractDateStart"
					type="date"
					placeholder="请选择开始日期"
					value-format="YYYY-MM-DD"
					style="width: 100%"
				/>
			</el-form-item>

			<el-form-item label="委外合同结束期限" prop="contractDateEnd">
				<el-date-picker
					v-model="formData.contractDateEnd"
					type="date"
					placeholder="请选择结束日期"
					value-format="YYYY-MM-DD"
					style="width: 100%"
				/>
			</el-form-item>

			<el-form-item label="服务单位" prop="serviceCompanies">
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
import { ref, reactive, watch, getCurrentInstance, toRefs } from 'vue'

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const serviceCompaniesArray = ref([])
const data = reactive({
	formData: {
		id: null,
		type: '1',
		unitName: '',
		externalCompanyCode: '',
		principal: '',
		phone: '',
		contractDateStart: null,
		contractDateEnd: null,
		serviceCompanies: '',
		repairType: '',
		remark: '',
	},
})
const { formData } = toRefs(data)

watch(
	serviceCompaniesArray,
	newVal => {
		if (newVal && Array.isArray(newVal)) {
			formData.value.serviceCompanies = newVal.join(',')
		} else {
			formData.value.serviceCompanies = ''
		}
	},
	{ deep: true },
)

const serviceUnitOptions = ref([
	{ label: '设备维修', value: '1' },
	{ label: '设备保养', value: '2' },
	{ label: '设备检测', value: '3' },
	{ label: '设备安装', value: '4' },
	{ label: '设备改造', value: '5' },
])

const rules = reactive({
	type: proxy.getRules({ required: true }),
	unitName: proxy.getRules({ required: true }),
	externalCompanyCode: proxy.getRules({ required: true }),
	phone: proxy.getRules({ required: true }),
})

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
	formData.value.type = '1'
	formData.value.unitName = ''
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

defineExpose({
	validate,
	resetForm,
	formData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
