<!--
 * @Author: zhangsd
 * @Date: 2025-09-04 10:05:32
 * @LastEditTime: 2025-09-10 14:20:24
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
/* 菜单查询条件 */
const selectData = reactive([
	{
		name: '模版名称',
		type: 'input',
		modelValue: 'menuName',
		span: 12,
	},
	{
		name: '模版类型',
		type: 'select',
		modelValue: 'type',
		span: 12,
		placeholder: '模版类型',
		selectData: [
			{ dictLabel: '普通', dictValue: '0' },
			{ dictLabel: '复杂', dictValue: '1' },
			{ dictLabel: '列表', dictValue: '2' },
			{ dictLabel: '表格', dictValue: '3' },
			{ dictLabel: '图片', dictValue: '4' },
		],
		selectLabel: 'dictLabel', // 下拉选项的文本字段
		selectValue: 'dictValue', // 下拉选项的value字段
	},
])
/* 表格数据列 */
const tableColumns = ref([
	{
		prop: 'menuName', // 绑定到菜单名字段
		label: '菜单名称',
		align: 'center',
		showOverFlow: true,
		width: 250,
		treeNode: true, // 标记为树形节点列（关键配置）
	},
	{
		prop: 'menuType',
		label: '模版类型',
		align: 'center',
		width: 150,
		render: row => {
			let type = ''
			let label = ''
			if (row.menuType === 'M') {
				type = 'primary'

				label = '目录'
			} else if (row.menuType === 'C') {
				type = 'warninging'
				label = '菜单'
			} else if (row.menuType === 'F') {
				type = 'danger'
				label = '按钮'
			}
			return [
				h(
					ElTag,
					{
						type: type,
						size: 'default',
					},
					{
						default: () => {
							return label
						},
					}
				),
			]
		},
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
						permission: 'system:hiprint:update',
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
						permission: 'system:hiprint:delete',
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
		permission: 'system:hiprint:insert', // 权限
	},
])
/**
 * 查询主列表数据
 */
const getList = params => {
	tableLoading.value = true
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
  dialogVisible.value = true
}

/** 编辑菜单 */
const handleUpdate = async row => {
	console.log('编辑', row)
}
/**
 * @description 删除
 * @param row 打印模版

 */
const handleDelete = row => {
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
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
</script>
<style lang="scss" scoped>
</style>
