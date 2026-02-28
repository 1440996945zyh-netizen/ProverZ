<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 17:19:11
 * @LastEditTime: 2026-02-11 09:40:59
 * @LastEditors: zhangsd
 * @Description: 流程实例操作按钮
 * @FilePath: \view\src\views\bpmModel\processInstance\detail\ProcessInstanceOperationButton.vue
-->
<template>
	<div
		style="
			height: 50px;
			position: fixed;
			bottom: 10px;
			font-size: 14px;
			display: flex;
			align-items: center;
			color: #32373c;
			font-weight: bold;
		"
		class="btn-container"
	>
		<!-- 【通过】按钮 -->
		<el-popover
			:visible="popOverVisible.approve"
			placement="top-end"
			:width="420"
			trigger="click"
			v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.APPROVE)"
		>
			<template #reference>
				<el-button plain type="success" @click="openPopover('approve')">
					<el-icon><Check /></el-icon>
					&nbsp; {{ getButtonDisplayName(OperationButtonType.APPROVE) }}
				</el-button>
			</template>
			<!-- 审批表单 -->
			<div
				style="display: flex; flex-direction: column; flex: 1; padding-top: 20px; padding-left: 20px; padding-right: 20px"
				v-loading="formLoading"
			>
				<el-form
					label-position="top"
					style="margin-bottom: auto"
					ref="approveFormRef"
					:model="approveReasonForm"
					:rules="approveReasonRule"
					label-width="100px"
				>
					<el-card v-if="runningTask?.formId > 0" style="margin-bottom: 15px; margin-top: -10px !important">
						<template #header>
							<span style="display: flex; align-items: center">
								<el-icon><PictureOutline /></el-icon>
								填写表单【{{ runningTask?.formName }}】
							</span>
						</template>
						<form-create
							v-model="approveForm.value"
							v-model:api="approveFormFApi"
							:option="approveForm.option"
							:rule="approveForm.rule"
						/>
					</el-card>
					<el-form-item :label="`${nodeTypeName}意见`" prop="reason">
						<el-input v-model="approveReasonForm.reason" :placeholder="`请输入${nodeTypeName}意见`" type="textarea" :rows="4" />
					</el-form-item>
					<el-form-item label="下一个节点的审批人" prop="nextAssignees" v-if="nextAssigneesActivityNode.length > 0">
						<div style="margin-left: 10px; margin-top: -15px; margin-bottom: -35px">
							<ProcessInstanceTimeline
								ref="nextAssigneesTimelineRef"
								:activity-nodes="nextAssigneesActivityNode"
								:show-status-icon="false"
								:enable-approve-user-select="true"
								@select-user-confirm="selectNextAssigneesConfirm"
							/>
						</div>
					</el-form-item>
					<el-form-item v-if="runningTask.signEnable" label="签名" prop="signPicUrl" ref="approveSignFormRef">
						<el-button @click="signRef.open()">点击签名</el-button>
						<el-button @click="personalElecSign()">使用电子签</el-button>
					</el-form-item>
					<el-form-item v-if="runningTask.signEnable" label="" prop="signPicUrl">
						<el-image
							style="width: 90px; height: 40px; margin-left: 5px"
							v-if="approveReasonForm.signPicUrl"
							:src="approveReasonForm.signPicUrl"
							:preview-src-list="[approveReasonForm.signPicUrl]"
						/>
					</el-form-item>
					<el-form-item>
						<el-button :disabled="formLoading" type="success" @click="handleAudit(true, approveFormRef)">
							{{ getButtonDisplayName(OperationButtonType.APPROVE) }}
						</el-button>
						<el-button @click="closePopover('approve', approveFormRef)">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-popover>

		<!-- 【拒绝】按钮 -->
		<el-popover
			:visible="popOverVisible.reject"
			placement="top-end"
			:width="420"
			trigger="click"
			v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.REJECT)"
		>
			<template #reference>
				<el-button style="margin-right: 20px" plain type="danger" @click="openPopover('reject')">
					<el-icon><Close /></el-icon>
					&nbsp; {{ getButtonDisplayName(OperationButtonType.REJECT) }}
				</el-button>
			</template>
			<!-- 审批表单 -->
			<div
				style="display: flex; flex-direction: column; flex: 1; padding-top: 20px; padding-left: 20px; padding-right: 20px"
				v-loading="formLoading"
			>
				<el-form
					label-position="top"
					style="margin-bottom: auto"
					ref="rejectFormRef"
					:model="rejectReasonForm"
					:rules="rejectReasonRule"
					label-width="100px"
				>
					<el-form-item label="审批意见" prop="reason">
						<el-input v-model="rejectReasonForm.reason" placeholder="请输入审批意见" type="textarea" :rows="4" />
					</el-form-item>
					<el-form-item>
						<el-button :disabled="formLoading" type="danger" @click="handleAudit(false, rejectFormRef)">
							{{ getButtonDisplayName(OperationButtonType.REJECT) }}
						</el-button>
						<el-button @click="closePopover('reject', rejectFormRef)">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-popover>

		<!-- 【抄送】按钮 -->
		<el-popover
			:visible="popOverVisible.copy"
			placement="top-start"
			:width="420"
			trigger="click"
			v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.COPY)"
		>
			<template #reference>
				<div
					@click="openPopover('copy')"
					style="cursor: pointer; border-radius: 25px; padding: 6px 12px"
					onmouseover="this.style.backgroundColor = '#f5f5f5'"
					onmouseout="this.style.backgroundColor = 'transparent'"
				>
					<el-icon :size="14"><Paperclip /></el-icon>
					&nbsp;
					{{ getButtonDisplayName(OperationButtonType.COPY) }}
				</div>
			</template>
			<div
				style="display: flex; flex-direction: column; flex: 1; padding-top: 20px; padding-left: 20px; padding-right: 20px"
				v-loading="formLoading"
			>
				<el-form
					label-position="top"
					style="margin-bottom: auto"
					ref="copyFormRef"
					:model="copyForm"
					:rules="copyFormRule"
					label-width="100px"
				>
					<el-form-item label="抄送人" prop="copyUserIds">
						<el-select v-model="copyForm.copyUserIds" clearable style="width: 100%" multiple placeholder="请选择抄送人">
							<el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="抄送意见" prop="copyReason">
						<el-input v-model="copyForm.copyReason" clearable placeholder="请输入抄送意见" type="textarea" :rows="3" />
					</el-form-item>
					<el-form-item>
						<el-button :disabled="formLoading" type="primary" @click="handleCopy">
							{{ getButtonDisplayName(OperationButtonType.COPY) }}
						</el-button>
						<el-button @click="closePopover('copy', copyFormRef)">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-popover>

		<!-- 【转办】按钮 -->
		<el-popover
			:visible="popOverVisible.transfer"
			placement="top-start"
			:width="420"
			trigger="click"
			v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.TRANSFER)"
		>
			<template #reference>
				<div
					@click="openPopover('transfer')"
					style="cursor: pointer; border-radius: 25px; padding: 6px 12px"
					onmouseover="this.style.backgroundColor = '#f5f5f5'"
					onmouseout="this.style.backgroundColor = 'transparent'"
				>
					<el-icon :size="14"><Share /></el-icon>
					&nbsp;
					{{ getButtonDisplayName(OperationButtonType.TRANSFER) }}
				</div>
			</template>
			<div
				style="display: flex; flex-direction: column; flex: 1; padding-top: 20px; padding-left: 20px; padding-right: 20px"
				v-loading="formLoading"
			>
				<el-form
					label-position="top"
					style="margin-bottom: auto"
					ref="transferFormRef"
					:model="transferForm"
					:rules="transferFormRule"
					label-width="100px"
				>
					<el-form-item label="新审批人" prop="assigneeUserId">
						<el-select v-model="transferForm.assigneeUserId" clearable style="width: 100%">
							<el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="审批意见" prop="reason">
						<el-input v-model="transferForm.reason" clearable placeholder="请输入审批意见" type="textarea" :rows="3" />
					</el-form-item>
					<el-form-item>
						<el-button :disabled="formLoading" type="primary" @click="handleTransfer()">
							{{ getButtonDisplayName(OperationButtonType.TRANSFER) }}
						</el-button>
						<el-button @click="closePopover('transfer', transferFormRef)">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-popover>

		<!-- 【委派】按钮 -->
		<el-popover
			:visible="popOverVisible.delegate"
			placement="top-start"
			:width="420"
			trigger="click"
			v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.DELEGATE)"
		>
			<template #reference>
				<div
					@click="openPopover('delegate')"
					style="cursor: pointer; border-radius: 25px; padding: 6px 12px"
					onmouseover="this.style.backgroundColor = '#f5f5f5'"
					onmouseout="this.style.backgroundColor = 'transparent'"
				>
					<el-icon :size="14"><User /></el-icon>
					&nbsp;
					{{ getButtonDisplayName(OperationButtonType.DELEGATE) }}
				</div>
			</template>
			<div
				style="display: flex; flex-direction: column; flex: 1; padding-top: 20px; padding-left: 20px; padding-right: 20px"
				v-loading="formLoading"
			>
				<el-form
					label-position="top"
					style="margin-bottom: auto"
					ref="delegateFormRef"
					:model="delegateForm"
					:rules="delegateFormRule"
					label-width="100px"
				>
					<el-form-item label="接收人" prop="delegateUserId">
						<el-select v-model="delegateForm.delegateUserId" clearable style="width: 100%">
							<el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="审批意见" prop="reason">
						<el-input v-model="delegateForm.reason" clearable placeholder="请输入审批意见" type="textarea" :rows="3" />
					</el-form-item>
					<el-form-item>
						<el-button :disabled="formLoading" type="primary" @click="handleDelegate()">
							{{ getButtonDisplayName(OperationButtonType.DELEGATE) }}
						</el-button>
						<el-button @click="closePopover('delegate', delegateFormRef)">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-popover>

		<!-- 【加签】按钮 当前任务审批人为A，向前加签选了一个C，则需要C先审批，然后再是A审批，向后加签B，A审批完，需要B再审批完，才算完成这个任务节点 -->
		<el-popover
			:visible="popOverVisible.addSign"
			placement="top-start"
			:width="420"
			trigger="click"
			v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.ADD_SIGN)"
		>
			<template #reference>
				<div
					@click="openPopover('addSign')"
					style="cursor: pointer; border-radius: 25px; padding: 6px 12px"
					onmouseover="this.style.backgroundColor = '#f5f5f5'"
					onmouseout="this.style.backgroundColor = 'transparent'"
				>
					<el-icon :size="14"><Plus /></el-icon>
					&nbsp;
					{{ getButtonDisplayName(OperationButtonType.ADD_SIGN) }}
				</div>
			</template>
			<div
				style="display: flex; flex-direction: column; flex: 1; padding-top: 20px; padding-left: 20px; padding-right: 20px"
				v-loading="formLoading"
			>
				<el-form
					label-position="top"
					style="margin-bottom: auto"
					ref="addSignFormRef"
					:model="addSignForm"
					:rules="addSignFormRule"
					label-width="100px"
				>
					<el-form-item label="加签处理人" prop="addSignUserIds">
						<el-select v-model="addSignForm.addSignUserIds" multiple clearable style="width: 100%">
							<el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="审批意见" prop="reason">
						<el-input v-model="addSignForm.reason" clearable placeholder="请输入审批意见" type="textarea" :rows="3" />
					</el-form-item>
					<el-form-item>
						<el-button :disabled="formLoading" type="primary" @click="handlerAddSign('before')">
							向前{{ getButtonDisplayName(OperationButtonType.ADD_SIGN) }}
						</el-button>
						<el-button :disabled="formLoading" type="primary" @click="handlerAddSign('after')">
							向后{{ getButtonDisplayName(OperationButtonType.ADD_SIGN) }}
						</el-button>
						<el-button @click="closePopover('addSign', addSignFormRef)">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-popover>

		<!-- 【减签】按钮 -->
		<el-popover
			:visible="popOverVisible.deleteSign"
			placement="top-start"
			:width="420"
			trigger="click"
			v-if="runningTask?.children.length > 0"
		>
			<template #reference>
				<div
					@click="openPopover('deleteSign')"
					style="cursor: pointer; border-radius: 25px; padding: 6px 12px"
					onmouseover="this.style.backgroundColor = '#f5f5f5'"
					onmouseout="this.style.backgroundColor = 'transparent'"
				>
					<el-icon :size="14"><Minus /></el-icon>
					&nbsp; 减签
				</div>
			</template>
			<div
				style="display: flex; flex-direction: column; flex: 1; padding-top: 20px; padding-left: 20px; padding-right: 20px"
				v-loading="formLoading"
			>
				<el-form
					label-position="top"
					style="margin-bottom: auto"
					ref="deleteSignFormRef"
					:model="deleteSignForm"
					:rules="deleteSignFormRule"
					label-width="100px"
				>
					<el-form-item label="减签人员" prop="deleteSignTaskId">
						<el-select v-model="deleteSignForm.deleteSignTaskId" clearable style="width: 100%">
							<el-option
								v-for="item in runningTask.children"
								:key="item.id"
								:label="getDeleteSignUserLabel(item)"
								:value="item.id"
							/>
						</el-select>
					</el-form-item>
					<el-form-item label="审批意见" prop="reason">
						<el-input v-model="deleteSignForm.reason" clearable placeholder="请输入审批意见" type="textarea" :rows="3" />
					</el-form-item>
					<el-form-item>
						<el-button :disabled="formLoading" type="primary" @click="handlerDeleteSign()">减签</el-button>
						<el-button @click="closePopover('deleteSign', deleteSignFormRef)">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-popover>

		<!-- 【退回】按钮 -->
		<el-popover
			:visible="popOverVisible.return"
			placement="top-start"
			:width="420"
			trigger="click"
			v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.RETURN)"
		>
			<template #reference>
				<div
					@click="openPopover('return')"
					style="cursor: pointer; border-radius: 25px; padding: 6px 12px"
					onmouseover="this.style.backgroundColor = '#f5f5f5'"
					onmouseout="this.style.backgroundColor = 'transparent'"
				>
					<el-icon :size="14"><Back /></el-icon>
					&nbsp;
					{{ getButtonDisplayName(OperationButtonType.RETURN) }}
				</div>
			</template>
			<div
				style="display: flex; flex-direction: column; flex: 1; padding-top: 20px; padding-left: 20px; padding-right: 20px"
				v-loading="formLoading"
			>
				<el-form
					label-position="top"
					style="margin-bottom: auto"
					ref="returnFormRef"
					:model="returnForm"
					:rules="returnFormRule"
					label-width="100px"
				>
					<el-form-item label="退回节点" prop="targetTaskDefinitionKey">
						<el-select v-model="returnForm.targetTaskDefinitionKey" clearable style="width: 100%">
							<el-option
								v-for="item in returnList"
								:key="item.taskDefinitionKey"
								:label="item.name"
								:value="item.taskDefinitionKey"
							/>
						</el-select>
					</el-form-item>
					<el-form-item label="退回理由" prop="returnReason">
						<el-input v-model="returnForm.returnReason" clearable placeholder="请输入退回理由" type="textarea" :rows="3" />
					</el-form-item>
					<el-form-item>
						<el-button :disabled="formLoading" type="primary" @click="handleReturn()">
							{{ getButtonDisplayName(OperationButtonType.RETURN) }}
						</el-button>
						<el-button @click="closePopover('return', returnFormRef)">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-popover>

		<!--【取消】按钮 这个对应发起人的取消, 只有发起人可以取消 -->
		<el-popover
			:visible="popOverVisible.cancel"
			placement="top-start"
			:width="420"
			trigger="click"
			v-if="userId === processInstance?.startUser?.id && !isEndProcessStatus(processInstance?.status)"
		>
			<template #reference>
				<div
					@click="openPopover('cancel')"
					style="cursor: pointer; border-radius: 25px; padding: 6px 12px"
					onmouseover="this.style.backgroundColor = '#f5f5f5'"
					onmouseout="this.style.backgroundColor = 'transparent'"
				>
					<el-icon :size="14"><SwitchButton /></el-icon>
					&nbsp; 办结
				</div>
			</template>
			<div
				style="display: flex; flex-direction: column; flex: 1; padding-top: 20px; padding-left: 20px; padding-right: 20px"
				v-loading="formLoading"
			>
				<el-form
					label-position="top"
					style="margin-bottom: auto"
					ref="cancelFormRef"
					:model="cancelForm"
					:rules="cancelFormRule"
					label-width="100px"
				>
					<el-form-item label="办结理由" prop="cancelReason">
						<span style="color: #878c93; font-size: 12px">&nbsp; 办结后，该审批流程将自动结束</span>
						<el-input v-model="cancelForm.cancelReason" clearable placeholder="请输入办结理由" type="textarea" :rows="3" />
					</el-form-item>
					<el-form-item>
						<el-button :disabled="formLoading" type="primary" @click="handleCancel()">确认</el-button>
						<el-button @click="closePopover('cancel', cancelFormRef)">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-popover>
		<!-- 【再次提交】 按钮-->
		<!-- <div
			@click="handleReCreate()"
			style="cursor: pointer; border-radius: 25px; padding: 6px 12px"
			onmouseover="this.style.backgroundColor = '#f5f5f5'"
			onmouseout="this.style.backgroundColor = 'transparent'"
			v-if="
				userId === processInstance?.startUser?.id &&
				isEndProcessStatus(processInstance?.status) &&
				processDefinition?.formType === 10
			"
		>
			<el-icon :size="14"><Refresh /></el-icon>
			&nbsp; 再次提交
		</div> -->
	</div>

	<!-- 签名弹窗 -->
	<SignDialog ref="signRef" @success="handleSignFinish" />
