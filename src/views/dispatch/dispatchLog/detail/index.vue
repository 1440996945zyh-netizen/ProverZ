<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="110px" :rules="rules" style="margin: 20px 20px">
			<el-form-item label="交班日期" prop="shiftDate" style="width: 100%">
				<!-- <div style="width: 100%">
					<el-date-picker
						v-model="formData.shiftDate"
						type="date"
						value-format="YYYY-MM-DD"
						placeholder="请选择..."
						:size="size"
					/>
				</div> -->
				<nvDatePicker v-model:value="formData.shiftDate" typeFlag="nativedate" placeholder="请选择..." />
			</el-form-item>
			<el-form-item label="交班班次" prop="shiftClassCode" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } }"
						v-model:value="formData.shiftClassCode"
						v-model:label="formData.shiftClassName"
					/>
				</div>
			</el-form-item>
			<el-form-item label="交班人" prop="shiftBy" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ params: { type: 'USER', role: 'DDY' } }"
						v-model:value="formData.shiftBy"
						v-model:label="formData.shiftByName"
					/>
				</div>
			</el-form-item>
			<el-form-item label="接班人" prop="acceptBy" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ params: { type: 'USER', role: 'DDY' } }"
						v-model:value="formData.acceptBy"
						v-model:label="formData.acceptByName"
					/>
				</div>
			</el-form-item>
			<el-form-item label="水文信息" prop="hydrologic">
				<el-input v-model="formData.hydrologic" placeholder="请输入水文信息" type="textarea" maxlength="200" show-word-limit />
			</el-form-item>
			<el-form-item label="潮汐信息" prop="tide">
				<el-input v-model="formData.tide" placeholder="请输入潮汐信息" type="textarea" maxlength="200" show-word-limit />
			</el-form-item>
			<el-form-item label="注意事项" prop="remark">
				<el-input v-model="formData.remark" maxlength="200" placeholder="请输入注意事项" show-word-limit type="textarea" />
			</el-form-item>
			<el-form-item label="附件信息" prop="">
				<Upload businessType="MASTER_SHIP_01" :businessId="formData.id" @changeFile="changeFile" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="dispatchLog">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Upload from '@/components/Upload/index.vue'
import nvDatePicker from '@/components/nvDatePicker/index.vue'
// import { getNowDate } from '@/utils/index.js'
import Select from '@/components/Select'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const ruleForm = ref()
const formData = reactive({
	id: '',
	shiftDate: '',
	shiftClassCode: '',
	shiftClassName: '',
	shiftBy: '',
	shiftByName: '',
	acceptBy: '',
	acceptByName: '',
	hydrologic: '',
	tide: '',
	remark: '',
	fileIds: [],
})
const rules = reactive({
	shiftDate: proxy.getRules({ required: true }),
	shiftClassCode: proxy.getRules({ required: true }),
	shiftBy: proxy.getRules({ required: true }),
	acceptBy: proxy.getRules({ required: true }),
	hydrologic: proxy.getRules({ length: '0-200' }),
	tide: proxy.getRules({ length: '0-200' }),
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
// 清空表单
const resetForm = () => {
	ruleForm.value.resetFields()
	formData.id = ''
	// formData.shiftDate = getNowDate()
	formData.shiftClassName = ''
	formData.shiftByName = ''
	formData.acceptByName = ''
}
// 上传文件
const changeFile = file => {
	formData.fileIds = file
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
