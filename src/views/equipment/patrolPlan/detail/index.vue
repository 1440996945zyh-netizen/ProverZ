<template>
	<div class="formData">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="计划信息" name="1">
				<el-form :model="formData" ref="ruleForm" label-width="120px" label-position="top" :rules="rules">
					<el-row :gutter="24">
						<el-col :span="8">
							<el-form-item label="巡检编号" prop="planCode">

								<el-input v-model="formData.planCode" placeholder="巡检编号" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="巡检名称" prop="planName">
								<el-input v-model="formData.planName" placeholder="巡检名称" />

							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="线路名称" prop="routeId">
								<Select :selectData="routeOptions" v-model:value="formData.routeId"
									v-model:label="formData.routeName" :selectValue="'id'" :selectLabel="'routeName'"
									placeholder="请选择线路名称" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="巡检类型" prop="patrolType">
								<Select :selectData="[
									{ label: '日', value: '1' },
									{ label: '周', value: '2' },
									{ label: '月', value: '3' },
									{ label: '年', value: '4' }
								]" v-model:value="formData.patrolType" @change="handlePatrolTypeChange" />
							</el-form-item>
						</el-col>
						<el-col :span="8" v-if="cycleTitle == '天'">
							<el-form-item label="初始日期" prop="initialDate">
								<template #label>
									<span>
										初始日期
										<el-tooltip lass="box-item" effect="dark" content="设置点检计划/任务开始日期" placement="top">
											<el-icon>
												<QuestionFilled />
											</el-icon>
										</el-tooltip>
									</span>
								</template>
								<el-date-picker v-model="formData.initialDate" type="date" value-format="YYYY-MM-DD"
									format="YYYY-MM-DD" placeholder="初始日期"></el-date-picker>
							</el-form-item>
						</el-col>
						<el-col :span="8" v-else>
							<el-form-item label="初始数据" prop="initialNumber">
								<template #label>
									<span>
										初始数据
										<el-tooltip lass="box-item" effect="dark" content="设备开始计算数" placement="top">
											<el-icon>
												<QuestionFilled />
											</el-icon>
										</el-tooltip>
									</span>
								</template>
								<el-input v-model="formData.initialNumber" placeholder="初始数据"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="是否单次" prop="isSingle">
								<Select :selectData="[
									{ label: '是', value: '1' },
									{ label: '否', value: '2' },
								]" v-model:value="formData.isSingle" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="是否生效" prop="status">
								<Select :selectData="[
									{ label: '是', value: '1' },
									{ label: '否', value: '2' },
								]" v-model:value="formData.status" />
							</el-form-item>
						</el-col>
						<el-col :span="8" v-if="!'1234'.includes(formData.patrolType)">
							<el-form-item :label="'巡检周期（' + cycleTitle + '）'" prop="cycle">
								<template #label>
									<span>
										巡检周期（{{ cycleTitle }}）
										<el-tooltip lass="box-item" effect="dark" content="设备作业多少数开始下次巡检任务" placement="top">
											<el-icon>
												<QuestionFilled />
											</el-icon>
										</el-tooltip>
									</span>
								</template>
								<el-input v-model="formData.cycle" placeholder="周期" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="巡检时限（天）" prop="timeLimit">
								<template #label>
									<span>
										巡检时限（天）
										<el-tooltip lass="box-item" effect="dark" content="通过巡检时限计算巡检任务截止日期（多少天内完成巡检任务）"
											placement="top">
											<el-icon>
												<QuestionFilled />
											</el-icon>
										</el-tooltip>
									</span>
								</template>
								<el-input v-model="formData.timeLimit" placeholder="时限" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="巡检员" prop="patrolId">
								<Select :selectData="inspectionList" v-model:value="formData.patrolId"
									v-model:label="formData.patrolName" />
							</el-form-item>
						</el-col>
						<el-col :span="24" v-if="formData.patrolType == 2">
							<el-form-item label="选择天" prop="setDate">
								<el-checkbox-group v-model="formData.setDate" @change="handleSetDateChange">
									<el-checkbox v-for="item in weekList" :key="item" :value="item"
										:label="item"></el-checkbox>
								</el-checkbox-group>
							</el-form-item>
						</el-col>
						<el-col :span="24" v-if="formData.patrolType == 3">
							<el-form-item label="选择天" prop="setDate">
								<el-checkbox-group v-model="formData.setDate" @change="handleSetDateChange">
									<el-checkbox v-for="item in monthList" :key="item" :value="item"
										:label="item"></el-checkbox>
								</el-checkbox-group>
							</el-form-item>
						</el-col>
						<el-col :span="24" v-if="formData.patrolType == 4">
							<el-form-item label="选择月" prop="setDate">
								<el-checkbox-group v-model="formData.setDate" @change="handleSetDateChange">
									<el-checkbox v-for="item in yearList" :key="item" :value="item"
										:label="item"></el-checkbox>
								</el-checkbox-group>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
			</el-collapse-item>

		</el-collapse>

	</div>