</template>

<script lang="js" setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import { useUserStoreWithOut } from '@/store/modules/user'
import { setConfAndFields2 } from '@/utils/bpm/formCreate'
import * as TaskApi from '@/api/system/bpm/task'
import * as ProcessInstanceApi from '@/api/system/bpm/processInstance'
// import * as UserApi from '@/api/system/user'
import {
	NodeType,
	OPERATION_BUTTON_NAME,
	OperationButtonType,
	CandidateStrategy,
} from '@/components/bpmnProcessDesigner/package/penal/consts'
import { BpmModelFormType, BpmProcessInstanceStatus } from '@/utils/bpm/constantEnumeration'
import SignDialog from './SignDialog.vue'
import ProcessInstanceTimeline from '../detail/ProcessInstanceTimeline.vue'
import { isEmpty } from '@/utils/common/form-validation'
import useUserStore from '@/store/modules/user'
import { useMessage } from '@/plugins/useMessage'
import publicApi from '@/api/public/index.js'
defineOptions({ name: 'ProcessInstanceBtnContainer' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const message = useMessage() // 消息弹窗

const userId = userStore.userId // 当前登录的编号
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

// 定义props
const props = defineProps({
	processInstance: {
		type: Object,
		required: true, // 流程实例信息
	},
	processDefinition: {
		type: Object,
		required: true, // 流程定义信息
	},
	userOptions: {
		type: Array,
		required: true, // 用户列表
	},
	normalForm: {
		type: Object,
		required: true, // 流程表单 formCreate
	},
	normalFormApi: {
		type: Object,
		required: true, // 流程表单 formCreate Api
	},
	writableFields: {
		type: Array,
		required: true, // 流程表单可以编辑的字段
	},
})

const formLoading = ref(false) // 表单加载中
const popOverVisible = ref({
	approve: false,
	reject: false,
	transfer: false,
	delegate: false,
	addSign: false,
	return: false,
	copy: false,
	cancel: false,
	deleteSign: false,
}) // 气泡卡是否展示
const returnList = ref([]) // 退回节点

// ========== 审批信息 ==========
const runningTask = ref(null) // 运行中的任务
const approveForm = ref({}) // 审批通过时，额外的补充信息
const approveFormFApi = ref(null) // approveForms 的 fAPi
const nodeTypeName = ref('审批') // 节点类型名称

// 审批通过意见表单
const reasonRequire = ref(false)
const approveFormRef = ref(null)
const signRef = ref(null)
const approveSignFormRef = ref(null)
const nextAssigneesActivityNode = ref([]) // 下一个审批节点信息
const nextAssigneesTimelineRef = ref(null) // 下一个节点审批人时间线组件的引用
const approveReasonForm = reactive({
	reason: '',
	signPicUrl: '',
	nextAssignees: {},
})
const approveReasonRule = computed(() => {
	return {
		reason: [{ required: reasonRequire.value, message: nodeTypeName.value + '意见不能为空', trigger: 'blur' }],
		signPicUrl: [{ required: true, message: '签名不能为空', trigger: 'change' }],
		nextAssignees: [{ required: true, message: '审批人不能为空', trigger: 'blur' }],
	}
})
//使用电子签
const personalElecSign = async() =>{
	const res0 = await ProcessInstanceApi.getPersonalSign()
	if(res0.data){

		// 1. 请求文件流
		const res = await publicApi.down(res0.data,'blob')
		// 2. 将 Blob 流转换为可访问的 URL
		// 先释放旧的 Blob URL，避免内存泄漏
		if (signPicBlobUrl.value) {
		URL.revokeObjectURL(signPicBlobUrl.value)
		}
		// 生成新的 Blob URL
		signPicBlobUrl.value = URL.createObjectURL(res.data)

		approveReasonForm.fileId = res0.data
		approveReasonForm.signPicUrl = signPicBlobUrl.value
		approveSignFormRef.value.validate('change')
	}
}
// 拒绝表单
const rejectFormRef = ref(null)
const rejectReasonForm = reactive({
	reason: '',
})
const rejectReasonRule = computed(() => {
	return {
		reason: [{ required: reasonRequire.value, message: '审批意见不能为空', trigger: 'blur' }],
	}
})

// 抄送表单
const copyFormRef = ref(null)
const copyForm = reactive({
	copyUserIds: [],
	copyReason: '',
})
const copyFormRule = reactive({
	copyUserIds: [{ required: true, message: '抄送人不能为空', trigger: 'change' }],
})

// 转办表单
const transferFormRef = ref(null)
const transferForm = reactive({
	assigneeUserId: undefined,
	reason: '',
})
const transferFormRule = reactive({
	assigneeUserId: [{ required: true, message: '新审批人不能为空', trigger: 'change' }],
	reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }],
})

