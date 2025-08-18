<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules">
			<el-form-item label="主泊位" prop="parentCode">
				<div style="width: 100%">
					<Select
						:dataConfig="{ url: '/api/v1/internal/mBerth/getParentBerth' }"
						v-model:value="formData.parentCode"
            @change="berthChange"
						selectLabel="berthName"
						selectValue="berthCode"
						placeholder="主泊位"
					/>
				</div>
			</el-form-item>
			<el-form-item label="泊位代码" prop="berthCode">
				<el-input v-model="formData.berthCode" placeholder="泊位代码" />
			</el-form-item>
			<el-form-item label="泊位名称" prop="berthName">
				<el-input v-model="formData.berthName" placeholder="泊位名称" />
			</el-form-item>
			<el-form-item label="长度（米）" prop="berthLong">
				<el-input
					v-model="formData.berthLong"
					@input="formData.berthLong = proxy.verify('exactDecimal', formData.berthLong)"
					placeholder="泊位名称"
				/>
			</el-form-item>
      <el-form-item label="工作区域" prop="workAreaCd" style="width: 100%">
        <div style="width: 100%">
          <Select :dataConfig="{ url: '/api/internal/public/getDictListByType/WORK_AREA' }" v-model:value="formData.workAreaCd" />
        </div>
      </el-form-item>
			<el-form-item label="状态" prop="status" style="width: 100%">
				<el-radio-group v-model="formData.status">
					<el-radio key="1" label="1">在用</el-radio>
					<el-radio key="0" label="0">停用</el-radio>
				</el-radio-group>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="berth">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'

const ruleForm = ref()
const formData = reactive({
	id: '',
	parentCode: '',
	berthCode: '',
	berthName: '',
	berthLong: '',
  workAreaCd:'',
	status: '1',
})
const rules = reactive({
	berthCode: proxy.getRules({
		required: true,
	}),
	berthName: proxy.getRules({
		required: true,
	}),
	status: proxy.getRules({
		required: true,
	}),
  workAreaCd: proxy.getRules({
    required: true,
  }),
})

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
			console.log('succ')
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
			console.log('err')
		}
	})
	return flag
}
const resetForm = () => {
	formData.id = ''
	ruleForm.value.resetFields()
}
const berthChange = e => {
  formData.workAreaCd = e.workAreaCd;
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
