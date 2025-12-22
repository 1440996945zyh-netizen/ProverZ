<!--
 * @Author: zhangsd
 * @Date: 2025-12-15 11:34:41
 * @LastEditTime: 2025-12-17 14:11:45
 * @LastEditors: zhangsd
 * @Description: 表单设计器列表页面，负责表单模板的查询、新增、编辑、删除、详情、复制等操作
 * @FilePath: \view\src\views\bpmModel\formdesigner\index.vue
-->

<template>
	<div class="form-designer-container">
		<!-- 表单设计器列表区域 -->
		<div class="app-container">
			<BaseTable
				ref="formDesignerTableRef"
				:showSearchHeader="true"
				:selectData="searchForm"
				:searchClick="getTableList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="handleCellClick"
				:rowConfig="tableRowConfig"
				:tableHeight="tableHeight"
				name="formDesignerTable"
				:loading="isTableLoading"
				:showPagination="true"
				:total="totalCount"
			/>
		</div>

		<!-- 表单详情 查看 -->
		<Dialog title="表单详情" v-model:visible="formDetailVisible" width="80%">
			<form-create :option="detailData.option" :rule="detailData.rule" />
			<template #footer>
				<ElButton @click="formDetailVisible = false">取消</ElButton>
			</template>
		</Dialog>
	</div>
</template>

<script setup >
defineOptions({ name: 'FormDesigne' })

// ===================== 导入模块 =====================
import { ref, computed, getCurrentInstance, onMounted } from 'vue'
import { ElTag, ElButton, ElMessageBox, ElMessage } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import TipMessage from '@/components/TipMessage/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
// 可按需导入路由（如果需要跳转）
import { useRouter, useRoute } from 'vue-router'

// ===================== 基础变量/实例 =====================
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

// 表格实例引用
const formDesignerTableRef = ref(null)
// 表单详情弹窗显示状态
const formDetailVisible = ref(false)
// 表单详情数据
const detailData = ref({
	rule: [],
	option: {},
})
// ===================== 计算属性 =====================
// 从store获取基础表格高度
const tableStoreHeight = computed(() => tableParamsStore().normalTableHeight)
// 最终表格高度（减去额外间距）
const tableHeight = computed(() => tableStoreHeight.value - 15)

// ===================== 响应式数据 =====================
// 搜索表单配置（原selectData）
const searchForm = ref([
	{
		name: '表单名',
		type: 'input',
		modelValue: 'formName', // 修正：原processName → formName 与业务匹配
		span: 24,
	},
])

// 表格加载状态（原tableLoading）
const isTableLoading = ref(false)

// 表格数据列表
const tableData = ref([
	{
		formNo: 'formNo1',
		formName: '表单名1',
		status: '0',
		remark: '备注1',
		createTime: '2025-12-15 11:34:41',
	},
	{
		formNo: 'formNo2',
		formName: '表单名2',
		status: '1', // 补充不同状态测试
		remark: '备注2',
		createTime: '2025-12-15 11:34:41',
	},
])

// 表格总条数（原total）
const totalCount = ref(tableData.value.length)

// ===================== 表格配置 =====================
/**
 * 表格列配置
 * 规范：权限码统一为 formDesigner 相关，避免复用user权限
 */
const tableColumns = ref([
	{
		label: '表单编号',
		prop: 'formNo',
		width: '200',
		align: 'center',
	},
	{
		label: '表单名称',
		prop: 'formName',
		width: '200',
		align: 'center',
	},
	{
		label: '状态',
		prop: 'status',
		width: '100',
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status === '0' ? '' : 'info',
					},
					{
						default: () => (row.status === '0' ? '正常' : '停用'),
					}
				),
			]
		},
	},
	{
		label: '备注',
		prop: 'remark',
		width: '200',
		align: 'center',
	},
	{
		label: '创建时间',
		prop: 'createTime',
		width: '200',
		align: 'center',
	},
	{
		label: '操作',
		prop: 'operation',
		width: '100',
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							// console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'bpm:fromdesigner:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							// console.log(row)
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'bpm:fromdesigner:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							// console.log(row)
							handleDetail(row)
						},
						type: 'warning',
						link: true,
						icon: 'Operation',
						permission: 'bpm:fromdesigner:detail', // 权限
					},
					{
						default: () => '详情',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							// console.log(row)
							handleCopy(row)
						},
						type: 'primary',
						link: true,
						icon: 'CopyDocument',
						permission: 'bpm:fromdesigner:detail', // 权限
					},
					{
						default: () => '复制',
					}
				),
			]
		},
	},
])