// 委派表单
const delegateFormRef = ref(null)
const delegateForm = reactive({
	delegateUserId: undefined,
	reason: '',
})
const delegateFormRule = reactive({
	delegateUserId: [{ required: true, message: '接收人不能为空', trigger: 'change' }],
	reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }],
})

// 加签表单
const addSignFormRef = ref(null)
const addSignForm = reactive({
	addSignUserIds: undefined,
	reason: '',
})
const addSignFormRule = reactive({
	addSignUserIds: [{ required: true, message: '加签处理人不能为空', trigger: 'change' }],
	reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }],
})

// 减签表单
const deleteSignFormRef = ref(null)
const deleteSignForm = reactive({
	deleteSignTaskId: undefined,
	reason: '',
})
const deleteSignFormRule = reactive({
	deleteSignTaskId: [{ required: true, message: '减签人员不能为空', trigger: 'change' }],
	reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }],
})

// 退回表单
const returnFormRef = ref(null)
const returnForm = reactive({
	targetTaskDefinitionKey: undefined,
	returnReason: '',
})
const returnFormRule = reactive({
	targetTaskDefinitionKey: [{ required: true, message: '退回节点不能为空', trigger: 'change' }],
	returnReason: [{ required: true, message: '退回理由不能为空', trigger: 'blur' }],
})

