<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 17:14:13
 * @LastEditTime: 2025-12-23 14:37:28
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
						<div style="">编号：{{ id || '' }}</div>
						<el-icon style="margin-left: 15px; cursor: pointer" @click="handlePrint">
							<Printer />
						</el-icon>
					</div>
					<!-- 审批标题 -->
					<el-divider style="margin: 8px 0px !important" />
					<div class="process-title">
						<div class="process-title-name">{{ processInstance.name }}</div>
						<el-tag :type="BPM_PROCESS_INSTANCE_STATUS.map(item => (item.value == processInstance.status ? item.type : '')).join('') ">
							{{ BPM_PROCESS_INSTANCE_STATUS.map(item => (item.value == processInstance.status ? item.label : '')).join('') }}
						</el-tag>
					</div>
					<!-- 审批发起人 -->
					<div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px; font-size: 13px; height: 35px">
						<div
							style="
								background-color: #f5f5f5;
								height: 35px;
								border-radius: 18px;
								display: flex;
								align-items: center;
								padding: 8px;
								gap: 2px;
							"
						>
							<el-avatar :size="28" v-if="processInstance?.startUser?.avatar" :src="processInstance?.startUser?.avatar" />
							<el-avatar :size="28" v-else-if="processInstance?.startUser?.nickname">
								{{ processInstance?.startUser?.nickname.substring(0, 1) }}
							</el-avatar>
							{{ processInstance?.startUser?.nickname }}
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
								<!-- 简单流程模型 -->
								<!-- <ProcessInstanceSimpleViewer
                v-show="
                  processDefinition.modelType && processDefinition.modelType === BpmModelType.SIMPLE
                "
                :loading="processInstanceLoading"
                :model-view="processModelView"
              /> -->
								<!-- BPMN流程模型 -->
								<ProcessInstanceBpmnViewer
									v-show="processDefinition.modelType && processDefinition.modelType === BpmModelType.BPMN"
									:loading="processInstanceLoading"
									:model-view="processModelView"
									style="height: calc(100vh - 20rem) !important"
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

<script  setup>
import { ref, nextTick, onMounted } from 'vue'
import { formatDate } from '@/utils/common/date'
import { BpmModelType, BpmModelFormType, BPM_PROCESS_INSTANCE_STATUS, TaskStatusEnum } from '@/utils/bpm/constantEnumeration'
import { setConfAndFields2 } from '@/utils/bpm/formCreate'
// import { registerComponent } from '@/utils/routerHelper'
import * as ProcessInstanceApi from '@/api/system/bpm/processInstance'
// import * as UserApi from '@/api/system/user'
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

