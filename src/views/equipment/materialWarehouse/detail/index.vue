<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="仓库编号" prop="warehouseCode">
						<el-input v-model="formData.warehouseCode" placeholder="请输入仓库编号" maxlength="50" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="仓库名称" prop="warehouseName">
						<el-input v-model="formData.warehouseName" placeholder="请输入仓库名称" maxlength="200" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="公司名称" prop="companyId">
						<el-select v-model="formData.companyId" placeholder="请选择公司" clearable style="width: 100%" @change="handleCompanyChange">
							<el-option
								v-for="item in companyOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup name="materialWarehouseDetail">
import { ref, reactive, getCurrentInstance, toRefs, onMounted } from 'vue'
import { listDept } from '@/api/system/dept'

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const data = reactive({
	formData: {
		id: null,
		warehouseCode: '',
		warehouseName: '',
		companyId: null,
		companyName: '',
	},
	companyOptions: [],
})
const { formData, companyOptions } = toRefs(data)

const rules = reactive({
	warehouseCode: proxy.getRules({ required: true }),
	warehouseName: proxy.getRules({ required: true }),
	companyId: proxy.getRules({ required: true }),
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

// 处理公司选择变化
const handleCompanyChange = (companyId) => {
	if (companyId) {
		const selectedCompany = companyOptions.value.find(item => item.value === companyId)
		if (selectedCompany) {
			formData.value.companyName = selectedCompany.label
		}
	} else {
		formData.value.companyName = ''
	}
}

// 加载公司列表（DEPT_LEVEL=1）
const loadCompanyList = () => {
	listDept({
		deptLevel: 1,
		status: '1'
	}).then(res => {
		if (res.code === '0000') {
			companyOptions.value = res.data.map(item => ({
				value: item.id,
				label: item.deptName,
			}))
		} else {
			proxy.$message.error(res.msg || '加载公司列表失败')
		}
	}).catch(error => {
		console.error('加载公司列表失败:', error)
		proxy.$message.error('加载公司列表失败')
	})
}

const resetForm = () => {
	// 逐个属性重置，保持响应式
	formData.value.id = null
	formData.value.warehouseCode = ''
	formData.value.warehouseName = ''
	formData.value.companyId = null
	formData.value.companyName = ''
	ruleForm.value?.clearValidate()
}

onMounted(() => {
	loadCompanyList()
})

defineExpose({
	validate,
	resetForm,
	formData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>