// 取消表单
const cancelFormRef = ref(null)
const cancelForm = reactive({
	cancelReason: '',
})
const cancelFormRule = reactive({
	cancelReason: [{ required: true, message: '办结理由不能为空', trigger: 'blur' }],
})

/** 监听 approveFormFApis，实现它对应的 form-create 初始化后，隐藏掉对应的表单提交按钮 */
watch(
	() => approveFormFApi.value,
	val => {
		val?.btn?.show(false)
		val?.resetBtn?.show(false)
	},
	{
		deep: true,
	},
)

/** 弹出气泡卡 */
const openPopover = async type => {
	if (popOverVisible.value[type] === true) return
	if (type === 'approve') {
		// 校验流程表单
		const valid = await validateNormalForm()
		if (!valid) {
			message.warning('表单校验不通过，请先完善表单!!')
			return
		}
		initNextAssigneesFormField()
	}
	if (type === 'return') {
		// 获取退回节点
		const res = await TaskApi.getTaskListByReturn(runningTask.value.id)
		returnList.value = res.data || []
		if (returnList.value.length === 0) {
			message.warning('当前没有可退回的节点')
			return
		}
	}
	Object.keys(popOverVisible.value).forEach(item => {
		popOverVisible.value[item] = item === type
	})
}

/** 关闭气泡卡 */
const closePopover = (type, formRef) => {
	if (formRef) {
		formRef.resetFields()
	}
	popOverVisible.value[type] = false
	nextAssigneesActivityNode.value = []
	// 清理 Timeline 组件中的自定义审批人数据
	if (nextAssigneesTimelineRef.value) {
		nextAssigneesTimelineRef.value.batchSetCustomApproveUsers({})
	}
}

