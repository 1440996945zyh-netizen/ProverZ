<!--
 * @Author: zhangsd
 * @Date: 2025-12-23 15:32:18
 * @LastEditTime: 2025-12-24 14:34:50
 * @LastEditors: zhangsd
 * @Description: 流程定义详情
 * @FilePath: \view\src\views\bpmModel\processInstance\create\ProcessDefinitionDetail.vue
-->
<template>
  <Dialog v-model:visible="visibleDialog" :title="'流程:' + selectProcessDefinition.name " isFullscreen>
    <div class="processInstance-wrap-main">
      <el-scrollbar>
        <!-- <div class="process-name-tip">流程：{{ selectProcessDefinition.name }}</div> -->
        <el-divider class="divider-short" />

        <!-- 中间主要内容 tab 栏 -->
        <el-tabs v-model="activeTab">
          <!-- 表单信息 -->
          <el-tab-pane label="表单填写" name="form">
            <div class="form-scroll-area" v-loading="processInstanceStartLoading">
              <el-scrollbar>
                <el-row>
                  <el-col :span="17">
                    <form-create
                      :rule="detailForm.rule"
                      v-model:api="fApi"
                      v-model="detailForm.value"
                      :option="detailForm.option"
                      @submit="submitForm"
                    />
                  </el-col>

                  <el-col :span="6" :offset="1">
                    <!-- 流程时间线 -->
                    <ProcessInstanceTimeline
                      ref="timelineRef"
                      :activity-nodes="activityNodes"
                      :show-status-icon="false"
                      @select-user-confirm="selectUserConfirm"
                    />
                  </el-col>
                </el-row>
              </el-scrollbar>
            </div>
          </el-tab-pane>
          <!-- 流程图 -->
          <el-tab-pane label="流程图" name="diagram">
            <div class="form-scroll-area">
              <!-- BPMN 流程图预览 -->
              <ProcessInstanceBpmnViewer
                :bpmn-xml="bpmnXML"
                v-if="BpmModelType.BPMN === selectProcessDefinition.modelType"
              />

              <!-- Simple 流程图预览 -->
              <ProcessInstanceSimpleViewer
                :simple-json="simpleJson"
                v-if="BpmModelType.SIMPLE === selectProcessDefinition.modelType"
              />
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 底部操作栏 -->
        <div class="bottom-operation-bar">
          <!-- 操作栏按钮 -->
          <div
            v-if="activeTab === 'form'"
            class="button-container"
          >
            <el-button plain type="success" @click="submitForm">
              <Icon icon="ep:select" />&nbsp; 发起
            </el-button>
            <el-button plain type="danger" @click="handleCancel">
              <Icon icon="ep:close" />&nbsp; 取消
            </el-button>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </Dialog>
</template>

<script setup>
import { decodeFields, setConfAndFields2 } from  '@/utils/bpm/formCreate'
import Dialog from "@/components/Dialog"
import {
  CandidateStrategy,
  NodeId,
  FieldPermissionType
} from '@/components/bpmnProcessDesigner/package/penal/consts'
import { BpmModelType, BpmModelFormType, BPM_PROCESS_INSTANCE_STATUS, TaskStatusEnum } from '@/utils/bpm/constantEnumeration'

import ProcessInstanceBpmnViewer from '../detail/ProcessInstanceBpmnViewer.vue'
import ProcessInstanceSimpleViewer from '../detail/ProcessInstanceSimpleViewer.vue'
import ProcessInstanceTimeline from '../detail/ProcessInstanceTimeline.vue'
import formCreate from '@form-create/element-ui'
import { useRouter } from 'vue-router'
import { useMessage } from '@/plugins/useMessage'
// import { useTagsViewStore } from '@/store/modules/tagsView'
import * as ProcessInstanceApi from '@/api/system/bpm/processInstance'
import * as DefinitionApi from '@/api/system/bpm/definition'

defineOptions({ name: 'ProcessDefinitionDetail' })
const visibleDialog = ref(true)
// 定义 props 和 emit
const props = defineProps(['selectProcessDefinition'])
const emit = defineEmits(['cancel'])

