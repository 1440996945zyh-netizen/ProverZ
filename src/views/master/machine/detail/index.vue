<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules">
			<el-form-item label="机械代码" prop="macCode">
				<el-input v-model="formData.macCode" placeholder="机械代码" />
			</el-form-item>
			<el-form-item label="机械名称" prop="macName">
				<el-input v-model="formData.macName" placeholder="机械名称" />
			</el-form-item>
			<el-form-item label="机械类型" prop="macTypeCode" style="width: 100%">
				<div style="width: 100%">
					<Select :dataConfig="{ params: { type: 'MAC_TYPE' } }" v-model:value="formData.macTypeCode" @change="selectChange" />
				</div>
			</el-form-item>
			<el-form-item label="机械型号" prop="macModelCode" style="width: 100%">
				<div style="width: 100%">
					<Select :selectData="dataList" v-model:value="formData.macModelCode" v-model:label="formData.macModelName" />
				</div>
			</el-form-item>
			<el-form-item label="所属部门" prop="deptId" style="width: 100%">
				<div style="width: 100%">
					<Select :dataConfig="{ params: { type: 'DEPT_MACHINE' } }" v-model:value="formData.deptId" />
				</div>
			</el-form-item>
			<el-form-item label="绑定设备" prop="imei">
				<el-input v-model="formData.imei" placeholder="绑定设备" />
			</el-form-item>
			<el-form-item label="状态" prop="status">
				<el-radio-group v-model="formData.status">
					<el-radio key="1" label="1">在用</el-radio>
					<el-radio key="0" label="0">停用</el-radio>
				</el-radio-group>
			</el-form-item>
      <el-form-item label="是否启用电子围栏" prop="isElectronFence">
        <el-radio-group v-model="formData.isElectronFence">
          <el-radio key="1" label="1">是</el-radio>
          <el-radio key="0" label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
		</el-form>
	</div>
</template>

<script setup name="berth">
import { ref, reactive, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
import api from '@/api/master/machine/index'
import publicApi from '@/api/public/index'

const deptOptions = ref([]) // 部门数据源
const ruleForm = ref()
const formData = reactive({
	macCode: '',
	macName: '',
	macTypeCode: '',
	macTypeName: '',
	macModelCode: '',
	macModelName: '',
	deptId: '',
	imei: '',
	status: '1',
  isElectronFence:'0',
})
const rules = reactive({
	macCode: proxy.getRules({
		required: true,
	}),
	macName: proxy.getRules({
		required: true,
	}),
	macTypeCode: proxy.getRules({
		required: true,
	}),
	deptId: proxy.getRules({
		required: true,
	}),
	status: proxy.getRules({
		required: true,
	}),
  isElectronFence: proxy.getRules({
		required: true,
	}),
})
const dataList = ref([])
const selectChange = () => {
	if (formData.macTypeCode != null) {
		formData.macModelCode = ''
		formData.macModelName = ''
		api.getMacModelByTypeCode(formData.macTypeCode).then(res => {
			dataList.value.splice(0, dataList.value.length)
			for (var i = 0; i < res.data.length; i++) {
				dataList.value.push({ label: res.data[i].label, value: res.data[i].value })
			}
		})
	}
}
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
	ruleForm.value.resetFields()
}
defineExpose({
	validate,
	resetForm,
	formData,
})

function getDeptTree() {
	publicApi.getDeptList().then(response => {
		deptOptions.value = proxy.handleTree(response.data)
	})
}

getDeptTree()
watch(
	() => formData.macTypeCode,
	(newV, oldV) => {
		api.getMacModelByTypeCode(formData.macTypeCode).then(res => {
			dataList.value.splice(0, dataList.value.length)
			for (var i = 0; i < res.data.length; i++) {
				dataList.value.push({ label: res.data[i].label, value: res.data[i].value })
			}
		})
	},
	{ deep: true }
)
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
