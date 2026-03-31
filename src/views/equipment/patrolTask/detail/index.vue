<template>
	<div>
		<BaseTable
			ref="baseTable"
			:showSearchHeader="false"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:tableHeight="'pageTableHeight'"
			:total="total"
		/>
		<el-dialog v-model="dialogVisible" title="图片查看" width="50%">
			<el-image
				v-for="(item, index) in imgurl"
				:src="item"
				:key="index"
				loading="lazy"
				fit
				:preview-src-list="imgurl"
				style="width: 49%; height: auto"
			/>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">关闭</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup>
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, getCurrentInstance, h } from 'vue'
import api from '@/api/equipment/patrolTask/index'
import publicApi from '@/api/public/index'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance()

const baseTable = ref(null)
const total = ref(0)
const taskId = ref(null)
const tableData = ref([])

const tableColumns = reactive([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '设备名称', prop: 'equipName', minWidth: 150 },
	{ label: '检查内容', prop: 'checkContent', minWidth: 200 },
	{ label: '合格条件', prop: 'qualifyCondition', minWidth: 150 },
	{ label: '检查方法', prop: 'checkMethod', minWidth: 150 },
	{
		label: '巡检状态',
		prop: 'status',
		align: 'center',
		width: 100,
		render: (row) => [
			h(
				ElTag,
				{ type: row.status == '1' ? 'success' : 'info' },
				{ default: () => (row.status == '1' ? '已检' : '未检') }
			),
		],
	},
	{
		label: '是否异常',
		prop: 'isAbnormal',
		align: 'center',
		width: 100,
		render: (row) => {
			const abnormalMap = {
				0: { text: '待检', type: 'info' },
				1: { text: '异常', type: 'danger' },
				2: { text: '正常', type: 'success' },
			}
			const abnormal = abnormalMap[row.isAbnormal] || { text: '未知', type: 'info' }
			return [
				h(
					ElTag,
					{ type: abnormal.type },
					{ default: () => abnormal.text }
				),
			]
		},
	},
	{
		label: '是否报修',
		prop: 'isRepair',
		align: 'center',
		width: 100,
		render: (row) => [
			h(
				ElTag,
				{ type: row.isRepair == '1' ? 'danger' : 'info' },
				{ default: () => (row.isRepair == '1' ? '已报修' : '否') }
			),
		],
	},
	{
		label: '图片',
		width: 100,
		align: 'center',
		fixed: 'right',
		render: (row) => {
			return [
				h(
					ElButton,
					{
						onClick: () => look(row),
						type: 'primary',
						link: true,
						icon: 'Picture',
					},
					{ default: () => '查看' }
				),
			]
		},
	},
])

const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})

// 获取子表数据列表
const getList = (e) => {
	queryParams.value = { ...queryParams.value, ...e, id: taskId.value }
	api.getById(queryParams.value).then((res) => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

const imgurl = ref([])
const dialogVisible = ref(false)
// 查看图片
const look = (row) => {
	dialogVisible.value = true
	imgurl.value = []
	const fileIds = row.fileIds ? row.fileIds.split(',') : []
	fileIds.forEach((item) => {
		publicApi.down(item).then((res) => {
			const blob = new Blob([res.data], {
				type: 'image/png',
			})
			const url = window.URL.createObjectURL(blob)
			imgurl.value.push(url)
		})
	})
}

defineExpose({
	getList,
	taskId,
})
</script>
