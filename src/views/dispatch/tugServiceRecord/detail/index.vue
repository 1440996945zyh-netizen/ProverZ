<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="150px" :rules="rules" style="margin: 20px 20px">
			<el-form-item label="拖轮名称" prop="tugId" style="width: 100%">
				<div style="width: 100%">
					<Select :dataConfig="{ params: { type: 'TUG' } }" v-model:value="formData.tugId" v-model:label="formData.tugName" />
				</div>
			</el-form-item>
			<el-form-item label="服务内容" prop="tugServiceType" style="width: 100%">
				<div style="width: 100%">
					<Select
						:dataConfig="{ params: { type: 'DICT', dictType: 'TUG_SERVICE_TYPE' } }"
						v-model:value="formData.tugServiceType"
						v-model:label="formData.tugServiceTypeName"
					/>
				</div>
			</el-form-item>
			<el-form-item label="是否标准使用" prop="isStandardUse">
				<el-radio-group v-model="formData.isStandardUse" @change="changeStd">
					<el-radio v-for="item in trueFalseOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="非标准使用原因" prop="closeReason">
				<el-select
					v-model="formData.closeReason"
					filterable
					allow-create
					default-first-option
					:reserve-keyword="false"
					placeholder="请输入非标准使用原因"
					@change="selectChange"
					:disabled="dis"
				>
					<el-option v-for="item in reasonList" :key="item.value" :label="item.label" :value="item" />
				</el-select>
			</el-form-item>
			<el-form-item label="开始时间" prop="startTime">
				<!-- <el-date-picker
					format="YYYY-MM-DD HH:mm"
					v-model="formData.startTime"
					type="datetime"
					placeholder="开始时间"
					value-format="YYYY-MM-DD HH:mm"
					@change="changeDate"
				/> -->
				<nvDatePicker v-model:value="formData.startTime" typeFlag="nativedatetime" @change="changeDate" />
			</el-form-item>
			<el-form-item label="结束时间" prop="endTime">
				<!-- <el-date-picker
					format="YYYY-MM-DD HH:mm"
					v-model="formData.endTime"
					type="datetime"
					placeholder="结束时间"
					value-format="YYYY-MM-DD HH:mm"
					@change="changeDate"
				/> -->
				<nvDatePicker v-model:value="formData.endTime" typeFlag="nativedatetime" @change="changeDate" />
			</el-form-item>
			<el-form-item label="服务时长(小时)" prop="timeLength" style="width: 100%">
				<el-input v-model="formData.timeLength" placeholder="请输入服务时长" />
			</el-form-item>
			<el-form-item label="航次" prop="shipvoyageItemId" style="width: 100%">
				<RemoteSelect type="VOYAGE" v-model:value="formData.shipvoyageItemId" @change="changeShipName" />
			</el-form-item>
			<el-form-item label="注意事项" prop="remark" style="width: 100%">
				<el-input v-model="formData.remark" placeholder="请输入注意事项" type="textarea"></el-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="tugServiceRecord">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { creatShortCd } from '@/utils/index.js'
import { getDuration } from '@/utils/index.js'
import RemoteSelect from '@/components/RemoteSelect'
import Select from '@/components/Select'
import publicApi from '@/api/public'
import nvDatePicker from '@/components/nvDatePicker/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const ruleForm = ref()
const times = ref([])
const dis = ref([])
const reasonList = ref([])
const formData = reactive({
	id: '',
	shipId: '',
	shipName: '',
	tugId: '',
	tugName: '',
	shipvoyageId: '',
	shipvoyageItemId: '',
	tugServiceType: '',
	tugServiceTypeName: '',
	startTime: '',
	endTime: '',
	timeLength: '',
	remark: '',
	isStandardUse: '1',
	notStandardReasonCode: '',
	notStandardReasonName: '',
	closeReason: null,
})
const rules = reactive({
	shipName: proxy.getRules({ length: '0-20' }),
	tugId: proxy.getRules({ required: true }),
	tugServiceType: proxy.getRules({ required: true }),
	startTime: proxy.getRules({ required: true }),
	endTime: proxy.getRules({ required: true }),
	timeLength: proxy.getRules({
		required: true,
		numberCheck: {
			int: 6,
			dec: 1,
		},
	}),
	remark: proxy.getRules({ length: '0-200' }),
})
const trueFalseOptions = ref([
	{ label: '是', value: '1' },
	{ label: '否', value: '0' },
])

const selectChange = e => {
	var flag = true
	reasonList.value.forEach(item => {
		console.log(item.value, 'e.value')
		if (item.value == e.value) {
			formData.reasonCode = item.value
			formData.reasonName = item.label
			flag = false
		}
	})
	if (flag) {
		formData.reasonCode = 0 //等于0时后端会增加新的字典信息
		formData.reasonName = e
	}
}

const changeStd = e => {
	console.log('e', e)
	if (e == 1) {
		console.log('true1')
		dis.value = true
	} else {
		console.log('true2')
		dis.value = false
	}
}

const changeDate = val => {
	if (formData.startTime && formData.endTime) {
		times.value[0] = formData.startTime
		times.value[1] = formData.endTime
		formData.timeLength = getDuration('hour', times.value)
	}
}
// 监听
// watch(
// 	() => formData.times,
// 	newVal => {
// 		if (newVal) {
// 			formData.timeLength = getDuration('hour', newVal)
// 		} else {
// 			formData.timeLength = ''
// 		}
// 	},
// 	{ deep: true }
// )
const changeShipName = val => {
	formData.shipName = val.shipName
	formData.shipId = val.shipId
}

const init = () => {}

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
// 清空表单
const resetForm = () => {
	ruleForm.value.resetFields()
	formData.id = ''
	formData.shipName = ''
	formData.tugName = ''
	formData.tugServiceTypeName = ''
	formData.startTime = ''
	formData.endTime = ''
	;(formData.isStandardUse = '1'), (formData.shipvoyageId = '')
	formData.reasonCode = ''
	formData.reasonName = ''
	// formData.times = []
	//更新reasonList内容
	publicApi.getLocalSelect({ type: 'DICT', dictType: 'DIS_TUG_REASON' }).then(res => {
		console.log(reasonList.value, '1')
		console.log(res.data.length, 'res.data.length')
		console.log(res.data, 'res.data')
		if (res.data != null && res.data.length != 0) {
			reasonList.value = res.data
		}
		console.log(reasonList.value, '2')
	})
}
defineExpose({
	validate,
	resetForm,
	formData,
	dis,
	reasonList,
})
init()
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
