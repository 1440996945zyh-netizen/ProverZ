<template>
	<!-- 货物信息 -->
	<BaseTable ref="baseTable" :tableColumns="tableColumns" :tableData="tableData" tableHeight="300" />
</template>

<script setup name="Cargo">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/master/cargo/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref() // table的ref
const total = ref(0) // 数据总数
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '货类名称', prop: 'cargoTypeName' },
	{ label: '货种名称', prop: 'cargoCategoryName' },
	{ label: '排序', prop: 'sortNum', sortable: true, align: 'right', width: 100 },
	{
		prop: '',
		label: '操作',
		width: 'operate',
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'test',
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'test',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getCargoCategoryList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	console.log('查询拉查询拉', e)
}
getList(queryParams.value)
</script>
