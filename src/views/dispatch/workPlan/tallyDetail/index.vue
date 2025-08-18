<template>
	<div class="formData">
		<el-form :model="formData" ref="tallyForm" label-position="left" label-width="120px">
			<el-form-item label="调度员" prop="dispatchBy">
				<Select
					:dataConfig="{ params: { type: 'USER', post: config.post.ddy } }"
					v-model:value="formData.dispatchBy"
					v-model:label="formData.dispatchByName"
          multiple
				/>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="tallyDetail">
import { ref, reactive, getCurrentInstance } from 'vue'
import config from '@/config/index.js'
import Select from '@/components/Select'

const ruleForm = ref()
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 校验规则
const rules = ref({})

const formData = reactive({
	updateType: '3',
	id: '',
	dispatchBy: '',
	dispatchByName: '',
  batchId:'',//批量保存
  batchFlag:'',
})

const resetForm = () => {
	formData.id = '' // 清空id
  formData.dispatchBy= ''
  formData.	dispatchByName= ''
  formData.batchId=''
  formData.batchFlag=''

}

defineExpose({
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
