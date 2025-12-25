<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 17:20:56
 * @LastEditTime: 2025-12-23 14:09:13
 * @LastEditors: zhangsd
 * @Description: 打印弹窗
 * @FilePath: \view\src\views\bpmModel\processInstance\detail\PrintDialog.vue
-->
 
<template>
  <Dialog title="打印流程实例" v-model:visible="visible" width="800px">
    <div id="printDivTag" style="word-break: break-all">
      <div v-if="printData?.printTemplateEnable" v-html="getPrintTemplateHTML()"></div>
      <div v-else>
        <h2 style="text-align: center;">{{ printData?.processInstance?.name }}</h2>
        <div style="text-align: right; font-size: 15px;">{{ '打印人员: ' + userName }}</div>
        <div style="display: flex; justify-content: space-between;">
          <div style="font-size: 15px;">{{ '流程编号: ' + printData?.processInstance?.id }}</div>
          <div style="font-size: 15px;">{{ '打印时间: ' + printTime }}</div>
        </div>
        <table style="margin-top: 20px; width: 100%;" border="1" :style="{'border-collapse': 'collapse'}">
          <tbody>
            <tr>
              <td style="padding: 5px; width: 25%;">发起人</td>
              <td style="padding: 5px; width: 25%;">{{ printData?.processInstance?.startUser?.nickname }}</td>
              <td style="padding: 5px; width: 25%;">发起时间</td>
              <td style="padding: 5px; width: 25%;">{{ formatDate(printData?.processInstance?.startTime) }}</td>
            </tr>
            <tr>
              <td style="padding: 5px; width: 25%;">所属部门</td>
              <td style="padding: 5px; width: 25%;">{{ printData?.processInstance?.startUser?.deptName }}</td>
              <td style="padding: 5px; width: 25%;">流程状态</td>
              <td style="padding: 5px; width: 25%;">
                <!-- {{
                  getDictLabel(
                    DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS,
                    printData?.processInstance?.status
                  )
                }} -->
              </td>
            </tr>
            <tr>
              <td style="padding: 5px; width: 100%; text-align: center;" colspan="4">
                <h4>表单内容</h4>
              </td>
            </tr>
            <tr v-for="item in formFields" :key="item.id">
              <td style="padding: 5px; width: 20%;">
                {{ item.name }}
              </td>
              <td style="padding: 5px; width: 80%;" colspan="3">
                <div v-html="item.html"></div>
              </td>
            </tr>
            <tr>
              <td style="padding: 5px; width: 100%; text-align: center;" colspan="4">
                <h4>流程节点</h4>
              </td>
            </tr>
            <tr v-for="item in printData?.tasks" :key="item.id">
              <td style="padding: 5px; width: 20%;">
                {{ item.name }}
              </td>
              <td style="padding: 5px; width: 80%;" colspan="3">
                {{ item.description }}
                <div v-if="item.signPicUrl && item.signPicUrl.length > 0">
                  <img style="width: 90px; height: 40px;" :src="item.signPicUrl" alt="" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" v-print="printObj"> 打 印</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="js">
// 显式导入Vue3组合式API
import { ref, computed, defineExpose } from 'vue'
// 导入接口、store、工具函数
import * as ProcessInstanceApi from '@/api/system/bpm/processInstance'
import Dialog from '@/components/Dialog'
import useUserStore from '@/store/modules/user'
import { formatDate } from '@/utils/common/date'
// import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { decodeFields } from '@/utils/bpm/formCreate'

// 获取用户store实例
const userStore = useUserStore()

// 响应式变量定义（移除TS类型注解）
const visible = ref(false)
const loading = ref(false)
const printData = ref(null)
const printTime = ref(formatDate(new Date(), 'YYYY-MM-DD HH:mm'))
const formFields = ref(null)
const printDataMap = ref({})

// 计算属性：获取用户名
const userName = computed(() => userStore.name ?? '')

