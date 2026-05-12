<template>
	<div class="formData">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="计划信息" name="1">
				<el-form :model="formData" ref="ruleForm" label-width="120px" label-position="top" :rules="rules">
					<el-row :gutter="24">
						<el-col :span="8">
							<el-form-item label="设备小类" prop="equipSmallCategoryId">
								<Select
									:selectData="macSmallTypeList"
									v-model:value="formData.equipSmallCategoryId"
									v-model:label="formData.equipSmallCategoryName"
									@change="getMacTypeList"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="设备名称" prop="equipName">
								<Select
									:selectData="macNameList"
									selectLabel="equipName"
									selectValue="id"
									v-model:value="formData.equipId"
									v-model:label="formData.equipName"
									placeholder="请选择设备（可搜索）"
									@change="handleEquipmentChange"
									:disabled="isViewMode"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="点检类型" prop="equipType">
								<Select
									:selectData="[
										{ label: '日', value: '1' },
										{ label: '周', value: '2' },
										{ label: '月', value: '3' },
										{ label: '年', value: '4' },
										{ label: '运行台时', value: '5' },
										{ label: '里程', value: '6' },
									]"
									v-model:value="formData.equipType"
									@change="equipTypeChange"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="8" v-if="cycleTitle == '天'">
							<el-form-item label="初始日期" prop="initialDate">
								<template #label>
									<span>
										初始日期
										<el-tooltip lass="box-item" effect="dark" content="设置点检计划/任务开始日期" placement="top">
											<el-icon><QuestionFilled /></el-icon>
										</el-tooltip>
									</span>
								</template>
								<el-date-picker
									v-model="formData.initialDate"
									type="date"
									value-format="YYYY-MM-DD"
									format="YYYY-MM-DD"
									placeholder="初始日期"
								></el-date-picker>
							</el-form-item>
						</el-col>
						<el-col :span="8" v-else>
							<el-form-item label="初始数据" prop="initialNumber">
								<template #label>
									<span>
										初始数据
										<el-tooltip lass="box-item" effect="dark" content="设备开始计算数" placement="top">
											<el-icon><QuestionFilled /></el-icon>
										</el-tooltip>
									</span>
								</template>
								<el-input v-model="formData.initialNumber" placeholder="初始数据"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="是否单次" prop="isSingle">
								<Select
									:selectData="[
										{ label: '是', value: '1' },
										{ label: '否', value: '2' },
									]"
									v-model:value="formData.isSingle"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="8" v-if="!'1234'.includes(formData.equipType)">
							<el-form-item :label="'点检周期（' + cycleTitle + '）'" prop="cycle">
								<template #label>
									<span>
										点检周期（{{ cycleTitle }}）
										<el-tooltip lass="box-item" effect="dark" content="设备作业多少数开始下次点检任务" placement="top">
											<el-icon><QuestionFilled /></el-icon>
										</el-tooltip>
									</span>
								</template>
								<el-input v-model="formData.cycle" placeholder="周期" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="点检时限（天）" prop="timeLimit">
								<template #label>
									<span>
										点检时限（天）
										<el-tooltip
											lass="box-item"
											effect="dark"
											content="通过点检时限计算点检任务截止日期（多少天内完成点检任务）"
											placement="top"
										>
											<el-icon><QuestionFilled /></el-icon>
										</el-tooltip>
									</span>
								</template>
								<el-input v-model="formData.timeLimit" placeholder="时限" />
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="点检员" prop="inspectorId">
								<Select
									:selectData="inspectionList"
									v-model:value="formData.inspectorId"
									v-model:label="formData.inspectorName"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="24" v-if="formData.equipType == 2">
							<el-form-item label="选择天" prop="setDate">
								<el-checkbox-group v-model="formData.setDate" @change="handleSetDateChange">
									<el-checkbox v-for="item in weekList" :key="item" :value="item" :label="item"></el-checkbox>
								</el-checkbox-group>
							</el-form-item>
						</el-col>
						<el-col :span="24" v-if="formData.equipType == 3">
							<el-form-item label="选择天" prop="setDate">
								<el-checkbox-group v-model="formData.setDate" @change="handleSetDateChange">
									<el-checkbox v-for="item in monthList" :key="item" :value="item" :label="item"></el-checkbox>
								</el-checkbox-group>
							</el-form-item>
						</el-col>
						<el-col :span="24" v-if="formData.equipType == 4">
							<el-form-item label="选择月" prop="setDate">
								<el-checkbox-group v-model="formData.setDate" @change="handleSetDateChange">
									<el-checkbox v-for="item in yearList" :key="item" :value="item" :label="item"></el-checkbox>
								</el-checkbox-group>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
			</el-collapse-item>
			<el-collapse-item title="点检标准" name="2">
				<template v-slot:title>
					<div style="display: flex; justify-content: space-between; width: 95%">
						<div>点检标准</div>
						<div>
							<el-button type="primary" @click.stop="addStandard">添加</el-button>
						</div>
					</div>
				</template>
				<BaseTable
					ref="baseTable"
					:showSearchHeader="false"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:tableHeight="300"
				/>
			</el-collapse-item>
		</el-collapse>
		<!-- 标准明细 -->
		<el-drawer v-model="isShow" title="点检标准" size="70%">
			<standard ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button type="primary" @click="saveStandard">保存</el-button>
					<el-button @click="isShow = false">取消</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="inspectionPlan">
