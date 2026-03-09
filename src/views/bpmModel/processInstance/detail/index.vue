<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 17:14:13
 * @LastEditTime: 2026-02-11 13:44:56
 * @LastEditors: zhangsd
 * @Description: 流程实例详情页面
 * @FilePath: \view\src\views\bpmModel\processInstance\detail\index.vue
-->
<template>
	<div class="app-container" style="position: relative; padding: 10px 20px 0">
		<div class="processInstance-wrap-main">
			<el-scrollbar>
				<!-- 审批头信息 -->
				<div class="process-header">
					<!-- 审批图标 -->
					<img style="position: absolute; right: 20px" width="150" :src="auditIconsMap[processInstance.status]" alt="" />
					<div class="process-info">
						<div style="">编号：{{ processInstanceId || '' }}</div>
						<el-icon style="margin-left: 15px; cursor: pointer" @click="handlePrint">
							<Printer />
						</el-icon>
					</div>
					<!-- 审批标题 -->
					<el-divider style="margin: 8px 0px !important" />
					<div class="process-title">
						<div class="process-title-name">{{ processInstance.name }}</div>
						<el-tag
							:type="
								BPM_PROCESS_INSTANCE_STATUS.map(item => (item.value == processInstance.status ? item.type : '')).join('')
							"
						>
							{{ BPM_PROCESS_INSTANCE_STATUS.map(item => (item.value == processInstance.status ? item.label : '')).join('') }}
						</el-tag>
					</div>
					<!-- 审批发起人 -->
					<div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px; font-size: 13px; height: 35px">
						<div
							style="
								background-color: #f5f5f5;
								height: 35px;
								border-radius: 25px;
								display: flex;
								align-items: center;
								padding: 6px;
								gap: 2px;
							"
						>
							<el-avatar :size="24" v-if="processInstance?.startUser?.avatar" :src="processInstance?.startUser?.avatar" />
							<el-avatar :size="24" v-else-if="processInstance?.startUser?.userName">
								{{ processInstance?.startUser?.userName.substring(0, 1) }}
							</el-avatar>
							{{ processInstance?.startUser?.userName }}
						</div>
						<div style="color: #878c93">{{ formatDate(processInstance.startTime) }} 提交</div>
					</div>
				</div>
				<!-- 审批操作 -->
				<div class="process-approval">
					<!-- 审批流程 -->
					<el-tabs v-model="activeTab">
						<!-- 表单信息 -->
						<el-tab-pane label="审批详情" name="form">
							<div class="form-scroll-area">
								<el-scrollbar>
									<el-row>
										<el-col :span="17" style="display: flex; flex-direction: column" class="formCol">
											<!-- 表单信息 -->
											<div
												v-loading="processInstanceLoading"
												class="form-box"
												style="display: flex; flex-direction: column; margin-bottom: 30px; flex: 1"
											>
												<!-- 情况一：流程表单 -->
												<el-col v-if="processDefinition?.formType === BpmModelFormType.NORMAL">
													<form-create
														v-model="detailForm.value"
														v-model:api="fApi"
														:option="detailForm.option"
														:rule="detailForm.rule"
													/>
												</el-col>
												<!-- 情况二：业务表单 -->
												<div v-if="processDefinition?.formType === BpmModelFormType.CUSTOM">
													<component :is="BusinessFormComponent" :id="processInstance.businessKey" />
												</div>
											</div>
										</el-col>
										<el-col :span="7">
											<!-- 审批记录时间线 -->
											<ProcessInstanceTimeline :activity-nodes="activityNodes" />
										</el-col>
									</el-row>
								</el-scrollbar>
							</div>
						</el-tab-pane>

						<!-- 流程图 -->
						<el-tab-pane label="流程图" name="diagram">
							<div class="form-scroll-area">
								<!-- BPMN流程模型 -->
								<ProcessInstanceBpmnViewer
									v-show="processDefinition.modelType && processDefinition.modelType === BpmModelType.BPMN"
									:loading="processInstanceLoading"
									:model-view="processModelView"
									style="height: calc(100vh - 25rem) !important"
								/>
							</div>
						</el-tab-pane>

						<!-- 流转记录 -->
						<el-tab-pane label="流转记录" name="record">
							<div class="form-scroll-area">
								<el-scrollbar>
									<ProcessInstanceTaskList :loading="processInstanceLoading" :id="id" />
								</el-scrollbar>
							</div>
						</el-tab-pane>

						<!-- 流转评论 TODO 待开发 -->
						<el-tab-pane label="流转评论" name="comment" v-if="false">
							<div class="form-scroll-area">
								<el-scrollbar>流转评论</el-scrollbar>
							</div>
						</el-tab-pane>
					</el-tabs>
				</div>

				<!-- 操作栏按钮 -->
				<div class="process-handle-btn">
					<!-- 操作栏按钮 -->
					<ProcessInstanceOperationButton
						ref="operationButtonRef"
						:process-instance="processInstance"
						:process-definition="processDefinition"
						:user-options="userOptions"
						:normal-form="detailForm"
						:normal-form-api="fApi"
						:writable-fields="writableFields"
						@success="refresh"
					/>
				</div>
			</el-scrollbar>
		</div>
	</div>

	<!-- 打印预览弹窗 -->
	<PrintDialog ref="printRef" />
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { formatDate } from '@/utils/common/date'
import { BpmModelType, BpmModelFormType, BPM_PROCESS_INSTANCE_STATUS, TaskStatusEnum } from '@/utils/bpm/constantEnumeration'
import { setConfAndFields2 } from '@/utils/bpm/formCreate'
// import { registerComponent } from '@/utils/routerHelper'
import * as ProcessInstanceApi from '@/api/system/bpm/processInstance'
import publicApi from '@/api/public/index.js'
import { useRoute } from 'vue-router'
import UserApi from '@/api/system/user'
import ProcessInstanceBpmnViewer from './ProcessInstanceBpmnViewer.vue'
import ProcessInstanceSimpleViewer from './ProcessInstanceSimpleViewer.vue'
import ProcessInstanceTaskList from './ProcessInstanceTaskList.vue'
import ProcessInstanceOperationButton from './ProcessInstanceOperationButton.vue'
import ProcessInstanceTimeline from './ProcessInstanceTimeline.vue'
import { FieldPermissionType } from '@/components/bpmnProcessDesigner/package/penal/consts'
import runningSvg from '@/assets/icons/bpm/running.svg'
import approveSvg from '@/assets/icons/bpm/approve.svg'
import rejectSvg from '@/assets/icons/bpm/reject.svg'
import cancelSvg from '@/assets/icons/bpm/cancel.svg'
import PrintDialog from './PrintDialog.vue'
import { useMessage } from '@/plugins/useMessage'
import dictTag from '@/components/dictTag'
defineOptions({ name: 'BpmProcessInstanceDetail' })
import { watch } from 'vue'
const route = useRoute()
// 定义props
const props = defineProps(['id', 'taskId', 'activityId'])