// 打开打印弹窗
const open = async (id) => {
  loading.value = true
  try {
    // printData.value = await ProcessInstanceApi.getProcessInstancePrintData(id)
    printData.value = {
    "processInstance": {
        "id": "f98de4bd-dfac-11f0-bc4a-00ff3e31cab8",
        "name": "通用表单",
        "summary": null,
        "category": null,
        "categoryName": null,
        "status": 1,
        "startTime": 1766459446268,
        "endTime": null,
        "durationInMillis": null,
        "formVariables": {
            "F8nhmjcjnzk1b4c": "2025-12-24",
            "PROCESS_START_USER_ID": 1,
            "_FLOWABLE_SKIP_EXPRESSION_ENABLED": true,
            "PROCESS_STATUS": 1,
            "Fjtmmjcjcm5fakc": "10",
            "Fb8fmjcjnevtb1c": "2025-12-23"
        },
        "businessKey": null,
        "startUser": {
            "id": null,
            "nickname": "芋道源码",
            "avatar": null,
            "deptId": null,
            "deptName": "研发部门"
        },
        "processDefinitionId": null,
        "processDefinition": {
            "icon": null,
            "description": "",
            "type": null,
            "formType": 10,
            "formId": 40,
            "formCustomCreatePath": "",
            "formCustomViewPath": "",
            "visible": true,
            "startUserIds": [],
            "startDeptIds": [],
            "managerUserIds": [
                1
            ],
            "sort": 1766128949437,
            "allowCancelRunningProcess": true,
            "allowWithdrawTask": false,
            "processIdRule": {
                "enable": false,
                "prefix": "",
                "infix": "",
                "postfix": "",
                "length": 5
            },
            "autoApprovalType": 0,
            "titleSetting": {
                "enable": false,
                "title": ""
            },
            "summarySetting": {
                "enable": false,
                "summary": []
            },
            "processBeforeTriggerSetting": null,
            "processAfterTriggerSetting": null,
            "taskBeforeTriggerSetting": null,
            "taskAfterTriggerSetting": null,
            "printTemplateSetting": {
                "enable": false,
                "template": null
            },
            "id": "460",
            "version": null,
            "name": null,
            "key": null,
            "category": "OA",
            "categoryName": null,
            "modelType": 10,
            "modelId": "7a191d73-dcab-11f0-b9e4-00ff3e31cab8",
            "formConf": "{\"form\":{\"inline\":false,\"hideRequiredAsterisk\":false,\"labelPosition\":\"right\",\"size\":\"default\",\"labelWidth\":\"100px\"},\"resetBtn\":{\"show\":false,\"innerText\":\"重置\"},\"submitBtn\":{\"show\":true,\"innerText\":\"提交\"}}",
            "formFields": [
                "{\"type\":\"datePicker\",\"field\":\"Fb8fmjcjnevtb1c\",\"title\":\"开始时间\",\"info\":\"\",\"$required\":\"请输入开始时间\",\"_fc_id\":\"id_Fdnwmjcjnevtb2c\",\"name\":\"ref_Fkr1mjcjnevtb3c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"datePicker\"}",
                "{\"type\":\"datePicker\",\"field\":\"F8nhmjcjnzk1b4c\",\"title\":\"结束时间\",\"info\":\"\",\"$required\":\"请输入结束时间\",\"_fc_id\":\"id_F7pimjcjnzk1b5c\",\"name\":\"ref_F8epmjcjnzk1b6c\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"datePicker\"}",
                "{\"type\":\"select\",\"field\":\"Fjtmmjcjcm5fakc\",\"title\":\"请假类型\",\"info\":\"\",\"effect\":{\"fetch\":\"\"},\"$required\":\"强选择请假类型\",\"props\":{\"clearable\":true,\"filterable\":false},\"options\":[{\"label\":\"事假\",\"value\":\"10\"},{\"label\":\"病假\",\"value\":\"20\"},{\"label\":\"其他\",\"value\":\"30\"}],\"_fc_id\":\"id_Fuelmjcjcm5falc\",\"name\":\"ref_Fhnhmjcjcm5famc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"select\"}",
                "{\"type\":\"input\",\"field\":\"F58dmjcjg2vfanc\",\"title\":\"请假原因\",\"info\":\"\",\"$required\":false,\"props\":{\"type\":\"textarea\"},\"_fc_id\":\"id_Fl48mjcjg2vfaoc\",\"name\":\"ref_Fghfmjcjg2vfapc\",\"display\":true,\"hidden\":false,\"_fc_drag_tag\":\"textarea\"}"
            ],
            "formName": null,
            "suspensionState": null,
            "deploymentTime": null,
            "bpmnXml": null,
            "simpleModel": null
        },
        "tasks": null
    },
    "printTemplateEnable": false,
    "printTemplateHtml": null,
    "tasks": []
}

    initPrintDataMap()
    parseFormFields()
  } finally {
    loading.value = false
  }
  visible.value = true
}

// 暴露方法给父组件
defineExpose({ open })