/** 获得详情 */
const getDetail = () => {
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
	try {
		const param = {
			processInstanceId: props.id,
			activityId: props.activityId,
			taskId: props.taskId,
		}
		console.log('param =>', param);
		// const data = await ProcessInstanceApi.getApprovalDetail(param)
		const data = {
			status: 1,
			activityNodes: [
				{
					id: 'StartUserNode',
					name: '发起人',
					nodeType: 10,
					status: 2,
					startTime: 1766459446304,
					endTime: 1766459446322,
					tasks: [
						{
							id: 'StartUserNode',
							ownerUser: null,
							assigneeUser: {
								id: 1,
								nickname: '芋道源码',
								avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
								deptId: 103,
								deptName: '研发部门',
							},
							status: 2,
							reason: null,
							signPicUrl: null,
						},
					],
					candidateStrategy: null,
					candidateUsers: [],
					processInstanceId: null,
				},
				{
					id: 'Activity_10dxbm6',
					name: '部门领导审批',
					nodeType: 11,
					status: 1,
					startTime: 1766459446395,
					endTime: null,
					tasks: [
						{
							id: 'f9a75f43-dfac-11f0-bc4a-00ff3e31cab8',
							ownerUser: null,
							assigneeUser: {
								id: 1,
								nickname: '芋道源码',
								avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
								deptId: 103,
								deptName: '研发部门',
							},
							status: 1,
							reason: null,
							signPicUrl: null,
						},
					],
					candidateStrategy: 37,
					candidateUsers: [],
					processInstanceId: null,
				},
				{
					id: 'Activity_0hq637b',
					name: 'HR审批',
					nodeType: 11,
					status: -1,
					startTime: null,
					endTime: null,
					tasks: null,
					candidateStrategy: 22,
					candidateUsers: [
						{
							id: 114,
							nickname: 'hr 小姐姐',
							avatar: null,
							deptId: null,
							deptName: null,
						},
					],
					processInstanceId: null,
				},
				{
					id: 'Event_02u1iqv',
					name: '结束',
					nodeType: 1,
					status: -1,
					startTime: null,
					endTime: null,
					tasks: null,
					candidateStrategy: null,
					candidateUsers: [],
					processInstanceId: null,
				},
			],
			formFieldsPermission: {
				F8nhmjcjnzk1b4c: '1',
				Fjtmmjcjcm5fakc: '1',
				F58dmjcjg2vfanc: '1',
				Fb8fmjcjnevtb1c: '1',
			},
			todoTask: {
				id: 'f9a75f43-dfac-11f0-bc4a-00ff3e31cab8',
				name: '部门领导审批',
				createTime: 1766459446395,
				endTime: null,
				durationInMillis: null,
				status: 1,
				reason: null,
				ownerUser: null,
				assigneeUser: {
					id: 1,
					nickname: '芋道源码',
					avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
					deptId: 103,
					deptName: '研发部门',
				},
				taskDefinitionKey: 'Activity_10dxbm6',
				processInstanceId: 'f98de4bd-dfac-11f0-bc4a-00ff3e31cab8',
				processInstance: null,
				parentTaskId: null,
				children: [],
				formId: null,
				formName: null,
				formConf: null,
				formFields: null,
				formVariables: null,
				buttonsSetting: {
					1: {
						displayName: '通过',
						enable: true,
					},
					2: {
						displayName: '拒绝',
						enable: true,
					},
					3: {
						displayName: '转办',
						enable: true,
					},
					4: {
						displayName: '委派',
						enable: true,
					},
					5: {
						displayName: '加签',
						enable: true,
					},
					6: {
						displayName: '退回',
						enable: true,
					},
				},
				signEnable: false,
				reasonRequire: false,
				nodeType: null,
			},
			processDefinition: {
				icon: null,
				description: '',
				type: null,
				formType: 10,
				formId: 40,
				formCustomCreatePath: '',
				formCustomViewPath: '',
				visible: true,
				startUserIds: [],
				startDeptIds: [],
				managerUserIds: [1],
				sort: 1766128949437,
				allowCancelRunningProcess: true,
				allowWithdrawTask: false,
				processIdRule: {
					enable: false,
					prefix: '',
					infix: '',
					postfix: '',
					length: 5,
				},
				autoApprovalType: 0,
				titleSetting: {
					enable: false,
					title: '',
				},
				summarySetting: {
					enable: false,
					summary: [],
				},
				processBeforeTriggerSetting: null,
				processAfterTriggerSetting: null,
				taskBeforeTriggerSetting: null,
				taskAfterTriggerSetting: null,
				printTemplateSetting: {
					enable: false,
					template: null,
				},
				id: 'common-form:4:3493d8be-dcae-11f0-b9e4-00ff3e31cab8',
				version: 4,
				name: '通用表单',
				key: 'common-form',
				category: 'OA',
				categoryName: null,
				modelType: 10,
				modelId: '7a191d73-dcab-11f0-b9e4-00ff3e31cab8',
				formConf:
					'{"form":{"inline":false,"hideRequiredAsterisk":false,"labelPosition":"right","size":"default","labelWidth":"100px"},"resetBtn":{"show":false,"innerText":"重置"},"submitBtn":{"show":true,"innerText":"提交"}}',
				formFields: [
					'{"type":"datePicker","field":"Fb8fmjcjnevtb1c","title":"开始时间","info":"","$required":"请输入开始时间","_fc_id":"id_Fdnwmjcjnevtb2c","name":"ref_Fkr1mjcjnevtb3c","display":true,"hidden":false,"_fc_drag_tag":"datePicker"}',
					'{"type":"datePicker","field":"F8nhmjcjnzk1b4c","title":"结束时间","info":"","$required":"请输入结束时间","_fc_id":"id_F7pimjcjnzk1b5c","name":"ref_F8epmjcjnzk1b6c","display":true,"hidden":false,"_fc_drag_tag":"datePicker"}',
					'{"type":"select","field":"Fjtmmjcjcm5fakc","title":"请假类型","info":"","effect":{"fetch":""},"$required":"强选择请假类型","props":{"clearable":true,"filterable":false},"options":[{"label":"事假","value":"10"},{"label":"病假","value":"20"},{"label":"其他","value":"30"}],"_fc_id":"id_Fuelmjcjcm5falc","name":"ref_Fhnhmjcjcm5famc","display":true,"hidden":false,"_fc_drag_tag":"select"}',
					'{"type":"input","field":"F58dmjcjg2vfanc","title":"请假原因","info":"","$required":false,"props":{"type":"textarea"},"_fc_id":"id_Fl48mjcjg2vfaoc","name":"ref_Fghfmjcjg2vfapc","display":true,"hidden":false,"_fc_drag_tag":"textarea"}',
				],
				formName: null,
				suspensionState: 1,
				deploymentTime: null,
				bpmnXml:
					'<?xml version="1.0" encoding="UTF-8"?>\n<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:flowable="http://flowable.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="http://flowable.org/bpmn" id="diagram_common-form">\n  <process id="common-form" name="通用表单" isExecutable="true">\n    <startEvent id="Event_12qla9o">\n      <extensionElements>\n        <flowable:formData></flowable:formData>\n      </extensionElements>\n    </startEvent>\n    <userTask id="Activity_10dxbm6" name="部门领导审批">\n      <extensionElements>\n        <flowable:approveMethod><![CDATA[4]]></flowable:approveMethod>\n        <flowable:candidateStrategy><![CDATA[37]]></flowable:candidateStrategy>\n        <flowable:candidateParam><![CDATA[1]]></flowable:candidateParam>\n        <flowable:formData></flowable:formData>\n        <flowable:assignStartUserHandlerType><![CDATA[1]]></flowable:assignStartUserHandlerType>\n        <flowable:rejectHandlerType><![CDATA[1]]></flowable:rejectHandlerType>\n        <flowable:rejectReturnTaskId></flowable:rejectReturnTaskId>\n        <flowable:assignEmptyHandlerType><![CDATA[1]]></flowable:assignEmptyHandlerType>\n        <flowable:assignEmptyUserIds></flowable:assignEmptyUserIds>\n        <flowable:approveType><![CDATA[1]]></flowable:approveType>\n        <flowable:buttonsSetting id="1" enable="true" displayName="通过"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="2" enable="true" displayName="拒绝"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="3" enable="true" displayName="转办"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="4" enable="true" displayName="委派"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="5" enable="true" displayName="加签"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="6" enable="true" displayName="退回"></flowable:buttonsSetting>\n        <flowable:fieldsPermission field="Fb8fmjcjnevtb1c" title="开始时间" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="F8nhmjcjnzk1b4c" title="结束时间" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="Fjtmmjcjcm5fakc" title="请假类型" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="F58dmjcjg2vfanc" title="请假原因" permission="1"></flowable:fieldsPermission>\n        <flowable:signEnable><![CDATA[false]]></flowable:signEnable>\n        <flowable:reasonRequire><![CDATA[false]]></flowable:reasonRequire>\n      </extensionElements>\n      <multiInstanceLoopCharacteristics isSequential="true" flowable:collection="${coll_userList}">\n        <loopCardinality>1</loopCardinality>\n        <completionCondition>${ nrOfCompletedInstances &gt;= nrOfInstances }</completionCondition>\n      </multiInstanceLoopCharacteristics>\n    </userTask>\n    <sequenceFlow id="Flow_0n82iub" sourceRef="Event_12qla9o" targetRef="Activity_10dxbm6"></sequenceFlow>\n    <userTask id="Activity_0hq637b" name="HR审批">\n      <extensionElements>\n        <flowable:approveMethod><![CDATA[4]]></flowable:approveMethod>\n        <flowable:candidateStrategy><![CDATA[22]]></flowable:candidateStrategy>\n        <flowable:candidateParam><![CDATA[5]]></flowable:candidateParam>\n        <flowable:assignStartUserHandlerType><![CDATA[1]]></flowable:assignStartUserHandlerType>\n        <flowable:rejectHandlerType><![CDATA[1]]></flowable:rejectHandlerType>\n        <flowable:rejectReturnTaskId></flowable:rejectReturnTaskId>\n        <flowable:assignEmptyHandlerType><![CDATA[1]]></flowable:assignEmptyHandlerType>\n        <flowable:assignEmptyUserIds></flowable:assignEmptyUserIds>\n        <flowable:approveType><![CDATA[1]]></flowable:approveType>\n        <flowable:buttonsSetting id="1" enable="true" displayName="通过"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="2" enable="true" displayName="拒绝"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="3" enable="true" displayName="转办"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="4" enable="true" displayName="委派"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="5" enable="true" displayName="加签"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="6" enable="true" displayName="退回"></flowable:buttonsSetting>\n        <flowable:fieldsPermission field="Fb8fmjcjnevtb1c" title="开始时间" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="F8nhmjcjnzk1b4c" title="结束时间" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="Fjtmmjcjcm5fakc" title="请假类型" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="F58dmjcjg2vfanc" title="请假原因" permission="1"></flowable:fieldsPermission>\n        <flowable:signEnable><![CDATA[false]]></flowable:signEnable>\n        <flowable:reasonRequire><![CDATA[false]]></flowable:reasonRequire>\n        <flowable:formData></flowable:formData>\n      </extensionElements>\n      <multiInstanceLoopCharacteristics isSequential="true" flowable:collection="${coll_userList}">\n        <loopCardinality>1</loopCardinality>\n        <completionCondition>${ nrOfCompletedInstances &gt;= nrOfInstances }</completionCondition>\n      </multiInstanceLoopCharacteristics>\n    </userTask>\n    <sequenceFlow id="Flow_100ug1n" sourceRef="Activity_10dxbm6" targetRef="Activity_0hq637b"></sequenceFlow>\n    <endEvent id="Event_02u1iqv"></endEvent>\n    <sequenceFlow id="Flow_0wwr60y" sourceRef="Activity_0hq637b" targetRef="Event_02u1iqv"></sequenceFlow>\n  </process>\n  <bpmndi:BPMNDiagram id="BPMNDiagram_common-form">\n    <bpmndi:BPMNPlane bpmnElement="common-form" id="BPMNPlane_common-form">\n      <bpmndi:BPMNShape bpmnElement="Event_12qla9o" id="BPMNShape_Event_12qla9o">\n        <omgdc:Bounds height="36.0" width="36.0" x="302.0" y="212.0"></omgdc:Bounds>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape bpmnElement="Activity_10dxbm6" id="BPMNShape_Activity_10dxbm6">\n        <omgdc:Bounds height="80.0" width="100.0" x="390.0" y="190.0"></omgdc:Bounds>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape bpmnElement="Activity_0hq637b" id="BPMNShape_Activity_0hq637b">\n        <omgdc:Bounds height="80.0" width="100.0" x="550.0" y="190.0"></omgdc:Bounds>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape bpmnElement="Event_02u1iqv" id="BPMNShape_Event_02u1iqv">\n        <omgdc:Bounds height="36.0" width="36.0" x="712.0" y="212.0"></omgdc:Bounds>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNEdge bpmnElement="Flow_0n82iub" id="BPMNEdge_Flow_0n82iub">\n        <omgdi:waypoint x="338.0" y="230.0"></omgdi:waypoint>\n        <omgdi:waypoint x="390.0" y="230.0"></omgdi:waypoint>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge bpmnElement="Flow_100ug1n" id="BPMNEdge_Flow_100ug1n">\n        <omgdi:waypoint x="490.0" y="230.0"></omgdi:waypoint>\n        <omgdi:waypoint x="550.0" y="230.0"></omgdi:waypoint>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge bpmnElement="Flow_0wwr60y" id="BPMNEdge_Flow_0wwr60y">\n        <omgdi:waypoint x="650.0" y="230.0"></omgdi:waypoint>\n        <omgdi:waypoint x="712.0" y="230.0"></omgdi:waypoint>\n      </bpmndi:BPMNEdge>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</definitions>',
				simpleModel: null,
			},
			processInstance: {
				id: 'f98de4bd-dfac-11f0-bc4a-00ff3e31cab8',
				name: '通用表单',
				summary: null,
				category: null,
				categoryName: null,
				status: 1,
				startTime: 1766459446268,
				endTime: null,
				durationInMillis: null,
				formVariables: {
					F8nhmjcjnzk1b4c: '2025-12-24',
					PROCESS_START_USER_ID: 1,
					_FLOWABLE_SKIP_EXPRESSION_ENABLED: true,
					Fjtmmjcjcm5fakc: '10',
					Fb8fmjcjnevtb1c: '2025-12-23',
				},
				businessKey: null,
				startUser: {
					id: 1,
					nickname: '芋道源码',
					avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
					deptId: 103,
					deptName: '研发部门',
				},
				processDefinitionId: 'common-form:4:3493d8be-dcae-11f0-b9e4-00ff3e31cab8',
				processDefinition: null,
				tasks: null,
			},
		}
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

		// 获取审批节点，显示 Timeline 的数据
		activityNodes.value = data.activityNodes

		// 获取待办任务显示操作按钮
		operationButtonRef.value?.loadTodoTask(data.todoTask)
	} finally {
		processInstanceLoading.value = false
	}
	console.log('processInstanceLoading.value =>', processInstanceLoading.value);
}

