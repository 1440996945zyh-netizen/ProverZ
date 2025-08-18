<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-collapse v-model="activeNames">
				<el-collapse-item title="分组信息" name="1">
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="分组名称" prop="groupName">
								<el-input v-model="formData.groupName" placeholder="分组名称" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="计划类型" prop="planTypeCd" style="width: 100%">
								<div style="width: 100%">
									<Select
										:selectData="[
											{ value: '1', label: '船舶计划' },
											{ value: '2', label: '集疏港计划' },
											{ value: '3', label: '转运计划' },
											{ value: '4', label: '杂项计划' },
										]"
										v-model:value="formData.planTypeCd"
										v-model:label="formData.planTypeName"
										@change="processChange"
									/>
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="主作业过程" prop="processCode" style="width: 100%">
								<div style="width: 100%">
									<Select
										:selectData="MAIN_PROCESS"
										v-model:value="formData.processCode"
										v-model:label="formData.processName"
										@change="childChange"
									/>
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="计件工资类型" prop="salaryTypeCode" style="width: 100%">
								<div style="width: 100%">
									<Select
										:dataConfig="{ url: '/api/internal/public/getDictListByType/SALARY_TYPE' }"
										v-model:value="formData.salaryTypeCode"
										v-model:label="formData.salaryTypeName"
									/>
								</div>
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
				<el-collapse-item title="其他信息" name="2">
					<EditTable
						ref="baseTable"
						:showSearchHeader="false"
						:showPagination="false"
						:showToolBarEditTable="true"
						:tableColumns="tableColumns"
						:tableData="formData.detailPOList"
						:tableHeight="tableHeight"
						:editRules="editRules"
						:hasAdd="true"
					/>
				</el-collapse-item>
			</el-collapse>
		</el-form>
	</div>
</template>

<script setup name="berth">
import { ref, reactive, getCurrentInstance } from 'vue'
import EditTable from '@/components/EditTable/index.vue'
import publicApi from '@/api/public/index'
import api from '@/api/master/groupInfo/index'
import { ElButton } from 'element-plus'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'
import tableParamsStore from '@/store/modules/tableParams'
const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight
const activeNames = reactive(['1', '2'])
const deptOptions = ref([]) // 部门数据源
const ruleForm = ref()
const formData = reactive({
	id: '',
	groupName: '',
	processCode: '',
	processName: '',
	planTypeCd: '',
	planTypeName: '',
	salaryTypeCode: '',
	salaryTypeName: '',
	detailPOList: [],
})
const MAIN_PROCESS = ref([]) //主过程
// 修改计划类别
const processChange = () => {
	MAIN_PROCESS.value = []
	formData.processCode = ''
	formData.processName = ''
	tableColumns.value[0].selectData = []
	formData.detailPOList.forEach(item => {
		item.processDetailCode = ''
		item.processDetailName = ''
	})
	getProcess()
}
//获取主作业过程
const getProcess = () => {
	if (formData.planTypeCd) {
		publicApi.getLocalSelect({ planTypeCode: formData.planTypeCd, type: 'MAIN_WORK_PROCESS' }).then(res => {
			const resData = JSON.parse(JSON.stringify(res.data))
			MAIN_PROCESS.value = resData
		})
	}
}
// 修改主过程
const childChange = () => {
	tableColumns.value[0].selectData = []
	formData.detailPOList.forEach(item => {
		item.processDetailCode = ''
		item.processDetailName = ''
	})
	getziProcess()
}
//获取子主作业过程
const getziProcess = () => {
	if (formData.processCode) {
		publicApi.getLocalSelect({ type: 'SUB_WORK_PROCESS', parent: formData.processCode }).then(res => {
			tableColumns.value[0].selectData = res.data
		})
	}
}
const rules = reactive({
	groupName: proxy.getRules({
		required: true,
	}),
	planTypeCd: proxy.getRules({
		required: true,
	}),
	processCode: proxy.getRules({
		required: true,
	}),
	salaryTypeCode: proxy.getRules({
		required: true,
	}),
})
const tableColumns = ref([
	{
		prop: 'processDetailCode',
		label: '子作业过程',
		editType: 'select',
		editRender: {},
		selectLabel: 'label', // options绑定的值，默认为label，和默认一致则不用传。
		selectValue: 'value', // options绑定的值，默认为value，和默认一致则不用传。
		modelLabel: 'processDetailName', // 选中label绑定的字段
		selectData: [],
		width: 200,
	},
	{
		prop: 'deptId',
		label: '班组',
		editType: 'select',
		editRender: {},
		multiple: true,
		selectLabel: 'deptName', // options绑定的值，默认为label，和默认一致则不用传。
		selectValue: 'deptId', // options绑定的值，默认为value，和默认一致则不用传。
		selectData: [],
	},
	{
		prop: '',
		label: '添加',
		width: 200,
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
const editRules = ref({
	processDetailCode: [{ required: true, message: '子作业过程必须填写' }],
})
// 列表删除按钮回调
const handleDelete = row => {
	console.log(row)
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			formData.detailPOList.splice(row.index, 1)
		})
		.catch(err => {})
}
const baseTable = ref()
const validate = async () => {
	let flags = false
	let flag1 = await baseTable.value.validAllEvent()
	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag1) {
			flags = true
		} else {
			flags = false
		}
	})
	return flags
}
const resetForm = () => {
	ruleForm.value.resetFields()
	formData.id = ''
	formData.detailPOList = []
}
// 获取工班
const getDept = () => {
	api.listPieceWorkTeam().then(res => {
		tableColumns.value[1].selectData = res.data
	})
}
defineExpose({
	validate,
	resetForm,
	formData,
	getProcess,
	getziProcess,
})

function getDeptTree() {
	publicApi.getDeptList().then(response => {
		deptOptions.value = proxy.handleTree(response.data)
	})
	console.log('树')
}
getDept()
getDeptTree()
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