// 解析表单字段，处理不同类型表单的打印展示
const parseFormFields = () => {
  if (!printData.value) return

  const formFieldsObj = decodeFields(
    printData.value.processInstance.processDefinition?.formFields || []
  )
  const processVariables = printData.value.processInstance.formVariables
  let res = []
  for (const item of formFieldsObj) {
    const id = item['field']
    const name = item['title']
    const variable = processVariables[item['field']]
    let html = variable
    switch (item['type']) {
      case 'UploadImg': {
        let imgEl = document.createElement('img')
        imgEl.setAttribute('src', variable)
        imgEl.setAttribute('style', 'max-width: 600px;')
        html = imgEl.outerHTML
        break
      }
      case 'radio':
      case 'checkbox':
      case 'select': {
        const options = item['options'] || []
        const temp = []
        if (Array.isArray(variable)) {
          const labels = options.filter((o) => variable.includes(o.value)).map((o) => o.label)
          temp.push(...labels)
        } else {
          const opt = options.find((o) => o.value === variable)
          temp.push(opt?.label || '')
        }
        html = temp.join(',')
        break // 补充遗漏的break，避免逻辑穿透
      }
      // TODO 更多表单打印展示
    }
    printDataMap.value[item['field']] = html
    res.push({ id, name, html })
  }
  formFields.value = res
}

// 初始化打印数据映射表
const initPrintDataMap = () => {
  printDataMap.value['startUser'] = printData.value.processInstance.startUser.nickname
  printDataMap.value['startUserDept'] = printData.value.processInstance.startUser.deptName
  printDataMap.value['processName'] = printData.value.processInstance.name
  printDataMap.value['processNum'] = printData.value.processInstance.id
  printDataMap.value['startTime'] = formatDate(printData.value.processInstance.startTime)
  printDataMap.value['endTime'] = formatDate(printData.value.processInstance.endTime)
  // printDataMap.value['processStatus'] = getDictLabel(
  //   DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS,
  //   printData.value.processInstance.status
  // )
  printDataMap.value['printUser'] = userName.value
  printDataMap.value['printTime'] = printTime.value
}

// 获取打印模板HTML，处理模板替换和样式优化
const getPrintTemplateHTML = () => {
  const parser = new DOMParser()
  let doc = parser.parseFromString(printData.value.printTemplateHtml, 'text/html')
  // table 添加border
  let tables = doc.querySelectorAll('table')
  tables.forEach((item) => {
    item.setAttribute('border', '1')
    item.setAttribute('style', (item.getAttribute('style') || '') + 'border-collapse:collapse;')
  })
  // 替换 mentions
  let mentions = doc.querySelectorAll('[data-w-e-type="mention"]')
  mentions.forEach((item) => {
    const mentionId = JSON.parse(decodeURIComponent(item.getAttribute('data-info') ?? ''))['id']
    item.innerHTML = printDataMap.value[mentionId] ?? ''
  })
  // 替换流程记录
  let processRecords = doc.querySelectorAll('[data-w-e-type="process-record"]')
  let processRecordTable = document.createElement('table')
  if (processRecords.length > 0) {
    // 构建流程记录html
    processRecordTable.setAttribute('border', '1')
    processRecordTable.setAttribute('style', 'width:100%;border-collapse:collapse;')
    const headTr = document.createElement('tr')
    const headTd = document.createElement('td')
    headTd.setAttribute('colspan', '2')
    headTd.setAttribute('width', 'auto')
    headTd.setAttribute('style', 'text-align: center;')
    headTd.innerHTML = '流程节点'
    headTr.appendChild(headTd)
    processRecordTable.appendChild(headTr)
    printData.value.tasks.forEach((item) => {
      const tr = document.createElement('tr')
      const td1 = document.createElement('td')
      td1.innerHTML = item.name
      const td2 = document.createElement('td')
      td2.innerHTML = item.description
      tr.appendChild(td1)
      tr.appendChild(td2)
      processRecordTable.appendChild(tr)
    })
  }
  processRecords.forEach((item) => {
    item.innerHTML = processRecordTable.outerHTML
  })
  // 返回 html
  return doc.body.innerHTML
}

// 打印配置项
const printObj = ref({
  id: 'printDivTag',
  popTitle: '&nbsp',
  extraCss: '/print.css',
  extraHead: '',
  zIndex: 20003
})
</script>

<style>
/* 修复打印只显示一页 */
@media print {
  @page {
    size: auto;
  }

  body,
  html,
  div {
    height: auto !important;
  }
}
</style>