</template>

<script setup name="patrolPlan">
import { ref, reactive, watch, getCurrentInstance } from 'vue'
import api from '@/api/equipment/patrolPlan/index'
import publicApi from '@/api/public/index'
import Select from '@/components/Select'

const { proxy } = getCurrentInstance()

const activeNames = ref(['1', '2'])
const ruleForm = ref(null)
const formData = ref({
	id: '',
	planCode: '',
	planName: '',
	routeId: '',
	routeName: '',
	patrolType: '',
	setDate: [],
	initialDate: '',
	initialNumber: '',
	isSingle: '2',
	status: '2',
	cycle: '',
	patrolId: '',
	patrolName: '',
	standardId: '',
	timeLimit: '',
})
// 设备小类
// 设备名称
// 点检员
const inspectionList = ref([])
// 周
const weekList = ref(['1', '2', '3', '4', '5', '6', '7'])
const monthList = ref([
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'10',
	'11',
	'12',
	'13',
	'14',
	'15',
	'16',
	'17',
	'18',
	'19',
	'20',
	'21',
	'22',
	'23',
	'24',
	'25',
	'26',
	'27',
	'28',
	'29',
	'30',
])
const yearList = ref([
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'10',
	'11',
	'12',
])
const rules = reactive({
	planCode: proxy.getRules({ required: true }),
	planName: proxy.getRules({ required: true }),
	routeId: proxy.getRules({ required: true }),
	patrolType: proxy.getRules({ required: true }),
	setDate: proxy.getRules({ required: true }),
	initialDate: proxy.getRules({ required: true }),
	isSingle: proxy.getRules({ required: true }),
	status: proxy.getRules({ required: true }),
	patrolId: proxy.getRules({ required: true }),
	initialNumber: proxy.getRules({ required: true }),
	cycle: proxy.getRules({ required: true }),
	timeLimit: proxy.getRules({ required: true }),
})
const cycleTitle = ref('天')
watch(
	() => formData.value.patrolType,
	newV => {
		if (newV) patrolTypeChange(newV)
	},
)
// 类型change事件
const patrolTypeChange = e => {
	if (e) {
		switch (formData.value.patrolType) {
			case '1':
				cycleTitle.value = '天'
				break
			case '2':
				cycleTitle.value = '天'
				break
			case '3':
				cycleTitle.value = '天'
				break
			case '4':
				cycleTitle.value = '天'
				break
			case '5':
				cycleTitle.value = '小时'
				break
			case '6':
				cycleTitle.value = '里程'
				break
			default:
				cycleTitle.value = '天'
		}
	} else {
		cycleTitle.value = '天'
	}
}
// 获取设备小类
const handlePatrolTypeChange = value => {
	patrolTypeChange(value)
	formData.value.setDate = []
}
const handleSetDateChange = values => {
	if (values.length > 1) {
		formData.value.setDate = [values[values.length - 1]]
	}
}
const routeOptions = ref([])
const getRouteList = () => {
	api.getRouteList({}).then(res => {
		if (res.code === '0000') {
			routeOptions.value = res.data
		}
	})
}
// 获取点检员列表
const getpatrolList = () => {
	publicApi.getLocalSelect({ type: 'USER', role: 'XJY' }).then(res => {
		inspectionList.value = res.data
	})
}
// 获取标准信息
const checkboxSelection = ref([])


const resetForm = () => {
	// 逐个属性重置，保持响应式
	formData.value.id = ''
	formData.value.planCode = ''
	formData.value.planName = ''
	formData.value.routeId = ''
	formData.value.routeName = ''
	formData.value.patrolType = ''
	formData.value.setDate = []
	formData.value.initialDate = ''
	formData.value.initialNumber = ''
	formData.value.isSingle = '2'
	formData.value.status = '2'
	formData.value.cycle = ''
	formData.value.patrolId = ''
	formData.value.patrolName = ''
	formData.value.timeLimit = ''
	if (ruleForm.value) {
		ruleForm.value.resetFields()
	}
}
const validate = async () => {
	let flag = false
	await ruleForm.value.validate(valid => {
		if (valid) {
			flag = true
		}
	})
	return flag
}

getpatrolList()
getRouteList()
defineExpose({
	validate,
	formData,
	resetForm,
	checkboxSelection,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
