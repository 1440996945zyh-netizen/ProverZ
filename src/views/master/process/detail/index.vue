<!-- 主过程编辑表单 -->
<template>
	<div class="formData">
		<el-form ref="processForm" :model="formData" :rules="rules" label-width="auto">
			<el-form-item label="作业过程" prop="processNm">
				<el-input v-model="formData.processNm" placeholder="请输入作业过程" @input="getShortCd" />
			</el-form-item>
			<el-form-item label="助记码" prop="shortCd">
				<el-input v-model="formData.shortCd" placeholder="不输入自动生成" />
			</el-form-item>
			<el-form-item label="过程种类" prop="processTypeCd">
				<div style="width: 100%">
					<Select :selectData="processTypeList" v-model:value="formData.processTypeCd" />
				</div>
			</el-form-item>
			<el-form-item label="所属计划" prop="planTypeCd">
				<div style="width: 100%">
					<Select
						:selectData="[
							{ value: '1', label: '船舶计划' },
							{ value: '2', label: '集疏港计划' },
							{ value: '3', label: '转运计划' },
							{ value: '4', label: '杂项计划' },
							{ value: '5', label: '零工计划' },
						]"
						v-model:value="formData.planTypeCd"
						v-model:label="formData.planTypeNm"
					/>
				</div>
			</el-form-item>
			<el-form-item label="源" prop="sourceCd">
				<div style="width: 100%">
					<Select :selectData="orignList"
                  v-model:value="formData.sourceCd"
                  v-model:label="formData.sourceNm"
          />
				</div>
			</el-form-item>
			<el-form-item label="目的" prop="targetCd">
				<div style="width: 100%">
					<Select :selectData="orignList"
                  v-model:value="formData.targetCd"
                  v-model:label="formData.targetNm"
          />
				</div>
			</el-form-item>
			<!-- <el-form-item label="是否选择票货" prop="isSelectSubticket">
				<el-radio-group v-model="formData.isSelectSubticket">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="是否新增目标票货" prop="isCreateTicket">
				<el-radio-group v-model="formData.isCreateTicket">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="是否合并票货" prop="isMergeTicket">
				<el-radio-group v-model="formData.isMergeTicket">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item> -->
			<el-form-item label="是否直取" prop="isDirectAccess">
				<el-radio-group v-model="formData.isDirectAccess">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="排序" prop="sortNum">
				<el-input
					v-model="formData.sortNum"
					placeholder="不填写自动生成"
					:maxlength="4"
					@input="formData.sortNum = proxy.verify('positiveNumber', formData.sortNum)"
				></el-input>
			</el-form-item>
			<el-form-item label="备注" prop="remark">
				<el-input v-model="formData.remark" placeholder="请输入备注" />
			</el-form-item>
      <el-form-item label="是否新流程" prop="newProcess">
        <div style="width: 100%">
          <Select
            :selectData="[
							{ value: '1', label: '是' },
							{ value: '2', label: '否' },
						]"
            v-model:value="formData.newProcess"
            v-model:label="formData.newProcessLabel"
          />
        </div>
      </el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import { creatShortCd } from '@/utils/index.js'
import Select from '@/components/Select'

const processForm = ref()
const props = defineProps({
	processTypeList: {
		type: Array,
		default: null,
	},
	orignList: {
		type: Array,
		default: null,
	},
})

const formData = reactive({
	processNm: '',
	processCd: '',
	shortCd: '',
	processTypeCd: '',
	planTypeCd: '',
	planTypeNm: '',
	sourceCd: '',
	targetCd: '',
	isSelectSubticket: '0',
	isCreateTicket: '0',
	isMergeTicket: '0',
	isDirectAccess: '0',
	sortNum: '',
	remark: '',
	id: '',
  newProcess:'',
})

const rules = reactive({
	processNm: proxy.getRules({ required: true }),
	processTypeCd: proxy.getRules({ required: true }),
	isSelectSubticket: proxy.getRules({ required: true }),
	isCreateTicket: proxy.getRules({ required: true }),
	isMergeTicket: proxy.getRules({ required: true }),
	isDirectAccess: proxy.getRules({ required: true }),
	shortCd: proxy.getRules({ length: '0-50' }),
	remark: proxy.getRules({ length: '0-200' }),
})
const trueFalseOptions = ref([
	{ label: '是', value: '1' },
	{ label: '否', value: '0' },
])
const getShortCd = value => {
	formData.shortCd = creatShortCd(value)
}
const validate = async () => {
	let flag = false
	await processForm.value.validate((valid, fields) => {
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
	processForm.value.resetFields()
	formData.planTypeNm = ''
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