import { ref, reactive, watch, getCurrentInstance, onMounted, toRefs, nextTick } from 'vue'
import api from '@/api/equipment/inspectionPlan/index'
import publicApi from '@/api/public/index'
import Select from '@/components/Select'
import BaseTable from '@/components/BaseTable/index.vue'
import standard from './standard.vue'
import { ElButton, ElTag, ElMessage } from 'element-plus'

const { proxy } = getCurrentInstance()

const activeNames = ref(['1', '2'])
const ruleForm = ref(null)
const baseTable = ref(null)
const formData = ref({
	id: '',
	equipSmallCategoryId: '',
	equipSmallCategoryName: '',
	equipId: '',
	equipName: '',
	equipType: '',
	setDate: [],
	initialDate: '',
	isSingle: '2',
	cycle: '',
	inspectorId: '',
	inspectorName: '',
	standardId: '',
	timeLimit: '',
})
// 设备小类
const macSmallTypeList = ref([])
// 设备名称
const macNameList = ref([])
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
	equipSmallCategoryId: proxy.getRules({ required: true }),
	equipInstitutionId: proxy.getRules({ required: true }),
	equipUnitId: proxy.getRules({ required: true }),
	equipId: proxy.getRules({ required: true }),
	equipType: proxy.getRules({ required: true }),
	setDate: proxy.getRules({ required: true }),
	initialDate: proxy.getRules({ required: true }),
	isSingle: proxy.getRules({ required: true }),
	inspectorId: proxy.getRules({ required: true }),
	initialNumber: proxy.getRules({ required: true }),
	cycle: proxy.getRules({ required: true }),
	timeLimit: proxy.getRules({ required: true }),
})
const cycleTitle = ref('天')
const clearSelectedStandards = () => {
	tableData.value = []
}
watch(
	() => formData.value.equipType,
	(newV, oldV) => {
		if (newV) equipTypeChange(newV)
		if (oldV && newV !== oldV) {
			formData.value.setDate = []
			clearSelectedStandards()
		}
	},
)
// 类型change事件
const equipTypeChange = e => {
	if (e) {
		switch (formData.value.equipType) {
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
const handleSetDateChange = value => {
	if (Array.isArray(value) && value.length > 1) {
		formData.value.setDate = value.slice(-1)
	}
}
const getEqptType = () => {
	if (baseTable.value) baseTable.value.clearCheckboxRow()
	publicApi.getLocalSelect({ type: 'EQUIP_TYPE', categoryLevel: '3' }).then(res => {
		macSmallTypeList.value = res.data
	})
}
// 获取设备列表
const getMacTypeList = value => {
	macNameList.value = []
	formData.value.equipId = ''
	formData.value.equipName = ''
	clearSelectedStandards()
	if (value) {
		api.getEquipListById({ id: formData.value.equipSmallCategoryId }).then(res => {
			macNameList.value = res.data
		})
		// api.queryByUnitId({equipSmallCategoryId: formData.value.equipSmallCategoryId}).then(res => {
		//   tableData.value = res.data
		// 	nextTick(() => {
		// 		if (formData.value.itemList) {
		// 			formData.value.itemList.forEach(v => {
		// 				tableData.value.forEach((k,index) => {
		// 					if (v.standardId == k.id)
		// 						k.isSelect = '1'
		// 				})
		// 			})
		// 			checkboxSelection.value = tableData.value.filter(v => v.isSelect == '1')
		// 			baseTable.value.setCheckboxRow(tableData.value.filter(v => v.isSelect == '1'))
		// 		}
		// 	})
		// })
	}
}
// 获取点检员列表
const getInspectorList = () => {
	publicApi.getLocalSelect({ type: 'USER', role: 'DJY' }).then(res => {
		inspectionList.value = res.data
	})
}
// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: false, // 开启复选框范围选择功能
}
// 获取标准信息
const checkboxSelection = ref([])
const tableData = ref([])
const tableColumns = ref([
	{
		label: '类型',
		prop: 'equipType',
		width: 80,
		render: row => {
			return [
				h(
					'span',
					{},
					{
						default: () => equipTypeSelect(row),
					},
				),
			]
		},
	},
	{ label: '设备机构', prop: 'equipInstitutionName', width: 140 },
	{ label: '设备部件', prop: 'equipUnitName', width: 140 },
	{ label: '点检内容', prop: 'content' },
	{ label: '点检标准', prop: 'standard' },
	{
		prop: '',
		label: '操作',
		width: 80,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
					},
					{
						default: () => '删除',
					},
				),
			]
		},
	},
])
const handleDelete = row => {
	tableData.value.splice(row.index, 1)
}
// 类型change事件
const equipTypeSelect = e => {
	if (e) {
		switch (e.equipType) {
			case '1':
				return '日'
				break
			case '2':
				return '周'
				break
			case '3':
				return '月'
				break
			case '4':
				return '年'
				break
			case '5':
				return '运行台时'
				break
			case '6':
				return '里程'
				break
			default:
				'日'
		}
	} else {
		return '日'
	}
}
// 复选框改变事件
const checkboxChange = data => {
	checkboxSelection.value = data
}
// 复选框全选事件
const selectAllChangeEvent = data => {
	checkboxSelection.value = data
}

