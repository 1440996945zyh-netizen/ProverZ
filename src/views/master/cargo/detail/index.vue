<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-form-item label="货种名称" prop="cargoCategoryName">
				<el-input v-model="formData.cargoCategoryName" placeholder="请输入货种名称" />
			</el-form-item>
			<el-form-item label="货类名称" prop="cargoTypeCode" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictListByType/CARGO_CATEGORY' }"
						v-model:value="formData.cargoTypeCode"
						v-model:label="formData.cargoTypeName"
					/>
				</div>
			</el-form-item>
      <el-form-item label="主要负责人" prop="mainName">
        <el-input v-model="formData.mainName" placeholder="请输入主要负责人" />
      </el-form-item>
      <el-form-item label="主要负责人电话" prop="mainMobile">
        <el-input v-model="formData.mainMobile" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="次要负责人" prop="minorName">
        <el-input v-model="formData.minorName" placeholder="请输入次要负责人" />
      </el-form-item>
      <el-form-item label="次要负责人电话" prop="minorMobile">
        <el-input v-model="formData.minorMobile" placeholder="请输入联系电话" />
      </el-form-item>
			<el-form-item label="排序号" prop="sortNum" v-if='false'>
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
import Select from '@/components/Select'

const ruleForm = ref()
const formData = reactive({
	cargoCategoryName: '',
	cargoTypeName: '',
	cargoTypeCode: '',
	sortNum: '',
	id: '',
	cargoCategoryCode: '',
  mainName:'',
  mainMobile:'',
  minorName:'',
  minorMobile:'',
})
const rules = reactive({
	cargoCategoryName: proxy.getRules({ required: true }),
	cargoTypeCode: proxy.getRules({ required: true }),
	/*sortNum: proxy.getRules({
		required: true,
		numberCheck: {
			int: 4,
		},
	}),*/
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