// 消息弹窗
const message = useMessage()
// 流程实例的加载中
const processInstanceLoading = ref(false)
// 流程实例
const processInstance = ref({})
// 流程定义
const processDefinition = ref({})
// 流程模型视图
const processModelView = ref({})
// 操作按钮组件 ref
const operationButtonRef = ref(null)
// 状态图标映射
const auditIconsMap = {
	[TaskStatusEnum.RUNNING]: runningSvg,
	[TaskStatusEnum.APPROVE]: approveSvg,
	[TaskStatusEnum.REJECT]: rejectSvg,
	[TaskStatusEnum.CANCEL]: cancelSvg,
}

// ========== 申请信息 ==========
// 表单实例
const fApi = ref(null)
// 流程实例的表单详情
const detailForm = ref({
	rule: [],
	option: {},
	value: {},
})
// 表单可以编辑的字段
const writableFields = ref([])

const processInstanceId = route.params.id // 详情id

/** 获得详情 */
const getDetail = () => {
	console.log('getDetail')
	// 获得审批详情
	getApprovalDetail()
	// 获得流程模型视图
	getProcessModelView()
}
// 加载流程实例（异步组件）
const BusinessFormComponent = ref(null)
/** 获取审批详情 */
// 审批节点信息
const activityNodes = ref([])
/**
 * 获取审批详情
 */