// 响应式数据
const processInstanceStartLoading = ref(false) // 流程实例发起中
const { push, currentRoute } = useRouter() // 路由
const message = useMessage() // 消息弹窗
// const { delView } = useTagsViewStore() // 视图操作
const timelineRef = ref() // 时间线组件ref

const detailForm = ref({
  rule: [],
  option: {},
  value: {}
}) // 流程表单详情
const fApi = ref(null)
// 指定审批人
const startUserSelectTasks = ref([]) // 发起人需要选择审批人或抄送人的任务列表
const startUserSelectAssignees = ref({}) // 发起人选择审批人的数据
const tempStartUserSelectAssignees = ref({}) // 历史发起人选择审批人的数据，用于每次表单变更时，临时保存
const bpmnXML = ref(null) // BPMN 数据
const simpleJson = ref(undefined) // Simple 设计器数据 json 格式
const activeTab = ref('form') // 当前的 Tab
const activityNodes = ref([]) // 审批节点信息

/** 设置表单信息、获取流程图数据 **/
const initProcessInfo = async (row, formVariables) => {
  // 重置指定审批人
  startUserSelectTasks.value = []
  startUserSelectAssignees.value = {}
  formVariables = formVariables || {}

  // 情况一：流程表单
  if (row.formType == BpmModelFormType.NORMAL) {
    // 设置表单
    // 注意：需要从 formVariables 中，移除不在 row.formFields 的值。
    // 原因是：后端返回的 formVariables 里面，会有一些非表单的信息。例如说，某个流程节点的审批人。
    //        这样，就可能导致一个流程被审批不通过后，重新发起时，会直接后端报错！！！
    const formApi = formCreate.create(decodeFields(row.formFields))
    const allowedFields = formApi.fields()
    for (const key in formVariables) {
      if (!allowedFields.includes(key)) {
        delete formVariables[key]
      }
    }
    setConfAndFields2(detailForm, row.formConf, row.formFields, formVariables)

    await nextTick()
    if (fApi.value) {
      fApi.value.btn.show(false) // 隐藏提交按钮
    }

    // 获取流程审批信息,当再次发起时，流程审批节点要根据原始表单参数预测出来
    await getApprovalDetail({
      id: row.id,
      processVariablesStr: JSON.stringify(formVariables)
    })

    // 加载流程图
    const processDefinitionDetail = await DefinitionApi.getProcessDefinition(row.id)
    if (processDefinitionDetail) {
      bpmnXML.value = processDefinitionDetail.bpmnXml
      simpleJson.value = processDefinitionDetail.simpleModel
    }
    // 情况二：业务表单
  } else if (row.formCustomCreatePath) {
    await push({
      path: row.formCustomCreatePath
    })
    // 这里暂时无需加载流程图，因为跳出到另外个 Tab；
  }
}

/** 预测流程节点会因为输入的参数值而产生新的预测结果值，所以需重新预测一次 */
watch(
  () => detailForm.value.value,
  (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
      // 记录之前的节点审批人
      tempStartUserSelectAssignees.value = JSON.parse(JSON.stringify(startUserSelectAssignees.value))
      startUserSelectAssignees.value = {}
      // 加载最新的审批详情
      getApprovalDetail({
        id: props.selectProcessDefinition.id,
        processVariablesStr: JSON.stringify(newValue) // 解决 GET 无法传递对象的问题，后端 String 再转 JSON
      })
    }
  },
  {
    immediate: true,
    deep: true
  }
)

/** 获取审批详情 */
const getApprovalDetail = async (row) => {
  try {
    // TODO 获取审批详情，设置 activityId 为发起人节点（为了获取字段权限。暂时只对 Simple 设计器有效）；@jason：这里可以去掉 activityId 么？
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: row.id,
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: row.processVariablesStr // 解决 GET 无法传递对象的问题，后端 String 再转 JSON
    })

    if (!data) {
      message.error('查询不到审批详情信息！')
      return
    }
    // 获取审批节点，显示 Timeline 的数据
    activityNodes.value = data.activityNodes

    // 获取发起人自选的任务
    startUserSelectTasks.value = data.activityNodes?.filter(
      (node) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy
    )
    // 恢复之前的选择审批人
    if (startUserSelectTasks.value && startUserSelectTasks.value.length > 0) {
      for (const node of startUserSelectTasks.value) {
        if (
          tempStartUserSelectAssignees.value[node.id] &&
          tempStartUserSelectAssignees.value[node.id].length > 0
        ) {
          startUserSelectAssignees.value[node.id] = tempStartUserSelectAssignees.value[node.id]
        } else {
          startUserSelectAssignees.value[node.id] = []
        }
      }
    }

    // 获取表单字段权限
    const formFieldsPermission = data.formFieldsPermission
    // 设置表单字段权限
    if (formFieldsPermission) {
      Object.keys(formFieldsPermission).forEach((item) => {
        setFieldPermission(item, formFieldsPermission[item])
      })
    }
  } catch (e) {
    console.error('获取审批详情失败：', e)
  }
}