/** 流程通过时，根据表单变量查询新的流程节点，判断下一个节点类型是否为自选审批人 */
const initNextAssigneesFormField = async () => {
	// 获取修改的流程变量, 暂时只支持流程表单
	const variables = getUpdatedProcessInstanceVariables()
	// const data = []
	const data = await ProcessInstanceApi.getNextApprovalNodes({
	  processInstanceId: props.processInstance.id,
	  taskId: runningTask.value.id,
	  processVariablesStr: JSON.stringify(variables)
	})
	if (data && data.length > 0) {
		const customApproveUsersData = {} // 用于收集需要设置到 Timeline 组件的自定义审批人数据
		data.forEach(node => {
			if (
				// 情况一：当前节点没有审批人，并且是发起人自选
				(isEmpty(node.tasks) && isEmpty(node.candidateUsers) && CandidateStrategy.START_USER_SELECT === node.candidateStrategy) ||
				// 情况二：当前节点是审批人自选
				CandidateStrategy.APPROVE_USER_SELECT === node.candidateStrategy
			) {
				nextAssigneesActivityNode.value.push(node)
			}

			// 如果节点有 candidateUsers，设置到 customApproveUsers 中
			if (node.candidateUsers && node.candidateUsers.length > 0) {
				customApproveUsersData[node.id] = node.candidateUsers
			}
		})

		// 将 candidateUsers 设置到 Timeline 组件中
		await nextTick() // 等待下一个 tick，确保 Timeline 组件已经渲染
		if (nextAssigneesTimelineRef.value && Object.keys(customApproveUsersData).length > 0) {
			nextAssigneesTimelineRef.value.batchSetCustomApproveUsers(customApproveUsersData)
		}
	}
}

