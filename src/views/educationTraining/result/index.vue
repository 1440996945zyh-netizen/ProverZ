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

		<el-drawer v-model="isShow" title="录入考核结果" size="60%">
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

<script setup name="educationTrainingResult">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/educationTraining/result/index'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance()

const selectData = reactive([
	{ name: '计划名称', type: 'input', modelValue: 'planName', span: 6 },
	{ name: '被考核人员', type: 'input', modelValue: 'userName', span: 6 },
	{
		name: '录入状态',
		type: 'select',
		modelValue: 'resultStatus',
		selectData: [
			{ label: '待录入', value: '0' },
			{ label: '已录入', value: '1' },
		],
		span: 6,
	},
	{
		name: '是否合格',
		type: 'select',
		modelValue: 'isPass',
		selectData: [
			{ label: '合格', value: '1' },
			{ label: '不合格', value: '0' },
		],
		span: 6,
	},
	{ name: '考核开始日期', type: 'date', modelValue: 'examStartTime', span: 4 },
	{ name: '考核结束日期', type: 'date', modelValue: 'examEndTime', span: 4 },
])

const buttonList = ref([{ label: 'hidden', vif: false }])
const total = ref(0)
const tableData = ref([])
const queryParams = ref({ startPage: 1, pageSize: 20 })
const isShow = ref(false)
const detailRef = ref(null)

const tableColumns = reactive([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '计划名称', prop: 'planName', minWidth: 180 },
	{ label: '被考核人员', prop: 'userName', minWidth: 120 },
	{ label: '考核时间', prop: 'examTime', width: 170 },
	{ label: '考核人员', prop: 'examinerNames', minWidth: 180 },
	{ label: '成绩', prop: 'score', width: 90, align: 'right' },
	{
		label: '是否合格',
		prop: 'isPass',
		width: 100,
		align: 'center',
		render: row => {
			if (row.isPass === '1') return [h(ElTag, { type: 'success' }, { default: () => '合格' })]
			if (row.isPass === '0') return [h(ElTag, { type: 'danger' }, { default: () => '不合格' })]
			return [h(ElTag, { type: 'info' }, { default: () => '未录入' })]
		},
	},
	{
		label: '录入状态',
		prop: 'resultStatus',
		width: 100,
		align: 'center',
		render: row => [h(ElTag, { type: row.resultStatus === '1' ? 'success' : 'warning' }, { default: () => (row.resultStatus === '1' ? '已录入' : '待录入') })],
	},
	{ label: '录入人', prop: 'inputUserName', minWidth: 100 },
	{ label: '录入时间', prop: 'inputTime', width: 170 },
	{
		prop: '',
		label: '操作',
		width: 100,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(ElButton, { onClick: () => handleInput(row), type: 'primary', link: true, icon: 'Edit', permission: 'educationTraining:result:input' }, { default: () => '录入' }),
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

const handleInput = row => {
	isShow.value = true
	nextTick(() => {
		api.getById({ id: row.id }).then(res => {
			detailRef.value.setData(res.data || {})
		})
	})
}

const save = async () => {
	if (!(await detailRef.value.validate())) return
	const params = JSON.parse(JSON.stringify(detailRef.value.formData))
	proxy.$modal.confirm('确认保存考核结果？').then(() => {
		api.input(params).then(res => {
			isShow.value = false
			proxy.$message.success(res.msg)
			getList(queryParams.value)
		})
	})
}

getList(queryParams.value)
</script>
