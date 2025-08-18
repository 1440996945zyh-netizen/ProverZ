<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-form-item label="货种名称" prop="cargoCategoryCode">
				<Select disabled
					v-model:value="formData.cargoCategoryCode"
					v-model:label="formData.cargoCategoryName"
					:selectData="cargoNamesList"
					selectValue="cargoCategoryCode"
					selectLabel="cargoCategoryName"
					:filterable="true"
				/>
			</el-form-item>
			<el-form-item label="货物名称" prop="cargoName">
				<el-input disabled v-model="formData.cargoName" placeholder="请输入货物名称" @input="getShortCd" />
			</el-form-item>
			<el-form-item label="助记码" prop="shorthandCode">
				<el-input disabled v-model="formData.shorthandCode" placeholder="请输入助记码" />
			</el-form-item>
      <el-form-item label="货物标识码" prop="sign">
				<el-input disabled v-model="formData.sign" placeholder="请输入货物标识码" />
			</el-form-item>
      <el-form-item disabled label="外付合同分类" prop="sign">
<!--        <Select-->
<!--          v-model:value="formData.cargoCategoryCode"-->
<!--          v-model:label="formData.cargoCategoryName"-->
<!--          :selectData="cargoNamesList"-->
<!--          selectValue="cargoCategoryCode"-->
<!--          selectLabel="cargoCategoryName"-->
<!--          :filterable="true"-->
<!--        />-->
        <Select  :dataConfig="{ params: { type: 'WBHTFL' } }"
                 v-model:value='formData.outwardType'
                 v-model:label='formData.outwardTypeName'
                 placeholder='作业公司'
        />
			</el-form-item>
<!--      <el-form-item label="外付包装" prop="sign">-->
<!--        <Select-->
<!--          v-model:value="formData.cargoCategoryCode"-->
<!--          v-model:label="formData.cargoCategoryName"-->
<!--          :selectData="cargoNamesList"-->
<!--          selectValue="cargoCategoryCode"-->
<!--          selectLabel="cargoCategoryName"-->
<!--          :filterable="true"-->
<!--        />-->
<!--			</el-form-item>-->
<!--			<el-form-item label="作业模式" prop="workTypeLabel">-->
<!--				<Select-->
<!--					v-model:value="formData.workType"-->
<!--					:selectData="[-->
<!--						{ label: '件杂', value: 1 },-->
<!--						{ label: '散杂', value: 2 },-->
<!--					]"-->
<!--				/>-->
<!--			</el-form-item>-->
<!--			<el-form-item label="理货方式" prop="tally" v-if="formData.workType !== 2">-->
<!--				<Select-->
<!--					v-model:value="formData.tally"-->
<!--					:selectData="[-->
<!--						{ label: '件号', value: 1 },-->
<!--						{ label: '件数', value: 2 },-->
<!--						{ label: '箱号', value: 3 },-->
<!--					]"-->
<!--				/>-->
<!--			</el-form-item>-->
<!--			<el-form-item label="场存节点" prop="updatePoint">-->
<!--				<Select-->
<!--					v-model:value="formData.updatePoint"-->
<!--					:selectData="[-->
<!--						{ label: '理货', value: 1 },-->
<!--						{ label: '签票', value: 2 },-->
<!--					]"-->
<!--				/>-->
<!--			</el-form-item>-->
		</el-form>
	</div>
</template>

<script setup name="detail">
import api from '@/api/master/goods/index.js'
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
  outwardType:'',
  outwardTypeName:'',
	id: '',
	cargoCategoryCode: '', //货物统称
	cargoName: '',
	cargoCode: '',
	shorthandCode: '',
	workType: '',
	tally: '',
	sortNum: '',
	cargoColor: '',
	updatePoint: '',
	yardSalaryTypeCode: '',
	yardSalaryTypeName: '',
  dispatchSalaryTypeCode: '',
  dispatchSalaryTypeName: '',
  flowSalaryTypeCode: '',
  flowSalaryTypeName: '',
  fixedSalaryTypeCode: '',
  fixedSalaryTypeName: '',
  sign:'',
  floatTon: '',
})
const rules = reactive({
	cargoCategoryCode: proxy.getRules({ required: false }),
	cargoName: proxy.getRules({ required: false }),
	shorthandCode: proxy.getRules({ required: false }),
	workType: proxy.getRules({ required: false }),
	tally: proxy.getRules({ required: false }),
	// sortNum: proxy.getRules({
	// 	required: true,
	// 	numberCheck: {
	// 		int: 4,
	// 	},
	// }),
	cargoColor: proxy.getRules({ required: false }),
	updatePoint: proxy.getRules({ required: false }),
  floatTon: proxy.getRules({ required: false }),
})
// 货物统称列表
const cargoNamesList = ref([])
const getCargoNameList = () => {
	let queryParams = {
		startPage: 1,
		pageSize: 500,
		// cargoCategoryCode: '03000003',
	}
	api.getCargoCategoryList(queryParams).then(res => {
		cargoNamesList.value = res.data.pages
		// tableData.value = res.data.pages
		// total.value = res.data.totalNum
	})
}
getCargoNameList()
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
