<template>
	<div class="formData">
		<el-form ref="ruleForm" :model="formData" :rules="rules" label-position="top" label-width="120px">
			<el-row :gutter="24">
				<el-col :span="8">
					<el-form-item label="培训计划">
						<el-input v-model="formData.planName" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="被考核人员">
						<el-input v-model="formData.userName" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="考核时间">
						<el-input v-model="formData.examTime" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="考核人员">
						<el-input v-model="formData.examinerNames" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="成绩" prop="score">
						<el-input-number v-model="formData.score" :precision="2" :min="0" :max="100" controls-position="right" />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="是否合格" prop="isPass">
						<el-select v-model="formData.isPass" placeholder="请选择是否合格">
							<el-option label="合格" value="1" />
							<el-option label="不合格" value="0" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="录入状态">
						<el-input :model-value="formData.resultStatus === '1' ? '已录入' : '待录入'" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="备注">
						<el-input v-model="formData.remark" type="textarea" :rows="4" placeholder="请输入考核备注" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup name="educationTrainingResultDetail">
import { ref, reactive, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const ruleForm = ref(null)
const formData = ref({
	id: '',
	planName: '',
	userName: '',
	examTime: '',
	examinerNames: '',
	score: null,
	isPass: '',
	resultStatus: '0',
	remark: '',
})

const rules = reactive({
	score: proxy.getRules({ required: true }),
	isPass: proxy.getRules({ required: true }),
})

const setData = data => {
	formData.value = { ...formData.value, ...data }
	if (ruleForm.value) ruleForm.value.clearValidate()
}

const validate = async () => {
	let flag = false
	await ruleForm.value.validate(valid => {
		flag = valid
	})
	return flag
}

defineExpose({
	formData,
	setData,
	validate,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
