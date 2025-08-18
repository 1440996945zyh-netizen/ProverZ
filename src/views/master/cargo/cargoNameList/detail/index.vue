<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="80px" :rules="rules">
			<el-form-item label="货物名称" prop="cargoName">
				<el-input v-model="formData.cargoName" placeholder="请输入货物名称" @input="getShortCd" />
			</el-form-item>
			<el-form-item label="助记码" prop="shorthandCode">
				<el-input v-model="formData.shorthandCode" placeholder="请输入助记码" />
			</el-form-item>
			<el-form-item label="作业模式" prop="workTypeLabel">
				<Select
					v-model:value="formData.workType"
					:selectData="[
						{ label: '件杂', value: 1 },
						{ label: '散杂', value: 2 },
					]"
				/>
			</el-form-item>
			<el-form-item label="计件工资类型" prop="salaryType" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictListByType/SALARY_TYPE' }"
						v-model:value="formData.salaryTypeCode"
						v-model:label="formData.salaryTypeName"
					/>
				</div>
			</el-form-item>
			<el-form-item label="理货方式" prop="tally" v-if="formData.workType !== 2">
				<Select
					v-model:value="formData.tally"
					:selectData="[
						{ label: '件号', value: 1 },
						{ label: '件数', value: 2 },
					]"
				/>
			</el-form-item>
			<el-form-item label="场存节点" prop="updatePoint">
				<Select
					v-model:value="formData.updatePoint"
					:selectData="[
						{ label: '理货', value: 1 },
						{ label: '签票', value: 2 },
					]"
				/>
			</el-form-item>
			<el-form-item label="货物颜色" prop="cargoColor">
				<el-color-picker v-model="formData.cargoColor" />
			</el-form-item>
			<el-form-item label="排序" prop="sortNum">
				<el-input
					v-model="formData.sortNum"
					placeholder="请输入数字"
					@input="formData.sortNum = proxy.verify('positiveNumber', formData.sortNum)"
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="detail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import { creatShortCd } from '@/utils/index.js'
import Select from '@/components/Select'
// 获取助记码
const getShortCd = value => {
	formData.shorthandCode = creatShortCd(value)
}
const ruleForm = ref()
const formData = reactive({
	id: '',
	cargoName: '',
	cargoCode: '',
	shorthandCode: '',
	workType: '',
	tally: '',
	sortNum: '',
	cargoColor: '',
	updatePoint: '',
	salaryTypeCode: '',
	salaryTypeName: '',
})
const rules = reactive({
	cargoName: proxy.getRules({ required: true }),
	shorthandCode: proxy.getRules({ required: true }),
	workType: proxy.getRules({ required: true }),
	tally: proxy.getRules({ required: true }),
	sortNum: proxy.getRules({
		required: true,
		numberCheck: {
			int: 4,
		},
	}),
	cargoColor: proxy.getRules({ required: true }),
	updatePoint: proxy.getRules({ required: true }),
})
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
	proxy.resetObj(formData)
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
