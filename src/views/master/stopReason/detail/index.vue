<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="110px" :rules="rules" style="margin: 20px 20px">
			<el-form-item label="停工原因分类" prop="stopReasonClassCode" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictListByType/STOP_REASON_CLASS' }"
						v-model:value="formData.stopReasonClassCode"
						v-model:label="formData.stopReasonClassLabel"
					/>
				</div>
			</el-form-item>
			<el-form-item label="停工类型" prop="stopReasonTypeCode" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictListByType/STOP_REASON_TYPE' }"
						v-model:value="formData.stopReasonTypeCode"
						v-model:label="formData.stopReasonTypeLabel"
					/>
				</div>
			</el-form-item>
			<el-form-item label="停工名称" prop="stopReasonName">
				<el-input v-model="formData.stopReasonName" @input="getShortCd" placeholder="请输入停工名称" />
			</el-form-item>
			<el-form-item label="助记码" prop="shorthandCode">
				<el-input v-model="formData.shorthandCode" placeholder="不输入自动生成" />
			</el-form-item>
			<el-form-item label="排序号" prop="sortNum">
				<el-input v-model="formData.sortNum" type="number" placeholder="请输入数字" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="berth">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { creatShortCd } from '@/utils/index.js'
import Select from '@/components/Select'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const ruleForm = ref()
const formData = reactive({
	id: '',
	stopReasonClassCode: '',
	stopReasonClassLabel: '',
	stopReasonName: '',
	stopReasonTypeCode: '',
	stopReasonTypeLabel: '',
	shorthandCode: '',
	sortNum: '',
})
const rules = reactive({
	stopReasonClassCode: proxy.getRules({ required: true }),
	stopReasonName: proxy.getRules({ required: true }),
	stopReasonTypeCode: proxy.getRules({ required: true }),
})

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
			console.log('succ')
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
			console.log('err')
		}
	})
	return flag
}
// 生成助记码
const getShortCd = value => {
	formData.shorthandCode = creatShortCd(value)
}
// 清空表单
const resetForm = () => {
	formData.id = ''
	ruleForm.value.resetFields()
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
