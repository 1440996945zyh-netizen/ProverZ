<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="130px" :rules="rules" style="margin: 20px 20px">
			<el-form-item label="贸别" prop="tradeType">
				<div style="width: 100%">
					<Select
						:selectData="[
							{ label: '内贸', value: '内贸' },
							{ label: '外贸', value: '外贸' },
						]"
						v-model:value="formData.tradeType"
						v-model:label="formData.tradeType"
					/>
				</div>
			</el-form-item>
			<el-form-item label="开始载重吨" prop="dwtStart">
				<el-input v-model="formData.dwtStart" placeholder="请输入载重吨开始区间" />
			</el-form-item>
			<el-form-item label="结束载重吨" prop="dwtEnd">
				<el-input v-model="formData.dwtEnd" placeholder="请输入载重吨结束区间" />
			</el-form-item>
			<el-form-item label="预缴费用" prop="advancePayment">
				<el-input
					v-model="formData.advancePayment"
					@input="formData.advancePayment = proxy.verify('twoPoint', formData.advancePayment)"
					placeholder="请输入预缴费用"
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="system">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const ruleForm = ref()
const formData = reactive({
	id: '',
	tradeType: '',
	dwtStart: '',
	dwtEnd: '',
	advancePayment: '',
})

const rules = reactive({
	tradeType: [{ required: true, message: '请输入内外贸', trigger: 'blur' }],
	dwtStart: [{ required: true, message: '请输入载重吨开始区间', trigger: 'blur' }],
	dwtEnd: [{ required: true, message: '请输入载重吨结束区间', trigger: 'blur' }],
	advancePayment: [{ required: true, message: '请输入预缴费用', trigger: 'blur' }],
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
