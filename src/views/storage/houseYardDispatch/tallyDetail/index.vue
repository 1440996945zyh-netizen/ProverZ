<template>
	<div class="formData">
		<el-form :model="formData" ref="tallyForm" label-position="left" label-width="120px">
			<el-form-item label="前沿理货员" prop="frontTallyBy">
				<Select
					:dataConfig="{ params: { type: 'USER', post: config.post.lhy } }"
					v-model:value="formData.frontTallyBy"
					v-model:label="formData.frontTallyByName"
					multiple
				/>
			</el-form-item>
			<el-form-item label="后场理货员" prop="backTallyBy">
				<Select
					:dataConfig="{ params: { type: 'USER', post: config.post.lhy } }"
					v-model:value="formData.backTallyBy"
					v-model:label="formData.backTallyByName"
					multiple
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="tallyDetail">
import { ref, reactive, nextTick, h, watch, getCurrentInstance } from 'vue'
import publicApi from '@/api/public/index' //字典
import MechanicalType from '@/businessComponents/MechanicalType/index.vue'
import config from '@/config/index.js'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'

const ruleForm = ref()
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 校验规则
const rules = ref({})

const formData = reactive({
	updateType: '0',
	id: '',
	frontTallyBy: '',
	frontTallyByName: '',
	backTallyBy: '',
	backTallyByName: '',
})

const resetForm = () => {
	ruleForm.value.resetFields()
	formData.id = '' // 清空id
}

defineExpose({
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
