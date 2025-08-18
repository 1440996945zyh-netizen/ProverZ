<template>
	<el-form :model="formData" ref="ruleForm" :rules="rules" :disabled="formDisabled" style="margin: 20px 15px">
		<el-collapse v-model="activeNames">
			<el-row :gutter="20">
				<el-col :span="6">
					<el-form-item label="日期" prop="workDate">
						<div>
							<el-date-picker
								v-model="formData.workDate"
								value-format="YYYY-MM-DD"
								format="YYYY-MM-DD"
								type="date"
								placeholder="日期"
							/>
						</div>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="班次" prop="classCode">
						<Select
							:dataConfig="{ params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } }"
							v-model:value="formData.classCode"
							v-model:label="formData.className"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="作业公司" prop="companyId">
						<div style="width: 100%">
							<Select
								:dataConfig="{ params: { type: 'DEPT_LEVEL', deptLevel: '1' } }"
								v-model:value="formData.companyId"
								v-model:label="formData.companyName"
								@change="changeCompany"
							/>
						</div>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="作业工班" prop="deptId">
						<div>
							<Select
								v-model:value="formData.deptId"
								v-model:label="formData.deptName"
								:select-data="deptData"
								select-label="deptName"
								select-value="id"
								@change="deptChange"
							/>
						</div>
					</el-form-item>
				</el-col>
			</el-row>

			<el-collapse-item title="人员出勤信息" name="attendance">
				<EditTable
					ref="editTableRef"
					:tableColumns="tableColumns"
					:tableData="formData.attendanceUserPOList"
					:tableHeight="tableHeight"
					:rowConfig="rowConfig"
          :hasAdd = "true"
					:cellClickEvent="attendanceCellClickEvent"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="attendance">
import { ref, reactive, watch, h, getCurrentInstance } from 'vue'

import EditTable from '@/components/EditTable'
import { getNowDate, uniqueArr } from '@/utils/index.js'
import useUserStore from '@/store/modules/user'
import { ElButton } from 'element-plus'
import publicApi from '@/api/public/index' //字典

import math from '@/utils/math'
import api from '@/api/produce/attendanceRoll/index'
import Select from '@/components/Select'
import tableParamsStore from '@/store/modules/tableParams'
const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight - 40
const activeNames = ['baseData', 'attendance']
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref('')
const rowIndex = ref(null)
// 表格数据
const editTableRef = ref() // editTable的ref
const exportConfig = {}
const formDisabled = ref(false)
const ruleForm = ref()
const detailRef = ref(null) // 明细组件ref
const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }

const tableData = ref([])
const formData = ref({
	id: null,
	companyId: null,
	companyName: null,
	workDate: null,
	classCode: null,
	className: null,
	deptId: null,
	deptName: null,
	attendanceUserPOList: [
		{
			userName: null,
			userId: null,
			coefficient: '',
			iswork: '',
		},
	],
})
const attendanceInfo = ref({
	id: null,
	attendanceId: null,
	userId: null,
	userName: null,
	coefficient: 100,
	iswork: '是',
})

const tableColumns = reactive([
	{
		prop: 'userId',
		label: '姓名',
		editType: 'select',
		modelLabel: 'userName',
    modelValue:'userId',
		selectValue: 'id',
		selectLabel: 'userName',
		editRender: {},
		align: 'center',
		change: (e, row) => {
			row.userId = e.id
      row.coefficient=100
      row.iswork = '是'
		},
	},
	{
		prop: 'coefficient',
		label: '系数(%)',
		editType: 'input',
		editRender: {},
		align: 'center',
	},
	{
		prop: 'iswork',
		label: '是否上班',
		editType: 'switch',
		modelLabel: 'iswork',
		activeValue: '是',
		inactiveValue: '否',
		editRender: {
			// selectLabel: '是',
		},
		// selectData: [
		// 	{ label: '是', value: '是' },
		// 	{ label: '否', value: '否' },
		// ],
		align: 'center',
	},
	{
		prop: '',
		label: '添加',
		width: 200,
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
					}
				),
			]
		},
	},
])

