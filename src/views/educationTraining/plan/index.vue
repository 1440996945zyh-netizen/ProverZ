<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:total="total"
			:showNum="4"
      defaultWidth="50"
    />

		<el-drawer v-model="isShow" :title="title" size="80%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="isShow = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="educationTrainingPlan">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/educationTraining/plan/index'
import resultApi from '@/api/educationTraining/result/index'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance()

const selectData = reactive([
	{ name: '计划名称', type: 'input', modelValue: 'planName', span: 6 },
	{ name: '负责人', type: 'input', modelValue: 'chargeUserName', span: 6 },
	{
		name: '是否生成记录',
		type: 'select',
		modelValue: 'resultGenerated',
		selectData: [
			{ label: '未生成', value: '0' },
			{ label: '已生成', value: '1' },
		],
		span: 6,
	},
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		selectData: [
			{ label: '启用', value: '1' },
			{ label: '停用', value: '0' },
		],
		span: 6,
	},
	{ name: '考核开始日期', type: 'date', modelValue: 'examStartTime', span: 4 },
	{ name: '考核结束日期', type: 'date', modelValue: 'examEndTime', span: 4 },
])

const buttonList = ref([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'educationTraining:plan:add',
	},
])

const total = ref(0)
const tableData = ref([])
const queryParams = ref({ startPage: 1, pageSize: 20 })
const isShow = ref(false)
const title = ref('培训计划')
const detailRef = ref(null)

const tableColumns = reactive([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '计划编号', prop: 'planCode', minWidth: 150 },
	{ label: '计划名称', prop: 'planName', minWidth: 180 },
	{ label: '培训开始时间', prop: 'trainStartTime', width: 170 },
	{ label: '培训结束时间', prop: 'trainEndTime', width: 170 },
	{ label: '考核时间', prop: 'examTime', width: 170 },
	{ label: '负责人', prop: 'chargeUserName', minWidth: 100 },
	{ label: '参与人数', prop: 'participantCount', width: 100, align: 'right' },
	{ label: '考核人数', prop: 'examinerCount', width: 100  , align: 'right' },
	{
		label: '记录生成',
		prop: 'resultGenerated',
		width: 100,
		align: 'center',
		render: row => {
			const generated = row.resultGenerated === '1'
			return [h(ElTag, { type: generated ? 'success' : 'info' }, { default: () => (generated ? '已生成' : '未生成') })]
		},
	},
	{
		label: '状态',
		prop: 'status',
		width: 90,
		align: 'center',
		render: row => [h(ElTag, { type: row.status === '1' ? 'success' : 'info' }, { default: () => (row.status === '1' ? '启用' : '停用') })],
	},
	{
		prop: '',
		label: '操作',
		width: 240,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(ElButton, { onClick: () => handleUpdate(row), type: 'primary', link: true, icon: 'Edit', permission: 'educationTraining:plan:update' }, { default: () => '编辑' }),
				h(ElButton, { onClick: () => handleGenerate(row), type: 'warning', link: true, icon: 'Finished', permission: 'educationTraining:result:generate' }, { default: () => '生成记录' }),
				h(ElButton, { onClick: () => handleDelete(row), type: 'danger', link: true, icon: 'Delete', permission: 'educationTraining:plan:delete' }, { default: () => '删除' }),
			]
		},
	},
])

const getList = e => {
	const { examDate, ...params } = { ...queryParams.value, ...e }
	queryParams.value = params
	api.getList(queryParams.value).then(res => {
		const data = res.data || {}
		tableData.value = data.pages || []
		total.value = data.totalNum || 0
	})
}

const add = () => {
	title.value = '新增培训计划'
	isShow.value = true
	nextTick(() => detailRef.value.resetForm())
}

const handleUpdate = row => {
	title.value = '修改培训计划'
	isShow.value = true
	nextTick(() => {
		api.getById({ id: row.id }).then(res => {
			detailRef.value.setData(res.data || {})
		})
	})
}

const buildSaveParams = form => {
	return {
		id: form.id || undefined,
		planName: form.planName,
		trainContent: form.trainContent,
		trainDeptId: form.trainDeptId,
		trainStartTime: form.trainStartTime,
		trainEndTime: form.trainEndTime,
		examTime: form.examTime,
		chargeUserId: form.chargeUserId,
		status: form.status,
		remark: form.remark,
		participantIds: form.participantIds || [],
		examinerIds: form.examinerIds || [],
	}
}

const save = async () => {
	if (!(await detailRef.value.validate())) return
	const params = buildSaveParams(detailRef.value.formData)
	proxy.$modal.confirm('确认保存培训计划？').then(() => {
		const request = params.id ? api.update(params) : api.add(params)
		request.then(res => {
			isShow.value = false
			proxy.$message.success(res.msg)
			getList(queryParams.value)
		})
	})
}

const handleGenerate = row => {
	proxy.$modal.confirm('确认生成待录入考核记录？如果已生成过，系统不会重复生成同一人员记录。').then(() => {
		resultApi.generate({ planId: row.id }).then(res => {
			proxy.$message.success(res.msg)
			getList(queryParams.value)
		})
	})
}

const handleDelete = row => {
	proxy.$modal.confirm('确认删除该培训计划？').then(() => {
		api.delete({ id: row.id }).then(res => {
			proxy.$message.success(res.msg)
			getList(queryParams.value)
		})
	})
}

getList(queryParams.value)
</script>
