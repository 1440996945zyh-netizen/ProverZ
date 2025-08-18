<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="80px" :rules="rules">
			<el-form-item label="服务名" prop="serviceNm">
				<el-input v-model="formData.serviceNm" placeholder="请输入服务名" @input="getShortCd" />
			</el-form-item>
			<el-form-item label="助记码" prop="shortCd">
				<el-input v-model="formData.shortCd" placeholder="不输入自动生成" />
			</el-form-item>
			<el-form-item label="作业过程" prop="processList" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ params: { type: 'MAIN_WORK_PROCESS' } }"
						v-model:value="formData.processList"
						v-model:label="formData.processNms"
						:multiple="true"
					/>
				</div>
			</el-form-item>

			<el-form-item label="进出口" prop="processList" style="width: 100%">
				<div style="width: 100%">
					<el-radio-group v-model="formData.inOut" class="ml-4">
						<el-radio label="IN" size="large">进口</el-radio>
						<el-radio label="OUT" size="large">出口</el-radio>
					</el-radio-group>
				</div>
			</el-form-item>

			<el-form-item label="出入库/直取" prop="processList" style="width: 100%">
				<div style="width: 100%">
					<el-radio-group v-model="formData.inOutStorage" class="ml-4">
						<el-radio label="1" size="large">出入库</el-radio>
						<el-radio label="2" size="large">直取</el-radio>
					</el-radio-group>
				</div>
			</el-form-item>

			<el-form-item label="备注" prop="remark">
				<el-input v-model="formData.remark" placeholder="请输入备注" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="detail">
import { ref, reactive, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import { creatShortCd } from '@/utils/index.js'
import Select from '@/components/Select'

const ruleForm = ref()
const formData = reactive({
	serviceNm: '',
	shortCd: '',
	processList: [],
	processStr: '',
	processNms: [],
	remark: '',
	id: '',
	inOut: '',
	inOutStorage: '',
})
const rules = reactive({
	serviceNm: proxy.getRules({ required: true, length: '1-50' }),
	processList: proxy.getRules({ required: true }),
	shortCd: proxy.getRules({ length: '1-50' }),
	remark: proxy.getRules({ length: '0-200' }),
})
// 获取助记码
const getShortCd = value => {
	formData.shortCd = creatShortCd(value)
}
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
const resetForm = () => {
	formData.id = ''
	ruleForm.value.resetFields()
	formData.processNms = ''
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