/** 选择下一个节点的审批人 */
const selectNextAssigneesConfirm = (id, userList) => {
	approveReasonForm.nextAssignees[id] = userList?.map(item => item.id)
}
/** 审批通过时，校验每个自选审批人的节点是否都已配置了审批人 */
const validateNextAssignees = () => {
	if (Object.keys(nextAssigneesActivityNode.value).length === 0) {
		return true
	}
	// 如果需要自选审批人，则校验每个节点是否都已配置审批人
	for (const item of nextAssigneesActivityNode.value) {
		if (isEmpty(approveReasonForm.nextAssignees[item.id])) {
			message.warning('下一个节点的审批人不能为空!')
			return false
		}
	}
	return true
}

/** 处理审批通过和不通过的操作 */
const handleAudit = async (pass, formRef) => {
	formLoading.value = true
	try {
		// 校验表单
		if (!formRef) return
		await formRef.validate()
		// 校验流程表单必填字段
		const valid = await validateNormalForm()
		if (!valid) {
			message.warning('表单校验不通过，请先完善表单!!')
			return
		}

		if (pass) {
			const nextAssigneesValid = validateNextAssignees()
			if (!nextAssigneesValid) return
			const variables = getUpdatedProcessInstanceVariables()
			// 审批通过数据
			const data = {
				id: runningTask.value.id,
				reason: approveReasonForm.reason,
				variables, // 审批通过, 把修改的字段值赋于流程实例变量
				nextAssignees: approveReasonForm.nextAssignees, // 下个自选节点选择的审批人信息
			}
			// 签名
			if (runningTask.value.signEnable) {
				//用文件id替换之前的url，根据查出的id去下载文件图片
				data.signPicUrl = approveReasonForm.fileId
				// data.signPicUrl = approveReasonForm.signPicUrl
			}
			// 多表单处理，并且有额外的 approveForm 表单，需要校验 + 拼接到 data 表单里提交
			// TODO 芋艿 任务有多表单这里要如何处理，会和可编辑的字段冲突
			const formCreateApi = approveFormFApi.value
			if (Object.keys(formCreateApi)?.length > 0) {
				await formCreateApi.validate()
				data.variables = approveForm.value.value
			}
			await TaskApi.approveTask(data)
			popOverVisible.value.approve = false
			nextAssigneesActivityNode.value = []
			// 清理 Timeline 组件中的自定义审批人数据
			if (nextAssigneesTimelineRef.value) {
				nextAssigneesTimelineRef.value.batchSetCustomApproveUsers({})
			}
			message.success('审批通过成功')
		} else {
			// 审批不通过数据
			const data = {
				id: runningTask.value.id,
				reason: rejectReasonForm.reason,
			}
			await TaskApi.rejectTask(data)
			popOverVisible.value.reject = false
			message.success('审批不通过成功')
		}
		// 重置表单
		formRef.resetFields()
		// 加载最新数据
		reload()
	} finally {
		formLoading.value = false
	}
}

