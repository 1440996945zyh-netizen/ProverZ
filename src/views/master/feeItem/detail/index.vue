<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="110px" :rules="rules">
			<el-form-item label="费目编号" prop="itemCd">
				<el-input v-model="formData.itemCd" placeholder="请输入费目编号" />
			</el-form-item>
			<el-form-item label="费目名称" prop="itemNm">
				<el-input v-model="formData.itemNm" placeholder="请输入费目名称" />
			</el-form-item>
			<el-form-item label="费目类型" prop="itemTypeCd" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictList?types=FEE_ITEM_TYPE', dictType: 'FEE_ITEM_TYPE' }"
						v-model:value="formData.itemTypeCd"
						v-model:label="formData.itemTypeNm"
					/>
				</div>
			</el-form-item>
			<el-form-item label="费用类型" prop="rateTypeCd" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/internal/public/getDictList?types=RATE_TYPE', dictType: 'RATE_TYPE' }"
						v-model:value="formData.rateTypeCd"
						v-model:label="formData.rateTypeNm"
					/>
				</div>
			</el-form-item>
      <el-form-item label="税收分类编码" prop="productCode">
        <el-input v-model="formData.productCode" placeholder="请输入费目名称" />
      </el-form-item>
			<el-form-item label="是否主营收入" prop="isMainIncome">
				<el-radio-group v-model="formData.isMainIncome">
					<el-radio label="1">是</el-radio>
					<el-radio label="0">否</el-radio>
				</el-radio-group>
			</el-form-item>
      <el-form-item label="是否租赁" prop="isLease">
        <el-radio-group v-model="formData.isLease">
          <el-radio label="1">是</el-radio>
          <el-radio label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
			<el-form-item label="排序号" prop="sortNum">
				<el-input
					v-model="formData.sortNum"
					placeholder="请输入排序号"
					@input="formData.sortNum = proxy.verify('positiveNumber', formData.sortNum)"
				/>
			</el-form-item>

			<el-form-item label="备注" prop="remark">
				<el-input v-model="formData.remark" placeholder="请输入备注" />
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
	itemCd: '',
	itemNm: '',
	itemTypeCd: '',
	itemTypeNm: '',
	rateTypeCd: '',
	rateTypeNm: '',
	status: '',
	sortNum: '',
	isMainIncome: '0',
	isLease: '0',
	remark: '',
	id: '',
  productCode: '',
})
const rules = reactive({
	itemCd: proxy.getRules({ required: true }),
	itemNm: proxy.getRules({ required: true }),
	itemTypeCd: proxy.getRules({ required: true }),
	status: proxy.getRules({ required: true }),
	isMainIncome: proxy.getRules({ required: true }),
	isLease: proxy.getRules({ required: true }),
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