const getApprovalDetail = async () => {
	processInstanceLoading.value = true
	console.log('getApprovalDetail1111111', props)
	try {
		const param = {
			processInstanceId,
			activityId: props.activityId,
			taskId: props.taskId,
		}
		console.log('param =>', param)
		const res = await ProcessInstanceApi.getApprovalDetail(param)
		const data = res.data
		if (!data) {
			message.error('查询不到审批详情信息！')
			return
		}
		if (!data.processDefinition || !data.processInstance) {
			message.error('查询不到流程信息！')
			return
		}
		processInstance.value = data.processInstance
		processDefinition.value = data.processDefinition

		// 设置表单信息
		if (processDefinition.value.formType === BpmModelFormType.NORMAL) {
			// 获取表单字段权限
			const formFieldsPermission = data.formFieldsPermission
			// 清空可编辑字段为空
			writableFields.value.splice(0)
			if (detailForm.value.rule?.length > 0) {
				// 避免刷新 form-create 显示不了
				detailForm.value.value = processInstance.value.formVariables
			} else {
				setConfAndFields2(
					detailForm,
					processDefinition.value.formConf,
					processDefinition.value.formFields,
					processInstance.value.formVariables
				)
			}
			nextTick().then(() => {
				fApi.value?.btn.show(false)
				fApi.value?.resetBtn.show(false)
				fApi.value?.disabled(true)
				// 设置表单字段权限
				if (formFieldsPermission) {
					Object.keys(data.formFieldsPermission).forEach(item => {
						setFieldPermission(item, formFieldsPermission[item])
					})
				}
			})
		} else {
			// 注意：data.processDefinition.formCustomViewPath 是组件的全路径，例如说：/crm/contract/detail/index.vue
			// BusinessFormComponent.value = registerComponent(data.processDefinition.formCustomViewPath)
			const modules = import.meta.glob('@/views/**/*.vue')
			for (const path in modules) {
				if (path.includes(data.processDefinition.formCustomViewPath)) {
					BusinessFormComponent.value = defineAsyncComponent(() => modules[path]())
					break
				}
			}
		}

		// 收集所有异步请求的 Promise
		const promiseList = []
		data.activityNodes.forEach(item => {
			item.tasks?.forEach(item1 => {
				if (item1.fileId != null) {
					// 把每个异步请求加入 Promise 列表
					const promise = publicApi
						.down(item1.fileId, 'blob')
						.then(res => {
							item1.fileId = URL.createObjectURL(res.data)
						})
						.catch(err => {
							console.error('获取签名图片失败：', err)
						})
					promiseList.push(promise)
				}
			})
		})

		// 3. 等待所有异步请求完成，再赋值给响应式变量
		await Promise.all(promiseList)
		// 获取审批节点，显示 Timeline 的数据
		activityNodes.value = data.activityNodes

		// 获取待办任务显示操作按钮
		operationButtonRef.value?.loadTodoTask(data.todoTask)
	} finally {
		processInstanceLoading.value = false
	}
	console.log('processInstanceLoading.value =>', processInstanceLoading.value)
}

/** 获取流程模型视图*/
const getProcessModelView = async () => {
	if (BpmModelType.BPMN === processDefinition.value?.modelType) {
		// 重置，解决 BPMN 流程图刷新不会重新渲染问题
		processModelView.value = {
			bpmnXml: '',
		}
	}
	const res = await ProcessInstanceApi.getProcessInstanceBpmnModelView(processInstanceId)
	const data = res.data

	if (data) {
		processModelView.value = data
		console.log('processModelView.value111111111111', processModelView.value)
	}
}