/** 处理抄送 */
const handleCopy = async () => {
	formLoading.value = true
	try {
		// 1. 校验表单
		if (!copyFormRef.value) return
		await copyFormRef.value.validate()
		// 2. 提交抄送
		const data = {
			id: runningTask.value.id,
			reason: copyForm.copyReason,
			copyUserIds: copyForm.copyUserIds,
		}
		await TaskApi.copyTask(data)
		copyFormRef.value.resetFields()
		popOverVisible.value.copy = false
		message.success('操作成功')
	} finally {
		formLoading.value = false
	}
}

/** 处理转交 */
const handleTransfer = async () => {
	formLoading.value = true
	try {
		// 1.1 校验表单
		if (!transferFormRef.value) return
		await transferFormRef.value.validate()
		// 1.2 提交转交
		const data = {
			id: runningTask.value.id,
			reason: transferForm.reason,
			assigneeUserId: transferForm.assigneeUserId,
		}
		await TaskApi.transferTask(data)
		transferFormRef.value.resetFields()
		popOverVisible.value.transfer = false
		message.success('操作成功')
		// 2. 加载最新数据
		reload()
	} finally {
		formLoading.value = false
	}
}

/** 处理委派 */
const handleDelegate = async () => {
	formLoading.value = true
	try {
		// 1.1 校验表单
		if (!delegateFormRef.value) return
		await delegateFormRef.value.validate()
		// 1.2 处理委派
		const data = {
			id: runningTask.value.id,
			reason: delegateForm.reason,
			delegateUserId: delegateForm.delegateUserId,
		}

		await TaskApi.delegateTask(data)
		popOverVisible.value.delegate = false
		delegateFormRef.value.resetFields()
		message.success('操作成功')
		// 2. 加载最新数据
		reload()
	} finally {
		formLoading.value = false
	}
}

/** 处理加签 */
const handlerAddSign = async type => {
	formLoading.value = true
	try {
		// 1.1 校验表单
		if (!addSignFormRef.value) return
		await addSignFormRef.value.validate()
		// 1.2 提交加签
		const data = {
			id: runningTask.value.id,
			type,
			reason: addSignForm.reason,
			userIds: addSignForm.addSignUserIds,
		}
		await TaskApi.signCreateTask(data)
		message.success('操作成功')
		addSignFormRef.value.resetFields()
		popOverVisible.value.addSign = false
		// 2 加载最新数据
		reload()
	} finally {
		formLoading.value = false
	}
}

/** 处理退回 */
const handleReturn = async () => {
	formLoading.value = true
	try {
		// 1.1 校验表单
		if (!returnFormRef.value) return
		await returnFormRef.value.validate()
		// 1.2 提交退回
		const data = {
			id: runningTask.value.id,
			reason: returnForm.returnReason,
			targetTaskDefinitionKey: returnForm.targetTaskDefinitionKey,
		}

		await TaskApi.returnTask(data)
		popOverVisible.value.return = false
		returnFormRef.value.resetFields()
		message.success('操作成功')
		// 2 重新加载数据
		reload()
	} finally {
		formLoading.value = false
	}
}

/** 处理取消 */
const handleCancel = async () => {
	formLoading.value = true
	try {
		// 1.1 校验表单
		if (!cancelFormRef.value) return
		await cancelFormRef.value.validate()
		// 1.2 提交取消
		await ProcessInstanceApi.cancelProcessInstanceByStartUser(props.processInstance.id, cancelForm.cancelReason)
		popOverVisible.value.return = false
		message.success('操作成功')
		cancelFormRef.value.resetFields()
		// 2 重新加载数据
		reload()
	} finally {
		formLoading.value = false
	}
}

/** 处理再次提交 */
const handleReCreate = async () => {
	// 跳转发起流程界面
	await router.push({
		name: 'BpmProcessInstanceCreate',
		query: { processInstanceId: props.processInstance?.id },
	})
}