const deptData = ref([])
const deptName = ref('')
const changeCompany = () => {
	formData.value.deptId = ''
	formData.value.deptName = ''
	formData.value.attendanceUserPOList = []
	api.getDeptByCompany(formData.value.companyId).then(res => {
		deptData.value = res.data
	})
}
const init = () => {
	publicApi.getLocalSelect({ type: 'USER' }).then(response => {
		tableColumns.value = response.data
		proxy.setEditTableOptions(tableColumns, { postName: response.data })
	})
}
const deptChange = val => {
	formData.value.attendanceUserPOList = []
	api.getAttendanceUserByDeptId(val.id).then(res => {
		formData.value.attendanceUserPOList = res.data
		if (formData.value.attendanceUserPOList.length == 0) {
			proxy.$message.error('该作业工班人员为空')
		}
		formData.value.attendanceUserPOList.map(function (item, index) {
			if (index !== '') {
				item.iswork = '是'
				item.coefficient = 100
				item.userId = item.id
				return item
			}
		})
	})
}

const attendanceHeaderCellClickEvent = even => {
	if (even.column.field == '') {
		// formData.value.attendanceUserPOList.push(JSON.parse(JSON.stringify(attendanceInfo.value)))
	}
}
// const headerCellClassName = even => {
// 	if (even.column.field == '') {
// 		return 'add'
// 	}
// }
const attendanceCellClickEvent = even => {
	rowIndex.value = even.row.row_id
}
//删除事件
const handleDelete = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			// 过滤要删除的数据重新赋值
			formData.value.attendanceUserPOList = formData.value.attendanceUserPOList.filter(item => {
				return item.row_id != row.row_id
			})
			rowIndex.value = null
		})
		.catch(err => {})
}

//校验
const rules = reactive({
	workDate: proxy.getRules({ required: true }),
	classCode: proxy.getRules({ required: true }),
	companyId: proxy.getRules({ required: true }),
	deptId: proxy.getRules({ required: true }),
})
const editRules = reactive({
	workerId: proxy.getRules({
		require: true,
	}),
	coefficient: proxy.getRules({
		require: true,
	}),
	iswork: proxy.getRules({
		require: true,
	}),
})
const validate = async () => {
	let flags = false
	let flag1 = await editTableRef.value.validAllEvent()
	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag1) {
			flags = true
		} else {
			flags = false
			// proxy.$message.warning('请完善表单信息！')
		}
	})
	return flags
}
//获取当前登录人所有人员
const getLoginmess = () => {
	api.getUserSelect(formData.value.deptId).then(res => {
		proxy.setEditTableOptions(tableColumns, { userId: res.data })
	})
}
init()
const resetForm = () => {
	proxy.resetObj(formData.value)
}
// 默认填补信息
const getMess = async () => {
	// 默认班次
	await publicApi.getNowDate().then(res => {
		formData.value.classCode = res.data.classCode
		formData.value.className = res.data.className
		formData.value.workDate = res.data.workDate
	})
	// 默认班组
	await publicApi.getLoginMess().then(res => {
		formData.value.companyId = res.data.companyId
		formData.value.companyName = res.data.companyName
		formData.value.deptId = res.data.classId
		formData.value.deptName = res.data.className
		if (formData.value.deptId) {
			deptChange({ id: formData.value.deptId })
		}
		if (formData.value.companyId) {
			api.getDeptByCompany(formData.value.companyId).then(res => {
				deptData.value = res.data
			})
		}
	})
}
watch(
	() => formData.value.companyId,
	(newV, oldV) => {
		if (newV) {
			api.getDeptByCompany(newV).then(res => {
				deptData.value = res.data
			})
		}
	},
	{ deep: true }
)
defineExpose({
	validate,
	resetForm,
	formData,
	formDisabled,
	getMess,
	getLoginmess,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
