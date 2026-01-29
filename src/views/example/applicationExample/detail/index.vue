<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" :rules="rules" :inline="false" label-width="120px">
			<el-row>
				<el-col :span="24">
					<el-form-item label="申请日期" prop="applyTime">
						<el-date-picker
							v-model="formData.applyTime"
							type="date"
							placeholder="选择申请日期"
							:disabled="isViewMode"
							style="width: 100%"
							format="YYYY-MM-DD"
							value-format="YYYY-MM-DD"
						/>
					</el-form-item>
				</el-col>

				<el-col :span="24">
					<el-form-item label="期望付款时间" prop="expectedPaymentTime">
						<el-date-picker
							v-model="formData.expectedPaymentTime"
							type="date"
							placeholder="选择期望付款时间"
							:disabled="isViewMode"
							style="width: 100%"
							format="YYYY-MM-DD"
							value-format="YYYY-MM-DD"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="付款事由" prop="paymentTitle">
						<el-input
							v-model="formData.paymentTitle"
							placeholder="请输入付款事由"
							:disabled="isViewMode"
							show-word-limit
							maxlength="200"
						/>
					</el-form-item>
				</el-col>

				<el-col :span="24">
					<el-form-item label="付款金额" prop="paymentAmount">
						<el-input
							v-model="formData.paymentAmount"
							placeholder="请输入付款金额"
							:disabled="isViewMode"
							@input="formatAmount"
						>
							<template #prepend>¥</template>
						</el-input>
					</el-form-item>
				</el-col>

				<el-col :span="24">
					<el-form-item label="收款方名称" prop="payeeName">
						<el-input
							v-model="formData.payeeName"
							placeholder="请输入收款方名称"
							:disabled="isViewMode"
							show-word-limit
							maxlength="100"
						/>
					</el-form-item>
				</el-col>

				<el-col :span="24">
					<el-form-item label="申请人" prop="applicantId">
						<Select
							:selectData="userOptions"
							v-model:value="formData.applicantId"
							v-model:label="formData.applicantName"
							:disabled="isViewMode || !!formData.id"
						/>
						<!-- <el-select v-model="formData.applicantId" placeholder="请选择申请人" :disabled="isViewMode || !!formData.id">
							<el-option v-for="item in userOptions" :key="item.id" :label="item.nickname" :value="item.id" />
						</el-select> -->
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup name="bpmApplicationExampleDetail">
import { ref, reactive, computed, getCurrentInstance, onMounted } from 'vue'
import dayjs from 'dayjs'
import publicApi from '@/api/public/index.js'

const { proxy } = getCurrentInstance()
const ruleForm = ref()
const isViewMode = ref(false)
const userOptions = ref([]) // 用户列表选项
import Select from '@/components/Select/index.vue'

const formData = reactive({
	id: null,
	paymentTitle: '',
	paymentAmount: '',
	payeeName: '',
	applicantId: '',
	applicantName: '',
	approvalStatus: '',
	applyTime: dayjs().format('YYYY-MM-DD '),
	expectedPaymentTime: dayjs().add(7, 'day').format('YYYY-MM-DD'),
})

// 校验规则
const rules = reactive({
	paymentTitle: proxy.getRules({
		required: true,
		length: '1-200',
		message: '请输入付款事由',
	}),
	paymentAmount: [
		{ required: true, message: '请输入付款金额', trigger: 'blur' },
		{
			validator: (rule, value, callback) => {
				if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
					callback(new Error('金额格式不正确，最多保留两位小数'))
				} else if (value && Number(value) <= 0) {
					callback(new Error('金额必须大于0'))
				} else if (value && Number(value) > 9999999999999.99) {
					callback(new Error('金额不能超过9999999999999.99'))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
	payeeName: proxy.getRules({
		required: true,
		length: '1-100',
		message: '请输入收款方名称',
	}),
	applicantId: [{ required: true, message: '请选择申请人', trigger: 'change' }],
	approvalStatus: proxy.getRules({
		required: true,
		message: '请选择审批状态',
	}),
	applyTime: proxy.getRules({
		required: true,
		message: '请选择申请时间',
	}),
	expectedPaymentTime: [
		{ required: true, message: '请选择期望付款时间', trigger: 'blur' },
		{
			validator: (rule, value, callback) => {
				if (value && formData.applyTime) {
					const applyDate = dayjs(formData.applyTime)
					const expectedDate = dayjs(value)
					if (expectedDate.isBefore(applyDate, 'day')) {
						callback(new Error('期望付款时间不能早于申请时间'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
})

// 组件挂载时加载用户列表
onMounted(async () => {
	await loadUserOptions()
})

// 加载用户选项
const loadUserOptions = async () => {
	try {
		const userResData = await publicApi.getLocalSelect({ type: 'USER' })
		if (userResData && userResData.data) {
			userOptions.value = userResData.data
		} else {
			userOptions.value = []
		}
	} catch (error) {
		console.error('加载用户列表失败:', error)
		userOptions.value = []
	}
}

// 格式化金额输入
const formatAmount = () => {
	if (formData.paymentAmount) {
		// 移除非数字字符，除了小数点
		let value = formData.paymentAmount.replace(/[^\d.]/g, '')

		// 确保只有一个小数点
		const parts = value.split('.')
		if (parts.length > 2) {
			value = parts[0] + '.' + parts.slice(1).join('')
		}

		// 限制小数点后最多两位
		if (parts.length === 2 && parts[1].length > 2) {
			value = parts[0] + '.' + parts[1].substring(0, 2)
		}

		formData.paymentAmount = value
	}
}

// 格式化日期时间
const formatDateTime = dateTime => {
	if (!dateTime) return '-'
	return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

// 验证表单
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

// 重置表单
const resetForm = () => {
	isViewMode.value = false
	Object.keys(formData).forEach(key => {
		if (key === 'approvalStatus') {
			formData[key] = '0'
		} else if (key === 'expectedPaymentTime' || key === 'applyTime') {
			formData[key] = dayjs().add(7, 'day').format('YYYY-MM-DD')
		} else {
			formData[key] = null
		}
	})

	if (ruleForm.value) {
		ruleForm.value.resetFields()
	}
}

// 设置表单数据（用于编辑时回填）
const setFormData = data => {
	Object.keys(data).forEach(key => {
		if (data[key] !== undefined && data[key] !== null) {
			formData[key] = data[key]
		}
	})
}

defineExpose({
	validate,
	resetForm,
	formData,
	isViewMode,
	setFormData,
})
</script>

<style lang="scss" scoped>
.formData {
	padding: 20px;

	.el-row {
		margin-bottom: 15px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.el-divider {
		margin: 20px 0;
	}
}
</style>