const resetForm = () => {
	// 逐个属性重置，保持响应式
	formData.value.id = ''
	formData.value.equipSmallCategoryId = ''
	formData.value.equipSmallCategoryName = ''
	formData.value.equipInstitutionId = ''
	formData.value.equipInstitutionName = ''
	formData.value.equipUnitId = ''
	formData.value.equipUnitName = ''
	formData.value.equipId = ''
	formData.value.equipName = ''
	formData.value.equipType = ''
	formData.value.setDate = []
	formData.value.initialDate = ''
	formData.value.isSingle = '2'
	formData.value.cycle = ''
	formData.value.inspectorId = ''
	formData.value.inspectorName = ''
	formData.value.timeLimit = ''
	clearSelectedStandards()
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
// 打开点检标准
const isShow = ref(false)
const detailRef = ref(null)
const addStandard = () => {
	if (!formData.value.equipSmallCategoryId || !formData.value.equipType) {
		return proxy.$message.warning('请选择设备小类和计划周期类型')
	}
	isShow.value = true
	nextTick(() => {
		detailRef.value.formData = formData.value
		detailRef.value.resetForm()
		detailRef.value.getList()
	})
}
// 保存选中的标准
const saveStandard = () => {
	if (detailRef.value.checkboxSelection.length == 0) {
		return proxy.$message.warning('请勾选点检标准')
	}
	for (let i = 0; i < detailRef.value.checkboxSelection.length; i++) {
		let select = detailRef.value.checkboxSelection[i]
		for (let k = 0; k < tableData.value.length; k++) {
			let table = tableData.value[k]
			if (select.id == table.id || select.id == table.standardId) {
				return proxy.$message.warning('序号' + select.seq + '已添加')
			}
		}
	}
	detailRef.value.checkboxSelection.forEach(v => {
		tableData.value.push(v)
	})
	isShow.value = false
}

getEqptType()
getInspectorList()
defineExpose({
	validate,
	formData,
	resetForm,
	checkboxSelection,
	getMacTypeList,
	tableData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
