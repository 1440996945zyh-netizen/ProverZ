<template>
	<el-collapse v-model="activeNames">
		<el-collapse-item title="船舶资料" name="1">
			<el-descriptions :column="4" border>
				<el-descriptions-item
					v-for="item in descriptionsData[0]"
					:key="item.prop"
					:label="item.label"
					:span="item.span"
					label-class-name="my-label"
					content-class-name="my-content"
				>
					{{ shipData[0][item.prop] }}
				</el-descriptions-item>
			</el-descriptions>
		</el-collapse-item>
		<el-collapse-item title="航次信息" name="2">
			<el-descriptions :column="4" border>
				<el-descriptions-item
					v-for="item in descriptionsData[1]"
					:key="item.prop"
					:label="item.label"
					:span="item.span"
					label-class-name="my-label"
					content-class-name="my-content"
				>
					{{ shipData[1][item.prop] }}
				</el-descriptions-item>
			</el-descriptions>
		</el-collapse-item>
		<el-collapse-item title="靠离泊计划" name="3">
			<template #title>
				<div class="slotTitle">
					<span>靠离泊计划</span>
					<el-button type="link" @click.stop="saveBerth">保存</el-button>
				</div>
			</template>
			<el-form :model="formData" ref="ruleForm" label-width="80px" :rules="rules">
				<el-form-item label="货种名称" prop="cargoCategoryName">
					<el-input v-model="formData.cargoCategoryName" placeholder="请输入货种名称" />
				</el-form-item>
				<el-form-item label="货类名称" prop="cargoTypeCode" style="width: 100%">
					<div style="width: 100%">
						<Select
							:dataConfig="{ url: '/api/internal/public/getDictListByType/CARGO_CATEGORY' }"
							v-model:value="formData.cargoTypeCode"
							v-model:label="formData.cargoTypeName"
							selectLabel="dictLabel"
							selectValue="dictValue"
						/>
					</div>
				</el-form-item>
				<el-form-item label="场存节点" prop="updatePoint">
					<el-select v-model="formData.updatePoint">
						<el-option label="理货" :value="1" />
						<el-option label="签票" :value="2" />
					</el-select>
				</el-form-item>
				<el-form-item label="排序号" prop="sortNum">
					<el-input v-model="formData.sortNum" placeholder="请输入排序号" />
				</el-form-item>
			</el-form>
		</el-collapse-item>
	</el-collapse>
</template>

<script setup name="detail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
const props = defineProps({
	descriptionsData: {
		type: Array,
	},
	shipData: {
		type: Array,
	},
})
const activeNames = ref(['1', '2', '3'])
const ruleForm = ref()
const formData = reactive({
	cargoCategoryName: '',
	updatePoint: '',
	cargoTypeName: '',
	cargoTypeCode: '',
	sortNum: '',
})
const rules = reactive({
	cargoCategoryName: [{ required: true, message: '请输入货种名称', trigger: 'blur' }],
	updatePoint: [{ required: true, message: '请输入货种代码', trigger: 'blur' }],
	cargoTypeCode: [{ required: true, message: '请输入货类名称', trigger: 'blur' }],
	sortNum: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
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
	proxy.resetObj(formData)
	// console.log(ruleForm, 'ruleForm')
	// ruleForm.value.resetFields()
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
