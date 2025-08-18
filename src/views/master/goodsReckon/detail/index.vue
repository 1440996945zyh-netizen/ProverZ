<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-form-item label="货种名称" prop="cargoCategoryCode" >
				<Select
					v-model:value="formData.cargoCategoryCode"
					v-model:label="formData.cargoCategoryName"
					:selectData="cargoNamesList"
					selectValue="cargoCategoryCode"
					selectLabel="cargoCategoryName"
					:filterable="true"
          disabled
				/>
			</el-form-item>
			<el-form-item label="货物名称" prop="cargoName" >
				<el-input v-model="formData.cargoName" placeholder="请输入货物名称" @input="getShortCd" disabled/>
			</el-form-item>
			<el-form-item label="助记码" prop="shorthandCode" >
				<el-input v-model="formData.shorthandCode" placeholder="请输入助记码" disabled/>
			</el-form-item>
      <el-form-item label="货物标识码" prop="sign" >
				<el-input v-model="formData.sign" placeholder="请输入货物标识码" disabled/>
			</el-form-item>
			<el-form-item label="作业模式" prop="workTypeLabel">
				<Select
					v-model:value="formData.workType"
					:selectData="[
						{ label: '件杂', value: 1 },
						{ label: '散杂', value: 2 },
					]"
          disabled
				/>
			</el-form-item>
			<el-form-item label="理货方式" prop="tally" v-if="formData.workType !== 2">
				<Select
					v-model:value="formData.tally"
					:selectData="[
						{ label: '件号', value: 1 },
						{ label: '件数', value: 2 },
					]"
          disabled
				/>
			</el-form-item>
			<el-form-item label="场存节点" prop="updatePoint">
				<Select
					v-model:value="formData.updatePoint"
					:selectData="[
						{ label: '理货', value: 1 },
						{ label: '签票', value: 2 },
					]"
          disabled
				/>
			</el-form-item>
			<el-form-item label="货物颜色" prop="cargoColor">
				<el-color-picker v-model="formData.cargoColor"  disabled/>
			</el-form-item>
      <el-form-item label="计件工资类型(库场)" prop="yardSalaryType" style="width: 100%">
        <div style="width: 100%">
          <Select
            :dataConfig="{ url: '/api/internal/public/getDictListByType/SALARY_TYPE' }"
            v-model:value="formData.yardSalaryTypeCode"
            v-model:label="formData.yardSalaryTypeName"
          />
        </div>
      </el-form-item>
      <el-form-item label="计件工资类型(调度)" prop="dispatchSalaryType" style="width: 100%">
        <div style="width: 100%">
          <Select
            :dataConfig="{ url: '/api/internal/public/getDictListByType/SALARY_TYPE' }"
            v-model:value="formData.dispatchSalaryTypeCode"
            v-model:label="formData.dispatchSalaryTypeName"
          />
        </div>
      </el-form-item>
      <el-form-item label="计件工资类型(流机)" prop="flowSalaryType" style="width: 100%">
        <div style="width: 100%">
          <Select
            :dataConfig="{ url: '/api/internal/public/getDictListByType/SALARY_TYPE' }"
            v-model:value="formData.flowSalaryTypeCode"
            v-model:label="formData.flowSalaryTypeName"
          />
        </div>
      </el-form-item>
      <el-form-item label="计件工资类型(固机)" prop="fixedSalaryType" style="width: 100%">
        <div style="width: 100%">
          <Select
            :dataConfig="{ url: '/api/internal/public/getDictListByType/SALARY_TYPE' }"
            v-model:value="formData.fixedSalaryTypeCode"
            v-model:label="formData.fixedSalaryTypeName"
          />
        </div>
      </el-form-item>
      <el-form-item label="浮动量(‰)" prop="floatTon" style="width: 100%">
        <div style="width: 100%">
          <el-input
            v-model="formData.floatTon"
            placeholder="请输入数字"
            @input="formData.floatTon = proxy.verify('positiveNumber', formData.floatTon)"
            disabled
          />
        </div>
      </el-form-item>
			<el-form-item label="排序" prop="sortNum"  v-if='false'>
				<el-input
					v-model="formData.sortNum"
					placeholder="请输入数字"
					@input="formData.sortNum = proxy.verify('positiveNumber', formData.sortNum)"
          disabled
				/>
			</el-form-item>
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
	cargoCategoryCode: proxy.getRules({ required: true }),
	cargoName: proxy.getRules({ required: true }),
	shorthandCode: proxy.getRules({ required: true }),
	workType: proxy.getRules({ required: true }),
	tally: proxy.getRules({ required: true }),
	// sortNum: proxy.getRules({
	// 	required: true,
	// 	numberCheck: {
	// 		int: 4,
	// 	},
	// }),
	cargoColor: proxy.getRules({ required: true }),
	updatePoint: proxy.getRules({ required: true }),
  floatTon: proxy.getRules({ required: true }),
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
		console.log('货种列表数据', res)
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