/**
 * 设置表单权限
 */
const setFieldPermission = (field, permission) => {
  if (!fApi.value) return
  if (permission === FieldPermissionType.READ) {
    // 1. 设置字段为只读
    fApi.value.disabled(true, field)
    // 2. 只读字段， 去掉验证规则
    try {
      const rule = fApi.value.getRule(field)
      if (rule) {
        // 必填验证设置为false
        rule.$required = false
        // 清空所有验证规则
        if (rule.validate) {
          rule.validate = []
        }
      }
    } catch (error) {
      console.warn('修改字段验证规则失败:', error)
    }
  }
  if (permission === FieldPermissionType.WRITE) {
    fApi.value.disabled(false, field)
  }
  if (permission === FieldPermissionType.NONE) {
    fApi.value.hidden(true, field)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!fApi.value || !props.selectProcessDefinition) {
    return
  }
  
  try {
    // 流程表单校验
    await fApi.value.validate()
  } catch (error) {
    // 如果验证失败，检查是否是只读字段的验证错误
    console.warn('表单验证失败:', error)
    return
  }
  // 如果有指定审批人，需要校验
  if (startUserSelectTasks.value && startUserSelectTasks.value.length > 0) {
    for (const userTask of startUserSelectTasks.value) {
      if (
        Array.isArray(startUserSelectAssignees.value[userTask.id]) &&
        startUserSelectAssignees.value[userTask.id].length === 0
      ) {
        return message.warning(`请选择${userTask.name}的候选人`)
      }
    }
  }

  // 提交请求
  processInstanceStartLoading.value = true
  try {
    await ProcessInstanceApi.createProcessInstance({
      processDefinitionId: props.selectProcessDefinition.id,
      variables: detailForm.value.value,
      startUserSelectAssignees: startUserSelectAssignees.value
    })
    // 提示
    message.success('发起流程成功')
    // 跳转回去
    // delView(unref(currentRoute))
    await push({
      name: 'BpmProcessInstanceMy'
    })
  } catch (e) {
    message.error('发起流程失败：' + (e.message || '未知错误'))
  } finally {
    processInstanceStartLoading.value = false
  }
}

/** 取消发起审批 */
const handleCancel = () => {
  emit('cancel')
}

/** 选择发起人 */
const selectUserConfirm = (id, userList) => {
  startUserSelectAssignees.value[id] = userList?.map((item) => item.id)
}

// 暴露方法给父组件
defineExpose({ initProcessInfo })
</script>

<style lang="scss" scoped>
/* 主容器高度计算 */
.processInstance-wrap-main {
  height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height) - 35px
  );
  max-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height) - 35px
  );
  overflow: auto;
}

/* 流程名称提示 */
.process-name-tip {
  color: #878c93;
  height: 15px;
  font-size: 14px;
}

/* 短分隔线 */
.divider-short {
  margin-top: 8px !important;
  margin-bottom: 8px !important;
}

/* 表单滚动区域 */
.form-scroll-area {
  height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height) - 35px -
      105px - 40px
  );
  max-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height) - 35px -
      105px - 40px
  );
  overflow: auto;
}

/* 底部操作栏 */
.bottom-operation-bar {
  border-top: solid 1px var(--el-border-color);
  margin-top: 10px;
}

/* 按钮容器 */
.button-container {
  height: 50px;
  font-size: 14px;
  display: flex;
  align-items: center;
  color: #32373c;
  font-weight: bold;
  margin-bottom: 10px;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .button-container {
    color: #fff;
  }
}
</style>