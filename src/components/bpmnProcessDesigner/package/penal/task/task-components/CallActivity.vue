<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-16 16:16:44
 * @LastEditors: zhangsd
 * @Description: 调用活动配置
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\task\task-components\CallActivity.vue
-->

<template>
  <div>
    <el-form label-width="100px">
      <el-form-item label="实例名称" prop="processInstanceName">
        <el-input
          v-model="formData.processInstanceName"
          clearable
          placeholder="请输入实例名称"
          @change="updateCallActivityAttr('processInstanceName')"
        />
      </el-form-item>

      <!-- TODO 需要可选择已存在的流程 -->
      <el-form-item label="被调用流程" prop="calledElement">
        <el-input
          v-model="formData.calledElement"
          clearable
          placeholder="请输入被调用流程"
          @change="updateCallActivityAttr('calledElement')"
        />
      </el-form-item>

      <el-form-item label="继承变量" prop="inheritVariables">
        <el-switch
          v-model="formData.inheritVariables"
          @change="updateCallActivityAttr('inheritVariables')"
        />
      </el-form-item>

      <el-form-item label="继承业务键" prop="inheritBusinessKey">
        <el-switch
          v-model="formData.inheritBusinessKey"
          @change="updateCallActivityAttr('inheritBusinessKey')"
        />
      </el-form-item>

      <el-form-item v-if="!formData.inheritBusinessKey" label="业务键表达式" prop="businessKey">
        <el-input
          v-model="formData.businessKey"
          clearable
          placeholder="请输入业务键表达式"
          @change="updateCallActivityAttr('businessKey')"
        />
      </el-form-item>

      <el-divider />
      <div>
        <div class="flex mb-10px">
          <el-text>输入参数</el-text>
          <el-button
            class="ml-auto"
            type="primary"
            @click="openVariableForm('in', null, -1)"
          >
            <el-icon><Plus /></el-icon>
            添加参数
          </el-button>
        </div>
        <el-table :data="inVariableList" max-height="240" fit border>
          <el-table-column label="源" prop="source" min-width="100px" show-overflow-tooltip />
          <el-table-column label="目标" prop="target" min-width="100px" show-overflow-tooltip />
          <el-table-column label="操作" width="110px">
            <template #default="scope">
              <el-button link @click="openVariableForm('in', scope.row, scope.$index)" size="small">
                编辑
              </el-button>
              <el-divider direction="vertical" />
              <el-button
                link
                size="small"
                style="color: #ff4d4f"
                @click="removeVariable('in', scope.$index)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-divider />
      <div>
        <div class="flex mb-10px">
          <el-text>输出参数</el-text>
          <el-button
            class="ml-auto"
            type="primary"
            @click="openVariableForm('out', null, -1)"
          >
            <el-icon><Plus /></el-icon>
            添加参数
          </el-button>
        </div>
        <el-table :data="outVariableList" max-height="240" fit border>
          <el-table-column label="源" prop="source" min-width="100px" show-overflow-tooltip />
          <el-table-column label="目标" prop="target" min-width="100px" show-overflow-tooltip />
          <el-table-column label="操作" width="110px">
            <template #default="scope">
              <el-button
                link
                @click="openVariableForm('out', scope.row, scope.$index)"
                size="small"
              >
                编辑
              </el-button>
              <el-divider direction="vertical" />
              <el-button
                link
                size="small"
                style="color: #ff4d4f"
                @click="removeVariable('out', scope.$index)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>

    <!-- 添加或修改参数 -->
    <el-dialog
      v-model="variableDialogVisible"
      title="参数配置"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="varialbeFormData" label-width="80px" ref="varialbeFormRef">
        <el-form-item label="源：" prop="source">
          <el-input v-model="varialbeFormData.source" clearable />
        </el-form-item>
        <el-form-item label="目标：" prop="target">
          <el-input v-model="varialbeFormData.target" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="variableDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveVariable">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

defineOptions({ name: 'CallActivity' })

const props = defineProps({
  id: String,
  type: String
})

const prefix = inject('prefix')

// 表单数据
const formData = ref({
  processInstanceName: '',
  calledElement: '',
  inheritVariables: false,
  businessKey: '',
  inheritBusinessKey: false,
  calledElementType: 'key'
})

// 参数列表
const inVariableList = ref([])
const outVariableList = ref([])
const variableType = ref() // 参数类型
const editingVariableIndex = ref(-1) // 编辑参数下标
const variableDialogVisible = ref(false)
const varialbeFormRef = ref()
const varialbeFormData = ref({
  source: '',
  target: ''
})

