<template>
		<el-form :model="formData" ref="ruleForm" label-width="80px" :rules="rules" style="margin: 20px 20px">
			<el-form-item label="港口代码" prop="portCode">
				<el-input v-model="formData.portCode" placeholder="请输入港口编号" />
			</el-form-item>
			<el-form-item label="港口名称" prop="portName">
				<el-input v-model="formData.portName" @input="getShortCd" placeholder="请输入港口名称" />
			</el-form-item>
			<el-form-item label="助记码" prop="shorthandCode">
				<el-input v-model="formData.shorthandCode" placeholder="不输入自动生成" />
			</el-form-item>
			<el-form-item label="国籍" prop="nationCode" style="width: 100%" v-if="formData.isDomestic == '0' ? true : false">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictListByType/NATION' }"
						v-model:value="formData.nationCode"
						v-model:label="formData.nationName"
						placeholder="国籍"
					/>
				</div>
			</el-form-item>
			<el-form-item label="所属省份" prop="provinceCode" v-if="formData.isDomestic == '1' ? true : false">
				<div style="width: 100%">
					<Select
						@change="changeProvince"
						:dataConfig="{ params: { type: 'PROVINCE' } }"
						v-model:value="formData.provinceCode"
						v-model:label="formData.provinceName"
					/>
				</div>
			</el-form-item>
			<el-form-item label="所属城市" prop="cityCode" v-if="formData.isDomestic == '1' ? true : false">
				<div style="width: 100%">
					<Select
						:dataConfig="{ params: { type: 'CITY', parent: formData.provinceCode } }"
						v-model:value="formData.cityCode"
						v-model:label="formData.cityName"
					/>
				</div>
			</el-form-item>
			<el-form-item label="航线" prop="routeCode">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictListByType/ROUTE' }"
						v-model:value="formData.routeCode"
						v-model:label="formData.routeName"
					/>
				</div>
			</el-form-item>
			<el-form-item label="排序号" prop="sortNum">
				<el-input v-model="formData.sortNum" type="number" placeholder="请输入数字" />
			</el-form-item>
		</el-form>
</template>

<script setup name="port">
import { ref, reactive, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import { creatShortCd } from '@/utils/index.js'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const ruleForm = ref()
const formData = reactive({
	id: '',
	portCode: '',
	portName: '',
	shorthandCode: '',
	nationCode: '',
	nationName: '',
	provinceCode: '',
	provinceName: '',
	cityCode: '',
	cityName: '',
	routeCode: '',
	routeName: '',
	sortNum: '',
	isDomestic: '1',
})
const rules = reactive({
	portCode: proxy.getRules({ required: true, length: '0-30' }),
	portName: proxy.getRules({ required: true, length: '0-50' }),
	shorthandCode: proxy.getRules({ length: '0-50' }),
	nationCode: proxy.getRules({ required: true }),
	provinceCode: proxy.getRules({ required: true }),
	cityCode: proxy.getRules({ required: true }),
})
const changeProvince = val => {
	formData.cityCode = ''
	formData.cityName = ''
}
// 生成助记码
const getShortCd = value => {
	formData.shorthandCode = creatShortCd(value)
}
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
	ruleForm.value.resetFields()
	formData.id = ''
	formData.nationName = ''
	formData.provinceName = ''
	formData.cityName = ''
	formData.routeName = ''
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
