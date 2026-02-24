<!--监听下的流程列表-->
<template>
	<Dialog v-model:visible="dialogVisible" title="监听模型" width="1400px" class="custom-form-dialog">
		<div class="app-container">
			<BaseTable
				ref="processtTableRef"
				:showSearchHeader="false"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				:loading="tableLoading"
				:showPagination="true"
				:showToolBar="false"
			/>
		</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialogVisible = false">关闭</el-button>
			</span>
		</template>
	</Dialog>

	<!-- 表单详情 查看 -->
	<Dialog title="表单详情" v-model:visible="formDetailVisible" width="40%" class="custom-form-dialog">
		<form-create :option="formDetailPreview.option" :rule="formDetailPreview.rule" />
		<template #footer>
			<ElButton @click="formDetailVisible = false">取消</ElButton>
		</template>
	</Dialog>
</template>

<script setup>
// 1. 基础依赖导入
import { ref, reactive, computed, getCurrentInstance, onMounted, h, nextTick, version } from 'vue'
import { formatDate } from '@/utils/common/date'
// 2. 组件导入
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
// 3. 状态管理与假数据导入
import tableParamsStore from '@/store/modules/tableParams'
import { ProcessListenerApi } from '@/api/system/bpm/processListener'
import { getDetail } from '@/api/system/bpm/form'
import { setConfAndFields2 } from '@/utils/bpm/formCreate'

const { proxy } = getCurrentInstance()

const dialogVisible = ref(false)
// 8. 页面状态变量
const tableHeight = ref(window.innerHeight - 300)
const rowConfig = { keyField: 'id' }

const tableData = ref()
// 14. 表格列配置（修复操作列逻辑，匹配流程业务）
const tableColumns = ref([
	{
		prop: 'name',
		label: '流程名称',
		align: 'left',
		minWidth: 150,
		showOverFlow: true,
	},
	{
		prop: 'formName',
		label: '表单信息',
		align: 'left',
		minWidth: 150,
		showOverFlow: true,
		render: row => {
			if (row.formId) {
				return [
					h(
						ElButton,
						{
							type: 'link',
							class: 'link-button',
							onClick: () => handleForm(row.formId),
							permission: undefined,
						},
						{ default: () => row.formName }
					),
				]
			} else {
				// 修复：给原生label添加props对象
				return [h('label', { props: {} }, '暂无表单')]
			}
		},
	},

	{
		prop: '',
		label: '发布时间',
		align: 'center',
		width: 180,
		render: row => {
			// 修复：给原生span添加props对象（即使为空）
			return [h('span', { props: {} }, row.processDefinition ? formatDate(row.processDefinition.deploymentTime) : '')]
		},
		sortable: true,
	},
	{
		prop: 'version',
		label: '版本',
		align: 'center',
		width: 150, // 增加宽度以容纳两个标签
		render: row => {
			const tags = []

			if (row.processDefinition) {
				// 版本标签
				tags.push(
					h(
						ElTag,
						{
							type: 'primary',
							class: 'mr-5', // 右边距
							permission: undefined,
						},
						{ default: () => `v${row.processDefinition.version}` }
					)
				)
			} else {
				// 未部署状态
				tags.push(
					h(
						ElTag,
						{
							type: 'info',
							permission: undefined,
						},
						{ default: () => '未部署' }
					)
				)
			}

			return tags
		},
		sortable: true,
	},
	{
		prop: 'suspensionState',
		label: '状态',
		align: 'center',
		width: 150, // 增加宽度以容纳两个标签
		render: row => {
			const tags = []

			if (row.processDefinition) {
				if (row.processDefinition.suspensionState === 1) {
					tags.push(
						h(
							ElTag,
							{
								type: 'success',
								class: 'ml-5',
								permission: undefined,
							},
							{ default: () => '已激活' }
						)
					)
				}
				// 挂起状态标签（当 suspensionState === 2 时显示）
				if (row.processDefinition.suspensionState === 2) {
					tags.push(
						h(
							ElTag,
							{
								type: 'warning',
								class: 'ml-5',
								permission: undefined,
							},
							{ default: () => '已停用' }
						)
					)
				}
			} else {
				// 未部署状态
				tags.push(
					h(
						ElTag,
						{
							type: 'info',
							permission: undefined,
						},
						{ default: () => '未部署' }
					)
				)
			}

			return tags
		},
		sortable: true,
	},
])

/** 打开弹窗 */
const open = async id => {
	dialogVisible.value = true
	tableData.value = []
	if (id) {
		try {
			const res = await ProcessListenerApi.getListenerModel(id)
			tableData.value = res.data || {}
		} catch (error) {
			proxy.$modal.msgError('获取列表失败', error)
		}
	}
}

/** 流程表单的详情按钮操作 */
const formDetailVisible = ref(false)
const formDetailPreview = ref({
	rule: [],
	option: {},
})
/**
 * 处理普通表单
 * @param {string} formId 表单ID
 */
const handleForm = async formId => {
	// 设置表单
	const apiResponse = await getDetail(formId)

	const formData = apiResponse.data

	setConfAndFields2(formDetailPreview, formData.conf, formData.fields)
	formDetailPreview.value.option = {
		...formDetailPreview.value.option, // 保留其他布局配置
		submitBtn: false, // 隐藏提交按钮
		resetBtn: false, // 隐藏重置按钮
		menuBtn: false, // 隐藏整个底部按钮区域（最保险）
	}
	// 弹窗打开
	formDetailVisible.value = true
}
// 暴露给父组件的方法
defineExpose({ open })
</script>

<style lang="scss" scoped>
/* 根容器：占满视口高度，避免内容撑开页面 */
.app-container {
	margin: 0 auto;
	// padding: 20px 24px;  //微调内边距，适配滚动
	font-family: 'Microsoft YaHei', Arial, sans-serif;
	color: #333;
	height: 100% !important;
	box-sizing: border-box; /* 避免padding导致页面溢出 */
}
:deep(.link-button) {
	background: transparent !important;
	border: none !important;
	color: #409eff !important; // 保持Element的主题蓝色
	padding: 0 8px !important;
	height: auto !important;
	line-height: normal !important;

	//  hover/focus/active状态都移除背景和边框
	&:hover,
	&:focus,
	&:active {
		background: transparent !important;
		border-color: transparent !important;
		box-shadow: none !important;
	}
}
</style>