/**
 * 顶部操作按钮配置
 */
const buttonList = ref([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => handleAdd, // 回调函数
		permission: 'bpm:fromdesigner:insert', // 修正权限码
	},
])

/**
 * 表格行配置
 */
const tableRowConfig = ref({
	// 行点击事件
	click: row => {
		// 行点击时选中当前行（赋值给搜索表单仅为示例，可根据业务调整）
		searchForm.value = [{ ...searchForm.value[0], modelValue: row.formName }]
	},
})

// ===================== 事件处理方法 =====================
/**
 * 表格单元格点击事件
 * @param {Object} row 行数据
 * @param {String} prop 列属性
 */
const handleCellClick = (row, prop) => {
	console.log('单元格点击：', row, prop)
}

/**
 * 获取表格数据列表
 * 可扩展：对接接口、处理分页/搜索参数
 */
const getTableList = async () => {
	try {
		isTableLoading.value = true
		// 模拟接口请求（实际项目替换为真实接口）
		// const res = await proxy.$api.formDesigner.getList(searchForm.value)
		// tableData.value = res.list
		// totalCount.value = res.total

		// 模拟加载延迟
		await new Promise(resolve => setTimeout(resolve, 500))
		ElMessage.success('数据加载成功')
	} catch (error) {
		console.error('获取表单列表失败：', error)
		ElMessage.error('数据加载失败，请重试')
	} finally {
		isTableLoading.value = false
	}
}

/**
 * 新增表单
 * 可扩展：打开新增弹窗/跳转到新增页面
 */
const handleAdd = () => {
	console.log('新增表单')
	// 示例：跳转新增页面
	router.push({ name: 'BpmFormEditor' })

	// 示例：打开新增弹窗（需引入弹窗组件）
	// addFormDialogRef.value.open()
	// ElMessage.info('新增表单功能待实现')
}

/**
 * 编辑表单
 * @param {Object} row 待编辑的行数据
 */
const handleEdit = row => {
	console.log('编辑表单：', row)
	// 示例：跳转编辑页面
	// router.push({ path: '/system/formDesigner/edit', query: { formNo: row.formNo } })
	ElMessage.info(`编辑表单：${row.formName}`)
}

/**
 * 删除表单（带确认弹窗）
 * @param {Object} row 待删除的行数据
 */
const handleDelete = async row => {
	try {
		// 确认删除
		await ElMessageBox.confirm(`确定要删除表单【${row.formName}】吗？删除后不可恢复！`, '删除确认', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		})

		// 模拟接口删除
		// await proxy.$api.formDesigner.delete(row.formNo)
		ElMessage.success(`表单【${row.formName}】删除成功`)

		// 重新加载列表
		getTableList()
	} catch (error) {
		if (error !== 'cancel') {
			console.error('删除表单失败：', error)
			ElMessage.error('删除失败，请重试')
		}
	}
}

/**
 * 查看表单详情
 * @param {Object} row 表单行数据
 */
const handleDetail = async row => {
	console.log('查看表单详情：', row)
	// 设置表单
	const data = await FormApi.getForm(row.id)
	setConfAndFields2(detailData, data.conf, data.fields)
	// 打开详情弹窗
	formDetailVisible.value = true
}

/**
 * 复制表单
 * @param {Object} row 待复制的行数据
 */
const handleCopy = row => {
	console.log('复制表单：', row)
	// 示例：调用复制接口
	// await proxy.$api.formDesigner.copy(row.formNo)
	ElMessage.success(`表单【${row.formName}】复制成功`)
	// 重新加载列表
	getTableList()
}

// ===================== 生命周期 =====================
// 页面挂载时加载表格数据
onMounted(() => {
	getTableList()
})
</script>

<style scoped>
.form-designer-container {
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	padding: 0;
	margin: 0;
}

.app-container {
	width: 100%;
	height: 100%;
}
</style>