// 内部状态
const bpmnElement = ref()
const otherExtensionList = ref()

/**
 * @description 获取 BPMN 实例对象
 * @returns {Object} BPMN 实例
 */
const bpmnInstances = () => window?.bpmnInstances

/**
 * @description 使用消息工具
 */
const useMessage = () => ({
  delConfirm: () => ElMessageBox.confirm('确认删除该参数吗？', '提示', {
    confirmButtonText: '确 认',
    cancelButtonText: '取 消'
  })
})

const message = useMessage()

/**
 * @description 初始化调用活动
 */
const initCallActivity = () => {
  bpmnElement.value = bpmnInstances().bpmnElement
  console.log(bpmnElement.value.businessObject, 'callActivity')

  // 初始化所有配置项
  Object.keys(formData.value).forEach((key) => {
    formData.value[key] = bpmnElement.value.businessObject[key] ?? formData.value[key]
  })

  // 初始化参数列表
  otherExtensionList.value = []
  inVariableList.value = []
  outVariableList.value = []
  
  bpmnElement.value.businessObject?.extensionElements?.values?.forEach((ex) => {
    if (ex.$type === `${prefix}:In`) {
      inVariableList.value.push(ex)
    } else if (ex.$type === `${prefix}:Out`) {
      outVariableList.value.push(ex)
    } else {
      otherExtensionList.value.push(ex)
    }
  })
}

/**
 * @description 更新调用活动属性
 * @param {string} attr 属性名
 */
const updateCallActivityAttr = (attr) => {
  bpmnInstances().modeling.updateProperties(bpmnElement.value, {
    [attr]: formData.value[attr]
  })
}

/**
 * @description 打开参数表单
 * @param {string} type 参数类型 ('in' | 'out')
 * @param {Object} data 参数数据
 * @param {number} index 参数索引
 */
const openVariableForm = (type, data, index) => {
  editingVariableIndex.value = index
  variableType.value = type
  varialbeFormData.value = index === -1 ? { source: '', target: '' } : { ...data }
  variableDialogVisible.value = true
}

/**
 * @description 移除参数
 * @param {string} type 参数类型 ('in' | 'out')
 * @param {number} index 参数索引
 */
const removeVariable = async (type, index) => {
  try {
    await message.delConfirm()
    if (type === 'in') {
      inVariableList.value.splice(index, 1)
    } else if (type === 'out') {
      outVariableList.value.splice(index, 1)
    }
    updateElementExtensions()
    ElMessage.success('参数已移除')
  } catch (error) {
    console.info('操作取消')
  }
}

/**
 * @description 保存参数
 */
const saveVariable = () => {
  if (editingVariableIndex.value === -1) {
    // 新增参数
    if (variableType.value === 'in') {
      inVariableList.value.push(
        bpmnInstances().moddle.create(`${prefix}:In`, { ...varialbeFormData.value })
      )
    } else if (variableType.value === 'out') {
      outVariableList.value.push(
        bpmnInstances().moddle.create(`${prefix}:Out`, { ...varialbeFormData.value })
      )
    }
    updateElementExtensions()
    ElMessage.success('参数已添加')
  } else {
    // 更新参数
    if (variableType.value === 'in') {
      inVariableList.value[editingVariableIndex.value].source = varialbeFormData.value.source
      inVariableList.value[editingVariableIndex.value].target = varialbeFormData.value.target
    } else if (variableType.value === 'out') {
      outVariableList.value[editingVariableIndex.value].source = varialbeFormData.value.source
      outVariableList.value[editingVariableIndex.value].target = varialbeFormData.value.target
    }
    ElMessage.success('参数已更新')
  }
  variableDialogVisible.value = false
}

/**
 * @description 更新元素扩展属性
 */
const updateElementExtensions = () => {
  const extensions = bpmnInstances().moddle.create('bpmn:ExtensionElements', {
    values: [...inVariableList.value, ...outVariableList.value, ...otherExtensionList.value]
  })
  bpmnInstances().modeling.updateProperties(bpmnElement.value, {
    extensionElements: extensions
  })
}

// 监听元素 ID 变化
watch(
  () => props.id,
  (val) => {
    if (val) {
      nextTick(() => {
        initCallActivity()
      })
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
}

.mb-10px {
  margin-bottom: 10px;
}

.ml-auto {
  margin-left: auto;
}
</style>