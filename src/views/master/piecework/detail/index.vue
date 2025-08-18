<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="140px" :rules="rules" :disabled="formDisabled">
			<el-form-item label="作业公司" prop="companyId">
				<Select
					:dataConfig="{
						params: { type: 'DEPT_LEVEL', deptLevel: '1' },
					}"
					v-model:value="formData.companyId"
					v-model:label="formData.companyName"
					@change="changeCompany"
				/>
			</el-form-item>
			<el-form-item label="部门" prop="deptId">
				<Select v-model:value="formData.deptId" v-model:label="formData.deptName" :select-data="deptData" />
			</el-form-item>
			<el-form-item label="计件工资项目名称" prop="pieceProjectCode" style="width: 100%">
				<Select
					:dataConfig="{ url: '/api/internal/public/getDictList?types=PIECE_PROJECT', dictType: 'PIECE_PROJECT' }"
					v-model:value="formData.pieceProjectCode"
					v-model:label="formData.pieceProjectName"
				/>
			</el-form-item>
			<el-form-item label="是否更新港存" prop="isUpdateStorage">
				<el-radio-group v-model="formData.isUpdateStorage">
					<el-radio label="1">是</el-radio>
					<el-radio label="0">否</el-radio>
				</el-radio-group>
			</el-form-item>
		</el-form>
	</div>
</template>
<script setup name="piecework">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import api from '@/api/produce/piecework/index'
import piecework from '@/api/produce/piecework/index'
import publicApi from '@/api/public/index' //字典
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const ruleForm = ref()
const formData = ref({
	id: '',
	companyId: '',
	companyName: '',
	deptId: '',
	deptName: '',
	pieceProjectCode: '',
	pieceProjectName: '',
	isUpdateStorage: '1',
})
const deptData = ref([])
const deptName = ref('')
const changeCompany = () => {
	publicApi.getLocalSelect({ type: 'DEPT_LEVEL', deptLevel: '4', parentDeptGid: formData.value.companyId }).then(res => {
		console.log(formData.value.companyId, 'res111111111111111111111111')
		deptData.value = res.data
		console.log(deptData.value)
	})
}
const rules = reactive({
	companyId: proxy.getRules({ required: true }),
	companyName: proxy.getRules({ required: true }),
	deptId: proxy.getRules({ required: true }),
	deptName: proxy.getRules({ required: true }),
	pieceProjectCode: proxy.getRules({ required: true }),
	pieceProjectName: proxy.getRules({ required: true }),
	isUpdateStorage: proxy.getRules({ required: true }),
})

const resetForm = () => {
	proxy.resetObj(formData.value)
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
defineExpose({
	validate,
	resetForm,
	formData,
	changeCompany,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
