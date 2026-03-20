<template>
	<div class="app-container">
		<div class="table-wrapper">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:loading="loading"
				:total="total"
				:tableHeight="tableHeight"
			/>
		</div>
		<Drawer v-model="dialogVisible" title="预警消息详情" size="40%">
			<el-descriptions :column="1" border>
				<el-descriptions-item label="物资名称">{{ detailData.materialName }}</el-descriptions-item>
				<el-descriptions-item label="触发预警时库存">{{ detailData.currentStock }}</el-descriptions-item>
				<el-descriptions-item label="预警阈值">{{ detailData.warningThreshold }}</el-descriptions-item>
				<el-descriptions-item label="预警接收人">{{ detailData.receiverNames || '-' }}</el-descriptions-item>
				<el-descriptions-item label="预警触发时间">{{ detailData.createTime }}</el-descriptions-item>
				<el-descriptions-item label="处理状态">
					<el-tag :type="detailData.handleStatus === 1 ? 'success' : 'warning'">
						{{ detailData.handleStatus === 1 ? '已处理' : '未处理' }}
					</el-tag>
				</el-descriptions-item>
				<el-descriptions-item label="处理时间" v-if="detailData.handleStatus === 1">{{ detailData.handleTime }}</el-descriptions-item>
				<el-descriptions-item label="处理人" v-if="detailData.handleStatus === 1">{{ detailData.handleUserName }}</el-descriptions-item>
			</el-descriptions>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">关闭</el-button>
					<el-button type="primary" @click="handleWarning" v-if="detailData.handleStatus !== 1">标记已处理</el-button>
				</span>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="materialWarningRecord">
import { ref, reactive, computed, getCurrentInstance, toRefs, h } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import api from '@/api/equipment/materialWarningRecord/index'
import tableParamsStore from '@/store/modules/tableParams'

const storeHeight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHeight.value - 90)

const { proxy } = getCurrentInstance()
const baseTable = ref()
const total = ref('')
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const detailData = ref({})

const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 20,
		materialName: undefined,
		handleStatus: undefined,
	},
})
const { queryParams } = toRefs(data)

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '物资名称', prop: 'materialName', align: 'left', minWidth: 180, showOverFlow: true },
	{ label: '触发预警时库存', prop: 'currentStock', align: 'center', width: 120 },
	{ label: '预警阈值', prop: 'warningThreshold', align: 'center', width: 100 },
	{ label: '预警接收人', prop: 'receiverNames', align: 'left', minWidth: 200, showOverFlow: true },
	{ label: '预警触发时间', prop: 'createTime', align: 'center', width: 180 },
	{
		prop: 'handleStatus',
		label: '处理状态',
		align: 'center',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.handleStatus === 1 ? 'success' : 'warning',
						size: 'default',
					},
					{
						default: () => {
							return row.handleStatus === 1 ? '已处理' : '未处理'
						},
					},
				),
			]
		},
	},
	{ label: '处理时间', prop: 'handleTime', align: 'center', width: 180 },
	{ label: '处理人', prop: 'handleUserName', align: 'center', width: 120 },
	{
		prop: 'operate',
		label: '操作',
		align: 'center',
		width: 150,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							viewDetail(row)
						},
						type: 'primary',
						link: true,
						icon: 'View',
					},
					{
						default: () => '查看',
					},
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleWarningRow(row)
						},
						type: 'success',
						link: true,
						icon: 'Check',
						permission: 'equipment:materialWarningRecord:handle',
						style: row.handleStatus === 1 ? { display: 'none' } : {},
					},
					{
						default: () => '处理',
					},
				),
			]
		},
	},
])

const selectData = reactive([
	{
		name: '物资名称',
		type: 'input',
		modelValue: 'materialName',
		span: 8,
	},
	{
		name: '处理状态',
		type: 'select',
		modelValue: 'handleStatus',
		span: 8,
		selectData: [
			{ label: '未处理', value: 0 },
			{ label: '已处理', value: 1 },
		],
	},
])

const buttonList = reactive([])

const getList = e => {
	loading.value = true
	queryParams.value = e
	api.getList(e).then(res => {
		loading.value = false
		if (res.code == '0000') {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		} else {
			proxy.$message.error(res.msg)
		}
	})
}

const viewDetail = row => {
	api.getById(row.id).then(res => {
		if (res.code === '0000') {
			detailData.value = res.data
			dialogVisible.value = true
		}
	})
}

const handleWarningRow = row => {
	proxy.$modal
		.confirm('确定标记为已处理？')
		.then(function () {
			return api.handle({ id: row.id })
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess('处理成功')
		})
		.catch(() => {})
}

const handleWarning = () => {
	api.handle({ id: detailData.value.id }).then(res => {
		if (res.code === '0000') {
			proxy.$modal.msgSuccess('处理成功')
			dialogVisible.value = false
			getList()
		}
	})
}

getList(queryParams.value)
</script>

<style lang="scss" scoped></style>