/** 获取流程模型视图*/
const getProcessModelView = async () => {
	if (BpmModelType.BPMN === processDefinition.value?.modelType) {
		// 重置，解决 BPMN 流程图刷新不会重新渲染问题
		processModelView.value = {
			bpmnXml: '',
		}
	}
	// const data = await ProcessInstanceApi.getProcessInstanceBpmnModelView(props.id)
	const data = {
		processInstance: {
			id: 'f98de4bd-dfac-11f0-bc4a-00ff3e31cab8',
			name: '通用表单',
			summary: null,
			category: null,
			categoryName: null,
			status: 1,
			startTime: 1766459446268,
			endTime: null,
			durationInMillis: null,
			formVariables: null,
			businessKey: null,
			startUser: {
				id: 1,
				nickname: '芋道源码',
				avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
				deptId: 103,
				deptName: '研发部门',
			},
			processDefinitionId: 'common-form:4:3493d8be-dcae-11f0-b9e4-00ff3e31cab8',
			processDefinition: null,
			tasks: null,
		},
		tasks: [
			{
				id: 'f9a75f43-dfac-11f0-bc4a-00ff3e31cab8',
				name: '部门领导审批',
				createTime: 1766459446395,
				endTime: null,
				durationInMillis: null,
				status: 1,
				reason: null,
				ownerUser: null,
				assigneeUser: {
					id: 1,
					nickname: '芋道源码',
					avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
					deptId: 103,
					deptName: '研发部门',
				},
				taskDefinitionKey: 'Activity_10dxbm6',
				processInstanceId: 'f98de4bd-dfac-11f0-bc4a-00ff3e31cab8',
				processInstance: null,
				parentTaskId: null,
				children: null,
				formId: null,
				formName: null,
				formConf: null,
				formFields: null,
				formVariables: null,
				buttonsSetting: null,
				signEnable: null,
				reasonRequire: null,
				nodeType: null,
			},
		],
		bpmnXml:
			'<?xml version="1.0" encoding="UTF-8"?>\n<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:flowable="http://flowable.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="http://flowable.org/bpmn" id="diagram_common-form">\n  <process id="common-form" name="通用表单" isExecutable="true">\n    <startEvent id="Event_12qla9o">\n      <extensionElements>\n        <flowable:formData></flowable:formData>\n      </extensionElements>\n    </startEvent>\n    <userTask id="Activity_10dxbm6" name="部门领导审批">\n      <extensionElements>\n        <flowable:approveMethod><![CDATA[4]]></flowable:approveMethod>\n        <flowable:candidateStrategy><![CDATA[37]]></flowable:candidateStrategy>\n        <flowable:candidateParam><![CDATA[1]]></flowable:candidateParam>\n        <flowable:formData></flowable:formData>\n        <flowable:assignStartUserHandlerType><![CDATA[1]]></flowable:assignStartUserHandlerType>\n        <flowable:rejectHandlerType><![CDATA[1]]></flowable:rejectHandlerType>\n        <flowable:rejectReturnTaskId></flowable:rejectReturnTaskId>\n        <flowable:assignEmptyHandlerType><![CDATA[1]]></flowable:assignEmptyHandlerType>\n        <flowable:assignEmptyUserIds></flowable:assignEmptyUserIds>\n        <flowable:approveType><![CDATA[1]]></flowable:approveType>\n        <flowable:buttonsSetting id="1" enable="true" displayName="通过"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="2" enable="true" displayName="拒绝"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="3" enable="true" displayName="转办"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="4" enable="true" displayName="委派"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="5" enable="true" displayName="加签"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="6" enable="true" displayName="退回"></flowable:buttonsSetting>\n        <flowable:fieldsPermission field="Fb8fmjcjnevtb1c" title="开始时间" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="F8nhmjcjnzk1b4c" title="结束时间" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="Fjtmmjcjcm5fakc" title="请假类型" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="F58dmjcjg2vfanc" title="请假原因" permission="1"></flowable:fieldsPermission>\n        <flowable:signEnable><![CDATA[false]]></flowable:signEnable>\n        <flowable:reasonRequire><![CDATA[false]]></flowable:reasonRequire>\n      </extensionElements>\n      <multiInstanceLoopCharacteristics isSequential="true" flowable:collection="${coll_userList}">\n        <loopCardinality>1</loopCardinality>\n        <completionCondition>${ nrOfCompletedInstances &gt;= nrOfInstances }</completionCondition>\n      </multiInstanceLoopCharacteristics>\n    </userTask>\n    <sequenceFlow id="Flow_0n82iub" sourceRef="Event_12qla9o" targetRef="Activity_10dxbm6"></sequenceFlow>\n    <userTask id="Activity_0hq637b" name="HR审批">\n      <extensionElements>\n        <flowable:approveMethod><![CDATA[4]]></flowable:approveMethod>\n        <flowable:candidateStrategy><![CDATA[22]]></flowable:candidateStrategy>\n        <flowable:candidateParam><![CDATA[5]]></flowable:candidateParam>\n        <flowable:assignStartUserHandlerType><![CDATA[1]]></flowable:assignStartUserHandlerType>\n        <flowable:rejectHandlerType><![CDATA[1]]></flowable:rejectHandlerType>\n        <flowable:rejectReturnTaskId></flowable:rejectReturnTaskId>\n        <flowable:assignEmptyHandlerType><![CDATA[1]]></flowable:assignEmptyHandlerType>\n        <flowable:assignEmptyUserIds></flowable:assignEmptyUserIds>\n        <flowable:approveType><![CDATA[1]]></flowable:approveType>\n        <flowable:buttonsSetting id="1" enable="true" displayName="通过"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="2" enable="true" displayName="拒绝"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="3" enable="true" displayName="转办"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="4" enable="true" displayName="委派"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="5" enable="true" displayName="加签"></flowable:buttonsSetting>\n        <flowable:buttonsSetting id="6" enable="true" displayName="退回"></flowable:buttonsSetting>\n        <flowable:fieldsPermission field="Fb8fmjcjnevtb1c" title="开始时间" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="F8nhmjcjnzk1b4c" title="结束时间" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="Fjtmmjcjcm5fakc" title="请假类型" permission="1"></flowable:fieldsPermission>\n        <flowable:fieldsPermission field="F58dmjcjg2vfanc" title="请假原因" permission="1"></flowable:fieldsPermission>\n        <flowable:signEnable><![CDATA[false]]></flowable:signEnable>\n        <flowable:reasonRequire><![CDATA[false]]></flowable:reasonRequire>\n        <flowable:formData></flowable:formData>\n      </extensionElements>\n      <multiInstanceLoopCharacteristics isSequential="true" flowable:collection="${coll_userList}">\n        <loopCardinality>1</loopCardinality>\n        <completionCondition>${ nrOfCompletedInstances &gt;= nrOfInstances }</completionCondition>\n      </multiInstanceLoopCharacteristics>\n    </userTask>\n    <sequenceFlow id="Flow_100ug1n" sourceRef="Activity_10dxbm6" targetRef="Activity_0hq637b"></sequenceFlow>\n    <endEvent id="Event_02u1iqv"></endEvent>\n    <sequenceFlow id="Flow_0wwr60y" sourceRef="Activity_0hq637b" targetRef="Event_02u1iqv"></sequenceFlow>\n  </process>\n  <bpmndi:BPMNDiagram id="BPMNDiagram_common-form">\n    <bpmndi:BPMNPlane bpmnElement="common-form" id="BPMNPlane_common-form">\n      <bpmndi:BPMNShape bpmnElement="Event_12qla9o" id="BPMNShape_Event_12qla9o">\n        <omgdc:Bounds height="36.0" width="36.0" x="302.0" y="212.0"></omgdc:Bounds>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape bpmnElement="Activity_10dxbm6" id="BPMNShape_Activity_10dxbm6">\n        <omgdc:Bounds height="80.0" width="100.0" x="390.0" y="190.0"></omgdc:Bounds>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape bpmnElement="Activity_0hq637b" id="BPMNShape_Activity_0hq637b">\n        <omgdc:Bounds height="80.0" width="100.0" x="550.0" y="190.0"></omgdc:Bounds>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape bpmnElement="Event_02u1iqv" id="BPMNShape_Event_02u1iqv">\n        <omgdc:Bounds height="36.0" width="36.0" x="712.0" y="212.0"></omgdc:Bounds>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNEdge bpmnElement="Flow_0n82iub" id="BPMNEdge_Flow_0n82iub">\n        <omgdi:waypoint x="338.0" y="230.0"></omgdi:waypoint>\n        <omgdi:waypoint x="390.0" y="230.0"></omgdi:waypoint>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge bpmnElement="Flow_100ug1n" id="BPMNEdge_Flow_100ug1n">\n        <omgdi:waypoint x="490.0" y="230.0"></omgdi:waypoint>\n        <omgdi:waypoint x="550.0" y="230.0"></omgdi:waypoint>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge bpmnElement="Flow_0wwr60y" id="BPMNEdge_Flow_0wwr60y">\n        <omgdi:waypoint x="650.0" y="230.0"></omgdi:waypoint>\n        <omgdi:waypoint x="712.0" y="230.0"></omgdi:waypoint>\n      </bpmndi:BPMNEdge>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</definitions>',
		simpleModel: null,
		unfinishedTaskActivityIds: ['Activity_10dxbm6'],
		finishedTaskActivityIds: ['Event_12qla9o'],
		finishedSequenceFlowActivityIds: ['Flow_0n82iub'],
		rejectedTaskActivityIds: [],
	}
	if (data) {
		processModelView.value = data
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
	printRef.value.open(props.id)
}
console.log('props.id =>', props.id);
/** 当前的 Tab */
const activeTab = ref('form')

/** 初始化 */
// 用户列表
const userOptions = ref([])
onMounted(async () => {
	getDetail()
	// 获得用户列表
	// userOptions.value = await UserApi.getSimpleUserList()
	userOptions.value = [
		{
			id: 1,
			nickname: '芋道源码',
			deptId: 103,
			deptName: '研发部门',
		},
		{
			id: 100,
			nickname: '芋道',
			deptId: 104,
			deptName: '市场部门',
		},
		{
			id: 103,
			nickname: '源码',
			deptId: 106,
			deptName: '财务部门',
		},
		{
			id: 104,
			nickname: '测试号',
			deptId: 107,
			deptName: '运维部门',
		},
		{
			id: 112,
			nickname: '新对象',
			deptId: 100,
			deptName: '芋道源码',
		},
		{
			id: 114,
			nickname: 'hr 小姐姐',
			deptId: null,
			deptName: null,
		},
		{
			id: 115,
			nickname: '阿呆',
			deptId: 102,
			deptName: '长沙分公司',
		},
		{
			id: 117,
			nickname: '测试号02',
			deptId: 100,
			deptName: '芋道源码',
		},
		{
			id: 118,
			nickname: '狗蛋',
			deptId: 103,
			deptName: '研发部门',
		},
		{
			id: 139,
			nickname: '小秃头',
			deptId: null,
			deptName: null,
		},
		{
			id: 141,
			nickname: '新用户',
			deptId: null,
			deptName: null,
		},
		{
			id: 142,
			nickname: 'test01',
			deptId: null,
			deptName: null,
		},
	]
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