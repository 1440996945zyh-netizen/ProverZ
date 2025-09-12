<!--
 * @Author: zhangsd
 * @Date: 2025-09-04 10:05:32
 * @LastEditTime: 2025-09-11 14:57:55
 * @LastEditors: zhangsd
 * @Description: 自定义打印
 * @FilePath: \view\src\views\example\hiprint\index.vue
-->
<template>
	<div class="app-container">
		<div>
			<BaseTable
				ref="menuTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableData="tableData"
				:tableColumns="tableColumns"
				:tableHeight="tableHeight"
				name="menuLazyTable"
				:cellClickEvent="cellClickEvent"
				:loading="tableLoading"
				:showPagination="false"
				:showToolBar="false"
			></BaseTable>
		</div>
		<!-- 表格组件 -->
		<Dialog ref="dialogRef" v-model:visible="dialogVisible" :title="dialogTitle" isFullscreen>
			<PrintDesigner ref="printDesignerRef" />
		</Dialog>
	</div>
</template>

<script setup>
import PrintDesigner from './detail/PrintDesigner.vue'
import Dialog from '@/components/Dialog'
import BaseTable from '@/components/BaseTable'
import tableParamsStore from '@/store/modules/tableParams'

import api from '@/api/master/template'
import { ElButton } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const { proxy } = getCurrentInstance()

const storeHight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHight.value) //表格高度
/* 打印弹窗显示 */
const dialogVisible = ref(false)
const dialogTitle = ref('自定义打印')
const printDesignerRef = ref(null)
/* 表格加载 */
const tableLoading = ref(false)
/* 表格数据 */
const tableData = ref([])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const total = ref(0)
const baseTable = ref()
/* 菜单查询条件 */
const selectData = reactive([
	{
		name: '模版名称',
		type: 'input',
		modelValue: 'modelName',
		span: 12,
	},
	{
		name: '模版类型',
		type: 'select',
		modelValue: 'modelTypeCode',
		span: 12,
		placeholder: '模版类型',
		dataConfig: { params: { type: 'DICT', dictType: 'MODEL_TYPE' } },
	},
])
/* 表格数据列 */
const tableColumns = ref([
	{
		prop: 'modelName', // 绑定到菜单名字段
		label: '模板名称',
		align: 'center',
		minWidth: 250,
	},
	{
		prop: 'modelTypeName',
		label: '模版类型',
		align: 'center',
		width: 150,
	},
	{
		prop: 'createBy', // 绑定到菜单名字段
		label: '创建人',
		align: 'center',
		minWidth: 250,
	},
	{
		prop: 'createTime', // 绑定到菜单名字段
		label: '创建时间',
		align: 'center',
		minWidth: 250,
	},

	{
		prop: 'operate',
		label: '操作',
		align: 'center',
		width: 250,
		fixed: 'right', // 固定在右侧

		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleUpdate(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'master:hiprint:update',
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
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'master:hiprint:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

/* 右侧按钮 */
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => handleAdd(), // 回调函数
		permission: 'master:hiprint:insert', // 权限
	},
])
/**
 * 查询主列表数据
 */

const getList = e => {
	queryParams.value = e
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
	// tableLoading.value = true
	// 改为实际的接口请求
	// listMenu(params)
	// 	.then(response => {
	// 		menuList.value = response.data.map(item => ({
	// 			...item,
	// 			hasChildren: item.hasChildren == '1' ? true : false,
	// 		}))
	// 	})
	// 	.finally(() => {
	// 		tableLoading.value = false
	// 	})
}
/** 新增菜单 */
const handleAdd = async row => {
	console.log('新增', row)
	// dialogVisible.value = true
	// 使用 router 跳转到打印设计页面
	router.push({
		name: 'PrintDesigner',
	})
}

/** 编辑菜单 */
const handleUpdate = async row => {
	router.push({
		name: 'PrintDesigner',
		query: { id: row.id },
	})
}
/**
 * @description 删除
 * @param row 打印模版

 */
const handleDelete = row => {
	const deleteRow = row // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
			})
		})
		.catch(err => {})
}

/** 行点击事件 */
const cellClickEvent = ({ row }) => {
	console.log('行点击事件', row)
}
// 父组件示例（假设设计器组件ref为printDesigner）
const editTemplate = template => {
	printDesignerRef.value.setEditTemplate({
		id: template.id,
		rateTypeCode: template.rateTypeCode,
		rateTypeName: template.rateTypeName,
		model: template.model, // 模板JSON字符串
	})
}
getList(queryParams.value)
</script>
<style lang="scss" scoped></style>