/** 获取减签人员标签 */
const getDeleteSignUserLabel = task => {
	const deptName = task?.assigneeUser?.deptName || task?.ownerUser?.deptName
	const nickname = task?.assigneeUser?.nickname || task?.ownerUser?.nickname
	return `${nickname} ( 所属部门：${deptName} )`
}
/** 处理减签 */
const handlerDeleteSign = async () => {
	formLoading.value = true
	try {
		// 1.1 校验表单
		if (!deleteSignFormRef.value) return
		await deleteSignFormRef.value.validate()
		// 1.2 提交减签
		const data = {
			id: deleteSignForm.deleteSignTaskId,
			reason: deleteSignForm.reason,
		}
		await TaskApi.signDeleteTask(data)
		message.success('减签成功')
		deleteSignFormRef.value.resetFields()
		popOverVisible.value.deleteSign = false
		// 2 加载最新数据
		reload()
	} finally {
		formLoading.value = false
	}
}
/** 重新加载数据 */
const reload = () => {
	emit('success')
}

/** 任务是否为处理中状态 */
const isHandleTaskStatus = () => {
	let canHandle = false
	if (TaskApi.TaskStatusEnum.RUNNING === runningTask.value?.status) {
		canHandle = true
	}
	return canHandle
}

/** 流程状态是否为结束状态 */
const isEndProcessStatus = status => {
	let isEndStatus = false
	if (
		BpmProcessInstanceStatus.APPROVE === status ||
		BpmProcessInstanceStatus.REJECT === status ||
		BpmProcessInstanceStatus.CANCEL === status
	) {
		isEndStatus = true
	}
	return isEndStatus
}

/** 是否显示按钮 */
const isShowButton = btnType => {
	let isShow = true
	if (runningTask.value?.buttonsSetting && runningTask.value?.buttonsSetting[btnType]) {
		isShow = runningTask.value.buttonsSetting[btnType].enable
	}
	return isShow
}

/** 获取按钮的显示名称 */
const getButtonDisplayName = btnType => {
	let displayName = OPERATION_BUTTON_NAME.get(btnType)
	if (runningTask.value?.buttonsSetting && runningTask.value?.buttonsSetting[btnType]) {
		displayName = runningTask.value.buttonsSetting[btnType].displayName
	}
	return displayName
}

const loadTodoTask = task => {
	approveForm.value = {}
	runningTask.value = task
	approveFormFApi.value = {}
	reasonRequire.value = task?.reasonRequire ?? false
	nodeTypeName.value = task?.nodeType === NodeType.TRANSACTOR_NODE ? '办理' : '审批'
	// 处理 approve 表单.
	if (task && task.formId && task.formConf) {
		const tempApproveForm = {}
		setConfAndFields2(tempApproveForm, task.formConf, task.formFields, task.formVariables)
		approveForm.value = tempApproveForm
	} else {
		approveForm.value = {} // 占位，避免为空
	}
}

/** 校验流程表单 */
const validateNormalForm = async () => {
	if (props.processDefinition?.formType === BpmModelFormType.NORMAL) {
		let valid = true
		try {
			await props.normalFormApi?.validate()
		} catch {
			valid = false
		}
		return valid
	} else {
		return true
	}
}

/** 从可以编辑的流程表单字段，获取需要修改的流程实例的变量 */
const getUpdatedProcessInstanceVariables = () => {
	const variables = {}
	props.writableFields.forEach(field => {
		variables[field] = props.normalFormApi.getValue(field)
	})
	return variables
}
// 定义一个变量存储图片的 Blob URL（在 Vue 组件的 data/setup 中声明）
const signPicBlobUrl = ref('')

/** 处理签名完成 */
const handleSignFinish = async (file) => {
  try {
    // 1. 请求文件流
    const res = await publicApi.down(file.id,'blob')
    // 2. 将 Blob 流转换为可访问的 URL
    // 先释放旧的 Blob URL，避免内存泄漏
    if (signPicBlobUrl.value) {
      URL.revokeObjectURL(signPicBlobUrl.value)
    }
    // 生成新的 Blob URL
    signPicBlobUrl.value = URL.createObjectURL(res.data)

    approveReasonForm.fileId = file.id
    approveReasonForm.signPicUrl = signPicBlobUrl.value
    approveSignFormRef.value.validate('change')
  } catch (error) {
    console.error('获取图片流失败：', error)
  }
}
const userOptions = ref([]) // 用户列表选项
// 加载用户选项
const loadUserOptions = async () => {
	try {
		const userResData = await publicApi.getLocalSelect({ type: 'USER' })
		if (userResData && userResData.data) {
			userOptions.value = userResData.data
		} else {
			userOptions.value = []
		}
	} catch (error) {
		console.error('加载用户列表失败:', error)
		userOptions.value = []
	}
}
// 组件挂载时加载用户列表
onMounted(async () => {
	await loadUserOptions()
})

// 暴露方法给父组件
defineExpose({ loadTodoTask })
</script>

<style lang="css" scoped>
/* 移除SCSS，改为标准CSS，替换简写样式 */
:deep(.el-affix--fixed) {
	background-color: var(--el-bg-color);
}

.btn-container > div {
	display: flex;
	margin: 0 8px;
	cursor: pointer;
	align-items: center;
}

.btn-container > div:hover {
	color: #6db5ff;
}
</style>