/** 设置表单权限 */
const setFieldPermission = (field, permission) => {
	if (permission === FieldPermissionType.READ) {
		fApi.value?.disabled(true, field)
	}
	if (permission === FieldPermissionType.WRITE) {
		fApi.value?.disabled(false, field)
		// 加入可以编辑的字段
		writableFields.value.push(field)
	}
	if (permission === FieldPermissionType.NONE) {
		fApi.value?.hidden(true, field)
	}
}

/** 操作成功后刷新 */
const refresh = () => {
	// 重新获取详情
	getDetail()
}

/** 处理打印 */
const printRef = ref(null)
const handlePrint = async () => {
	printRef.value.open(processInstanceId)
}
console.log('processInstanceId =>', processInstanceId)
/** 当前的 Tab */
const activeTab = ref('form')

/** 初始化 */
// 用户列表
const userOptions = ref([])
onMounted(async () => {
	getDetail()
	// 获得用户列表
	userOptions.value = await UserApi.getListNoPage()
})
</script>

<style lang="scss" scoped>
// 流程实例详情页面样式
.process-instance-detail {
	// 主容器
	&-container {
		height: calc(100vh - 95px);
		max-height: calc(100vh - 95px);
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
	}

	// 审批头信息
	&-header {
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

		.header-content {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-wrap: wrap;
			gap: 16px;
		}

		.header-info {
			flex: 1;
			min-width: 300px;
		}

		.header-actions {
			display: flex;
			gap: 12px;
			flex-wrap: wrap;
		}
	}

	// 审批操作区域
	&-operation {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 400px;

		.operation-tabs {
			flex: 1;
			display: flex;
			flex-direction: column;

			:deep(.el-tabs) {
				flex: 1;
				display: flex;
				flex-direction: column;

				.el-tabs__content {
					flex: 1;
					overflow: auto;
				}
			}
		}
	}

	// 表单区域
	&-form {
		height: 100%;
		display: flex;
		flex-direction: column;

		.form-scroll-area {
			flex: 1;
			height: calc(100vh - 20rem) !important;
			overflow: auto;
			padding: 16px;
			background: #f8f9fa;
			border-radius: 6px;
		}
	}

	// 流程图区域
	&-bpmn {
		height: 100%;
		min-height: 500px;
		background: #fff;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	// 流转记录区域
	&-timeline {
		height: 100%;
		overflow: auto;
		padding: 16px;
		background: #fff;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	// 操作栏按钮
	&-actions {
		border-top: 1px solid var(--el-border-color);
		height: 60px;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		background: #fff;
		border-radius: 0 0 8px 8px;

		.action-buttons {
			display: flex;
			gap: 12px;
		}
	}

	// 响应式设计
	@media (max-width: 768px) {
		&-container {
			height: calc(100vh - 120px);
			max-height: calc(100vh - 120px);
			padding: 8px;
		}

		&-header {
			.header-content {
				flex-direction: column;
				text-align: center;
			}

			.header-actions {
				justify-content: center;
			}
		}

		&-actions {
			height: auto;
			padding: 12px;
			flex-wrap: wrap;
			justify-content: center;
		}
	}
}

// 通用工具类
.flex-center {
	display: flex;
	justify-content: center;
	align-items: center;
}

.flex-between {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.flex-column {
	display: flex;
	flex-direction: column;
}

.scrollable {
	overflow: auto;
}

.auto-height {
	height: auto;
	min-height: 200px;
}

.form-box {
	:deep(.el-card) {
		border: none;
	}
}
.processInstance-wrap-main {
	.process-info {
		color: #878c93;
		height: 20px;
		display: flex;
		align-items: center;
		flex-direction: row;
	}
	.process-title {
		display: flex;
		align-items: center;
		gap: 5px;
		margin-bottom: 10px;
		height: 40px;
		.process-title-name {
			font-size: 26px;
			font-weight: bold;
			display: flex;
			align-content: center;
			text-align: center;
			margin-right: 15px;
		}
	}
}
</style>
